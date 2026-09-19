import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { readCount, readCounts } from "./model/articleCounts";
import { displayedViews } from "./model/audience";
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
 *
 * **No query reads the whole `articles` table** (19/09/2026). An article
 * weighs about 6 Ko; the 16 Mio a function may read ran out at ~2 500 of
 * them. Lists take what they show through an index, counts come from
 * `articleCounts`, and every size a caller chooses is capped.
 */

const PUBLISHED = "published" as const;

/** Caps a size chosen by the caller: these queries are open to anyone. */
function cap(value: number, max: number): number {
  return Math.min(Math.max(Math.floor(value) || 1, 1), max);
}

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
};

const summaryValidator = v.object(summaryFields);

const detailValidator = v.object({
  ...summaryFields,
  /** Only the article page shows it: a list would have to read the audience of every card. */
  views: v.number(),
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

/* -------------------------------------------------------------------------
   Articles
   ------------------------------------------------------------------------- */

/**
 * Published slugs, newest first, one page at a time — the sitemap walks
 * them all, the article route prebuilds the first page. A page of 200
 * articles reads ~1,3 Mo, far from the 16 Mio of one call.
 */
export const publishedSlugPage = query({
  args: { cursor: v.union(v.string(), v.null()), numItems: v.number() },
  returns: v.object({
    page: v.array(
      v.object({
        slug: v.string(),
        publishedAt: v.number(),
        updatedAt: v.number(),
        categorySlug: v.string(),
      })
    ),
    continueCursor: v.string(),
    isDone: v.boolean(),
  }),
  handler: async (ctx, { cursor, numItems }) => {
    const result = await ctx.db
      .query("articles")
      .withIndex("by_status_date", (q) => q.eq("status", PUBLISHED))
      .order("desc")
      .paginate({ cursor, numItems: cap(numItems, 200) });
    return {
      page: result.page.map(
        ({ slug, publishedAt, updatedAt, categorySlug }) => ({
          slug,
          publishedAt,
          updatedAt,
          categorySlug,
        })
      ),
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
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
      .take(cap(limit, 100));
    return rows.map((row) => toSummary(row, lookup));
  },
});

/** Sizes of the home page (CDC §4.2). */
const HOME = { top: 4, latest: 6, perSection: 3, espacePro: 4 } as const;
const ESPACE_PRO = "espace-pro";

/**
 * Everything the home page needs, in one round trip: the lead story, the
 * "À la une" selection, the standing dossier, the latest pieces per section
 * and the "Espace pro" shortlist (CDC §4.2).
 *
 * Each block reads what it shows through its own index — about sixty
 * articles whatever the size of the archive, where the whole table was read
 * until 19/09/2026.
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
    const featured = (feature: "lead" | "top" | "dossier") =>
      ctx.db
        .query("articles")
        .withIndex("by_feature", (q) =>
          q.eq("status", PUBLISHED).eq("feature", feature)
        )
        .order("desc");
    const newestIn = (categorySlug: string, count: number) =>
      ctx.db
        .query("articles")
        .withIndex("by_category", (q) =>
          q.eq("status", PUBLISHED).eq("categorySlug", categorySlug)
        )
        .order("desc")
        .take(count);

    const sections = [...lookup.categories.values()]
      .filter(
        (row) => !row.parentSlug && row.isActive && row.slug !== ESPACE_PRO
      )
      .sort((a, b) => a.order - b.order);

    const [leadRow, dossierRow, topRows, newest, sectionRows, espaceProRows] =
      await Promise.all([
        featured("lead").first(),
        featured("dossier").first(),
        featured("top").take(HOME.top),
        // The latest pieces leave out the lead, the dossier and the "top"
        // selection: reading that many more is enough to still fill the block.
        ctx.db
          .query("articles")
          .withIndex("by_status_date", (q) => q.eq("status", PUBLISHED))
          .order("desc")
          .take(HOME.latest + HOME.top + 2),
        Promise.all(
          sections.map((section) => newestIn(section.slug, HOME.perSection))
        ),
        newestIn(ESPACE_PRO, HOME.espacePro),
      ]);

    const summary = (row: Doc<"articles">) => toSummary(row, lookup);
    const lead = leadRow ? summary(leadRow) : null;
    const dossier = dossierRow ? summary(dossierRow) : null;
    const top = topRows.map(summary);
    const taken = new Set(
      [lead?.slug, dossier?.slug, ...top.map((item) => item.slug)].filter(
        Boolean
      ) as string[]
    );

    return {
      lead,
      top,
      dossier,
      latest: newest
        .filter((row) => !taken.has(row.slug))
        .slice(0, HOME.latest)
        .map(summary),
      bySection: sections
        .map((section, index) => ({
          slug: section.slug,
          name: section.name,
          accent: section.accent,
          description: section.description,
          articles: sectionRows[index].map(summary),
        }))
        .filter((section) => section.articles.length > 0),
      espacePro: espaceProRows.map(summary),
    };
  },
});

/**
 * One page of a section or sub-section list.
 *
 * Pagination is offset-based on purpose: the section pages are prerendered
 * (`/rubrique/<slug>/page/2`), so the query runs at build or revalidation
 * time, never on the reader's critical path.
 *
 * Page `n` reads the `n × perPage` articles up to it (plus one, to know
 * whether another page follows), no longer the whole section: the first page
 * of « Éditorial » reads 10 articles instead of 902. The total comes from
 * `articleCounts`; it is exact from the list itself when the list ends here.
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
  handler: async (ctx, args) => {
    const { categorySlug, subCategorySlug, order } = args;
    const perPage = cap(args.perPage, 48);
    const page = cap(args.page, 10_000);
    const reach = page * perPage;

    const [lookup, rows, counted] = await Promise.all([
      loadLookup(ctx),
      (subCategorySlug
        ? ctx.db
            .query("articles")
            .withIndex("by_subcategory", (q) =>
              q.eq("status", PUBLISHED).eq("subCategorySlug", subCategorySlug)
            )
        : ctx.db
            .query("articles")
            .withIndex("by_category", (q) =>
              q.eq("status", PUBLISHED).eq("categorySlug", categorySlug)
            )
      )
        .order(order === "recent" ? "desc" : "asc")
        .take(reach + 1),
      subCategorySlug
        ? readCount(ctx, "published_subcategory", subCategorySlug)
        : readCount(ctx, "published_category", categorySlug),
    ]);

    // Stopped short: the whole list is in hand, and so is its length.
    const total =
      rows.length <= reach ? rows.length : Math.max(counted, reach + 1);
    const pageCount = Math.max(1, Math.ceil(total / perPage));
    const safePage = Math.min(page, pageCount);
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
    const [sections, subSections] = await Promise.all([
      readCounts(ctx, "published_category"),
      readCounts(ctx, "published_subcategory"),
    ]);
    const counts = new Map(sections);
    for (const [slug, count] of subSections) {
      counts.set(slug, (counts.get(slug) ?? 0) + count);
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

    const [lookup, stats] = await Promise.all([
      loadLookup(ctx),
      ctx.db
        .query("articleStats")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique(),
    ]);
    const author = lookup.authors.get(row.authorSlug);
    return {
      ...toSummary(row, lookup),
      views: displayedViews(row, stats),
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

/** Articles sharing a tag are looked up through the search index, this many at most. */
const TAG_CANDIDATES = 12;

/** The words of the tags, as the search index wants them (16 terms at most). */
function tagQuery(tags: readonly string[]): string {
  const words = new Set(
    tags.flatMap((tag) =>
      tag
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((word) => word.length > 1)
    )
  );
  return [...words].slice(0, 16).join(" ");
}

/**
 * Related reading: same sub-section first, then same section, then the tags.
 * Never the article itself, never a duplicate.
 *
 * Only candidates are read: the newest of the sub-section and of the section
 * (one more than asked, the article itself may be among them), and the
 * articles the search index finds for the tags. Without shared tags — the
 * whole WordPress archive: its 123 tags are unique — the result is exactly
 * the one of the whole archive. With them, an older piece sharing a tag is
 * found as long as the search ranks it among the first twelve: a tag whose
 * words fill many bodies (a company in the news) can leave it out, and the
 * newest pieces of the section stand in its place.
 */
export const related = query({
  args: { slug: v.string(), limit: v.number() },
  returns: v.array(summaryValidator),
  handler: async (ctx, { slug, limit }) => {
    const count = cap(limit, 12);
    const current = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!current) return [];

    const subCategorySlug = current.subCategorySlug;
    const terms = tagQuery(current.tags);
    const [lookup, sameSub, sameSection, sameTags] = await Promise.all([
      loadLookup(ctx),
      subCategorySlug
        ? ctx.db
            .query("articles")
            .withIndex("by_subcategory", (q) =>
              q.eq("status", PUBLISHED).eq("subCategorySlug", subCategorySlug)
            )
            .order("desc")
            .take(count + 1)
        : [],
      ctx.db
        .query("articles")
        .withIndex("by_category", (q) =>
          q.eq("status", PUBLISHED).eq("categorySlug", current.categorySlug)
        )
        .order("desc")
        .take(count + 1),
      terms
        ? ctx.db
            .query("articles")
            .withSearchIndex("search_articles", (q) =>
              q.search("searchText", terms).eq("status", PUBLISHED)
            )
            // The article matches its own tags: one more.
            .take(TAG_CANDIDATES + 1)
        : [],
    ]);
    const pool = [
      ...new Map(
        [...sameSub, ...sameSection, ...sameTags].map((row) => [row._id, row])
      ).values(),
    ];

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
        (a, b) =>
          b.value - a.value ||
          b.row.publishedAt - a.row.publishedAt ||
          // Same instant: the order of the index, which the whole-archive
          // version inherited from its read.
          b.row._creationTime - a.row._creationTime
      )
      .slice(0, count)
      .map((entry) => toSummary(entry.row, lookup));
  },
});

/* -------------------------------------------------------------------------
   Authors, documents, search
   ------------------------------------------------------------------------- */

/** Articles listed on an author page; the page states the total beside them. */
const AUTHOR_PAGE_ARTICLES = 24;

/**
 * An author and their latest articles. The WordPress archive signs all
 * 1 019 of its pieces with one name: the page lists the newest ones and
 * gives the total, the sections carry the archive.
 */
export const authorBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      author: authorValidator,
      articles: v.array(summaryValidator),
      /** Published articles signed by the author, listed or not. */
      total: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, { slug }) => {
    const author = await ctx.db
      .query("authors")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (!author) return null;

    const [lookup, rows, counted] = await Promise.all([
      loadLookup(ctx),
      ctx.db
        .query("articles")
        .withIndex("by_author", (q) =>
          q.eq("status", PUBLISHED).eq("authorSlug", slug)
        )
        .order("desc")
        .take(AUTHOR_PAGE_ARTICLES + 1),
      readCount(ctx, "published_author", slug),
    ]);

    return {
      author: {
        slug: author.slug,
        name: author.name,
        role: author.role,
        bio: author.bio,
        portraitMediaKey: author.portraitMediaKey,
        links: author.links,
      },
      articles: rows
        .slice(0, AUTHOR_PAGE_ARTICLES)
        .map((row) => toSummary(row, lookup)),
      total:
        rows.length <= AUTHOR_PAGE_ARTICLES
          ? rows.length
          : Math.max(counted, rows.length),
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
    const [rows, counts] = await Promise.all([
      ctx.db.query("authors").collect(),
      readCounts(ctx, "published_author"),
    ]);
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
    return rows
      .filter((row) => row.isActive !== false)
      .map(
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
      .take(cap(limit, 50));

    return rows.map((row) => toSummary(row, lookup));
  },
});
