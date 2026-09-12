import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { blockValidator, seoValidator } from "./model/content";

/**
 * Public read API of the journal.
 *
 * Everything here is readable by anyone: the site is a newspaper. The pages
 * call these from the server (`lib/content/server.ts`) and cache the result
 * with ISR, so a reader's visit costs no Convex round trip at all.
 *
 * Only `status: "published"` ever leaves this module. Drafts, submissions and
 * partner deposits stay invisible until milestone 3 publishes them.
 */

const PUBLISHED = "published" as const;

/* -------------------------------------------------------------------------
   Shapes returned to the pages
   ------------------------------------------------------------------------- */

const summaryFields = {
  slug: v.string(),
  title: v.string(),
  dek: v.string(),
  categorySlug: v.string(),
  categoryName: v.string(),
  categoryAccent: v.string(),
  subCategorySlug: v.optional(v.string()),
  subCategoryName: v.optional(v.string()),
  authorSlug: v.string(),
  authorName: v.string(),
  heroMediaKey: v.optional(v.string()),
  publishedAt: v.number(),
  readingMinutes: v.number(),
  origin: v.union(v.literal("redaction"), v.literal("partenaire")),
  feature: v.union(
    v.literal("lead"),
    v.literal("top"),
    v.literal("dossier"),
    v.literal("none")
  ),
  views: v.number(),
};

const summaryValidator = v.object(summaryFields);

const detailValidator = v.object({
  ...summaryFields,
  body: v.array(blockValidator),
  keyPoints: v.array(v.string()),
  galleryMediaKeys: v.array(v.string()),
  seo: seoValidator,
  updatedAt: v.number(),
  authorRole: v.string(),
  authorBio: v.string(),
  tags: v.array(v.string()),
});

const categoryValidator = v.object({
  name: v.string(),
  slug: v.string(),
  parentSlug: v.optional(v.string()),
  accent: v.string(),
  order: v.number(),
  description: v.string(),
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
});

const authorValidator = v.object({
  slug: v.string(),
  name: v.string(),
  role: v.string(),
  bio: v.string(),
  portraitMediaKey: v.optional(v.string()),
  links: v.array(v.object({ label: v.string(), url: v.string() })),
});

/* -------------------------------------------------------------------------
   Denormalisation helpers
   ------------------------------------------------------------------------- */

type Lookup = {
  categories: Map<string, Doc<"categories">>;
  authors: Map<string, Doc<"authors">>;
};

/**
 * Loads the two small reference tables once per query.
 *
 * The alternative — one lookup per article — would multiply reads by twenty on
 * a list page for no gain: both tables hold a few dozen rows.
 */
async function loadLookup(ctx: QueryCtx): Promise<Lookup> {
  const [categories, authors] = await Promise.all([
    ctx.db.query("categories").collect(),
    ctx.db.query("authors").collect(),
  ]);
  return {
    categories: new Map(categories.map((row) => [row.slug, row])),
    authors: new Map(authors.map((row) => [row.slug, row])),
  };
}

function toSummary(article: Doc<"articles">, lookup: Lookup) {
  const category = lookup.categories.get(article.categorySlug);
  const sub = article.subCategorySlug
    ? lookup.categories.get(article.subCategorySlug)
    : undefined;
  const author = lookup.authors.get(article.authorSlug);
  return {
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    categorySlug: article.categorySlug,
    categoryName: category?.name ?? article.categorySlug,
    categoryAccent: category?.accent ?? "navy-900",
    subCategorySlug: article.subCategorySlug,
    subCategoryName: sub?.name,
    authorSlug: article.authorSlug,
    authorName: author?.name ?? "La rédaction",
    heroMediaKey: article.heroMediaKey,
    publishedAt: article.publishedAt,
    readingMinutes: article.readingMinutes,
    origin: article.origin,
    feature: article.feature,
    views: article.views,
  };
}

/* -------------------------------------------------------------------------
   Navigation and reference data
   ------------------------------------------------------------------------- */

