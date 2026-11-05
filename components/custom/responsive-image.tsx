import ReactDOM from "react-dom";
import {
  fallbackVariant,
  srcSet,
  srcSetCapped,
  variantUrl,
  type MediaAsset,
} from "@/lib/media-core";
import { cx } from "@/lib/cx";

type ResponsiveImageProps = {
  media: MediaAsset;
  /** Art-directed phone poster; one picture/source choice, never a second image. */
  mobileMedia?: MediaAsset;
  mobileSizes?: string;
  mobileMaxWidth?: number;
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
 * **Data saver (CDC §2.2)** is not handled here. The markup is identical for
 * everyone, and `proxy.ts` rewrites the picture *request* to the 480 px
 * rendition when the reader has the mode on. The obvious alternative —
 * rendering two `<picture>` elements and hiding one with CSS — was built,
 * measured and removed: Chrome downloads a `loading="lazy"` image inside a
 * `display: none` element anyway, so the page paid for both. Rewriting at
 * the edge costs nothing, keeps the DOM half the size, and also covers the
 * eagerly loaded lead picture, which CSS never could.
 */
export function ResponsiveImage({
  media,
  mobileMedia,
  mobileSizes = "92vw",
  mobileMaxWidth = 640,
  sizes,
  alt,
  priority = false,
  className,
  wrapperClassName,
  maxWidth,
}: ResponsiveImageProps) {
  const fallback = fallbackVariant(media, maxWidth ?? media.width);
  const description = alt ?? media.alt;
  const avif = maxWidth
    ? srcSetCapped(media, "avif", maxWidth)
    : srcSet(media, "avif");
  const webp = maxWidth
    ? srcSetCapped(media, "webp", maxWidth)
    : srcSet(media, "webp");
  const mobileAvif = mobileMedia ? srcSetCapped(mobileMedia, "avif", mobileMaxWidth) : "";
  const mobileWebp = mobileMedia ? srcSetCapped(mobileMedia, "webp", mobileMaxWidth) : "";

  if (priority && !mobileMedia) {
    // Hisse un <link rel="preload"> dans le <head>. Sans lui, l'analyseur de
    // préchargement ne découvre l'image de une qu'après la feuille de style :
    // 593 ms de retard au démarrage, mesurés par Lighthouse. Une image
    // envoyée depuis la médiathèque n'a pas d'AVIF : on précharge son WebP.
    const preloadFormat = avif !== "" ? "avif" : "webp";
    ReactDOM.preload(variantUrl(media, fallback.w, preloadFormat), {
      as: "image",
      imageSrcSet: avif !== "" ? avif : webp,
      imageSizes: sizes,
      fetchPriority: "high",
      type: `image/${preloadFormat}`,
    });
  }

  return (
    <span
      className={cx("lc-media", wrapperClassName)}
      style={{ backgroundColor: media.color }}
    >
      <picture>
        {mobileAvif !== "" && (
          <source media="(max-width: 1023px)" type="image/avif" srcSet={mobileAvif} sizes={mobileSizes} />
        )}
        {mobileWebp !== "" && (
          <source media="(max-width: 1023px)" type="image/webp" srcSet={mobileWebp} sizes={mobileSizes} />
        )}
        {avif !== "" && (
          <source type="image/avif" srcSet={avif} sizes={sizes} />
        )}
        <source type="image/webp" srcSet={webp} sizes={sizes} />
        <img
          src={variantUrl(media, fallback.w, "webp")}
          alt={description}
          width={fallback.w}
          height={fallback.h}
          loading={priority ? "eager" : "lazy"}
          // `fetchPriority` n'est honoré que sur une image non différée.
          fetchPriority={priority ? "high" : undefined}
          // Toujours `async`, y compris pour l'image de une : `sync` impose
          // un décodage AVIF avant la présentation de l'image, et sur un
          // processeur bridé cela coûtait deux secondes de retard au rendu
          // — 60 % du LCP mesuré par Lighthouse.
          decoding="async"
          // `object-cover` par défaut ; un appelant qui précise son propre
          // ajustement (l'emplacement publicitaire : `object-contain`) le
          // remplace, sans moteur de fusion de classes côté lecteur.
          className={cx(
            "block h-full w-full",
            /\bobject-(contain|fill|none|scale-down)\b/.test(className ?? "")
              ? undefined
              : "object-cover",
            className
          )}
        />
      </picture>
    </span>
  );
}
