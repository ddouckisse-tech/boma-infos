import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import {
  PERMISSIONS,
  requireOrganizationScope,
  requirePermission,
} from "./model/access";
import {
  AUDIENCE_DAYS,
  bumpAudience,
  computeAudience,
  countView,
} from "./model/audience";

/**
 * Audience — CDC §4.4 point 6 and §5.4.
 *
 * **No third-party tracker.** The legacy site loads MonsterInsights and
 * Google Analytics; this one loads nothing. A view is counted by
 * `proxy.ts` as the request goes past — server side, no cookie, no
 * identifier, no JavaScript, and therefore no weight on the 180 Ko budget.
 * Reading time and shares come from a 700-byte inline beacon on the article
 * page, which sends a duration and nothing else.
 *
 * What is stored is three counters per article and a daily bucket. There is
 * no row anywhere that describes a reader.
 *
 * **A view never writes the article** (19/09/2026). Adding 1 to
 * `articles.views` rewrote a 6 Ko row on every visit and invalidated every
 * query that had read it — home page, related reading, every back-office
 * list — for every open tab. The article is only read once, when its first
 * view creates its audience row (`model/audience.ts`).
 */

const MAX_READING_SECONDS = 1800;

export const recordView = mutation({
  args: { slug: v.string() },
  returns: v.null(),
  handler: async (ctx, { slug }) => {
    await countView(ctx, slug);
    return null;
  },
});

export const recordReading = mutation({
  args: { slug: v.string(), seconds: v.number() },
  returns: v.null(),
  handler: async (ctx, { slug, seconds }) => {
    const value = Math.round(seconds);
    // Un onglet laissé ouvert toute la nuit n'est pas une lecture.
    if (!Number.isFinite(value) || value < 5 || value > MAX_READING_SECONDS) {
      return null;
    }
    await bumpAudience(ctx, slug, (row) => {
      row.readingSeconds += value;
      row.readingSamples += 1;
    });
    return null;
  },
});

export const recordShare = mutation({
  args: { slug: v.string(), channel: v.string() },
  returns: v.null(),
  handler: async (ctx, { slug, channel }) => {
    const known = ["whatsapp", "linkedin", "facebook", "email", "lien"];
    const name = known.includes(channel) ? channel : "autre";
    await bumpAudience(ctx, slug, (row) => {
      row.shares += 1;
      const entry = row.sharesByChannel.find((item) => item.channel === name);
      if (entry) entry.count += 1;
      else row.sharesByChannel.push({ channel: name, count: 1 });
    });
    return null;
  },
});

/* -------------------------------------------------------------------------
   Reads
   ------------------------------------------------------------------------- */

const articleStatShape = v.object({
  slug: v.string(),
  title: v.string(),
  categoryName: v.string(),
  origin: v.string(),
  publishedAt: v.number(),
  views: v.number(),
  averageReadingSeconds: v.number(),
  shares: v.number(),
  sharesByChannel: v.array(
    v.object({ channel: v.string(), count: v.number() })
  ),
});

export const overview = query({
  args: {},
  returns: v.object({
    totalViews: v.number(),
    totalShares: v.number(),
    averageReadingSeconds: v.number(),
    byDay: v.array(v.object({ day: v.string(), views: v.number() })),
    bySection: v.array(v.object({ name: v.string(), views: v.number() })),
    articles: v.array(articleStatShape),
  }),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.statsAll);
    // One small row per article that was ever read, the section tree and the
    // quarter-hourly snapshot — never the articles themselves (6 Ko each):
    // only the sixty listed below are opened, for their title.
    const [stats, categories, snapshot] = await Promise.all([
      ctx.db.query("articleStats").collect(),
      ctx.db.query("categories").collect(),
      ctx.db
        .query("audienceSnapshots")
        .withIndex("by_key", (q) => q.eq("key", "site"))
        .unique(),
    ]);
    const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
    const nameOf = (slug: string | undefined) =>
      slug === undefined ? "—" : (categoryName.get(slug) ?? slug);

    const ranked = [...stats].sort((a, b) => b.views - a.views);
    const listed = ranked.slice(0, 60);
    // The listed rows, and the rows whose section was never recorded (only
    // until `articleCounts.rebuild` has run once, and for slugs no article
    // carries any more).
    const opened = ranked.filter(
      (row, index) => index < listed.length || row.categorySlug === undefined
    );
    const articles = new Map(
      (
        await Promise.all(
          opened.map((row) =>
            ctx.db
              .query("articles")
              .withIndex("by_slug", (q) => q.eq("slug", row.slug))
              .unique()
          )
        )
      )
        .filter((row) => row !== null)
        .map((row) => [row.slug, row])
    );

    const sectionTotals = new Map<string, number>();
    for (const row of ranked) {
      const article = articles.get(row.slug);
      const name = article
        ? nameOf(article.categorySlug)
        : nameOf(row.categorySlug);
      sectionTotals.set(name, (sectionTotals.get(name) ?? 0) + row.views);
    }

    const samples = stats.reduce((sum, row) => sum + row.readingSamples, 0);
    const seconds = stats.reduce((sum, row) => sum + row.readingSeconds, 0);

    return {
      totalViews: stats.reduce((sum, row) => sum + row.views, 0),
      totalShares: stats.reduce((sum, row) => sum + row.shares, 0),
      averageReadingSeconds: samples > 0 ? Math.round(seconds / samples) : 0,
      // Une ligne par jour, tirée de l'instantané : `articleStatDays` en
      // porte une par article ET par jour, et grossit sans fin.
      byDay: (
        snapshot ?? (await computeAudience(ctx, Date.now(), null))
      ).days.slice(-AUDIENCE_DAYS),
      bySection: [...sectionTotals.entries()]
        .map(([name, views]) => ({ name, views }))
        .sort((a, b) => b.views - a.views),
      articles: listed.map((row) => {
        const article = articles.get(row.slug);
        return {
          slug: row.slug,
          title: article?.title ?? row.slug,
          categoryName: article ? nameOf(article.categorySlug) : "—",
          origin: article?.origin ?? "redaction",
          publishedAt: article?.publishedAt ?? 0,
          views: row.views,
          averageReadingSeconds:
            row.readingSamples > 0
              ? Math.round(row.readingSeconds / row.readingSamples)
              : 0,
          shares: row.shares,
          sharesByChannel: row.sharesByChannel,
        };
      }),
    };
  },
});

