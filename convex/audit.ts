import { v } from "convex/values";
import { query } from "./_generated/server";
import { PERMISSIONS, requirePermission } from "./model/access";

/**
 * Read side of the audit trail — CDC §4.3, §5.3.
 *
 * Read-only on purpose: this module exports no mutation, so there is no
 * endpoint anywhere that edits or deletes a line. Rows are written by
 * `model/audit.ts`, from inside the mutations that perform the act.
 */

export const list = query({
  args: {
    action: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("auditLog"),
      at: v.number(),
      actorName: v.string(),
      actorRole: v.string(),
      action: v.string(),
      targetType: v.string(),
      targetId: v.string(),
      summary: v.string(),
    })
  ),
  handler: async (ctx, { action, limit }) => {
    await requirePermission(ctx, PERMISSIONS.auditRead);
    const take = Math.min(limit ?? 100, 500);
    const rows = action
      ? await ctx.db
          .query("auditLog")
          .withIndex("by_action", (q) => q.eq("action", action))
          .order("desc")
          .take(take)
      : await ctx.db.query("auditLog").withIndex("by_at").order("desc").take(take);
    return rows.map((row) => ({
      _id: row._id,
      at: row.at,
      actorName: row.actorName,
      actorRole: row.actorRole,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      summary: row.summary,
    }));
  },
});

/** Distinct actions present in the trail, for the filter menu. */
export const actions = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.auditRead);
    const rows = await ctx.db.query("auditLog").withIndex("by_at").order("desc").take(500);
    return [...new Set(rows.map((row) => row.action))].sort();
  },
});