/** The editorial tree, ordered — drives the masthead, the drawer and the footer. */
export const navigation = query({
  args: {},
  returns: v.array(categoryValidator),
  handler: async (ctx) => {
    const rows = await ctx.db.query("categories").collect();
    return rows
      .filter((row) => row.isActive)
      .sort((a, b) => a.order - b.order)
      .map(({ name, slug, parentSlug, accent, order, description }) => ({
        name,
        slug,
        parentSlug,
        accent,
        order,
        description,
      }));
  },
});

export const mediaLibrary = query({
  args: {},
  returns: v.array(mediaValidator),
  handler: async (ctx) => {
    const rows = await ctx.db.query("media").collect();
    return rows.map(
      ({
        key,
        alt,
        caption,
        credit,
        license,
        source,
        width,
        height,
        color,
      }) => ({
        key,
        alt,
        caption,
        credit,
        license,
        source,
        width,
        height,
        color,
      })
    );
  },
});

/* -------------------------------------------------------------------------
   Articles
   ------------------------------------------------------------------------- */

/** Every published slug, newest first — feeds ISR, the sitemap and the RSS. */
export const publishedSlugs = query({
  args: {},
  returns: v.array(
    v.object({
      slug: v.string(),
      publishedAt: v.number(),
      updatedAt: v.number(),
      categorySlug: v.string(),
    })
  ),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("articles")
      .withIndex("by_status_date", (q) => q.eq("status", PUBLISHED))
      .order("desc")
      .collect();
    return rows.map(({ slug, publishedAt, updatedAt, categorySlug }) => ({
      slug,
      publishedAt,
      updatedAt,
      categorySlug,
    }));
  },
});

export const latest = query({
  args: { limit: v.number() },
  returns: v.array(summaryValidator),
  handler: async (ctx, { limit }) => {
    const lookup = await loadLookup(ctx);
    const rows = await ctx.db
      .query("articles")
      .withIndex("by_status_date", (q) => q.eq("status", PUBLISHED))
      .order("desc")
      .take(limit);
    return rows.map((row) => toSummary(row, lookup));
  },
});

/**
 * Everything the home page needs, in one round trip: the lead story, the
 * "À la une" selection, the standing dossier, the latest pieces per section
 * and the "Espace pro" shortlist (CDC §4.2).
 */
export const homepage = query({
  args: {},
  returns: v.object({
    lead: v.union(summaryValidator, v.null()),
    top: v.array(summaryValidator),
    dossier: v.union(summaryValidator, v.null()),
    latest: v.array(summaryValidator),
    bySection: v.array(
      v.object({
        slug: v.string(),
        name: v.string(),
        accent: v.string(),
        description: v.string(),
        articles: v.array(summaryValidator),
      })
    ),
    espacePro: v.array(summaryValidator),
  }),
  handler: async (ctx) => {
    const lookup = await loadLookup(ctx);
    const all = await ctx.db
      .query("articles")
      .withIndex("by_status_date", (q) => q.eq("status", PUBLISHED))
      .order("desc")
      .collect();
    const summaries = all.map((row) => toSummary(row, lookup));

    const lead = summaries.find((item) => item.feature === "lead") ?? null;
    const dossier =
      summaries.find((item) => item.feature === "dossier") ?? null;
    const top = summaries
      .filter((item) => item.feature === "top" && item.slug !== lead?.slug)
      .slice(0, 4);

    const taken = new Set(
      [lead?.slug, dossier?.slug, ...top.map((item) => item.slug)].filter(
        Boolean
      ) as string[]
    );

    const sections = [...lookup.categories.values()]
      .filter((row) => !row.parentSlug && row.isActive)
      .sort((a, b) => a.order - b.order);

    const bySection = sections
      .filter((section) => section.slug !== "espace-pro")
      .map((section) => ({
        slug: section.slug,
        name: section.name,
        accent: section.accent,
        description: section.description,
        articles: summaries
          .filter((item) => item.categorySlug === section.slug)
          .slice(0, 3),
      }))
      .filter((section) => section.articles.length > 0);

    return {
      lead,
      top,
      dossier,
      latest: summaries
        .filter((item) => !taken.has(item.slug))
        .slice(0, 6),
      bySection,
      espacePro: summaries
        .filter((item) => item.categorySlug === "espace-pro")
        .slice(0, 4),
    };
  },
});

