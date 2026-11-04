import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { MEDIA } from "./mediaManifest";
import { insertArticle } from "./model/articleWrites";
import {
  MEDIA_INDEX_BUILD,
  mediaDerivedFields,
  syncArticleMedia,
} from "./model/media";
import {
  ARTICLES_1,
  ARTICLES_2,
  ARTICLES_3,
  ARTICLES_4,
  AUTHORS,
  CATEGORIES,
  DOCUMENTS,
} from "./seed";
import type { SeedArticle } from "./seed/types";
import { normalizeDemoArticle, normalizeDemoAuthor } from "./seed/people";

/**
 * Loads the demonstration dataset into the deployment.
 *
 *   bunx convex run seeding:run '{"reset": true}'
 *
 * Declared as an `internalMutation`: it is reachable from the CLI (which
 * authenticates as the developer) and from the scheduler, never from the
 * browser. An open seeding endpoint on a public deployment would be a way to
 * wipe the journal (CDC §5.3).
 *
 * The corpus is fictional — see `convex/seed/index.ts`.
 */

const ALL_ARTICLES: readonly SeedArticle[] = [
  ...ARTICLES_1,
  ...ARTICLES_2,
  ...ARTICLES_3,
  ...ARTICLES_4,
].map(normalizeDemoArticle);

const DAY = 24 * 60 * 60 * 1000;

/** ~230 words per minute, the usual figure for a French reading adult. */
function readingMinutes(article: SeedArticle): number {
  let words = `${article.title} ${article.dek}`.split(/\s+/).length;
  for (const block of article.body) {
    switch (block.type) {
      case "paragraph":
      case "heading":
        words += block.text.split(/\s+/).length;
        break;
      case "quote":
        words += block.text.split(/\s+/).length;
        break;
      case "list":
        words += block.items.join(" ").split(/\s+/).length;
        break;
      case "stat":
        words += `${block.value} ${block.label}`.split(/\s+/).length;
        break;
      case "image":
        words += 8; // temps d'arrêt sur une photo légendée
        break;
      case "video":
        break;
    }
  }
  return Math.max(1, Math.round(words / 230));
}

