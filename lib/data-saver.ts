/**
 * Data saver — the plumbing shared by the browser, the proxy and the budget
 * checker (CAHIER-DES-CHARGES.md §2.2).
 *
 * Deliberately dependency-free: `proxy.ts` runs in the edge runtime, the
 * blocking preferences script runs before React, and `scripts/check-budget.ts`
 * runs in Node. All three need the same two rules and nothing else.
 */

/** Read by `proxy.ts` on every picture request. Value is "1" or absent. */
export const DATA_SAVER_COOKIE = "lc-eco";

/**
 * Ceiling of a downgraded picture, in pixels.
 *
 * 480 is the widest rendition that still halves the bytes on the high-density
 * phones that make up the Gabonese parc: a card asking for 768 px gets a
 * 12 Ko file instead of a 21 Ko one, and the lead picture 12 Ko instead of 31.
 */
export const DATA_SAVER_MAX_WIDTH = 480;

/** Widths produced by `scripts/fetch-media.ts`, ascending. */
export const MEDIA_WIDTHS = [320, 480, 640, 768, 960, 1280] as const;

const MEDIA_PATH = /^\/medias\/([A-Za-z0-9-]+)-(\d+)\.(avif|webp)$/;

/**
 * `/medias/port-owendo-960.avif` → `/medias/port-owendo-480.avif`.
 * Returns null when the path is not a rendition, or is already small enough.
 */
export function downgradeMediaPath(
  pathname: string,
  maxWidth: number
): string | null {
  const match = MEDIA_PATH.exec(pathname);
  if (!match) return null;

  const [, key, rawWidth, format] = match;
  const width = Number(rawWidth);
  if (!Number.isFinite(width) || width <= maxWidth) return null;

  const target = [...MEDIA_WIDTHS]
    .filter((candidate) => candidate <= maxWidth)
    .pop();
  if (!target || target === width) return null;

  return `/medias/${key}-${target}.${format}`;
}