/**
 * One page of a section or sub-section list.
 *
 * Pagination is offset-based on purpose: the section pages are prerendered
 * (`/rubrique/<slug>/page/2`), so the query runs at build or revalidation
 * time, never on the reader's critical path.
 */
export const bySection = query({
  args: {
    categorySlug: v.string(),
    subCategorySlug: v.optional(v.string()),
    page: v.number(),
    perPage: v.number(),
    order: v.union(v.literal("recent"), v.literal("ancien")),
  },
  returns: v.object({
    items: v.array(summaryValidator),
    total: v.number(),
    page: v.number(),
    pageCount: v.number(),
  }),
  handler: async (
    ctx,
    { categorySlug, subCategorySlug, page, perPage, order }
  ) => {
    const lookup = await loadLookup(ctx);
    const rows = subCategorySlug
      ? await ctx.db
          .query("articles")
          .withIndex("by_subcategory", (q) =>
            q.eq("status", PUBLISHED).eq("subCategorySlug", subCategorySlug)
          )
          .order(order === "recent" ? "desc" : "asc")
          .collect()
      : await ctx.db
          .query("articles")
          .withIndex("by_category", (q) =>
            q.eq("status", PUBLISHED).eq("categorySlug", categorySlug)
          )
          .order(order === "recent" ? "desc" : "asc")
          .collect();

    const total = rows.length;
    const pageCount = Math.max(1, Math.ceil(total / perPage));
    const safePage = Math.min(Math.max(1, page), pageCount);
    const items = rows
      .slice((safePage - 1) * perPage, safePage * perPage)
      .map((row) => toSummary(row, lookup));

    return { items, total, page: safePage, pageCount };
  },
});

/** Number of published articles per section slug — shown next to the filters. */
export const sectionCounts = query({
  args: {},
  returns: v.array(v.object({ slug: v.string(), count: v.number() })),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("articles")
      .withIndex("by_status_date", (q) => q.eq("status", PUBLISHED))
      .collect();
    const counts = new Map<string, number>();
    for (const row of rows) {
      counts.set(row.categorySlug, (counts.get(row.categorySlug) ?? 0) + 1);
      if (row.subCategorySlug) {
        counts.set(
          row.subCategorySlug,
          (counts.get(row.subCategorySlug) ?? 0) + 1
        );
      }
    }
    return [...counts].map(([slug, count]) => ({ slug, count }));
  },
});

export const article = query({
  args: { slug: v.string() },
  returns: v.union(detailValidator, v.null()),
  handler: async (ctx, { slug }) => {
    const row = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!row || row.status !== PUBLISHED) return null;

    const lookup = await loadLookup(ctx);
    const author = lookup.authors.get(row.authorSlug);
    return {
      ...toSummary(row, lookup),
      body: row.body,
      keyPoints: row.keyPoints,
      galleryMediaKeys: row.galleryMediaKeys,
      seo: row.seo,
      updatedAt: row.updatedAt,
      authorRole: author?.role ?? "",
      authorBio: author?.bio ?? "",
      tags: row.tags,
    };
  },
});

/**
 * Related reading: same sub-section first, then same section, then the tags.
 * Never the article itself, never a duplicate.
 */
export const related = query({
  args: { slug: v.string(), limit: v.number() },
  returns: v.array(summaryValidator),
  handler: async (ctx, { slug, limit }) => {
    const current = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!current) return [];

    const lookup = await loadLookup(ctx);
    const pool = await ctx.db
      .query("articles")
      .withIndex("by_status_date", (q) => q.eq("status", PUBLISHED))
      .order("desc")
      .collect();

    const tags = new Set(current.tags);
    const score = (row: Doc<"articles">) => {
      let value = 0;
      if (
        current.subCategorySlug &&
        row.subCategorySlug === current.subCategorySlug
      ) {
        value += 4;
      }
      if (row.categorySlug === current.categorySlug) value += 2;
      value += row.tags.filter((tag) => tags.has(tag)).length;
      return value;
    };

    return pool
      .filter((row) => row.slug !== slug)
      .map((row) => ({ row, value: score(row) }))
      .filter((entry) => entry.value > 0)
      .sort(
        (a, b) => b.value - a.value || b.row.publishedAt - a.row.publishedAt
      )
      .slice(0, limit)
      .map((entry) => toSummary(entry.row, lookup));
  },
});

