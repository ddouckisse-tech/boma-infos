import Link from "next/link";
import { formatDate, formatReadingTime, isoDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type AuthorBylineProps = {
  authorSlug: string;
  authorName: string;
  authorRole?: string;
  publishedAt: number;
  updatedAt?: number;
  readingMinutes?: number;
  size?: "default" | "compact";
  className?: string;
};

/** Initials on a brand disc — no portrait to download, no face to invent. */
export function AuthorMonogram({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-navy-900 font-semibold text-white dark:bg-navy-300 dark:text-navy-950",
        className
      )}
    >
      {initials}
    </span>
  );
}

/**
 * Byline: who wrote it, when, how long it takes to read.
 *
 * The legacy site attributed its 1 019 articles to a single account named
 * `admin`; a named signature is both a credibility signal and a condition of
 * eligibility for Google Actualités (audit §07).
 */
export function AuthorByline({
  authorSlug,
  authorName,
  authorRole,
  publishedAt,
  updatedAt,
  readingMinutes,
  size = "default",
  className,
}: AuthorBylineProps) {
  const edited = updatedAt && updatedAt - publishedAt > 60_000;

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      <AuthorMonogram
        name={authorName}
        className={size === "compact" ? "size-7 text-[0.7rem]" : "size-10"}
      />
      <div className="min-w-0">
        <p className="type-small">
          <span className="text-muted-foreground">Par </span>
          <Link
            href={`/auteur/${authorSlug}`}
            className="font-semibold text-foreground underline-offset-4 hover:underline"
            rel="author"
          >
            {authorName}
          </Link>
          {authorRole && size === "default" && (
            <span className="text-muted-foreground">
              {" "}
              — {authorRole}
            </span>
          )}
        </p>
        <p className="type-small text-muted-foreground">
          <time dateTime={isoDate(publishedAt)}>{formatDate(publishedAt)}</time>
          {readingMinutes !== undefined && (
            <>
              <span aria-hidden="true"> · </span>
              {formatReadingTime(readingMinutes)}
            </>
          )}
          {edited && (
            <>
              <span aria-hidden="true"> · </span>
              <span>
                mis à jour le{" "}
                <time dateTime={isoDate(updatedAt)}>
                  {formatDate(updatedAt)}
                </time>
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
