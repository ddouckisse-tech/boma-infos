import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  accessError,
  PERMISSIONS,
  requirePermission,
  type Viewer,
} from "./model/access";
import { readCount, readCounts } from "./model/articleCounts";
import {
  deleteArticle,
  insertArticle,
  patchArticle,
} from "./model/articleWrites";
import { countMissingAlt, syncArticleMedia } from "./model/media";
import { recordAudit } from "./model/audit";
import { AUDIENCE_DAYS, computeAudience, viewsOver } from "./model/audience";
import {
  articleFeature,
  articleOrigin,
  articleStatus,
  blockValidator,
  seoValidator,
} from "./model/content";
import { plainText, readingMinutes, searchText, slugify } from "./model/text";

/**
 * Newsroom back office — CDC §4.4 "Back-office rédaction".
 *
 * Every function here starts with a permission check. The section filter is
 * the second gate: an Éditeur whose profile carries `sectionSlugs` may only
 * touch pieces in those sections, and that is checked on the *stored* row,
 * not on the argument the caller sent.
 */

/* -------------------------------------------------------------------------
   Shapes
   ------------------------------------------------------------------------- */

const rowShape = v.object({
  _id: v.id("articles"),
  title: v.string(),
  slug: v.string(),
  dek: v.string(),
  status: articleStatus,
  categorySlug: v.string(),
  categoryName: v.string(),
  subCategorySlug: v.optional(v.string()),
  authorSlug: v.string(),
  authorName: v.string(),
  origin: articleOrigin,
  feature: articleFeature,
  heroMediaKey: v.optional(v.string()),
  publishedAt: v.number(),
  updatedAt: v.number(),
  readingMinutes: v.number(),
  pendingSuggestions: v.number(),
});

const detailShape = v.object({
  _id: v.id("articles"),
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
  origin: articleOrigin,
  feature: articleFeature,
  tags: v.array(v.string()),
  readingMinutes: v.number(),
  publishedAt: v.number(),
  updatedAt: v.number(),
  editable: v.boolean(),
});

const versionShape = v.object({
  _id: v.id("articleVersions"),
  at: v.number(),
  authorName: v.string(),
  label: v.string(),
  title: v.string(),
  status: articleStatus,
});

/* -------------------------------------------------------------------------
   Section scope
   ------------------------------------------------------------------------- */

/**
 * CDC §4.3: an Éditeur "publie dans ses rubriques autorisées".
 *
 * An empty list means every section — the common case for a small newsroom.
 * An Administrateur is never restricted.
 */
function assertSection(viewer: Viewer, categorySlug: string): void {
  if (viewer.role.slug === "administrateur") return;
  const allowed = viewer.profile.sectionSlugs ?? [];
  if (allowed.length === 0) return;
  if (!allowed.includes(categorySlug)) throw accessError("FORBIDDEN");
}

async function loadLookup(ctx: QueryCtx) {
  const [categories, authors] = await Promise.all([
    ctx.db.query("categories").collect(),
    ctx.db.query("authors").collect(),
  ]);
  return {
    categories: new Map(categories.map((row) => [row.slug, row])),
    authors: new Map(authors.map((row) => [row.slug, row])),
  };
}

type Lookup = Awaited<ReturnType<typeof loadLookup>>;

/**
 * Agent proposals still waiting for a human, per target, through the status
 * index: the decided ones — most of the table, which only grows — are not
 * read. `limit` caps what a badge needs.
 */
async function pendingSuggestions(ctx: QueryCtx, limit?: number) {
  const pending = ctx.db
    .query("agentSuggestions")
    .withIndex("by_status", (q) => q.eq("status", "pending"));
  const rows =
    limit === undefined ? await pending.collect() : await pending.take(limit);
  const byTarget = new Map<string, number>();
  for (const row of rows) {
    byTarget.set(row.targetId, (byTarget.get(row.targetId) ?? 0) + 1);
  }
  return { total: rows.length, byTarget };
}

/** Company deposits handed over and not yet decided. */
async function waitingSubmissions(
  ctx: QueryCtx,
  limit?: number
): Promise<number> {
  const counts = await Promise.all(
    (["submitted", "in_review"] as const).map(async (status) => {
      const rows = ctx.db
        .query("submissions")
        .withIndex("by_status", (q) => q.eq("status", status));
      return (
        limit === undefined ? await rows.collect() : await rows.take(limit)
      ).length;
    })
  );
  return counts[0] + counts[1];
}

