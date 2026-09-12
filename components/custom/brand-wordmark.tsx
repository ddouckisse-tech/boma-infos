import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * "Le Corporate" lock-up. Text only: no image request, no extra font.
 * The magenta point is decorative and carries no information.
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
        "inline-flex items-baseline gap-1 font-serif leading-none font-semibold tracking-tight text-foreground",
        size === "large" ? "text-h1" : "text-h3",
        className
      )}
    >
      <span>Le&nbsp;Corporate</span>
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
