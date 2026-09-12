import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Newsletter with double opt-in (CAHIER-DES-CHARGES.md §4.2).
 *
 * An address is never subscribed by the mere act of typing it: the row is
 * created `pending` with a single-use token, and only a click on the
 * confirmation link flips it to `confirmed`. Unsubscribing is one click on a
 * second token — no account, no form, no dark pattern.
 *
 * No mail provider is wired in milestone 2. `subscribe` therefore returns the
 * confirmation path so the interface can show it plainly, labelled as
 * standing in for the message that will be sent once the provider exists.
 * Pretending a mail had been sent would be a lie the reader could not check.
 */

const THROTTLE_MS = 60_000;

/** 32 hex characters from the Web Crypto API — not guessable, not sequential. */
function token(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const normalise = (email: string) => email.trim().toLowerCase();

export const subscribe = mutation({
  args: { email: v.string(), source: v.string() },
  returns: v.object({
    status: v.union(
      v.literal("pending"),
      v.literal("already_confirmed"),
      v.literal("throttled"),
      v.literal("invalid")
    ),
    confirmToken: v.optional(v.string()),
  }),
  handler: async (ctx, { email, source }) => {
    const address = normalise(email);
    // Contrôle serveur systématique : la validation Zod du navigateur ne
    // protège personne (CDC §5.3).
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address) || address.length > 254) {
      return { status: "invalid" as const };
    }

    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", address))
      .unique();

    const now = Date.now();

    if (existing?.status === "confirmed") {
      return { status: "already_confirmed" as const };
    }

    if (existing) {
      // Limitation de débit : un renvoi par minute et par adresse, pour que
      // le formulaire ne serve pas à inonder une boîte tierce.
      if (now - existing.createdAt < THROTTLE_MS) {
        return { status: "throttled" as const };
      }
      const confirmToken = token();
      await ctx.db.patch(existing._id, {
        status: "pending",
        confirmToken,
        createdAt: now,
        source,
      });
      return { status: "pending" as const, confirmToken };
    }

    const confirmToken = token();
    await ctx.db.insert("newsletterSubscribers", {
      email: address,
      status: "pending",
      confirmToken,
      unsubscribeToken: token(),
      createdAt: now,
      source,
    });
    return { status: "pending" as const, confirmToken };
  },
});

export const confirm = mutation({
  args: { token: v.string() },
  returns: v.object({
    status: v.union(
      v.literal("confirmed"),
      v.literal("already_confirmed"),
      v.literal("unknown")
    ),
    unsubscribeToken: v.optional(v.string()),
  }),
  handler: async (ctx, { token: value }) => {
    const row = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_confirm_token", (q) => q.eq("confirmToken", value))
      .unique();
    if (!row) return { status: "unknown" as const };
    if (row.status === "confirmed") {
      return {
        status: "already_confirmed" as const,
        unsubscribeToken: row.unsubscribeToken,
      };
    }
    await ctx.db.patch(row._id, {
      status: "confirmed",
      confirmedAt: Date.now(),
    });
    return {
      status: "confirmed" as const,
      unsubscribeToken: row.unsubscribeToken,
    };
  },
});

export const unsubscribe = mutation({
  args: { token: v.string() },
  returns: v.object({
    status: v.union(
      v.literal("unsubscribed"),
      v.literal("already_unsubscribed"),
      v.literal("unknown")
    ),
  }),
  handler: async (ctx, { token: value }) => {
    const row = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_unsubscribe_token", (q) =>
        q.eq("unsubscribeToken", value)
      )
      .unique();
    if (!row) return { status: "unknown" as const };
    if (row.status === "unsubscribed") {
      return { status: "already_unsubscribed" as const };
    }
    await ctx.db.patch(row._id, {
      status: "unsubscribed",
      unsubscribedAt: Date.now(),
    });
    return { status: "unsubscribed" as const };
  },
});

/** Count of confirmed subscribers — shown on the newsletter page. */
export const stats = query({
  args: {},
  returns: v.object({ confirmed: v.number() }),
  handler: async (ctx) => {
    const rows = await ctx.db.query("newsletterSubscribers").collect();
    return {
      confirmed: rows.filter((row) => row.status === "confirmed").length,
    };
  },
});
