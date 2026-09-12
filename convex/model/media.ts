import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/**
 * Pictures uploaded from the back office (12/09/2026).
 *
 * The demo library is pre-encoded offline and served from `public/medias/`;
 * a picture added from the médiathèque lives in Convex file storage instead,
 * as WebP renditions the browser encoded before sending. These two helpers
 * turn the stored identifiers into signed URLs, for the grids, the pickers
 * and the public journal.
 */

export type ResolvedRendition = {
  format: "webp";
  w: number;
  h: number;
  bytes: number;
  url: string;
};

/** Renditions with a URL each, smallest first; `undefined` for the demo library. */
export async function resolveRenditions(
  ctx: QueryCtx,
  row: Doc<"media">
): Promise<ResolvedRendition[] | undefined> {
  if (!row.storage || row.storage.length === 0) return undefined;
  const resolved: ResolvedRendition[] = [];
  for (const rendition of row.storage) {
    const url = await ctx.storage.getUrl(rendition.storageId);
    if (url) {
      resolved.push({
        format: "webp",
        w: rendition.w,
        h: rendition.h,
        bytes: rendition.bytes,
        url,
      });
    }
  }
  return resolved.sort((a, b) => a.w - b.w);
}

/** A small rendition for a grid or a picker; `undefined` when the file lives under `public/medias/`. */
export async function thumbUrlOf(
  ctx: QueryCtx,
  row: Doc<"media">
): Promise<string | undefined> {
  const renditions = await resolveRenditions(ctx, row);
  if (!renditions || renditions.length === 0) return undefined;
  return (
    renditions.find((r) => r.w >= 320) ?? renditions[renditions.length - 1]
  ).url;
}

/** Keys of every picture a set of articles displays (hero, gallery, blocks). */
export function mediaKeysUsedBy(
  articles: readonly Doc<"articles">[]
): Map<string, number> {
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
  return usage;
}
