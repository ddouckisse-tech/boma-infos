import { MEDIA, type MediaAsset, type MediaVariant } from "@/convex/mediaManifest";

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
 */

export type { MediaAsset, MediaVariant };

export const getMediaAsset = (key: string | undefined): MediaAsset | undefined =>
  key ? MEDIA[key] : undefined;

export const mediaUrl = (key: string, width: number, format: "avif" | "webp") =>
  `/medias/${key}-${width}.${format}`;

/** `srcset` string for one format, ordered by ascending width. */
export function srcSet(asset: MediaAsset, format: "avif" | "webp"): string {
  const variants = format === "avif" ? asset.avif : asset.webp;
  return variants
    .map((variant) => `${mediaUrl(asset.id, variant.w, format)} ${variant.w}w`)
    .join(", ");
}

/**
 * Same thing, capped: the data-saver rendition never offers anything above
 * 640 px, whatever the layout would otherwise ask for (CDC §2.2).
 */
export function srcSetCapped(
  asset: MediaAsset,
  format: "avif" | "webp",
  maxWidth: number
): string {
  const variants = (format === "avif" ? asset.avif : asset.webp).filter(
    (variant) => variant.w <= maxWidth
  );
  const usable = variants.length > 0 ? variants : [asset.avif[0]];
  return usable
    .map((variant) => `${mediaUrl(asset.id, variant.w, format)} ${variant.w}w`)
    .join(", ");
}

/** Largest rendition at or below `maxWidth` — the `src` fallback. */
export function fallbackVariant(
  asset: MediaAsset,
  maxWidth: number
): MediaVariant {
  const eligible = asset.webp.filter((variant) => variant.w <= maxWidth);
  return eligible[eligible.length - 1] ?? asset.webp[0];
}

/** Ceiling of the data-saver rendition, in pixels. */
export const DATA_SAVER_MAX_WIDTH = 640;

/**
 * `sizes` presets. Keeping them to a handful of named layouts means the
 * budget checker can resolve the same value the browser will, instead of
 * guessing (see `scripts/check-budget.ts`).
 */
export const SIZES = {
  /** Full-bleed lead picture on the home page. */
  hero: "(min-width: 1280px) 820px, (min-width: 768px) 66vw, 100vw",
  /** Article opening picture, inside the page container. */
  articleHero: "(min-width: 1024px) 760px, 100vw",
  /** Three-per-row card grid. */
  card: "(min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw",
  /** Small list thumbnail. */
  thumb: "(min-width: 640px) 160px, 96px",
  /** Picture inside the reading column. */
  inline: "(min-width: 1024px) 680px, 92vw",
} as const;

export type SizesPreset = keyof typeof SIZES;