/** Companies an administrator has not approved (pending, rejected or suspended). */
async function waitingOrganizations(
  ctx: QueryCtx,
  limit?: number
): Promise<number> {
  const rows = ctx.db
    .query("organizations")
    .withIndex("by_approved", (q) => q.eq("approved", false));
  return (limit === undefined ? await rows.collect() : await rows.take(limit))
    .length;
}

function toRow(
  row: Doc<"articles">,
  lookup: Lookup,
  pending: Map<string, number>
) {
  return {
    _id: row._id,
    title: row.title,
    slug: row.slug,
    dek: row.dek,
    status: row.status,
    categorySlug: row.categorySlug,
    categoryName:
      lookup.categories.get(row.categorySlug)?.name ?? row.categorySlug,
    subCategorySlug: row.subCategorySlug,
    authorSlug: row.authorSlug,
    authorName: lookup.authors.get(row.authorSlug)?.name ?? row.authorSlug,
    origin: row.origin,
    feature: row.feature,
    heroMediaKey: row.heroMediaKey,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    readingMinutes: row.readingMinutes,
    pendingSuggestions: pending.get(row._id) ?? 0,
  };
}

/* -------------------------------------------------------------------------
   Reads
   ------------------------------------------------------------------------- */

export const dashboard = query({
  args: {},
  returns: v.object({
    counts: v.object({
      draft: v.number(),
      inReview: v.number(),
      scheduled: v.number(),
      published: v.number(),
    }),
    submissionsWaiting: v.number(),
    organizationsWaiting: v.number(),
    /** What the newsroom should look at next (task-first dashboard, 12/09/2026). */
    tasks: v.object({
      pendingSuggestions: v.number(),
      mediaMissingAlt: v.number(),
      hasLead: v.boolean(),
      awaitingReview: v.array(rowShape),
    }),
    recent: v.array(rowShape),
    audience: v.object({
      views7d: v.number(),
      views30d: v.number(),
      topArticles: v.array(
        v.object({ slug: v.string(), title: v.string(), views: v.number() })
      ),
    }),
  }),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);

    // Nothing here reads a whole table, and nothing changes on a public
    // view: counts come from `articleCounts`, lists from their index, the
    // audience from the quarter-hourly snapshot.
    const newest = (status: "in_review" | "submitted") =>
      ctx.db
        .query("articles")
        .withIndex("by_status_updated", (q) => q.eq("status", status))
        .order("desc")
        .take(5);
    const [
      statuses,
      lookup,
      pending,
      submissionsWaiting,
      organizationsWaiting,
      recentRows,
      reviewRows,
      lead,
      snapshot,
      mediaMissingAlt,
    ] = await Promise.all([
      readCounts(ctx, "status"),
      loadLookup(ctx),
      pendingSuggestions(ctx),
      waitingSubmissions(ctx),
      waitingOrganizations(ctx),
      ctx.db.query("articles").withIndex("by_updated").order("desc").take(8),
      Promise.all([newest("in_review"), newest("submitted")]),
      ctx.db
        .query("articles")
        .withIndex("by_feature", (q) =>
          q.eq("status", "published").eq("feature", "lead")
        )
        .first(),
      ctx.db
        .query("audienceSnapshots")
        .withIndex("by_key", (q) => q.eq("key", "site"))
        .unique(),
      countMissingAlt(ctx),
    ]);

    const count = (status: Doc<"articles">["status"]) =>
      statuses.get(status) ?? 0;
    const now = Date.now();
    // Before the first snapshot (the first quarter of an hour after a
    // deployment), the same figures are computed here.
    const audience = snapshot ?? (await computeAudience(ctx, now, null));

    return {
      counts: {
        draft: count("draft"),
        inReview: count("in_review") + count("submitted"),
        scheduled: count("scheduled"),
        published: count("published"),
      },
      submissionsWaiting,
      organizationsWaiting,
      tasks: {
        pendingSuggestions: pending.total,
        mediaMissingAlt,
        hasLead: lead !== null,
        awaitingReview: reviewRows
          .flat()
          .sort(
            (a, b) =>
              b.updatedAt - a.updatedAt || a._creationTime - b._creationTime
          )
          .slice(0, 5)
          .map((row) => toRow(row, lookup, pending.byTarget)),
      },
      recent: recentRows.map((row) => toRow(row, lookup, pending.byTarget)),
      audience: {
        views7d: viewsOver(audience.days, now, 7),
        views30d: viewsOver(audience.days, now, AUDIENCE_DAYS),
        topArticles: audience.topArticles,
      },
    };
  },
});

