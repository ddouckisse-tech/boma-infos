import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * "Le Corporate." lock-up. Text only: no image request, no extra font — it is
 * set in the display face already loaded for the headings.
 *
 * Three colours, on purpose: « Le » and the final point in the brand magenta,
 * « Corporate » in the ink of the current theme (near-black on light,
 * near-white on dark). The point is decorative and carries no information.
 *
 * The link is padded to a full 44 px touch target (CDC §3.5): the wordmark is
 * the most-tapped control of a news site on a phone, and the glyphs alone are
 * only about 20 px tall.
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
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center font-display leading-none font-extrabold tracking-[-0.04em] text-foreground",
        size === "large" ? "type-h1" : "type-h3",
        className
      )}
    >
      <span translate="no">
        <span className="text-brand-magenta dark:text-brand-magenta-dark">
          Le
        </span>{" "}
        Corporate
        <span
          aria-hidden="true"
          className="text-brand-magenta dark:text-brand-magenta-dark"
        >
          .
        </span>
      </span>
    </Link>
  );
}
