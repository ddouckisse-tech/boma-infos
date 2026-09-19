import { v, type Infer } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  articleFeature,
  articleStatus,
  blockValidator,
  linkValidator,
  mediaVariantValidator,
  seoValidator,
  storedRenditionValidator,
} from "./model/content";
import { mediaDerivedFields, syncArticleMedia } from "./model/media";
import {
  ARTICLES_1,
  ARTICLES_2,
  ARTICLES_3,
  ARTICLES_4,
  DOCUMENTS,
} from "./seed";

/**
 * Developer-only WordPress migration. Every operation is internal, bounded,
 * and resumable; no operation deletes a document or a stored file. Upload
 * originals/renditions first, and register media before referencing them in
 * author portraits or articles. Retiring the local demonstration corpus is
 * a separate, explicit final step.
 */

const categoryValidator = v.object({
  name: v.string(),
  slug: v.string(),
  parentSlug: v.optional(v.string()),
  accent: v.string(),
  order: v.number(),
  description: v.string(),
  isActive: v.boolean(),
});

const authorValidator = v.object({
  name: v.string(),
  slug: v.string(),
  role: v.string(),
  bio: v.string(),
  portraitMediaKey: v.optional(v.string()),
  links: v.array(linkValidator),
});

const mediaValidator = v.object({
  key: v.string(),
  alt: v.string(),
  caption: v.string(),
  credit: v.string(),
  license: v.string(),
  source: v.string(),
  width: v.number(),
  height: v.number(),
  color: v.string(),
  variants: v.array(mediaVariantValidator),
  storage: v.optional(v.array(storedRenditionValidator)),
  uploadedAt: v.optional(v.number()),
  wordpressId: v.number(),
  originalStorageId: v.optional(v.id("_storage")),
  originalMimeType: v.optional(v.string()),
  originalBytes: v.optional(v.number()),
});

const articleValidator = v.object({
  title: v.string(),
  slug: v.string(),
  dek: v.string(),
  body: v.array(blockValidator),
  status: articleStatus,
  categorySlug: v.string(),
  subCategorySlug: v.optional(v.string()),
  authorSlug: v.string(),
  heroMediaKey: v.optional(v.string()),
  galleryMediaKeys: v.array(v.string()),
  keyPoints: v.array(v.string()),
  seo: seoValidator,
  origin: v.literal("redaction"),
  feature: articleFeature,
  readingMinutes: v.number(),
  tags: v.array(v.string()),
  createdAt: v.number(),
  publishedAt: v.number(),
  updatedAt: v.number(),
  views: v.number(),
  searchText: v.string(),
  wordpressId: v.number(),
  sourceUrl: v.string(),
  sourceModifiedAt: v.number(),
  sourceCategorySlugs: v.optional(v.array(v.string())),
});

const documentValidator = v.object({
  title: v.string(),
  slug: v.string(),
  description: v.string(),
  kind: v.string(),
  fileUrl: v.string(),
  fileFormat: v.literal("PDF"),
  fileBytes: v.number(),
  pages: v.optional(v.number()),
  publisher: v.string(),
  publishedAt: v.number(),
  wordpressId: v.number(),
  sourceUrl: v.string(),
  originalStorageId: v.id("_storage"),
  isActive: v.optional(v.boolean()),
});

const resultValidator = v.object({
  inserted: v.number(),
  updated: v.number(),
});

function boundedBatch(length: number, max: number, label: string): void {
  if (length > max) throw new Error(`${label} : maximum ${max} par lot.`);
}

