import {
  MEDIA,
  type MediaAsset,
  type MediaVariant,
} from "@/convex/mediaManifest";

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

export const getMediaAsset = (
  key: string | undefined
): MediaAsset | undefined => (key ? MEDIA[key] : undefined);

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

/**
 * Ceiling of the data-saver rendition, in pixels.
 *
 * 480 and not 640: paired with `sizes="320px"`, a DPR-1 phone takes the
 * 320 px file (about 6 Ko) and a DPR-2 or DPR-3 phone the 480 px one (about
 * 12 Ko). Capping at 640 left high-density phones — most of the parc — on a
 * 19 Ko file, which is not what a reader asks for when they switch the mode
 * on (CDC §2.2).
 */
export const DATA_SAVER_MAX_WIDTH = 480;

/**
 * `sizes` presets. Keeping them to a handful of named layouts means the
 * budget checker can resolve the same value the browser will, instead of
 * guessing (see `scripts/check-budget.ts`).
 */
export const SIZES = {
  /**
   * Lead picture on the home page: the background of the `.lc-hero` band —
   * the right three quarters of the viewport from 768 px, the whole width
   * below, gutters included. Its worst case is bounded by the call site
   * (`maxWidth={1280}`, the largest rendition).
   */
  hero: "(min-width: 768px) 74vw, 100vw",
  /**
   * Article opening picture — the same band. Bounded at 960 px by the call
   * site: the article page runs 12 Ko under its 400 Ko ceiling, and the
   * dark scrim hides the mild upscale on wide screens.
   */
  articleHero: "(min-width: 768px) 74vw, 100vw",
  /** Three-per-row card grid. */
  card: "(min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw",
  /** Small list thumbnail. */
  thumb: "(min-width: 640px) 160px, 96px",
  /** Picture inside the reading column, itself capped at 39 rem. */
  inline: "(min-width: 1024px) 624px, 92vw",
} as const;

export type SizesPreset = keyof typeof SIZES;
