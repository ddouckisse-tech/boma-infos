import Link from "next/link";
import { LocalizedText } from "@/components/custom/localized-text";
import { formatDate, formatReadingTime, isoDate } from "@/lib/format";
import type { LocaleChoice } from "@/lib/preferences";
import { localeDate } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const englishDate = (value: number) =>
  localeDate(value, "en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Libreville",
  });

const englishReadingTime = (minutes: number) => `${minutes}\u00a0min read`;

type AuthorBylineProps = {
  authorSlug: string;
  authorName: string;
  authorRole?: string;
  locale?: LocaleChoice;
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
  locale = "fr",
  publishedAt,
  updatedAt,
  readingMinutes,
  size = "default",
  className,
}: AuthorBylineProps) {
  const edited = updatedAt && updatedAt - publishedAt > 60_000;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}
    >
      <AuthorMonogram
        name={authorName}
        className={size === "compact" ? "size-7 text-[0.7rem]" : "size-10"}
      />
      <div className="min-w-0">
        <p className="type-small">
          <span className="text-muted-foreground">
            <LocalizedText fr="Par " en="By " />
          </span>
          <Link
            href={`/auteur/${authorSlug}`}
            prefetch={false}
            className="inline-flex min-h-11 items-center font-semibold text-foreground underline-offset-4 hover:underline"
            rel="author"
          >
            {authorName}
          </Link>
          {authorRole && size === "default" && (
            <span lang={locale} className="text-muted-foreground">
              {" "}
              — {authorRole}
            </span>
          )}
        </p>
        <p className="type-small text-muted-foreground">
          <time dateTime={isoDate(publishedAt)}>
            <LocalizedText
              fr={formatDate(publishedAt)}
              en={englishDate(publishedAt)}
            />
          </time>
          {readingMinutes !== undefined && (
            <>
              <span aria-hidden="true"> · </span>
              <LocalizedText
                fr={formatReadingTime(readingMinutes)}
                en={englishReadingTime(readingMinutes)}
              />
            </>
          )}
          {edited && (
            <>
              <span aria-hidden="true"> · </span>
              <span>
                <LocalizedText fr="mis à jour le " en="updated " />
                <time dateTime={isoDate(updatedAt)}>
                  <LocalizedText
                    fr={formatDate(updatedAt)}
                    en={englishDate(updatedAt)}
                  />
                </time>
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
