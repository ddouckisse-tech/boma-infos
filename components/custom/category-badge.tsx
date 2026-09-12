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
  const href = parentSlug ? subSectionHref(parentSlug, slug) : sectionHref(slug);

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex max-w-full items-center rounded-xs type-small font-semibold",
        variant === "fill"
          ? cn("px-2 py-1 leading-tight", accentFillClass[token])
          : cn("tracking-wide uppercase", accentTextClass[token]),
        className
      )}
    >
      <span className="truncate">{name}</span>
    </Link>
  );
}