/** Flattens the article into the single field the search index reads. */
function searchText(article: SeedArticle): string {
  const parts: string[] = [article.title, article.dek, ...article.tags];
  for (const block of article.body) {
    if (block.type === "paragraph" || block.type === "heading") {
      parts.push(block.text);
    } else if (block.type === "quote") {
      parts.push(block.text, block.attribution ?? "");
    } else if (block.type === "list") {
      parts.push(...block.items);
    } else if (block.type === "stat") {
      parts.push(block.value, block.label);
    } else if (block.type === "video") {
      parts.push(block.title);
    }
  }
  // Le balisage en ligne ne doit pas polluer l'index.
  return parts
    .join(" ")
    .replace(/\*\*|\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fails loudly before writing anything.
 *
 * A corpus with a duplicate slug, a picture that does not exist or a section
 * that was renamed would produce a journal full of broken links and missing
 * images — visible only page by page. Checking it here costs nothing and
 * turns a silent content bug into one error message.
 */
function validate(): void {
  const problems: string[] = [];
  const categorySlugs = new Set(CATEGORIES.map((c) => c.slug));
  const authorSlugs = new Set(AUTHORS.map((a) => a.slug));
  const mediaKeys = new Set(Object.keys(MEDIA));
  const seen = new Set<string>();

  for (const article of ALL_ARTICLES) {
    const at = `article « ${article.slug} »`;
    if (seen.has(article.slug)) problems.push(`${at} : slug en double`);
    seen.add(article.slug);

    if (!categorySlugs.has(article.categorySlug)) {
      problems.push(`${at} : rubrique inconnue « ${article.categorySlug} »`);
    }
    if (
      article.subCategorySlug &&
      !categorySlugs.has(article.subCategorySlug)
    ) {
      problems.push(
        `${at} : sous-rubrique inconnue « ${article.subCategorySlug} »`
      );
    }
    if (!authorSlugs.has(article.authorSlug)) {
      problems.push(`${at} : signature inconnue « ${article.authorSlug} »`);
    }
    if (!mediaKeys.has(article.heroMediaKey)) {
      problems.push(`${at} : photo inconnue « ${article.heroMediaKey} »`);
    }
    for (const key of article.galleryMediaKeys ?? []) {
      if (!mediaKeys.has(key)) {
        problems.push(`${at} : photo de galerie inconnue « ${key} »`);
      }
    }
    if (article.keyPoints.length !== 3) {
      problems.push(`${at} : « l'essentiel » doit compter trois points`);
    }
    for (const block of article.body) {
      if (block.type === "image" && !mediaKeys.has(block.mediaKey)) {
        problems.push(`${at} : bloc image inconnu « ${block.mediaKey} »`);
      }
      if (block.type === "video" && !mediaKeys.has(block.posterMediaKey)) {
        problems.push(
          `${at} : vignette vidéo inconnue « ${block.posterMediaKey} »`
        );
      }
    }
  }

  for (const category of CATEGORIES) {
    if (category.parentSlug && !categorySlugs.has(category.parentSlug)) {
      problems.push(
        `rubrique « ${category.slug} » : parent inconnu « ${category.parentSlug} »`
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Jeu de démonstration invalide :\n  - ${problems.join("\n  - ")}`
    );
  }
}

export const run = internalMutation({
  args: { reset: v.optional(v.boolean()) },
  returns: v.object({
    categories: v.number(),
    authors: v.number(),
    media: v.number(),
    articles: v.number(),
    documents: v.number(),
  }),
  handler: async (ctx, { reset }) => {
    validate();

    // The first install adds data without deleting anything. Refuse a second
    // run before writing, rather than creating duplicate slugs or replacing work.
    if (reset === false) {
      for (const table of ["categories", "authors", "media", "articles", "documents"] as const) {
        if (await ctx.db.query(table).first()) {
          throw new Error("Le jeu de démonstration sans effacement exige un journal vide.");
        }
      }
    }

    // Le jeu de démonstration est remplacé, pas complété : deux exécutions
    // successives ne doivent pas produire vingt-six doublons.
    if (reset !== false) {
      for (const row of await ctx.db.query("categories").collect()) {
        await ctx.db.delete(row._id);
      }
      for (const row of await ctx.db.query("authors").collect()) {
        await ctx.db.delete(row._id);
      }
      for (const row of await ctx.db.query("media").collect()) {
        await ctx.db.delete(row._id);
      }
      for (const row of await ctx.db.query("articles").collect()) {
        await ctx.db.delete(row._id);
      }
      for (const row of await ctx.db.query("mediaUsages").collect()) {
        await ctx.db.delete(row._id);
      }
      // Les comptes partent avec les articles ; les insertions les refont.
      for (const row of await ctx.db.query("articleCounts").collect()) {
        await ctx.db.delete(row._id);
      }
      for (const row of await ctx.db.query("documents").collect()) {
        await ctx.db.delete(row._id);
      }
    }

    for (const category of CATEGORIES) {
      await ctx.db.insert("categories", { ...category, isActive: true });
    }

    for (const author of AUTHORS) {
      await ctx.db.insert("authors", { ...normalizeDemoAuthor(author), links: [...author.links] });
    }

    for (const asset of Object.values(MEDIA)) {
      const text = {
        key: asset.id,
        alt: asset.alt,
        caption: asset.caption,
        credit: asset.credit,
      };
      await ctx.db.insert("media", {
        ...text,
        ...mediaDerivedFields(text),
        license: asset.license,
        source: asset.source,
        width: asset.width,
        height: asset.height,
        color: asset.color,
        variants: [
          ...asset.avif.map((variant) => ({
            format: "avif" as const,
            ...variant,
          })),
          ...asset.webp.map((variant) => ({
            format: "webp" as const,
            ...variant,
          })),
        ],
      });
    }

    const now = Date.now();
    for (const article of ALL_ARTICLES) {
      const publishedAt = now - article.daysAgo * DAY;
      const articleId = await insertArticle(ctx, {
        title: article.title,
        slug: article.slug,
        dek: article.dek,
        body: [...article.body],
        status: "published",
        categorySlug: article.categorySlug,
        subCategorySlug: article.subCategorySlug,
        authorSlug: article.authorSlug,
        heroMediaKey: article.heroMediaKey,
        galleryMediaKeys: [...(article.galleryMediaKeys ?? [])],
        keyPoints: [...article.keyPoints],
        seo: { ...article.seo, keywords: [...article.seo.keywords] },
        origin: article.origin,
        feature: article.feature,
        readingMinutes: readingMinutes(article),
        tags: [...article.tags],
        createdAt: publishedAt - 2 * DAY,
        publishedAt,
        updatedAt: publishedAt,
        views: article.views,
        searchText: searchText(article),
      });
      await syncArticleMedia(ctx, articleId);
    }

    // Après une remise à zéro, tout ce qui vient d'être écrit est indexé :
    // inutile d'attendre `library:reindex` pour compter les usages.
    if (reset !== false) {
      const build = await ctx.db
        .query("indexBuilds")
        .withIndex("by_name", (q) => q.eq("name", MEDIA_INDEX_BUILD))
        .unique();
      if (!build) {
        await ctx.db.insert("indexBuilds", {
          name: MEDIA_INDEX_BUILD,
          completedAt: Date.now(),
        });
      }
    }

    for (const document of DOCUMENTS) {
      await ctx.db.insert("documents", {
        title: document.title,
        slug: document.slug,
        description: document.description,
        kind: document.kind,
        fileUrl: document.fileUrl,
        fileFormat: document.fileFormat,
        fileBytes: document.fileBytes,
        pages: document.pages,
        publisher: document.publisher,
        publishedAt: now - document.daysAgo * DAY,
      });
    }

    return {
      categories: CATEGORIES.length,
      authors: AUTHORS.length,
      media: Object.keys(MEDIA).length,
      articles: ALL_ARTICLES.length,
      documents: DOCUMENTS.length,
    };
  },
});
