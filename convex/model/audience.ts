import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { dayOf } from "./text";

/**
 * Audience figures without reading `articles` on every view.
 *
 * Until 19/09/2026 `stats.recordView` also added 1 to `articles.views`: every
 * public view rewrote a 6 Ko article, which invalidated every query that had
 * read it, for every open tab. A view now only touches `articleStats` and
 * `articleStatDays`; the article keeps the views counted before, and the
 * row tells how many of its own it shares with the article.
 */

type CountedViews = Pick<Doc<"articleStats">, "views" | "viewsInArticle">;

/** Views shown to readers: those frozen in the article, plus the live ones counted since. */
export function displayedViews(
  article: Pick<Doc<"articles">, "views">,
  stats: CountedViews | null
): number {
  if (!stats) return article.views;
  // Absent: the row has not been written since the change, so the article
  // already includes every one of its views.
  return article.views + stats.views - (stats.viewsInArticle ?? stats.views);
}

type Counters = Pick<
  Doc<"articleStats">,
  "views" | "readingSeconds" | "readingSamples" | "shares" | "sharesByChannel"
>;

/**
 * Applies `patch` to the audience row of `slug`, creating it on the first
 * visit. Returns `false`, and writes nothing, when no published article
 * carries the slug.
 */
export async function bumpAudience(
  ctx: MutationCtx,
  slug: string,
  patch: (row: Counters) => void
): Promise<boolean> {
  const existing = await ctx.db
    .query("articleStats")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();

  if (existing) {
    const row: Counters = {
      views: existing.views,
      readingSeconds: existing.readingSeconds,
      readingSamples: existing.readingSamples,
      shares: existing.shares,
      sharesByChannel: existing.sharesByChannel.map((entry) => ({
        ...entry,
      })),
    };
    patch(row);
    await ctx.db.patch(existing._id, {
      ...row,
      // Premier passage depuis que les vues ne vont plus dans l'article :
      // toutes celles comptées jusqu'ici y figurent déjà.
      viewsInArticle: existing.viewsInArticle ?? existing.views,
      updatedAt: Date.now(),
    });
    return true;
  }

  const article = await ctx.db
    .query("articles")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  // On ne compte que des articles réellement publiés : sinon le compteur
  // devient un moyen de deviner les slugs en préparation. La ligne naît donc
  // à la première visite d'un article publié ; ensuite, l'article (6 Ko)
  // n'est plus relu à chaque vue.
  if (!article || article.status !== "published") return false;

  const row: Counters = {
    views: 0,
    readingSeconds: 0,
    readingSamples: 0,
    shares: 0,
    sharesByChannel: [],
  };
  patch(row);
  await ctx.db.insert("articleStats", {
    slug,
    ...row,
    viewsInArticle: 0,
    categorySlug: article.categorySlug,
    updatedAt: Date.now(),
  });
  return true;
}

/** One public view: the audience row and the day's bucket — never the article. */
export async function countView(
  ctx: MutationCtx,
  slug: string
): Promise<boolean> {
  const counted = await bumpAudience(ctx, slug, (row) => {
    row.views += 1;
  });
  if (!counted) return false;

  const day = dayOf(Date.now());
  const bucket = await ctx.db
    .query("articleStatDays")
    .withIndex("by_slug_day", (q) => q.eq("slug", slug).eq("day", day))
    .unique();
  if (bucket) {
    await ctx.db.patch(bucket._id, {
      views: bucket.views + 1,
    });
  } else {
    await ctx.db.insert("articleStatDays", { slug, day, views: 1 });
  }
  return true;
}

/** Keeps the section of an article's audience row in step with the article. */
export async function syncStatSection(
  ctx: MutationCtx,
  slug: string,
  categorySlug: string
): Promise<void> {
  const row = await ctx.db
    .query("articleStats")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (row && row.categorySlug !== categorySlug) {
    await ctx.db.patch(row._id, { categorySlug });
  }
}

/* -------------------------------------------------------------------------
   Site-wide snapshot (`audienceSnapshots`)
   ------------------------------------------------------------------------- */

export const AUDIENCE_DAYS = 30;
export const TOP_ARTICLES = 5;
const DAY_MS = 86_400_000;
/**
 * A view recorded just before midnight may commit a moment after it: a day
 * is final once a snapshot was taken this long after it ended.
 */
const SETTLE_MS = 10 * 60_000;

/** The `count` last UTC days, oldest first, today included. */
export function lastDays(now: number, count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    dayOf(now - (count - 1 - index) * DAY_MS)
  );
}

/** Sum of the daily buckets of one day. */
async function dayTotal(ctx: QueryCtx, day: string): Promise<number> {
  let total = 0;
  for await (const row of ctx.db
    .query("articleStatDays")
    .withIndex("by_day", (q) => q.eq("day", day))) {
    total += row.views;
  }
  return total;
}

type Snapshot = Pick<
  Doc<"audienceSnapshots">,
  "days" | "topArticles" | "updatedAt"
>;

/**
 * The figures of the snapshot, from the previous one when it has them.
 *
 * A past day is summed once, after it settled; only today (and yesterday,
 * until it settles) is read again — the daily buckets of one day, not of
 * thirty.
 */
export async function computeAudience(
  ctx: QueryCtx,
  now: number,
  previous: Snapshot | null
): Promise<Pick<Snapshot, "days" | "topArticles">> {
  const known = new Map(previous?.days.map((row) => [row.day, row.views]));
  const days: { day: string; views: number }[] = [];
  for (const day of lastDays(now, AUDIENCE_DAYS)) {
    const settled =
      previous !== null &&
      previous.updatedAt >= Date.parse(`${day}T00:00:00Z`) + DAY_MS + SETTLE_MS;
    const views = settled ? (known.get(day) ?? 0) : await dayTotal(ctx, day);
    if (views > 0) days.push({ day, views });
  }

  const top = await ctx.db
    .query("articleStats")
    .withIndex("by_views")
    .order("desc")
    .take(TOP_ARTICLES);
  const topArticles = await Promise.all(
    top
      .filter((row) => row.views > 0)
      .map(async (row) => {
        const article = await ctx.db
          .query("articles")
          .withIndex("by_slug", (q) => q.eq("slug", row.slug))
          .unique();
        return {
          slug: row.slug,
          title: article?.title ?? row.slug,
          views: row.views,
        };
      })
  );
  return { days, topArticles };
}

/** Views of the last `count` days of a snapshot, today included. */
export function viewsOver(
  days: readonly { day: string; views: number }[],
  now: number,
  count: number
): number {
  const window = new Set(lastDays(now, count));
  return days
    .filter((row) => window.has(row.day))
    .reduce((sum, row) => sum + row.views, 0);
}