/* -------------------------------------------------------------------------
   Authors, documents, search
   ------------------------------------------------------------------------- */

export const authorBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      author: authorValidator,
      articles: v.array(summaryValidator),
    }),
    v.null()
  ),
  handler: async (ctx, { slug }) => {
    const author = await ctx.db
      .query("authors")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!author) return null;

    const lookup = await loadLookup(ctx);
    const rows = await ctx.db
      .query("articles")
      .withIndex("by_author", (q) =>
        q.eq("status", PUBLISHED).eq("authorSlug", slug)
      )
      .order("desc")
      .collect();

    return {
      author: {
        slug: author.slug,
        name: author.name,
        role: author.role,
        bio: author.bio,
        portraitMediaKey: author.portraitMediaKey,
        links: author.links,
      },
      articles: rows.map((row) => toSummary(row, lookup)),
    };
  },
});

export const authors = query({
  args: {},
  returns: v.array(
    v.object({
      slug: v.string(),
      name: v.string(),
      role: v.string(),
      bio: v.string(),
      articleCount: v.number(),
    })
  ),
  handler: async (ctx) => {
    const [rows, articles] = await Promise.all([
      ctx.db.query("authors").collect(),
      ctx.db
        .query("articles")
        .withIndex("by_status_date", (q) => q.eq("status", PUBLISHED))
        .collect(),
    ]);
    const counts = new Map<string, number>();
    for (const item of articles) {
      counts.set(item.authorSlug, (counts.get(item.authorSlug) ?? 0) + 1);
    }
    return rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      role: row.role,
      bio: row.bio,
      articleCount: counts.get(row.slug) ?? 0,
    }));
  },
});

export const documents = query({
  args: {},
  returns: v.array(
    v.object({
      slug: v.string(),
      title: v.string(),
      description: v.string(),
      kind: v.string(),
      fileUrl: v.string(),
      fileFormat: v.string(),
      fileBytes: v.number(),
      pages: v.optional(v.number()),
      publisher: v.string(),
      publishedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("documents")
      .withIndex("by_date")
      .order("desc")
      .collect();
    return rows.map(
      ({
        slug,
        title,
        description,
        kind,
        fileUrl,
        fileFormat,
        fileBytes,
        pages,
        publisher,
        publishedAt,
      }) => ({
        slug,
        title,
        description,
        kind,
        fileUrl,
        fileFormat,
        fileBytes,
        pages,
        publisher,
        publishedAt,
      })
    );
  },
});

/**
 * Full-text search over the Convex index (CDC §5.1).
 *
 * Serves both `/recherche` and the `Cmd+K` dialog, through the route handler
 * `app/api/recherche/route.ts` — so the Convex client never ships to the
 * browser and the JavaScript budget of §5.4 stays intact.
 */
export const search = query({
  args: {
    term: v.string(),
    categorySlug: v.optional(v.string()),
    limit: v.number(),
  },
  returns: v.array(summaryValidator),
  handler: async (ctx, { term, categorySlug, limit }) => {
    const trimmed = term.trim();
    if (trimmed.length < 2) return [];

    const lookup = await loadLookup(ctx);
    const rows = await ctx.db
      .query("articles")
      .withSearchIndex("search_articles", (q) => {
        const base = q.search("searchText", trimmed).eq("status", PUBLISHED);
        return categorySlug ? base.eq("categorySlug", categorySlug) : base;
      })
      .take(limit);

    return rows.map((row) => toSummary(row, lookup));
  },
});