function uniqueValues(
  values: readonly (string | number)[],
  label: string
): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} : doublon dans le lot.`);
  }
}

function identifier(value: string, label: string): void {
  if (!value.trim() || value !== value.trim() || /[\s/]/u.test(value)) {
    throw new Error(`${label} : identifiant invalide « ${value} ».`);
  }
}

function integer(value: number, min: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < min) {
    throw new Error(`${label} : entier supérieur ou égal à ${min} attendu.`);
  }
}

type Category = Infer<typeof categoryValidator>;

function categoryPair(
  categories: ReadonlyMap<string, Category>,
  categorySlug: string,
  subCategorySlug: string | undefined,
  label: string
): void {
  const category = categories.get(categorySlug);
  if (!category || category.parentSlug) {
    throw new Error(
      `${label} : rubrique principale inconnue « ${categorySlug} ».`
    );
  }
  if (subCategorySlug) {
    const subcategory = categories.get(subCategorySlug);
    if (!subcategory || subcategory.parentSlug !== categorySlug) {
      throw new Error(
        `${label} : sous-rubrique incohérente « ${subCategorySlug} ».`
      );
    }
  }
}

async function requireMedia(ctx: MutationCtx, key: string): Promise<void> {
  const media = await ctx.db
    .query("media")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  if (!media) throw new Error(`Média référencé inconnu « ${key} ».`);
}

/** Missing rows are added; only supplied slugs are patched, never removed. */
export const upsertTaxonomy = internalMutation({
  args: {
    categories: v.array(categoryValidator),
    authors: v.array(authorValidator),
  },
  returns: v.object({ categories: resultValidator, authors: resultValidator }),
  handler: async (ctx, args) => {
    boundedBatch(args.categories.length, 100, "Rubriques");
    boundedBatch(args.authors.length, 100, "Auteurs");
    uniqueValues(
      args.categories.map((row) => row.slug),
      "Rubriques"
    );
    uniqueValues(
      args.authors.map((row) => row.slug),
      "Auteurs"
    );

    const existing = await ctx.db.query("categories").collect();
    uniqueValues(
      existing.map((row) => row.slug),
      "Rubriques existantes"
    );
    const categories = new Map<string, Category>(
      existing.map((row) => [row.slug, row])
    );
    for (const category of args.categories) {
      identifier(category.slug, "Rubrique");
      integer(category.order, 0, "Ordre de rubrique");
      if (category.parentSlug !== undefined) {
        identifier(category.parentSlug, "Rubrique parente");
      }
      categories.set(category.slug, category);
    }
    for (const category of categories.values()) {
      if (!category.parentSlug) continue;
      const parent = categories.get(category.parentSlug);
      if (!parent || parent.parentSlug || parent.slug === category.slug) {
        throw new Error(
          `Parent incohérent pour la rubrique « ${category.slug} ».`
        );
      }
    }
    // A parent change must not invalidate articles already in the deployment.
    const changedParents = new Set(
      args.categories
        .filter((row) =>
          existing.some(
            (old) => old.slug === row.slug && old.parentSlug !== row.parentSlug
          )
        )
        .map((row) => row.slug)
    );
    if (changedParents.size > 0) {
      for (const article of await ctx.db.query("articles").collect()) {
        if (
          changedParents.has(article.categorySlug) ||
          (article.subCategorySlug &&
            changedParents.has(article.subCategorySlug))
        ) {
          categoryPair(
            categories,
            article.categorySlug,
            article.subCategorySlug,
            article.slug
          );
        }
      }
    }
    for (const author of args.authors) {
      identifier(author.slug, "Auteur");
      if (author.portraitMediaKey)
        await requireMedia(ctx, author.portraitMediaKey);
    }

    const result = {
      categories: { inserted: 0, updated: 0 },
      authors: { inserted: 0, updated: 0 },
    };
    for (const category of args.categories) {
      const row = existing.find((entry) => entry.slug === category.slug);
      if (row) {
        await ctx.db.patch(row._id, {
          ...category,
          parentSlug: category.parentSlug,
        });
        result.categories.updated += 1;
      } else {
        await ctx.db.insert("categories", category);
        result.categories.inserted += 1;
      }
    }
    for (const author of args.authors) {
      const row = await ctx.db
        .query("authors")
        .withIndex("by_slug", (q) => q.eq("slug", author.slug))
        .unique();
      if (row) {
        await ctx.db.patch(row._id, author);
        result.authors.updated += 1;
      } else {
        await ctx.db.insert("authors", author);
        result.authors.inserted += 1;
      }
    }
    return result;
  },
});

/** One upload URL per file, including originals and WebP renditions. */
export const uploadUrls = internalMutation({
  args: { count: v.number() },
  returns: v.array(v.string()),
  handler: async (ctx, { count }) => {
    integer(count, 1, "Nombre de fichiers");
    boundedBatch(count, 20, "Fichiers");
    return await Promise.all(
      Array.from({ length: count }, () => ctx.storage.generateUploadUrl())
    );
  },
});

async function requireStoredFile(
  ctx: MutationCtx,
  id: Id<"_storage">,
  bytes: number | undefined,
  mimeType: string | undefined
): Promise<void> {
  const metadata = await ctx.db.system.get("_storage", id);
  if (!metadata) throw new Error(`Fichier stocké introuvable « ${id} ».`);
  if (bytes !== undefined && metadata.size !== bytes) {
    throw new Error(`Taille du fichier stocké incohérente « ${id} ».`);
  }
  if (mimeType !== undefined && metadata.contentType !== mimeType) {
    throw new Error(`Type du fichier stocké incohérent « ${id} ».`);
  }
}

export const upsertMedia = internalMutation({
  args: { items: v.array(mediaValidator) },
  returns: resultValidator,
  handler: async (ctx, { items }) => {
    boundedBatch(items.length, 20, "Médias");
    uniqueValues(
      items.map((row) => row.key),
      "Clés de médias"
    );
    uniqueValues(
      items.map((row) => row.wordpressId),
      "IDs WordPress des médias"
    );
    const result = { inserted: 0, updated: 0 };
    for (const item of items) {
      identifier(item.key, "Média");
      integer(item.wordpressId, 1, "ID WordPress du média");
      integer(item.width, 1, "Largeur du média");
      integer(item.height, 1, "Hauteur du média");
      boundedBatch(item.storage?.length ?? 0, 8, "Versions du média");
      if (item.originalStorageId) {
        if (!item.originalMimeType || item.originalBytes === undefined) {
          throw new Error(
            `Métadonnées du fichier original manquantes « ${item.key} ».`
          );
        }
        integer(item.originalBytes, 1, "Taille du fichier original");
        await requireStoredFile(
          ctx,
          item.originalStorageId,
          item.originalBytes,
          item.originalMimeType
        );
      } else if (
        item.originalMimeType !== undefined ||
        item.originalBytes !== undefined
      ) {
        throw new Error(`ID du fichier original manquant « ${item.key} ».`);
      }
      for (const rendition of item.storage ?? []) {
        integer(rendition.w, 1, "Largeur de version");
        integer(rendition.h, 1, "Hauteur de version");
        integer(rendition.bytes, 1, "Taille de version");
        await requireStoredFile(
          ctx,
          rendition.storageId,
          rendition.bytes,
          "image/webp"
        );
      }
      const row = await ctx.db
        .query("media")
        .withIndex("by_key", (q) => q.eq("key", item.key))
        .unique();
      if (row && row.wordpressId !== item.wordpressId) {
        throw new Error(`Collision avec un autre média « ${item.key} ».`);
      }
      const identity = await ctx.db
        .query("media")
        .withIndex("by_wordpress_id", (q) =>
          q.eq("wordpressId", item.wordpressId)
        )
        .unique();
      if (identity && identity.key !== item.key) {
        throw new Error(
          `ID WordPress ${item.wordpressId} déjà importé sous « ${identity.key} ».`
        );
      }
      const fields = { ...item, ...mediaDerivedFields(item) };
      if (row) {
        await ctx.db.patch(row._id, fields);
        result.updated += 1;
      } else {
        await ctx.db.insert("media", fields);
        result.inserted += 1;
      }
    }
    return result;
  },
});

export const upsertArticles = internalMutation({
  args: { items: v.array(articleValidator) },
  returns: resultValidator,
  handler: async (ctx, { items }) => {
    boundedBatch(items.length, 20, "Articles");
    uniqueValues(
      items.map((row) => row.slug),
      "Slugs des articles"
    );
    uniqueValues(
      items.map((row) => row.wordpressId),
      "IDs WordPress des articles"
    );
    const categories = new Map(
      (await ctx.db.query("categories").collect()).map((row) => [row.slug, row])
    );
    const checkedMedia = new Set<string>();
    const result = { inserted: 0, updated: 0 };
    for (const item of items) {
      identifier(item.slug, "Article");
      integer(item.wordpressId, 1, "ID WordPress de l'article");
      integer(item.views, 0, "Vues");
      integer(item.readingMinutes, 1, "Temps de lecture");
      for (const field of [
        "createdAt",
        "publishedAt",
        "updatedAt",
        "sourceModifiedAt",
      ] as const) {
        integer(item[field], 0, field);
      }
      if (!/^https?:\/\/[^\s]+$/iu.test(item.sourceUrl)) {
        throw new Error(`URL source invalide « ${item.slug} ».`);
      }
      const row = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", item.slug))
        .unique();
      if (row && row.wordpressId !== item.wordpressId) {
        throw new Error(`Collision avec un autre article « ${item.slug} ».`);
      }
      const identity = await ctx.db
        .query("articles")
        .withIndex("by_wordpress_id", (q) =>
          q.eq("wordpressId", item.wordpressId)
        )
        .unique();
      if (identity && identity.slug !== item.slug) {
        throw new Error(
          `ID WordPress ${item.wordpressId} déjà importé sous « ${identity.slug} ».`
        );
      }
      categoryPair(
        categories,
        item.categorySlug,
        item.subCategorySlug,
        item.slug
      );
      const author = await ctx.db
        .query("authors")
        .withIndex("by_slug", (q) => q.eq("slug", item.authorSlug))
        .unique();
      if (!author)
        throw new Error(`Auteur référencé inconnu « ${item.authorSlug} ».`);
      const mediaKeys = new Set(item.galleryMediaKeys);
      if (item.heroMediaKey) mediaKeys.add(item.heroMediaKey);
      for (const block of item.body) {
        if (block.type === "image") mediaKeys.add(block.mediaKey);
        if (block.type === "video") mediaKeys.add(block.posterMediaKey);
      }
      if (author.portraitMediaKey) mediaKeys.add(author.portraitMediaKey);
      for (const key of mediaKeys) {
        if (checkedMedia.has(key)) continue;
        await requireMedia(ctx, key);
        checkedMedia.add(key);
      }
      if (row) {
        await ctx.db.patch(row._id, {
          ...item,
          subCategorySlug: item.subCategorySlug,
          heroMediaKey: item.heroMediaKey,
          views: Math.max(row.views, item.views),
        });
        await syncArticleMedia(ctx, row._id);
        result.updated += 1;
      } else {
        await syncArticleMedia(ctx, await ctx.db.insert("articles", item));
        result.inserted += 1;
      }
    }
    return result;
  },
});

/** Only editorial PDFs enter the public library; technical ZIP/TXT assets do not. */
export const upsertDocuments = internalMutation({
  args: { items: v.array(documentValidator) },
  returns: resultValidator,
  handler: async (ctx, { items }) => {
    boundedBatch(items.length, 20, "Documents");
    uniqueValues(
      items.map((row) => row.slug),
      "Slugs des documents"
    );
    uniqueValues(
      items.map((row) => row.wordpressId),
      "IDs WordPress des documents"
    );
    const result = { inserted: 0, updated: 0 };
    for (const item of items) {
      identifier(item.slug, "Document");
      integer(item.wordpressId, 1, "ID WordPress du document");
      integer(item.fileBytes, 1, "Taille du PDF");
      integer(item.publishedAt, 0, "Date du document");
      if (item.pages !== undefined) integer(item.pages, 1, "Nombre de pages");
      if (!/^https?:\/\/[^\s]+$/iu.test(item.sourceUrl)) {
        throw new Error(`URL source invalide « ${item.slug} ».`);
      }
      await requireStoredFile(
        ctx,
        item.originalStorageId,
        item.fileBytes,
        "application/pdf"
      );
      // Resolve the download from the verified PDF, not from an unrelated URL.
      const fileUrl = await ctx.storage.getUrl(item.originalStorageId);
      if (!fileUrl) throw new Error(`PDF stocké introuvable « ${item.slug} ».`);
      const row = await ctx.db
        .query("documents")
        .withIndex("by_slug", (q) => q.eq("slug", item.slug))
        .unique();
      if (row && row.wordpressId !== item.wordpressId) {
        throw new Error(`Collision avec un autre document « ${item.slug} ».`);
      }
      const identity = await ctx.db
        .query("documents")
        .withIndex("by_wordpress_id", (q) =>
          q.eq("wordpressId", item.wordpressId)
        )
        .unique();
      if (identity && identity.slug !== item.slug) {
        throw new Error(
          `ID WordPress ${item.wordpressId} déjà importé sous « ${identity.slug} ».`
        );
      }
      const document = {
        ...item,
        fileUrl,
        isActive: item.isActive ?? row?.isActive ?? true,
      };
      if (row) {
        await ctx.db.patch(row._id, document);
        result.updated += 1;
      } else {
        await ctx.db.insert("documents", document);
        result.inserted += 1;
      }
    }
    return result;
  },
});

/** Compact source identities and storage IDs for verification and resume. */
export const inventory = internalQuery({
  args: {},
  returns: v.object({
    counts: v.object({
      categories: v.number(),
      authors: v.number(),
      media: v.number(),
      articles: v.number(),
      documents: v.number(),
      publishedArticles: v.number(),
      wordpressArticles: v.number(),
      wordpressMedia: v.number(),
      wordpressDocuments: v.number(),
    }),
    categories: v.array(categoryValidator),
    authors: v.array(authorValidator),
    articles: v.array(
      v.object({
        slug: v.string(),
        wordpressId: v.optional(v.number()),
        status: articleStatus,
      })
    ),
    media: v.array(
      v.object({
        key: v.string(),
        wordpressId: v.optional(v.number()),
        originalStorageId: v.optional(v.id("_storage")),
        storage: v.optional(v.array(storedRenditionValidator)),
      })
    ),
    documents: v.array(
      v.object({
        slug: v.string(),
        wordpressId: v.optional(v.number()),
        originalStorageId: v.optional(v.id("_storage")),
        isActive: v.optional(v.boolean()),
      })
    ),
  }),
  handler: async (ctx) => {
    const [categories, authors, articles, media, documents] = await Promise.all(
      [
        ctx.db.query("categories").collect(),
        ctx.db.query("authors").collect(),
        ctx.db.query("articles").collect(),
        ctx.db.query("media").collect(),
        ctx.db.query("documents").collect(),
      ]
    );
    return {
      counts: {
        categories: categories.length,
        authors: authors.length,
        articles: articles.length,
        media: media.length,
        documents: documents.length,
        publishedArticles: articles.filter((row) => row.status === "published")
          .length,
        wordpressArticles: articles.filter(
          (row) => row.wordpressId !== undefined
        ).length,
        wordpressMedia: media.filter((row) => row.wordpressId !== undefined)
          .length,
        wordpressDocuments: documents.filter(
          (row) => row.wordpressId !== undefined
        ).length,
      },
      categories: categories.map(({ _id, _creationTime, ...row }) => {
        void _id;
        void _creationTime;
        return row;
      }),
      authors: authors.map(({ _id, _creationTime, ...row }) => {
        void _id;
        void _creationTime;
        return row;
      }),
      articles: articles.map(({ slug, wordpressId, status }) => ({
        slug,
        wordpressId,
        status,
      })),
      media: media.map(({ key, wordpressId, originalStorageId, storage }) => ({
        key,
        wordpressId,
        originalStorageId,
        storage,
      })),
      documents: documents.map(
        ({ slug, wordpressId, originalStorageId, isActive }) => ({
          slug,
          wordpressId,
          originalStorageId,
          isActive,
        })
      ),
    };
  },
});

const DEMO_ARTICLES = [
  ...ARTICLES_1,
  ...ARTICLES_2,
  ...ARTICLES_3,
  ...ARTICLES_4,
];

/** Run only after the import has been verified. No deletion or table reset. */
export const retireDemo = internalMutation({
  args: {},
  returns: v.object({
    drafted: v.array(v.string()),
    alreadyDraft: v.array(v.string()),
    skipped: v.array(v.string()),
    hiddenDocuments: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const result = {
      drafted: [] as string[],
      alreadyDraft: [] as string[],
      skipped: [] as string[],
      hiddenDocuments: [] as string[],
    };
    for (const seed of DEMO_ARTICLES) {
      const row: Doc<"articles"> | null = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", seed.slug))
        .unique();
      if (!row || row.title !== seed.title || row.wordpressId !== undefined) {
        result.skipped.push(seed.slug);
      } else if (row.status === "draft") {
        result.alreadyDraft.push(seed.slug);
      } else {
        await ctx.db.patch(row._id, { status: "draft", updatedAt: Date.now() });
        result.drafted.push(seed.slug);
      }
    }
    for (const seed of DOCUMENTS) {
      const row = await ctx.db
        .query("documents")
        .withIndex("by_slug", (q) => q.eq("slug", seed.slug))
        .unique();
      if (
        row &&
        row.title === seed.title &&
        row.wordpressId === undefined &&
        row.isActive !== false
      ) {
        await ctx.db.patch(row._id, { isActive: false });
        result.hiddenDocuments.push(seed.slug);
      }
    }
    return result;
  },
});