/** Section of each audience row, from the articles (`articleCounts.rebuild`). */
export const syncSections = internalMutation({
  args: {
    sections: v.array(v.object({ slug: v.string(), categorySlug: v.string() })),
  },
  returns: v.number(),
  handler: async (ctx, { sections }) => {
    let changed = 0;
    for (const { slug, categorySlug } of sections) {
      const row = await ctx.db
        .query("articleStats")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (row && row.categorySlug !== categorySlug) {
        await ctx.db.patch(row._id, { categorySlug });
        changed += 1;
      }
    }
    return changed;
  },
});

/**
 * Every quarter of an hour (`crons.ts`): the site-wide figures of the
 * dashboard, so that a public view re-runs no back-office query. Written
 * only when something changed.
 */
export const refreshAudience = internalMutation({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const previous = await ctx.db
      .query("audienceSnapshots")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    const now = Date.now();
    const next = await computeAudience(ctx, now, previous);
    if (!previous) {
      await ctx.db.insert("audienceSnapshots", {
        key: "site",
        ...next,
        updatedAt: now,
      });
      return true;
    }
    const same =
      JSON.stringify([previous.days, previous.topArticles]) ===
      JSON.stringify([next.days, next.topArticles]);
    // Même inchangé, l'horodatage avance au moins toutes les heures : c'est
    // lui qui dit qu'une journée est close (`computeAudience`).
    if (same && now - previous.updatedAt < 3_600_000) return false;
    await ctx.db.patch(previous._id, {
      ...next,
      updatedAt: now,
    });
    return true;
  },
});

/**
 * The company's own figures, and strictly those.
 *
 * The scope comes from the session (`requireOrganizationScope`), the slugs
 * come from the company's own published deposits, and the query never even
 * loads a row belonging to another company. CDC §4.4: "Rien sur les autres
 * entreprises."
 */
export const forOrganization = query({
  args: { organizationId: v.optional(v.id("organizations")) },
  returns: v.object({
    totalViews: v.number(),
    totalShares: v.number(),
    averageReadingSeconds: v.number(),
    articles: v.array(articleStatShape),
  }),
  handler: async (ctx, { organizationId }) => {
    const { organizationId: scope } = await requireOrganizationScope(
      ctx,
      organizationId
    );

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_organization", (q) => q.eq("organizationId", scope))
      .collect();
    const slugs = new Set(
      submissions
        .map((row) => row.publishedArticleSlug)
        .filter((slug): slug is string => Boolean(slug))
    );

    const categories = await ctx.db.query("categories").collect();
    const categoryName = new Map(categories.map((c) => [c.slug, c.name]));

    const rows: {
      slug: string;
      title: string;
      categoryName: string;
      origin: string;
      publishedAt: number;
      views: number;
      averageReadingSeconds: number;
      shares: number;
      sharesByChannel: { channel: string; count: number }[];
    }[] = [];

    for (const slug of slugs) {
      const article = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!article || article.status !== "published") continue;
      const stat = await ctx.db
        .query("articleStats")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      rows.push({
        slug,
        title: article.title,
        categoryName:
          categoryName.get(article.categorySlug) ?? article.categorySlug,
        origin: article.origin,
        publishedAt: article.publishedAt,
        views: stat?.views ?? 0,
        averageReadingSeconds:
          stat && stat.readingSamples > 0
            ? Math.round(stat.readingSeconds / stat.readingSamples)
            : 0,
        shares: stat?.shares ?? 0,
        sharesByChannel: stat?.sharesByChannel ?? [],
      });
    }

    rows.sort((a, b) => b.publishedAt - a.publishedAt);
    const withSamples = rows.filter((row) => row.averageReadingSeconds > 0);

    return {
      totalViews: rows.reduce((sum, row) => sum + row.views, 0),
      totalShares: rows.reduce((sum, row) => sum + row.shares, 0),
      averageReadingSeconds:
        withSamples.length > 0
          ? Math.round(
              withSamples.reduce(
                (sum, row) => sum + row.averageReadingSeconds,
                0
              ) / withSamples.length
            )
          : 0,
      articles: rows,
    };
  },
});
