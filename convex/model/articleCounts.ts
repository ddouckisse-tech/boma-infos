import { v, type Infer } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Article counts kept in the `articleCounts` table.
 *
 * Whatever its status, every article counts once in `status`, `category`,
 * `author` and `origin`, and in `subcategory` when it has one — the
 * newsroom's figures, and what lets its list pick its narrowest index. A
 * published article also counts in the three `published_*` groups — the
 * journal's filters, pagination and authors.
 *
 * `meta/rebuiltAt` is not a count: it holds the time of the last full
 * recount (`articleCounts.rebuild`), so the hourly check knows whether the
 * table was ever built.
 */
export const articleCountGroup = v.union(
  v.literal("status"),
  v.literal("category"),
  v.literal("subcategory"),
  v.literal("author"),
  v.literal("origin"),
  v.literal("published_category"),
  v.literal("published_subcategory"),
  v.literal("published_author"),
  v.literal("meta")
);

export type ArticleCountGroup = Infer<typeof articleCountGroup>;

/** The fields a count depends on: a write that changes none of them moves nothing. */
export type CountedArticle = Pick<
  Doc<"articles">,
  "status" | "categorySlug" | "subCategorySlug" | "authorSlug" | "origin"
>;

export type CountCell = { group: ArticleCountGroup; key: string };

export const REBUILT_AT: CountCell = { group: "meta", key: "rebuiltAt" };

/** The cells one article adds 1 to. */
export function countCells(article: CountedArticle): CountCell[] {
  const cells: CountCell[] = [
    { group: "status", key: article.status },
    { group: "category", key: article.categorySlug },
    { group: "author", key: article.authorSlug },
    { group: "origin", key: article.origin },
  ];
  if (article.subCategorySlug) {
    cells.push({ group: "subcategory", key: article.subCategorySlug });
  }
  if (article.status === "published") {
    cells.push({ group: "published_category", key: article.categorySlug });
    if (article.subCategorySlug) {
      cells.push({
        group: "published_subcategory",
        key: article.subCategorySlug,
      });
    }
    cells.push({ group: "published_author", key: article.authorSlug });
  }
  return cells;
}

const cellId = ({ group, key }: CountCell): string => `${group}\u0000${key}`;

/**
 * What an article moving from `before` to `after` changes (`null`: the
 * article does not exist on that side). Cells that end where they started
 * are left out, so an autosave that keeps status, sections and author costs
 * no write at all.
 */
export function countDelta(
  before: CountedArticle | null,
  after: CountedArticle | null
): (CountCell & { change: number })[] {
  const changes = new Map<string, CountCell & { change: number }>();
  const add = (article: CountedArticle | null, sign: 1 | -1) => {
    for (const cell of article ? countCells(article) : []) {
      const entry = changes.get(cellId(cell)) ?? { ...cell, change: 0 };
      entry.change += sign;
      changes.set(cellId(cell), entry);
    }
  };
  add(before, -1);
  add(after, 1);
  return [...changes.values()].filter((entry) => entry.change !== 0);
}

/** Totals of a set of articles, one entry per cell — what a recount writes. */
export function tally(
  articles: readonly CountedArticle[]
): (CountCell & { count: number })[] {
  const totals = new Map<string, CountCell & { count: number }>();
  for (const article of articles) {
    for (const cell of countCells(article)) {
      const entry = totals.get(cellId(cell)) ?? { ...cell, count: 0 };
      entry.count += 1;
      totals.set(cellId(cell), entry);
    }
  }
  return [...totals.values()];
}

/** Moves the counts in the caller's transaction. */
export async function applyCountDelta(
  ctx: MutationCtx,
  before: CountedArticle | null,
  after: CountedArticle | null
): Promise<void> {
  for (const { group, key, change } of countDelta(before, after)) {
    const row = await ctx.db
      .query("articleCounts")
      .withIndex("by_group_key", (q) => q.eq("group", group).eq("key", key))
      .unique();
    if (row) {
      await ctx.db.patch(row._id, {
        count: row.count + change,
      });
    } else {
      await ctx.db.insert("articleCounts", { group, key, count: change });
    }
  }
}

/** One count; 0 when nothing was ever counted there. */
export async function readCount(
  ctx: QueryCtx,
  group: ArticleCountGroup,
  key: string
): Promise<number> {
  const row = await ctx.db
    .query("articleCounts")
    .withIndex("by_group_key", (q) => q.eq("group", group).eq("key", key))
    .unique();
  return Math.max(0, row?.count ?? 0);
}

/** Every non-zero count of a group, by key. */
export async function readCounts(
  ctx: QueryCtx,
  group: ArticleCountGroup
): Promise<Map<string, number>> {
  const rows = await ctx.db
    .query("articleCounts")
    .withIndex("by_group_key", (q) => q.eq("group", group))
    .collect();
  return new Map(
    rows.filter((row) => row.count > 0).map((row) => [row.key, row.count])
  );
}