/** Rows of the article list; a search returns its most relevant matches. */
const LIST_SIZE = 200;
const SEARCH_SIZE = 50;
const STATUSES = articleStatus.members.map((member) => member.value);
const ORIGINS = articleOrigin.members.map((member) => member.value);

/**
 * The articles of the narrowest filter, last modified first: the list stops
 * at 200 matches, and reads no more than that filter holds — `articleCounts`
 * says which one it is. Without a filter, the last modified of all.
 */
async function narrowestList(
  ctx: QueryCtx,
  filters: {
    status?: Doc<"articles">["status"];
    categorySlug?: string;
    authorSlug?: string;
    origin?: Doc<"articles">["origin"];
  }
) {
  const { status, categorySlug, authorSlug, origin } = filters;
  const everything = () => ctx.db.query("articles").withIndex("by_updated");
  const candidates: {
    size: Promise<number>;
    query: () => ReturnType<typeof everything>;
  }[] = [];
  if (status) {
    candidates.push({
      size: readCount(ctx, "status", status),
      query: () =>
        ctx.db
          .query("articles")
          .withIndex("by_status_updated", (q) => q.eq("status", status)),
    });
  }
  if (categorySlug) {
    candidates.push({
      size: readCount(ctx, "category", categorySlug),
      query: () =>
        ctx.db
          .query("articles")
          .withIndex("by_category_updated", (q) =>
            q.eq("categorySlug", categorySlug)
          ),
    });
  }
  if (authorSlug) {
    candidates.push({
      size: readCount(ctx, "author", authorSlug),
      query: () =>
        ctx.db
          .query("articles")
          .withIndex("by_author_updated", (q) =>
            q.eq("authorSlug", authorSlug)
          ),
    });
  }
  if (origin) {
    candidates.push({
      size: readCount(ctx, "origin", origin),
      query: () =>
        ctx.db
          .query("articles")
          .withIndex("by_origin_updated", (q) => q.eq("origin", origin)),
    });
  }
  if (candidates.length === 0) return everything().order("desc");
  const sizes = await Promise.all(candidates.map((entry) => entry.size));
  return candidates[sizes.indexOf(Math.min(...sizes))].query().order("desc");
}

export const list = query({
  args: {
    status: v.optional(v.string()),
    categorySlug: v.optional(v.string()),
    authorSlug: v.optional(v.string()),
    origin: v.optional(v.string()),
    term: v.optional(v.string()),
  },
  returns: v.array(rowShape),
  handler: async (ctx, filters) => {
    await requirePermission(ctx, PERMISSIONS.articlesRead);
    const status = STATUSES.find((value) => value === filters.status);
    const origin = ORIGINS.find((value) => value === filters.origin);
    // Un filtre inconnu ne désigne aucun article, comme avant.
    if ((filters.status && !status) || (filters.origin && !origin)) return [];

    const [lookup, pending] = await Promise.all([
      loadLookup(ctx),
      pendingSuggestions(ctx),
    ]);
    const matches = (row: Doc<"articles">) =>
      (!status || row.status === status) &&
      (!filters.categorySlug || row.categorySlug === filters.categorySlug) &&
      (!filters.authorSlug || row.authorSlug === filters.authorSlug) &&
      (!origin || row.origin === origin);

    const term = (filters.term ?? "").trim().toLowerCase();
    const rows: Doc<"articles">[] = [];
    if (term) {
      // Title, chapô, tags and body, over the whole archive — the substring
      // test on titles read every article at each keystroke.
      const found = await ctx.db
        .query("articles")
        .withSearchIndex("search_articles", (q) => {
          const search = q.search("searchText", term);
          const inStatus = status ? search.eq("status", status) : search;
          return filters.categorySlug
            ? inStatus.eq("categorySlug", filters.categorySlug)
            : inStatus;
        })
        .take(SEARCH_SIZE);
      rows.push(...found.filter(matches));
    } else {
      for await (const row of await narrowestList(ctx, {
        status,
        categorySlug: filters.categorySlug,
        authorSlug: filters.authorSlug,
        origin,
      })) {
        if (!matches(row)) continue;
        rows.push(row);
        if (rows.length === LIST_SIZE) break;
      }
    }

    return rows
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((row) => toRow(row, lookup, pending.byTarget));
  },
});

