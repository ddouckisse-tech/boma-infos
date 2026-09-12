import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { PERMISSIONS, requirePermission } from "./model/access";

/**
 * Outbox of every message the chain owes someone — CDC §4.4.
 *
 * No mail provider and no WhatsApp gateway are configured on this
 * deployment. Rather than print "un courriel vous a été envoyé" and send
 * nothing, each transition composes its message and drops it here, where the
 * newsroom can read it and copy it. The day a provider exists, a scheduled
 * job drains the `pending` rows and nothing else changes.
 */

const notificationShape = v.object({
  _id: v.id("notifications"),
  channel: v.union(v.literal("email"), v.literal("whatsapp")),
  to: v.string(),
  subject: v.string(),
  body: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("sent"),
    v.literal("skipped")
  ),
  createdAt: v.number(),
});

/** Used by Better Auth's password-reset hook, which has no database access. */
export const queueRaw = internalMutation({
  args: {
    channel: v.union(v.literal("email"), v.literal("whatsapp")),
    to: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    return null;
  },
});

export const recent = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(notificationShape),
  handler: async (ctx, { limit }) => {
    await requirePermission(ctx, PERMISSIONS.submissionsReview);
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_created")
      .order("desc")
      .take(Math.min(limit ?? 40, 200));
    return rows.map((row) => ({
      _id: row._id,
      channel: row.channel,
      to: row.to,
      subject: row.subject,
      body: row.body,
      status: row.status,
      createdAt: row.createdAt,
    }));
  },
});

/** Marks a message as handed over by hand, since no provider does it. */
export const markSent = mutation({
  args: { id: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await requirePermission(ctx, PERMISSIONS.submissionsReview);
    const row = await ctx.db.get(id);
    if (!row) return null;
    await ctx.db.patch(id, { status: "sent", sentAt: Date.now() });
    return null;
  },
});
