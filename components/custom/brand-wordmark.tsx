import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * "Le Corporate" lock-up. Text only: no image request, no extra font.
 * The magenta point is decorative and carries no information.
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
        "inline-flex min-h-11 items-center gap-1 font-serif leading-none font-semibold tracking-tight text-foreground",
        size === "large" ? "type-h1" : "type-h3",
        className
      )}
    >
      <span translate="no">Le&nbsp;Corporate</span>
      <span aria-hidden="true" className="text-brand-magenta dark:hidden">
        .
      </span>
      <span
        aria-hidden="true"
        className="hidden text-brand-magenta-dark dark:inline"
      >
        .
      </span>
    </Link>
  );
}
