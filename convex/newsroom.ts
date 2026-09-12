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
import { thumbUrlOf } from "./model/media";
import { recordAudit } from "./model/audit";
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
  views: v.number(),
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
  views: v.number(),
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

    const articles = await ctx.db.query("articles").collect();
    const submissions = await ctx.db.query("submissions").collect();
    const organizations = await ctx.db.query("organizations").collect();
    const lookup = await loadLookup(ctx);
    const suggestions = await ctx.db
      .query("agentSuggestions")
      .withIndex("by_target")
      .collect();
    const pending = new Map<string, number>();
    for (const suggestion of suggestions) {
      if (suggestion.status !== "pending") continue;
      pending.set(
        suggestion.targetId,
        (pending.get(suggestion.targetId) ?? 0) + 1
      );
    }

    const counts = {
      draft: articles.filter((a) => a.status === "draft").length,
      inReview: articles.filter(
        (a) => a.status === "in_review" || a.status === "submitted"
      ).length,
      scheduled: articles.filter((a) => a.status === "scheduled").length,
      published: articles.filter((a) => a.status === "published").length,
    };

    const toRow = (row: Doc<"articles">) => ({
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
      views: row.views,
      pendingSuggestions: pending.get(row._id) ?? 0,
    });
    const byRecency = [...articles].sort((a, b) => b.updatedAt - a.updatedAt);
    const recent = byRecency.slice(0, 8).map(toRow);
    const awaitingReview = byRecency
      .filter((a) => a.status === "in_review" || a.status === "submitted")
      .slice(0, 5)
      .map(toRow);
    const media = await ctx.db.query("media").collect();
    let pendingSuggestions = 0;
    for (const count of pending.values()) pendingSuggestions += count;

    const stats = await ctx.db.query("articleStats").collect();
    const days = await ctx.db.query("articleStatDays").collect();
    const now = Date.now();
    const dayLabel = (offset: number) =>
      new Date(now - offset * 86_400_000).toISOString().slice(0, 10);
    const last7 = new Set(Array.from({ length: 7 }, (_, i) => dayLabel(i)));
    const last30 = new Set(Array.from({ length: 30 }, (_, i) => dayLabel(i)));
    const titles = new Map(articles.map((a) => [a.slug, a.title]));

    return {
      counts,
      submissionsWaiting: submissions.filter(
        (s) => s.status === "submitted" || s.status === "in_review"
      ).length,
      organizationsWaiting: organizations.filter((o) => !o.approved).length,
      tasks: {
        pendingSuggestions,
        mediaMissingAlt: media.filter((m) => m.alt.trim() === "").length,
        hasLead: articles.some(
          (a) => a.status === "published" && a.feature === "lead"
        ),
        awaitingReview,
      },
      recent,
      audience: {
        views7d: days
          .filter((d) => last7.has(d.day))
          .reduce((sum, d) => sum + d.views, 0),
        views30d: days
          .filter((d) => last30.has(d.day))
          .reduce((sum, d) => sum + d.views, 0),
        topArticles: [...stats]
          .sort((a, b) => b.views - a.views)
          .slice(0, 5)
          .map((row) => ({
            slug: row.slug,
            title: titles.get(row.slug) ?? row.slug,
            views: row.views,
          })),
      },
    };
  },
});

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
    const lookup = await loadLookup(ctx);
    const suggestions = await ctx.db.query("agentSuggestions").collect();
    const pending = new Map<string, number>();
    for (const suggestion of suggestions) {
      if (suggestion.status !== "pending") continue;
      pending.set(
        suggestion.targetId,
        (pending.get(suggestion.targetId) ?? 0) + 1
      );
    }

    const term = (filters.term ?? "").trim().toLowerCase();
    const rows = await ctx.db.query("articles").collect();

    return rows
      .filter((row) => !filters.status || row.status === filters.status)
      .filter(
        (row) =>
          !filters.categorySlug || row.categorySlug === filters.categorySlug
      )
      .filter(
        (row) => !filters.authorSlug || row.authorSlug === filters.authorSlug
      )
      .filter((row) => !filters.origin || row.origin === filters.origin)
      .filter(
        (row) =>
          term === "" ||
          row.title.toLowerCase().includes(term) ||
          row.slug.includes(term)
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 200)
      .map((row) => ({
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
        views: row.views,
        pendingSuggestions: pending.get(row._id) ?? 0,
      }));
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
      views: row.views,
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
    const id = await ctx.db.insert("articles", {
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

    await ctx.db.patch(args.id, {
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
    await ctx.db.patch(id, {
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
      await ctx.db.patch(id, { status, updatedAt: Date.now() });
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
    await ctx.db.delete(id);
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
    await ctx.db.patch(article._id, {
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
    media: v.array(
      v.object({
        key: v.string(),
        alt: v.string(),
        caption: v.string(),
        credit: v.string(),
        /** Small rendition of an uploaded picture; the demo library has none. */
        thumbUrl: v.optional(v.string()),
      })
    ),
  }),
  handler: async (ctx) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.articlesRead);
    const allowed = viewer.profile.sectionSlugs ?? [];
    const unrestricted =
      viewer.role.slug === "administrateur" || allowed.length === 0;

    const [categories, authors, media] = await Promise.all([
      ctx.db.query("categories").collect(),
      ctx.db.query("authors").collect(),
      ctx.db.query("media").collect(),
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
      media: await Promise.all(
        [...media]
          .sort(
            (a, b) =>
              (b.uploadedAt ?? 0) - (a.uploadedAt ?? 0) ||
              a.key.localeCompare(b.key, "fr")
          )
          .map(async (row) => ({
            key: row.key,
            alt: row.alt,
            caption: row.caption,
            credit: row.credit,
            thumbUrl: await thumbUrlOf(ctx, row),
          }))
      ),
    };
  },
});

/**
 * The little numbers on the navigation — what is waiting, where. Cheap on
 * purpose: the shell asks for them on every screen of the back office.
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
    const [articles, submissions, organizations, suggestions] =
      await Promise.all([
        ctx.db.query("articles").collect(),
        ctx.db.query("submissions").collect(),
        ctx.db.query("organizations").collect(),
        ctx.db.query("agentSuggestions").collect(),
      ]);
    return {
      inReview: articles.filter(
        (a) => a.status === "in_review" || a.status === "submitted"
      ).length,
      submissionsWaiting: submissions.filter(
        (s) => s.status === "submitted" || s.status === "in_review"
      ).length,
      pendingSuggestions: suggestions.filter((s) => s.status === "pending")
        .length,
      organizationsWaiting: organizations.filter((o) => !o.approved).length,
    };
  },
});
