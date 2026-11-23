import type {
  MediaAsset as ManifestAsset,
  MediaVariant,
} from "../convex/mediaManifest";

/**
 * Pure image helpers — the half of `lib/media.ts` that a **client** component
 * may import.
 *
 * `lib/media.ts` also carries the static manifest (`MEDIA`, some 30 Ko of
 * source) and the registry of uploaded pictures. The video poster
 * (`HeavyMedia`, a client component) and the `<picture>` it renders only
 * need the address arithmetic below; importing it from here keeps the
 * manifest out of the article's JavaScript, which the budget of CDC §5.4
 * counts to the kilobyte. Type-only imports from the manifest cost nothing.
 */

export type { MediaVariant };

/**
 * A picture the journal can render: a demo-library asset, or an upload whose
 * renditions live in Convex file storage and carry their own URL each.
 */
export type MediaAsset = ManifestAsset & {
  /** `"webp-640"` → signed URL. Only uploads have it. */
  readonly urls?: Readonly<Record<string, string>>;
};

export const mediaUrl = (key: string, width: number, format: "avif" | "webp") =>
  `/medias/${key}-${width}.${format}`;

/** Address of one rendition: the signed storage URL of an upload, else the static file. */
export const variantUrl = (
  asset: MediaAsset,
  width: number,
  format: "avif" | "webp"
): string =>
  asset.urls?.[`${format}-${width}`] ?? mediaUrl(asset.id, width, format);

/** `srcset` string for one format, ordered by ascending width; empty when the format is absent. */
export function srcSet(asset: MediaAsset, format: "avif" | "webp"): string {
  const variants = format === "avif" ? asset.avif : asset.webp;
  return variants
    .map((variant) => `${variantUrl(asset, variant.w, format)} ${variant.w}w`)
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
  const all = format === "avif" ? asset.avif : asset.webp;
  const variants = all.filter((variant) => variant.w <= maxWidth);
  const usable = variants.length > 0 ? variants : all.slice(0, 1);
  return usable
    .map((variant) => `${variantUrl(asset, variant.w, format)} ${variant.w}w`)
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
 * on (CDC §2.2). Uploads are not rewritten by `proxy.ts` (their address is
 * not under `/medias/`); they are capped at 1 280 px at upload time.
 */
export const DATA_SAVER_MAX_WIDTH = 480;

/**
 * `sizes` presets. Keeping them to a handful of named layouts means the
 * budget checker can resolve the same value the browser will, instead of
 * guessing (see `scripts/check-budget.ts`).
 */
export const SIZES = {
  /** Lead image in the article header, within the editorial frame. */
  articleHero: "(min-width: 1120px) 1056px, calc(100vw - 32px)",
  /** Three-per-row card grid. */
  card: "(min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw",
  /**
   * Small list thumbnail, capped at the 240 px rendition by its call site
   * (`scripts/media-thumbnails.ts` adds it to pictures held in storage).
   */
  thumb: "(min-width: 640px) 160px, 96px",
  /** Picture inside the reading column, itself capped at 39 rem. */
  inline: "(min-width: 1024px) 624px, 92vw",
} as const;

export type SizesPreset = keyof typeof SIZES;
