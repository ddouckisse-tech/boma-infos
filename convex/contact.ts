import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Contact form (CAHIER-DES-CHARGES.md §4.2).
 *
 * The audit of the legacy site found a form with no consent checkbox, no
 * statement of purpose and a dormant anti-robot. All three are fixed here:
 * `consent` is required, the purpose is stated next to the field, and the
 * page combines a honeypot with a minimum fill time before this mutation is
 * even called.
 *
 * Every field is revalidated server-side (§5.3): the browser's validation is
 * a convenience for the reader, never a control.
 */

const THROTTLE_MS = 30_000;

export const send = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    organization: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
    consent: v.boolean(),
  },
  returns: v.object({
    status: v.union(
      v.literal("received"),
      v.literal("invalid"),
      v.literal("throttled")
    ),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const subject = args.subject.trim();
    const message = args.message.trim();

    if (name.length < 2 || name.length > 120) {
      return { status: "invalid" as const, reason: "name" };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
      return { status: "invalid" as const, reason: "email" };
    }
    if (subject.length < 3 || subject.length > 160) {
      return { status: "invalid" as const, reason: "subject" };
    }
    if (message.length < 20 || message.length > 4000) {
      return { status: "invalid" as const, reason: "message" };
    }
    if (!args.consent) {
      return { status: "invalid" as const, reason: "consent" };
    }

    // Limitation de débit par adresse : un message toutes les trente secondes.
    const recent = await ctx.db
      .query("contactMessages")
      .withIndex("by_date")
      .order("desc")
      .take(20);
    const now = Date.now();
    if (
      recent.some(
        (row) => row.email === email && now - row.createdAt < THROTTLE_MS
      )
    ) {
      return { status: "throttled" as const };
    }

    await ctx.db.insert("contactMessages", {
      name,
      email,
      organization: args.organization?.trim() || undefined,
      subject,
      message,
      consent: true,
      createdAt: now,
      handled: false,
    });

    return { status: "received" as const };
  },
});
