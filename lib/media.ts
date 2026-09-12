import { MEDIA } from "@/convex/mediaManifest";
import type { MediaAsset } from "@/lib/media-core";

/**
 * Image plumbing — the single heaviest item of the performance budget.
 *
 * The legacy site shipped 7,95 Mo of pictures on its home page: 2 560 px
 * files displayed at 85 px, no `srcset`, no modern format, no dimensions.
 * The answer here is the opposite on all four counts — four precomputed
 * widths per picture, AVIF with a WebP fallback, an explicit `sizes`, and
 * intrinsic dimensions written on every `<img>` so the layout never shifts
 * (CDC §5.4, CLS ≤ 0,1).
 *
 * Nothing is optimised at request time: `scripts/fetch-media.ts` has already
 * produced the files, so `scripts/check-budget.ts` can weigh a page exactly
 * and fail the build when it is too heavy.
 *
 * Since 12/09/2026 a second kind of picture exists: uploads from the
 * médiathèque, encoded in WebP by the browser at up to four widths and held
 * in Convex file storage. They carry their own URL per rendition (`urls`),
 * are registered at render time by `lib/content/server.ts`, and go through
 * the very same `<picture>` — only the address of each file differs.
 *
 * **Server side only.** This module carries the static manifest (`MEDIA`)
 * and the registry; a client component imports the pure helpers from
 * `lib/media-core.ts` instead, so the manifest never ships as JavaScript.
 */

export * from "@/lib/media-core";

/**
 * Uploaded pictures, registered at render time (`hydrateUploadedMedia`).
 * Module-level and additive: an asset is keyed by a unique key and never
 * changes shape, so sharing the map between requests is a cache, not a
 * leak. The one client renderer (`HeavyMedia`) receives the resolved asset
 * as a prop from its server parent and never consults this.
 */
const uploaded = new Map<string, MediaAsset>();

export function registerMedia(assets: readonly MediaAsset[]): void {
  for (const asset of assets) uploaded.set(asset.id, asset);
}

export const getMediaAsset = (
  key: string | undefined
): MediaAsset | undefined =>
  key ? (MEDIA[key] ?? uploaded.get(key)) : undefined;
