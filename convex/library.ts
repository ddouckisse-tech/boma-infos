import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { accessError, PERMISSIONS, requirePermission } from "./model/access";
import { recordAudit } from "./model/audit";
import {
  mediaVariantValidator,
  storedRenditionValidator,
} from "./model/content";
import { mediaKeysUsedBy, resolveRenditions, thumbUrlOf } from "./model/media";

/**
 * Media library — CDC §4.4, and the client's request of 12/09/2026: an
 * administrator adds pictures from the screen.
 *
 * Two kinds of picture live side by side.
 *
 *  - The **demo library**, pre-encoded offline by `scripts/fetch-media.ts`
 *    in AVIF and WebP at four widths and served from `public/medias/`. That
 *    is what makes the performance budget of §5.4 computable at build time,
 *    and it does not change.
 *  - **Uploads** from the médiathèque: the browser encodes the picture in
 *    WebP at up to four widths (320, 640, 960, 1280) and sends each file to
 *    Convex file storage; the row records the renditions and the journal
 *    resolves their URLs at render time. No image pipeline at request time,
 *    no native library on the server.
 *
 * The alternative text is mandatory (§3.5) before a picture is worth
 * placing; an upload starts without one and the screen says so until it is
 * written. Agent 4 proposes one — it never writes it.
 */

const renditionShape = v.object({
  format: v.literal("webp"),
  w: v.number(),
  h: v.number(),
  bytes: v.number(),
  url: v.string(),
});

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
  /** Storage-backed renditions, a signed URL each; absent for the demo library. */
  renditions: v.optional(v.array(renditionShape)),
  /** Small rendition for the grid; the demo library computes its own client-side. */
  thumbUrl: v.optional(v.string()),
  uploadedAt: v.optional(v.number()),
});

export const list = query({
  args: { term: v.optional(v.string()) },
  returns: v.array(mediaShape),
  handler: async (ctx, { term }) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const rows = await ctx.db.query("media").collect();
    const articles = await ctx.db.query("articles").collect();
    const usage = mediaKeysUsedBy(articles);

    const suggestions = await ctx.db.query("agentSuggestions").collect();
    const pending = new Map<string, number>();
    for (const suggestion of suggestions) {
      if (
        suggestion.targetType !== "media" ||
        suggestion.status !== "pending"
      ) {
        continue;
      }
      pending.set(
        suggestion.targetId,
        (pending.get(suggestion.targetId) ?? 0) + 1
      );
    }

    const needle = (term ?? "").trim().toLowerCase();
    const selected = rows
      .filter(
        (row) =>
          needle === "" ||
          row.key.includes(needle) ||
          row.alt.toLowerCase().includes(needle) ||
          row.caption.toLowerCase().includes(needle)
      )
      // Les ajouts récents d'abord, puis la bibliothèque par clé.
      .sort(
        (a, b) =>
          (b.uploadedAt ?? 0) - (a.uploadedAt ?? 0) ||
          a.key.localeCompare(b.key, "fr")
      );

    return await Promise.all(
      selected.map(async (row) => {
        const renditions = await resolveRenditions(ctx, row);
        return {
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
          renditions,
          thumbUrl: renditions
            ? (renditions.find((r) => r.w >= 320) ?? renditions.at(-1))?.url
            : undefined,
          uploadedAt: row.uploadedAt,
        };
      })
    );
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

/* -------------------------------------------------------------------------
   Uploads
   ------------------------------------------------------------------------- */

/** One short-lived URL per file; the browser POSTs the WebP blob to it. */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.mediaWrite);
    return await ctx.storage.generateUploadUrl();
  },
});

const KEY = /^[a-z0-9][a-z0-9-]{2,79}$/;

/**
 * Records an uploaded picture once every rendition is in storage. The key is
 * made unique here — two people can upload `conseil-des-ministres.jpg` the
 * same morning — and returned, since that is what an article references.
 */
