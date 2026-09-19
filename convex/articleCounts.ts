import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import {
  articleCountGroup,
  REBUILT_AT,
  tally,
  type CountCell,
} from "./model/articleCounts";

/**
 * Full recount of `articleCounts`, from the articles themselves.
 *
 * Run once after the deployment that introduced the table, then only to
 * repair (`bunx convex run articleCounts:rebuild`); the hourly `ensureBuilt`
 * starts it by itself when the table was never built. Articles are read 200
 * at a time, so the recount never meets the 16 Mio limit it exists to avoid.
 *
 * The totals are written at the end, in one transaction: a newsroom write
 * landing during the few seconds of the recount may be missed — run it again
 * when the newsroom is quiet if in doubt.
 */

const PAGE = 200;

const cellValidator = v.object({
  group: articleCountGroup,
  key: v.string(),
  count: v.number(),
});

export const tallyPage = internalQuery({
  args: { cursor: v.union(v.string(), v.null()) },
  returns: v.object({
    cells: v.array(cellValidator),
    sections: v.array(v.object({ slug: v.string(), categorySlug: v.string() })),
    continueCursor: v.string(),
    isDone: v.boolean(),
  }),
  handler: async (ctx, { cursor }) => {
    const page = await ctx.db
      .query("articles")
      .paginate({ cursor, numItems: PAGE });
    return {
      cells: tally(page.page),
      sections: page.page.map(({ slug, categorySlug }) => ({
        slug,
        categorySlug,
      })),
      continueCursor: page.continueCursor,
      isDone: page.isDone,
    };
  },
});

/** Replaces every count; a cell absent from `cells` goes back to 0. */
export const replaceCounts = internalMutation({
  args: { cells: v.array(cellValidator) },
  returns: v.null(),
  handler: async (ctx, { cells }) => {
    const id = ({ group, key }: CountCell) => `${group}\u0000${key}`;
    const next = new Map(cells.map((cell) => [id(cell), cell]));
    for (const row of await ctx.db.query("articleCounts").collect()) {
      if (row.group === "meta") continue;
      const count = next.get(id(row))?.count ?? 0;
      if (row.count !== count) {
        await ctx.db.patch(row._id, { count });
      }
      next.delete(id(row));
    }
    for (const cell of next.values()) {
      await ctx.db.insert("articleCounts", cell);
    }

    const stamp = await ctx.db
      .query("articleCounts")
      .withIndex("by_group_key", (q) =>
        q.eq("group", REBUILT_AT.group).eq("key", REBUILT_AT.key)
      )
      .unique();
    if (stamp) {
      await ctx.db.patch(stamp._id, { count: Date.now() });
    } else {
      await ctx.db.insert("articleCounts", {
        ...REBUILT_AT,
        count: Date.now(),
      });
    }
    return null;
  },
});

export const rebuild = internalAction({
  args: {},
  returns: v.object({ articles: v.number(), cells: v.number() }),
  handler: async (ctx) => {
    const totals = new Map<string, CountCell & { count: number }>();
    let cursor: string | null = null;
    let articles = 0;
    for (;;) {
      const page: {
        cells: (CountCell & { count: number })[];
        sections: { slug: string; categorySlug: string }[];
        continueCursor: string;
        isDone: boolean;
      } = await ctx.runQuery(internal.articleCounts.tallyPage, { cursor });
      for (const cell of page.cells) {
        const key = `${cell.group}\u0000${cell.key}`;
        const entry = totals.get(key) ?? { ...cell, count: 0 };
        entry.count += cell.count;
        totals.set(key, entry);
      }
      articles += page.sections.length;
      // Rows counted before `articleStats.categorySlug` existed learn their section.
      await ctx.runMutation(internal.stats.syncSections, {
        sections: page.sections,
      });
      if (page.isDone) break;
      cursor = page.continueCursor;
    }
    const cells = [...totals.values()];
    await ctx.runMutation(internal.articleCounts.replaceCounts, { cells });
    return { articles, cells: cells.length };
  },
});

/** Hourly: builds the counts the first time, when nobody ran `rebuild`. */
export const ensureBuilt = internalMutation({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const stamp = await ctx.db
      .query("articleCounts")
      .withIndex("by_group_key", (q) =>
        q.eq("group", REBUILT_AT.group).eq("key", REBUILT_AT.key)
      )
      .unique();
    if (stamp) return false;
    await ctx.scheduler.runAfter(0, internal.articleCounts.rebuild, {});
    return true;
  },
});
