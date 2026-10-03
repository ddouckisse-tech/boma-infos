"use client";

import Link from "next/link";
import { usePreferences } from "@/components/providers/preferences-provider";
import { BRAND_LOGO } from "@/lib/brand";
import { cx } from "@/lib/cx";

/**
 * The wordmark of the charter: « BOMA » in the serif, « infos » in the sans,
 * and the three dots — green, yellow, blue — above it.
 *
 * The letters and the dots are two fragments of one cached SVG request, so
 * no font and no logo data travel in the JavaScript. The letters take the
 * colour of the theme they sit in — navy on a white page, white on navy,
 * including inside a navy island such as the masthead; the dots keep the
 * three colours of the charter everywhere. The link remains at least 44 px
 * tall, even when the logo shrinks on mobile.
 */
export function BrandWordmark({
  className,
  href = "/",
  size = "default",
}: {
  className?: string;
  href?: string;
  size?: "default" | "large";
}) {
  const { locale } = usePreferences();
  return (
    <Link
      href={href}
      aria-label={
        locale === "en" ? "BOMA Infos — home" : "BOMA Infos — accueil"
      }
      // Un `className` fourni remplace la largeur par défaut (les écrans
      // privés passent la leur) : sans fusion de classes, deux largeurs
      // côte à côte laisseraient l'ordre de la feuille de style trancher.
      className={cx(
        "inline-flex min-h-11 max-w-full min-w-0 items-center",
        className ?? (size === "large" ? "w-72 sm:w-80" : "w-44 sm:w-56")
      )}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        width={BRAND_LOGO.width}
        height={BRAND_LOGO.height}
        viewBox={`0 0 ${BRAND_LOGO.width} ${BRAND_LOGO.height}`}
        className="block h-auto w-full"
      >
        <use
          href={`${BRAND_LOGO.sprite}#wordmark`}
          className="fill-brand-navy dark:fill-white"
        />
        <use href={`${BRAND_LOGO.sprite}#dots`} />
      </svg>
    </Link>
  );
}
