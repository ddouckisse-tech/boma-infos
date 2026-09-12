import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { accessError, PERMISSIONS, requirePermission } from "./model/access";
import { recordAudit } from "./model/audit";
import { mediaVariantValidator } from "./model/content";

/**
 * Media library — CDC §4.4.
 *
 * **What this module does not do: resize pictures.** The journal serves
 * pre-encoded AVIF/WebP files produced offline by `scripts/fetch-media.ts`,
 * which is what makes the performance budget of §5.4 computable at build
 * time. So the library manages the *editorial* half — alternative text,
 * caption, credit, licence — and records which renditions exist. Importing
 * a new photograph means adding it to `scripts/media-sources.ts` and
 * re-running the script; the alternative would be an image pipeline at
 * request time, and a budget nobody can check before shipping.
 *
 * The alternative text is mandatory (§3.5) and agent 4 proposes one — it
 * never writes it: a suggestion has to be accepted like every other.
 */

const mediaShape = v.object({
  _id: v.id("media"),
  key: v.string(),
  alt: v.string(),
  caption: v.string(),
  credit: v.string(),
  license: v.string(),
  source: v.string(),
  width: v.number(),
  height: v.number(),
  color: v.string(),
  variants: v.array(mediaVariantValidator),
  usedBy: v.number(),
  pendingSuggestions: v.number(),
});

export const list = query({
  args: { term: v.optional(v.string()) },
  returns: v.array(mediaShape),
  handler: async (ctx, { term }) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const rows = await ctx.db.query("media").collect();
    const articles = await ctx.db.query("articles").collect();

    const usage = new Map<string, number>();
    const bump = (key?: string) => {
      if (!key) return;
      usage.set(key, (usage.get(key) ?? 0) + 1);
    };
    for (const article of articles) {
      bump(article.heroMediaKey);
      for (const key of article.galleryMediaKeys) bump(key);
      for (const block of article.body) {
        if (block.type === "image") bump(block.mediaKey);
        if (block.type === "video") bump(block.posterMediaKey);
      }
    }

    const suggestions = await ctx.db.query("agentSuggestions").collect();
    const pending = new Map<string, number>();
    for (const suggestion of suggestions) {
      if (suggestion.targetType !== "media" || suggestion.status !== "pending") {
        continue;
      }
      pending.set(
        suggestion.targetId,
        (pending.get(suggestion.targetId) ?? 0) + 1
      );
    }

    const needle = (term ?? "").trim().toLowerCase();
    return rows
      .filter(
        (row) =>
          needle === "" ||
          row.key.includes(needle) ||
          row.alt.toLowerCase().includes(needle) ||
          row.caption.toLowerCase().includes(needle)
      )
      .sort((a, b) => a.key.localeCompare(b.key, "fr"))
      .map((row) => ({
        _id: row._id,
        key: row.key,
        alt: row.alt,
        caption: row.caption,
        credit: row.credit,
        license: row.license,
        source: row.source,
        width: row.width,
        height: row.height,
        color: row.color,
        variants: row.variants,
        usedBy: usage.get(row.key) ?? 0,
        pendingSuggestions: pending.get(row._id) ?? 0,
      }));
  },
});

export const update = mutation({
  args: {
    id: v.id("media"),
    alt: v.string(),
    caption: v.string(),
    credit: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { id, alt, caption, credit }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.mediaWrite);
    const row = await ctx.db.get(id);
    if (!row) throw accessError("FORBIDDEN");
    const cleaned = alt.trim();
    if (cleaned === "") {
      // CDC §3.5 : « toute image porte un alt pertinent ». Le champ n'est
      // pas facultatif, l'agent ne fait que proposer.
      throw new Error("Le texte alternatif est obligatoire.");
    }
    await ctx.db.patch(id, {
      alt: cleaned,
      caption: caption.trim(),
      credit: credit.trim() || row.credit,
    });
    await recordAudit(ctx, viewer, "media.update", "media", id, row.key);
    return null;
  },
});