export const createUploaded = mutation({
  args: {
    key: v.string(),
    alt: v.string(),
    caption: v.string(),
    credit: v.string(),
    width: v.number(),
    height: v.number(),
    color: v.string(),
    renditions: v.array(storedRenditionValidator),
  },
  returns: v.object({ id: v.id("media"), key: v.string() }),
  handler: async (ctx, args) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.mediaWrite);
    if (!KEY.test(args.key)) throw new Error("Clé de média invalide.");
    if (args.renditions.length === 0) {
      throw new Error("Aucune version de l'image n'a été reçue.");
    }
    if (!/^#[0-9a-f]{6}$/i.test(args.color)) {
      throw new Error("Couleur dominante invalide.");
    }

    let key = args.key;
    for (let attempt = 2; attempt < 100; attempt += 1) {
      const clash = await ctx.db
        .query("media")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();
      if (!clash) break;
      key = `${args.key}-${attempt}`;
    }

    const renditions = [...args.renditions].sort((a, b) => a.w - b.w);
    const id = await ctx.db.insert("media", {
      key,
      alt: args.alt.trim(),
      caption: args.caption.trim(),
      credit: args.credit.trim() || "Le Corporate",
      license: "Droits réservés",
      source: "upload",
      width: args.width,
      height: args.height,
      color: args.color.toLowerCase(),
      variants: renditions.map((r) => ({
        format: "webp" as const,
        w: r.w,
        h: r.h,
        bytes: r.bytes,
      })),
      storage: renditions,
      uploadedAt: Date.now(),
    });
    await recordAudit(ctx, viewer, "media.upload", "media", id, key);
    return { id, key };
  },
});

/**
 * Deletes an uploaded picture and its files. Refused while an article still
 * displays it, and never offered for the demo library, whose files are not
 * in storage.
 */
export const remove = mutation({
  args: { id: v.id("media") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.mediaWrite);
    const row = await ctx.db.get(id);
    if (!row) throw accessError("FORBIDDEN");
    if (!row.storage || row.storage.length === 0) {
      throw new Error(
        "Cette photographie fait partie de la bibliothèque de démonstration : elle se retire depuis scripts/media-sources.ts."
      );
    }
    const articles = await ctx.db.query("articles").collect();
    const used = mediaKeysUsedBy(articles).get(row.key) ?? 0;
    if (used > 0) {
      throw new Error(
        `Cette image est encore utilisée par ${used} article${used > 1 ? "s" : ""} : retirez-la d'abord.`
      );
    }
    for (const rendition of row.storage) {
      await ctx.storage.delete(rendition.storageId);
    }
    await ctx.db.delete(id);
    await recordAudit(ctx, viewer, "media.delete", "media", id, row.key);
    return null;
  },
});

/* -------------------------------------------------------------------------
   Public journal
   ------------------------------------------------------------------------- */

const publicAssetShape = v.object({
  key: v.string(),
  alt: v.string(),
  caption: v.string(),
  credit: v.string(),
  license: v.string(),
  source: v.string(),
  color: v.string(),
  width: v.number(),
  height: v.number(),
  renditions: v.array(renditionShape),
});

/**
 * Uploaded pictures displayed by **published** articles, with their URLs —
 * what the public journal needs to render them (`lib/media.ts`). Only those:
 * a picture attached to a draft is not public yet, and this query has no
 * session to check.
 */
export const publicAssets = query({
  args: { articleSlugs: v.optional(v.array(v.string())) },
  returns: v.array(publicAssetShape),
  handler: async (ctx, { articleSlugs }) => {
    if (articleSlugs && articleSlugs.length > 100) {
      throw new Error("Cent articles maximum par lot de médias.");
    }
    // A page needs its pictures, not every image in the WordPress archive.
    const published = articleSlugs
      ? (
          await Promise.all(
            [...new Set(articleSlugs)].map((slug) =>
              ctx.db
                .query("articles")
                .withIndex("by_slug", (q) => q.eq("slug", slug))
                .unique()
            )
          )
        ).filter(
          (row): row is Doc<"articles"> =>
            row !== null && row.status === "published"
        )
      : await ctx.db
          .query("articles")
          .withIndex("by_status_date", (q) => q.eq("status", "published"))
          .collect();
    const visible = mediaKeysUsedBy(published);
    const rows = await Promise.all(
      [...visible.keys()].map((key) =>
        ctx.db
          .query("media")
          .withIndex("by_key", (q) => q.eq("key", key))
          .unique()
      )
    );
    const uploaded = rows.filter(
      (row) => row !== null && row.storage && row.storage.length
    );

    const assets = [];
    for (const row of uploaded) {
      if (!row) continue;
      if (!visible.has(row.key)) continue;
      const renditions = await resolveRenditions(ctx, row);
      if (!renditions || renditions.length === 0) continue;
      assets.push({
        key: row.key,
        alt: row.alt,
        caption: row.caption,
        credit: row.credit,
        license: row.license,
        source: row.source,
        color: row.color,
        width: row.width,
        height: row.height,
        renditions,
      });
    }
    return assets;
  },
});

// `thumbUrlOf` est partagé avec `newsroom.editorOptions` ; il est réexporté
// ici pour que les écrans n'aient qu'un module média à connaître.
export { thumbUrlOf };
