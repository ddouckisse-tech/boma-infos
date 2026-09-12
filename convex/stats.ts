import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import {
  PERMISSIONS,
  requireOrganizationScope,
  requirePermission,
} from "./model/access";
import { dayOf } from "./model/text";

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
 */

const MAX_READING_SECONDS = 1800;

async function bump(
  ctx: MutationCtx,
  slug: string,
  patch: (row: {
    views: number;
    readingSeconds: number;
    readingSamples: number;
    shares: number;
    sharesByChannel: { channel: string; count: number }[];
  }) => void
): Promise<boolean> {
  const article = await ctx.db
    .query("articles")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  // On ne compte que des articles réellement publiés : sinon le compteur
  // devient un moyen de deviner les slugs en préparation.
  if (!article || article.status !== "published") return false;

  const existing = await ctx.db
    .query("articleStats")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  const row = existing
    ? {
        views: existing.views,
        readingSeconds: existing.readingSeconds,
        readingSamples: existing.readingSamples,
        shares: existing.shares,
        sharesByChannel: existing.sharesByChannel.map((entry) => ({
          ...entry,
        })),
      }
    : {
        views: 0,
        readingSeconds: 0,
        readingSamples: 0,
        shares: 0,
        sharesByChannel: [] as { channel: string; count: number }[],
      };

  patch(row);

  if (existing) {
    await ctx.db.patch(existing._id, { ...row, updatedAt: Date.now() });
  } else {
    await ctx.db.insert("articleStats", {
      slug,
      ...row,
      updatedAt: Date.now(),
    });
  }
  return true;
}

export const recordView = mutation({
  args: { slug: v.string() },
  returns: v.null(),
  handler: async (ctx, { slug }) => {
    const counted = await bump(ctx, slug, (row) => {
      row.views += 1;
    });
    if (!counted) return null;

    const day = dayOf(Date.now());
    const bucket = await ctx.db
      .query("articleStatDays")
      .withIndex("by_slug_day", (q) => q.eq("slug", slug).eq("day", day))
      .unique();
    if (bucket) await ctx.db.patch(bucket._id, { views: bucket.views + 1 });
    else await ctx.db.insert("articleStatDays", { slug, day, views: 1 });

    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (article) await ctx.db.patch(article._id, { views: article.views + 1 });
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
    await bump(ctx, slug, (row) => {
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
    await bump(ctx, slug, (row) => {
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
    const [stats, days, articles, categories] = await Promise.all([
      ctx.db.query("articleStats").collect(),
      ctx.db.query("articleStatDays").collect(),
      ctx.db.query("articles").collect(),
      ctx.db.query("categories").collect(),
    ]);
    const byslug = new Map(articles.map((a) => [a.slug, a]));
    const categoryName = new Map(categories.map((c) => [c.slug, c.name]));

    const rows = stats
      .map((row) => {
        const article = byslug.get(row.slug);
        return {
          slug: row.slug,
          title: article?.title ?? row.slug,
          categoryName: article
            ? (categoryName.get(article.categorySlug) ?? article.categorySlug)
            : "—",
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
      })
      .sort((a, b) => b.views - a.views);

    const sectionTotals = new Map<string, number>();
    for (const row of rows) {
      sectionTotals.set(
        row.categoryName,
        (sectionTotals.get(row.categoryName) ?? 0) + row.views
      );
    }

    const samples = stats.reduce((sum, row) => sum + row.readingSamples, 0);
    const seconds = stats.reduce((sum, row) => sum + row.readingSeconds, 0);

    return {
      totalViews: rows.reduce((sum, row) => sum + row.views, 0),
      totalShares: rows.reduce((sum, row) => sum + row.shares, 0),
      averageReadingSeconds: samples > 0 ? Math.round(seconds / samples) : 0,
      byDay: [...days]
        .sort((a, b) => a.day.localeCompare(b.day))
        .slice(-30)
        .map((row) => ({ day: row.day, views: row.views })),
      bySection: [...sectionTotals.entries()]
        .map(([name, views]) => ({ name, views }))
        .sort((a, b) => b.views - a.views),
      articles: rows.slice(0, 60),
    };
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
