import {
  DATA_SAVER_MAX_WIDTH,
  fallbackVariant,
  mediaUrl,
  srcSet,
  srcSetCapped,
  type MediaAsset,
} from "@/lib/media";
import { cn } from "@/lib/utils";

type ResponsiveImageProps = {
  media: MediaAsset;
  /** `sizes` attribute — use a preset from `SIZES`. */
  sizes: string;
  /** Overrides the manifest's alternative text. Never omit both. */
  alt?: string;
  /**
   * The one picture per page that is above the fold. Rendered eagerly at high
   * priority and never paired (see the note on data saver below).
   */
  priority?: boolean;
  /** Tailwind classes for the <img> itself (object-fit, rounding…). */
  className?: string;
  /** Tailwind classes for the wrapper that holds the aspect ratio. */
  wrapperClassName?: string;
  /** Caps the full rendition; useful for thumbnails in a narrow column. */
  maxWidth?: number;
};

/**
 * The project's only image primitive.
 *
 * Four precomputed widths, AVIF first with a WebP fallback, explicit
 * `width`/`height` and a background painted in the picture's dominant colour:
 * the box is reserved before a byte arrives, so the page never jumps
 * (CDC §5.4 — CLS ≤ 0,1).
 *
 * **Data saver (CDC §2.2).** A lazy picture is rendered twice: the full
 * rendition and a 320 px one. CSS shows exactly one of them, and a
 * `loading="lazy"` image inside a `display: none` element is never
 * intersected, therefore never downloaded — the hidden rendition costs zero
 * byte. The `priority` picture is the documented exception: it must be
 * eagerly fetched to hold the LCP, and an eager image *is* downloaded even
 * when hidden, so pairing it would waste on the very readers the mode
 * protects. It is instead kept small by its `sizes` — a phone pulls the
 * 640 px rendition, around 19 Ko.
 */
export function ResponsiveImage({
  media,
  sizes,
  alt,
  priority = false,
  className,
  wrapperClassName,
  maxWidth,
}: ResponsiveImageProps) {
  const fallback = fallbackVariant(media, maxWidth ?? media.width);
  const description = alt ?? media.alt;

  const full = (
    <picture className={priority ? undefined : "lc-media-full"}>
      <source
        type="image/avif"
        srcSet={
          maxWidth ? srcSetCapped(media, "avif", maxWidth) : srcSet(media, "avif")
        }
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={
          maxWidth ? srcSetCapped(media, "webp", maxWidth) : srcSet(media, "webp")
        }
        sizes={sizes}
      />
      <img
        src={mediaUrl(media.id, fallback.w, "webp")}
        alt={description}
        width={fallback.w}
        height={fallback.h}
        loading={priority ? "eager" : "lazy"}
        // `fetchPriority` n'est honoré que sur une image non différée.
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
        className={cn("block h-full w-full object-cover", className)}
      />
    </picture>
  );

  return (
    <span
      className={cn("lc-media", wrapperClassName)}
      style={{ backgroundColor: media.color }}
    >
      {full}
      {!priority && (
        <picture className="lc-media-lite">
          <source
            type="image/avif"
            srcSet={srcSetCapped(media, "avif", DATA_SAVER_MAX_WIDTH)}
            sizes="320px"
          />
          <source
            type="image/webp"
            srcSet={srcSetCapped(media, "webp", DATA_SAVER_MAX_WIDTH)}
            sizes="320px"
          />
          <img
            src={mediaUrl(media.id, 320, "webp")}
            alt={description}
            width={media.avif[0].w}
            height={media.avif[0].h}
            loading="lazy"
            decoding="async"
            className={cn("block h-full w-full object-cover", className)}
          />
        </picture>
      )}
    </span>
  );
}