export const get = query({
  args: { id: v.id("articles") },
  returns: v.union(detailShape, v.null()),
  handler: async (ctx, { id }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.articlesRead);
    const row = await ctx.db.get(id);
    if (!row) return null;
    const allowed = viewer.profile.sectionSlugs ?? [];
    const editable =
      viewer.role.slug === "administrateur" ||
      allowed.length === 0 ||
      allowed.includes(row.categorySlug);
    return {
      _id: row._id,
      title: row.title,
      slug: row.slug,
      dek: row.dek,
      body: row.body,
      status: row.status,
      categorySlug: row.categorySlug,
      subCategorySlug: row.subCategorySlug,
      authorSlug: row.authorSlug,
      heroMediaKey: row.heroMediaKey,
      galleryMediaKeys: row.galleryMediaKeys,
      keyPoints: row.keyPoints,
      seo: row.seo,
      origin: row.origin,
      feature: row.feature,
      tags: row.tags,
      readingMinutes: row.readingMinutes,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
      editable,
    };
  },
});

export const versions = query({
  args: { id: v.id("articles") },
  returns: v.array(versionShape),
  handler: async (ctx, { id }) => {
    await requirePermission(ctx, PERMISSIONS.articlesRead);
    const rows = await ctx.db
      .query("articleVersions")
      .withIndex("by_article", (q) => q.eq("articleId", id))
      .order("desc")
      .take(30);
    return rows.map((row) => ({
      _id: row._id,
      at: row.at,
      authorName: row.authorName,
      label: row.label,
      title: row.title,
      status: row.status,
    }));
  },
});

export const version = query({
  args: { id: v.id("articleVersions") },
  returns: v.union(
    v.object({
      at: v.number(),
      authorName: v.string(),
      title: v.string(),
      dek: v.string(),
      body: v.array(blockValidator),
    }),
    v.null()
  ),
  handler: async (ctx, { id }) => {
    await requirePermission(ctx, PERMISSIONS.articlesRead);
    const row = await ctx.db.get(id);
    if (!row) return null;
    return {
      at: row.at,
      authorName: row.authorName,
      title: row.title,
      dek: row.dek,
      body: row.body,
    };
  },
});

/* -------------------------------------------------------------------------
   Writes
   ------------------------------------------------------------------------- */

async function uniqueSlug(
  ctx: MutationCtx,
  base: string,
  exclude?: Id<"articles">
): Promise<string> {
  let candidate = slugify(base);
  let suffix = 2;
  for (;;) {
    const clash = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .unique();
    if (!clash || clash._id === exclude) return candidate;
    candidate = `${slugify(base)}-${suffix++}`;
  }
}

/** Snapshots the row before a change, at most one version every 3 minutes. */
async function snapshot(
  ctx: MutationCtx,
  article: Doc<"articles">,
  viewer: Viewer,
  label: string
): Promise<void> {
  const latest = await ctx.db
    .query("articleVersions")
    .withIndex("by_article", (q) => q.eq("articleId", article._id))
    .order("desc")
    .first();
  const forced = label !== "Enregistrement automatique";
  if (!forced && latest && Date.now() - latest.at < 180_000) return;

  await ctx.db.insert("articleVersions", {
    articleId: article._id,
    at: Date.now(),
    authorSubject: viewer.subject,
    authorName: viewer.name,
    label,
    title: article.title,
    dek: article.dek,
    body: article.body,
    status: article.status,
  });
}

export const create = mutation({
  args: {
    title: v.string(),
    categorySlug: v.string(),
    authorSlug: v.string(),
  },
  returns: v.id("articles"),
  handler: async (ctx, args) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.articlesWrite);
    assertSection(viewer, args.categorySlug);

    const now = Date.now();
    const title = args.title.trim() || "Nouvel article";
    const id = await insertArticle(ctx, {
      title,
      slug: await uniqueSlug(ctx, title),
      dek: "",
      body: [{ type: "paragraph", text: "" }],
      status: "draft",
      categorySlug: args.categorySlug,
      authorSlug: args.authorSlug,
      galleryMediaKeys: [],
      keyPoints: [],
      seo: { description: "", keywords: [] },
      origin: "redaction",
      feature: "none",
      readingMinutes: 1,
      tags: [],
      createdAt: now,
      publishedAt: now,
      updatedAt: now,
      views: 0,
      searchText: title,
    });
    await recordAudit(ctx, viewer, "article.create", "article", id, title);
    return id;
  },
});

