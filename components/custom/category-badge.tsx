import Link from "next/link";
import {
  accentFillClass,
  accentTextClass,
  sectionHref,
  subSectionHref,
  toAccent,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

type CategoryBadgeProps = {
  slug: string;
  name: string;
  accent: string;
  parentSlug?: string;
  /** `fill` for a solid pill, `text` for the eyebrow above a headline. */
  variant?: "fill" | "text";
  className?: string;
};

/**
 * Section marker. The audit measured the legacy pill at 4,4:1 — just under
 * the threshold; every pair used here is at or above 4,5:1 and the brand
 * magenta `#C74794` is never asked to carry a label (CDC §3.5).
 *
 * Rendered as a link: a section marker that cannot be clicked is a wasted
 * navigation affordance on a press site.
 */
export function CategoryBadge({
  slug,
  name,
  accent,
  parentSlug,
  variant = "fill",
  className,
}: CategoryBadgeProps) {
  const token = toAccent(accent);
  const href = parentSlug
    ? subSectionHref(parentSlug, slug)
    : sectionHref(slug);

  // La cible tactile fait 44 px de haut (CDC §3.5) sans que la pastille
  // n'en fasse autant : le lien porte la hauteur, l'aplat vit dans le span.
  // `relative z-10` la garde cliquable au-dessus du lien étiré de la carte.
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "relative z-10 inline-flex min-h-11 max-w-full items-center type-small font-semibold",
        className
      )}
    >
      <span
        className={cn(
          "truncate rounded-xs",
          variant === "fill"
            ? cn("px-2 py-1 leading-tight", accentFillClass[token])
            : cn("tracking-wide uppercase", accentTextClass[token])
        )}
      >
        {name}
      </span>
    </Link>
  );
}
