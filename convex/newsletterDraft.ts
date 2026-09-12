import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { accessError, PERMISSIONS, requirePermission } from "./model/access";
import { recordAudit } from "./model/audit";
import { isoWeek } from "./model/text";

/**
 * Weekly newsletter drafts — CDC §4.6, agent 6.
 *
 * The agent composes; it never sends. A draft sits here until an
 * administrator approves it, and "sent" is a state a human sets once the
 * mailing has actually gone out — there is no provider on this deployment,
 * and pretending otherwise would be the same lie the milestone-2 newsletter
 * refused to tell.
 */

const editionShape = v.object({
  _id: v.id("newsletterEditions"),
  week: v.string(),
  subject: v.string(),
  intro: v.string(),
  items: v.array(
    v.object({ slug: v.string(), title: v.string(), teaser: v.string() })
  ),
  status: v.string(),
  runId: v.optional(v.id("agentRuns")),
  createdAt: v.number(),
  approvedAt: v.optional(v.number()),
  approvedBy: v.optional(v.string()),
});

/** Published in the last seven days, most recent first. */
export const weekArticles = internalQuery({
  args: {},
  returns: v.array(
    v.object({ slug: v.string(), title: v.string(), dek: v.string() })
  ),
  handler: async (ctx) => {
    const since = Date.now() - 7 * 86_400_000;
    const rows = await ctx.db
      .query("articles")
      .withIndex("by_status_date", (q) =>
        q.eq("status", "published").gt("publishedAt", since)
      )
      .order("desc")
      .take(12);
    return rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      dek: row.dek,
    }));
  },
});

export const upsert = internalMutation({
  args: {
    week: v.string(),
    runId: v.id("agentRuns"),
    articles: v.array(
      v.object({ slug: v.string(), title: v.string(), dek: v.string() })
    ),
  },
  returns: v.null(),
  handler: async (ctx, { week, runId, articles }) => {
    const suggestions = await ctx.db
      .query("agentSuggestions")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .collect();
    const find = (field: string) =>
      suggestions.find((row) => row.field === field)?.proposed ?? "";

    const items = articles.slice(0, 6).map((article) => ({
      slug: article.slug,
      title: article.title,
      teaser:
        find(`newsletter.item.${article.slug}`) || article.dek.slice(0, 180),
    }));

    const payload = {
      week,
      subject: find("newsletter.subject") || `Le Corporate — semaine ${week}`,
      intro: find("newsletter.intro"),
      items,
      status: "draft" as const,
      runId,
      createdAt: Date.now(),
    };

    const existing = await ctx.db
      .query("newsletterEditions")
      .withIndex("by_week", (q) => q.eq("week", week))
      .unique();
    if (existing) {
      if (existing.status === "sent") return null;
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("newsletterEditions", payload);
    }
    return null;
  },
});

export const list = query({
  args: {},
  returns: v.array(editionShape),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const rows = await ctx.db.query("newsletterEditions").collect();
    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20)
      .map((row) => ({
        _id: row._id,
        week: row.week,
        subject: row.subject,
        intro: row.intro,
        items: row.items,
        status: row.status,
        runId: row.runId,
        createdAt: row.createdAt,
        approvedAt: row.approvedAt,
        approvedBy: row.approvedBy,
      }));
  },
});

export const approve = mutation({
  args: { id: v.id("newsletterEditions") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.agentsRun);
    const row = await ctx.db.get(id);
    if (!row) throw accessError("FORBIDDEN");
    await ctx.db.patch(id, {
      status: "approved",
      approvedAt: Date.now(),
      approvedBy: viewer.name,
    });
    await recordAudit(
      ctx,
      viewer,
      "newsletter.approve",
      "newsletter",
      row.week,
      row.subject
    );
    return null;
  },
});

export const currentWeek = query({
  args: {},
  returns: v.string(),
  handler: async () => isoWeek(Date.now()),
});