export const save = mutation({
  args: {
    id: v.id("articles"),
    title: v.string(),
    dek: v.string(),
    body: v.array(blockValidator),
    categorySlug: v.string(),
    subCategorySlug: v.optional(v.string()),
    authorSlug: v.string(),
    heroMediaKey: v.optional(v.string()),
    galleryMediaKeys: v.array(v.string()),
    keyPoints: v.array(v.string()),
    seo: seoValidator,
    feature: articleFeature,
    tags: v.array(v.string()),
    slug: v.optional(v.string()),
    auto: v.optional(v.boolean()),
  },
  returns: v.object({ slug: v.string(), updatedAt: v.number() }),
  handler: async (ctx, args) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.articlesWrite);
    const row = await ctx.db.get(args.id);
    if (!row) throw accessError("FORBIDDEN");
    assertSection(viewer, row.categorySlug);
    assertSection(viewer, args.categorySlug);

    await snapshot(
      ctx,
      row,
      viewer,
      args.auto ? "Enregistrement automatique" : "Enregistrement"
    );

    const title = args.title.trim() || row.title;
    const slug =
      args.slug && args.slug !== row.slug
        ? await uniqueSlug(ctx, args.slug, args.id)
        : row.slug;
    const now = Date.now();

    await patchArticle(ctx, row, {
      title,
      slug,
      dek: args.dek,
      body: args.body,
      categorySlug: args.categorySlug,
      subCategorySlug: args.subCategorySlug || undefined,
      authorSlug: args.authorSlug,
      heroMediaKey: args.heroMediaKey || undefined,
      galleryMediaKeys: args.galleryMediaKeys,
      keyPoints: args.keyPoints.filter((point) => point.trim() !== ""),
      seo: args.seo,
      feature: args.feature,
      tags: args.tags.filter((tag) => tag.trim() !== ""),
      readingMinutes: readingMinutes(title, args.dek, args.body),
      searchText: searchText(title, args.dek, args.tags, args.body),
      updatedAt: now,
    });
    await syncArticleMedia(ctx, args.id);

    if (!args.auto) {
      await recordAudit(
        ctx,
        viewer,
        "article.update",
        "article",
        args.id,
        title
      );
    }
    return { slug, updatedAt: now };
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("articles"),
    status: articleStatus,
    publishAt: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, { id, status, publishAt }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.articlesPublish);
    const row = await ctx.db.get(id);
    if (!row) throw accessError("FORBIDDEN");
    assertSection(viewer, row.categorySlug);

    if (status === "published" && row.dek.trim() === "") {
      throw new Error("Un article publié doit porter un chapô.");
    }
    if (status === "published" && plainText(row.body).trim().length < 200) {
      throw new Error(
        "Le corps de l'article est trop court pour une publication."
      );
    }

    await snapshot(ctx, row, viewer, `Passage en « ${status} »`);

    const now = Date.now();
    await patchArticle(ctx, row, {
      status,
      updatedAt: now,
      publishedAt:
        status === "published"
          ? (publishAt ?? now)
          : status === "scheduled"
            ? (publishAt ?? row.publishedAt)
            : row.publishedAt,
    });

    await recordAudit(
      ctx,
      viewer,
      status === "published"
        ? "article.publish"
        : status === "scheduled"
          ? "article.schedule"
          : "article.unpublish",
      "article",
      id,
      `${row.title} → ${status}`
    );
    return null;
  },
});

/** Bulk action of the article list (CDC §4.4: "actions groupées"). */
export const setStatusMany = mutation({
  args: { ids: v.array(v.id("articles")), status: articleStatus },
  returns: v.number(),
  handler: async (ctx, { ids, status }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.articlesPublish);
    let done = 0;
    for (const id of ids.slice(0, 50)) {
      const row = await ctx.db.get(id);
      if (!row) continue;
      const allowed = viewer.profile.sectionSlugs ?? [];
      if (
        viewer.role.slug !== "administrateur" &&
        allowed.length > 0 &&
        !allowed.includes(row.categorySlug)
      ) {
        continue;
      }
      await patchArticle(ctx, row, { status, updatedAt: Date.now() });
      await recordAudit(
        ctx,
        viewer,
        status === "published" ? "article.publish" : "article.unpublish",
        "article",
        id,
        `${row.title} → ${status} (action groupée)`
      );
      done += 1;
    }
    return done;
  },
});

