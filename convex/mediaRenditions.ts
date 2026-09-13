import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { storedRenditionValidator } from "./model/content";

/**
 * Thumbnail renditions for pictures held in Convex file storage (13/09/2026).
 *
 * The list thumbnails of the journal are 96 × 54 px on a phone — 192 physical
 * pixels at DPR 2 — yet the smallest rendition the WordPress archive and the
 * back-office uploads carried was 320 px. Fourteen of them cost the home page
 * about 150 Ko, a quarter of its §5.4 ceiling. A 240 px WebP weighs a third
 * less and looks the same at that size.
 *
 * These internal functions let `scripts/media-thumbnails.ts` add the missing
 * rendition from the command line: it lists what is missing, resizes locally
 * with sharp, uploads, then attaches. Nothing here resizes: the Convex
 * runtime has no image library, and the budget stays computable because the
 * file sizes are recorded like every other rendition. Additive and
 * idempotent — a rendition already present is never duplicated, and a
 * surplus upload is deleted rather than orphaned.
 */

export const pending = internalQuery({
  args: { paginationOpts: paginationOptsValidator, width: v.number() },
  returns: v.object({
    page: v.array(
      v.object({
        id: v.id("media"),
        key: v.string(),
        sourceUrl: v.string(),
        sourceWidth: v.number(),
      })
    ),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, { paginationOpts, width }) => {
    const result = await ctx.db.query("media").paginate(paginationOpts);
    const page = [];
    for (const row of result.page) {
      const storage = row.storage ?? [];
      // Bibliothèque de démonstration (fichiers sous public/medias) ou image
      // déjà assez petite : rien à produire.
      if (storage.length === 0 || row.width <= width) continue;
      if (storage.some((rendition) => rendition.w <= width)) continue;
      const source = [...storage]
        .sort((a, b) => a.w - b.w)
        .find((rendition) => rendition.w > width);
      if (!source) continue;
      const sourceUrl = await ctx.storage.getUrl(source.storageId);
      if (!sourceUrl) continue;
      page.push({
        id: row._id,
        key: row.key,
        sourceUrl,
        sourceWidth: source.w,
      });
    }
    return {
      page,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

/** Short-lived upload URLs, one per file the script is about to send. */
export const uploadUrls = internalMutation({
  args: { count: v.number() },
  returns: v.array(v.string()),
  handler: async (ctx, { count }) => {
    const urls: string[] = [];
    for (let index = 0; index < Math.min(count, 200); index += 1) {
      urls.push(await ctx.storage.generateUploadUrl());
    }
    return urls;
  },
});

export const attach = internalMutation({
  args: {
    items: v.array(
      v.object({ id: v.id("media"), rendition: storedRenditionValidator })
    ),
  },
  returns: v.object({ attached: v.number(), skipped: v.number() }),
  handler: async (ctx, { items }) => {
    let attached = 0;
    let skipped = 0;
    for (const { id, rendition } of items) {
      const row = await ctx.db.get(id);
      const storage = row?.storage ?? [];
      if (!row || storage.some((entry) => entry.w === rendition.w)) {
        await ctx.storage.delete(rendition.storageId);
        skipped += 1;
        continue;
      }
      await ctx.db.patch(id, {
        storage: [...storage, rendition].sort((a, b) => a.w - b.w),
        variants: [
          ...row.variants.filter(
            (variant) =>
              !(variant.format === "webp" && variant.w === rendition.w)
          ),
          {
            format: "webp" as const,
            w: rendition.w,
            h: rendition.h,
            bytes: rendition.bytes,
          },
        ].sort((a, b) => a.w - b.w || a.format.localeCompare(b.format)),
      });
      attached += 1;
    }
    return { attached, skipped };
  },
});
