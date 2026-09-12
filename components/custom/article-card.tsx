import Link from "next/link";
import { CategoryBadge } from "@/components/custom/category-badge";
import { PartnerTag } from "@/components/custom/partner-tag";
import { ResponsiveImage } from "@/components/custom/responsive-image";
import { formatDate, formatReadingTime, isoDate } from "@/lib/format";
import { getMediaAsset, SIZES } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/convex/model/content";

type ArticleCardProps = {
  article: ArticleSummary;
  /**
   * `card` — picture on top, used in grids.
   * `list` — picture beside the headline, used in a column.
   * `compact` — headline only, used in sidebars and "latest" rails.
   */
  variant?: "card" | "list" | "compact";
  /** Hides the section marker where the surrounding block already states it. */
  showCategory?: boolean;
  className?: string;
  /** Raises the headline to <h2>; default is <h3>. */
  headingLevel?: 2 | 3;
};

/**
 * The workhorse of every list on the site.
 *
 * One link wraps the whole card, so the touch target is the card itself —
 * comfortably past the 44 px of CDC §3.5 rather than a 16 px chevron. The
 * headline carries the accessible name; the picture is decorative here
 * (`alt=""`) because repeating it would make a screen reader announce the
 * same story twice.
 */
export function ArticleCard({
  article,
  variant = "card",
  showCategory = true,
  className,
  headingLevel = 3,
}: ArticleCardProps) {
  const media = getMediaAsset(article.heroMediaKey);
  const Heading = headingLevel === 2 ? "h2" : "h3";

  const meta = (
    <p className="type-small text-muted-foreground">
      <time dateTime={isoDate(article.publishedAt)}>
        {formatDate(article.publishedAt)}
      </time>
      <span aria-hidden="true"> · </span>
      {formatReadingTime(article.readingMinutes)}
    </p>
  );

  if (variant === "compact") {
    return (
      <article className={cn("group/card py-3", className)}>
        <div className="flex items-baseline gap-3">
          <span
            aria-hidden="true"
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-magenta"
          />
          <div className="min-w-0">
            <Heading className="font-serif type-body font-semibold text-balance">
              <Link
                href={`/article/${article.slug}`}
                className="underline-offset-4 hover:underline"
              >
                {article.title}
              </Link>
            </Heading>
            <div className="mt-1 flex flex-wrap items-center gap-x-2">
              {article.origin === "partenaire" && <PartnerTag size="small" />}
              {meta}
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article
        className={cn(
          "group/card grid grid-cols-[96px_1fr] gap-4 py-4 sm:grid-cols-[160px_1fr] sm:gap-6",
          className
        )}
      >
        <Link
          href={`/article/${article.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="block"
        >
          {media ? (
            <ResponsiveImage
              media={media}
              alt=""
              sizes={SIZES.thumb}
              maxWidth={640}
              wrapperClassName="aspect-[16/9] rounded-md"
            />
          ) : (
            <span className="block aspect-[16/9] rounded-md bg-surface-muted" />
          )}
        </Link>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {showCategory && (
              <CategoryBadge
                slug={article.subCategorySlug ?? article.categorySlug}
                name={article.subCategoryName ?? article.categoryName}
                accent={article.categoryAccent}
                parentSlug={article.subCategorySlug ? article.categorySlug : undefined}
                variant="text"
              />
            )}
            {article.origin === "partenaire" && <PartnerTag size="small" />}
          </div>
          <Heading className="mt-1 font-serif type-h3 text-balance">
            <Link
              href={`/article/${article.slug}`}
              className="underline-offset-4 hover:underline"
            >
              {article.title}
            </Link>
          </Heading>
          <p className="mt-2 line-clamp-2 type-small text-muted-foreground">
            {article.dek}
          </p>
          <div className="mt-2">{meta}</div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group/card flex h-full flex-col overflow-hidden rounded-md border border-border bg-card",
        className
      )}
    >
      <Link
        href={`/article/${article.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="block"
      >
        {media ? (
          <ResponsiveImage
            media={media}
            alt=""
            sizes={SIZES.card}
            maxWidth={960}
            wrapperClassName="aspect-[16/9]"
          />
        ) : (
          <span className="block aspect-[16/9] bg-surface-muted" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-2">
          {showCategory && (
            <CategoryBadge
              slug={article.subCategorySlug ?? article.categorySlug}
              name={article.subCategoryName ?? article.categoryName}
              accent={article.categoryAccent}
              parentSlug={article.subCategorySlug ? article.categorySlug : undefined}
            />
          )}
          {article.origin === "partenaire" && <PartnerTag size="small" />}
        </div>
        <Heading className="mt-3 font-serif type-h3 text-balance">
          <Link
            href={`/article/${article.slug}`}
            className="underline-offset-4 hover:underline"
          >
            {article.title}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-3 flex-1 type-small text-muted-foreground">
          {article.dek}
        </p>
        <div className="mt-4 border-t border-border pt-3">{meta}</div>
      </div>
    </article>
  );
}