export const remove = mutation({
  args: { id: v.id("articles") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.articlesPublish);
    const row = await ctx.db.get(id);
    if (!row) return null;
    assertSection(viewer, row.categorySlug);
    if (row.status === "published") {
      throw new Error("Dépubliez l'article avant de le supprimer.");
    }
    await deleteArticle(ctx, row);
    await syncArticleMedia(ctx, id, null);
    await recordAudit(ctx, viewer, "article.delete", "article", id, row.title);
    return null;
  },
});

export const restoreVersion = mutation({
  args: { id: v.id("articleVersions") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.articlesWrite);
    const version = await ctx.db.get(id);
    if (!version) throw accessError("FORBIDDEN");
    const article = await ctx.db.get(version.articleId);
    if (!article) throw accessError("FORBIDDEN");
    assertSection(viewer, article.categorySlug);

    await snapshot(ctx, article, viewer, "Avant restauration");
    await patchArticle(ctx, article, {
      title: version.title,
      dek: version.dek,
      body: version.body,
      readingMinutes: readingMinutes(version.title, version.dek, version.body),
      searchText: searchText(
        version.title,
        version.dek,
        article.tags,
        version.body
      ),
      updatedAt: Date.now(),
    });
    await syncArticleMedia(ctx, article._id);
    await recordAudit(
      ctx,
      viewer,
      "article.update",
      "article",
      article._id,
      `Restauration de la version du ${new Date(version.at).toLocaleString("fr-FR")}`
    );
    return null;
  },
});

/* -------------------------------------------------------------------------
   Reference data for the editor
   ------------------------------------------------------------------------- */

export const editorOptions = query({
  args: {},
  returns: v.object({
    categories: v.array(
      v.object({
        slug: v.string(),
        name: v.string(),
        parentSlug: v.optional(v.string()),
        accent: v.string(),
        order: v.number(),
        allowed: v.boolean(),
      })
    ),
    authors: v.array(v.object({ slug: v.string(), name: v.string() })),
  }),
  handler: async (ctx) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.articlesRead);
    const allowed = viewer.profile.sectionSlugs ?? [];
    const unrestricted =
      viewer.role.slug === "administrateur" || allowed.length === 0;

    // Les images ne sont plus livrées ici : le sélecteur les cherche page
    // par page (`library.pick`) et retrouve les siennes par clé
    // (`library.byKeys`). Toute la photothèque à chaque ouverture de
    // l'éditeur, c'est ce qui a fait tomber le back-office le 19/09/2026.
    const [categories, authors] = await Promise.all([
      ctx.db.query("categories").collect(),
      ctx.db.query("authors").collect(),
    ]);

    return {
      categories: categories
        .sort((a, b) => a.order - b.order)
        .map((row) => ({
          slug: row.slug,
          name: row.name,
          parentSlug: row.parentSlug,
          accent: row.accent,
          order: row.order,
          allowed: unrestricted || allowed.includes(row.slug),
        })),
      authors: authors.map((row) => ({ slug: row.slug, name: row.name })),
    };
  },
});

/** A badge shows « 99+ » beyond 99: counting further reads for nothing. */
const BADGE_CAP = 100;

/**
 * The little numbers on the navigation — what is waiting, where. Cheap on
 * purpose: the shell asks for them on every screen of the back office.
 *
 * Until 19/09/2026 it read four whole tables, `articles` included (6,9 Mo
 * per call, re-run at every public view). The articles waiting come from
 * `articleCounts`; the other queues are read through their index, up to
 * what a badge can show.
 */
export const navCounts = query({
  args: {},
  returns: v.object({
    inReview: v.number(),
    submissionsWaiting: v.number(),
    pendingSuggestions: v.number(),
    organizationsWaiting: v.number(),
  }),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const [inReview, submitted, submissionsWaiting, pending, organizations] =
      await Promise.all([
        readCount(ctx, "status", "in_review"),
        readCount(ctx, "status", "submitted"),
        waitingSubmissions(ctx, BADGE_CAP),
        pendingSuggestions(ctx, BADGE_CAP),
        waitingOrganizations(ctx, BADGE_CAP),
      ]);
    return {
      inReview: inReview + submitted,
      submissionsWaiting: Math.min(submissionsWaiting, BADGE_CAP),
      pendingSuggestions: pending.total,
      organizationsWaiting: organizations,
    };
  },
});
