import { CategoryBadge } from "@/components/custom/category-badge";
import { ArticleLink } from "@/components/custom/article-link";
import {
  EditorialText,
  LocalizedText,
} from "@/components/custom/localized-text";
import { PartnerTag } from "@/components/custom/partner-tag";
import { ResponsiveImage } from "@/components/custom/responsive-image";
import { formatDate, formatReadingTime, isoDate } from "@/lib/format";
import { localeDate } from "@/lib/i18n";
import { getMediaAsset, SIZES } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/convex/model/content";

const englishDate = (value: number) =>
  localeDate(value, "en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Libreville",
  });

const englishReadingTime = (minutes: number) => `${minutes}\u00a0min read`;

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
  /** Keeps deep home-page sections textual to stay within the mobile budget. */
  showImage?: boolean;
};

/**
 * The workhorse of every list on the site.
 *
 * Every link carries `prefetch={false}`. Next prefetches in-viewport links
 * by default, which on a section page means downloading nine articles the
 * reader has not asked for — measured at 40 Ko of speculative traffic on the
 * home page alone. On a metered Gabonese connection that is the reader's
 * money, so navigation is prefetched on intent (hover, touch) instead.
 *
 * The headline link is **stretched** over the whole card (`after:absolute
 * after:inset-0`), so the touch target is the card — far past the 44 px of
 * CDC §3.5, instead of a 27 px line of text. There is exactly one link per
 * card in the accessibility tree: the picture is not a second link and not
 * described (`alt=""`), because a screen reader announcing the same story
 * twice is worse than not announcing the picture at all. Controls that must
 * stay separately clickable — the section badge — are lifted above the
 * stretch with `relative z-10`.
 */
export function ArticleCard({
  article,
  variant = "card",
  showCategory = true,
  className,
  headingLevel = 3,
  showImage = true,
}: ArticleCardProps) {
  const media = getMediaAsset(article.heroMediaKey);
  const Heading = headingLevel === 2 ? "h2" : "h3";

  const meta = (
    <p className="news-card-meta text-muted-foreground">
      <time dateTime={isoDate(article.publishedAt)}>
        <LocalizedText
          fr={formatDate(article.publishedAt)}
          en={englishDate(article.publishedAt)}
        />
      </time>
      <span aria-hidden="true"> · </span>
      <LocalizedText
        fr={formatReadingTime(article.readingMinutes)}
        en={englishReadingTime(
          article.englishSummary?.readingMinutes ?? article.readingMinutes
        )}
      />
    </p>
  );

  if (variant === "compact") {
    return (
      <article className={cn("group/card relative py-3", className)}>
        <Heading className="news-brief-title font-display text-pretty">
          <ArticleLink
            slug={article.slug}
            className="underline-offset-4 after:absolute after:inset-0 hover:underline"
          >
            <EditorialText
              fr={article.title}
              en={article.englishSummary?.title}
            />
          </ArticleLink>
        </Heading>
        <div className="mt-1 flex flex-wrap items-center gap-x-2">
          {article.origin === "partenaire" && <PartnerTag size="small" />}
          {meta}
        </div>
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article
        className={cn(
          "group/card relative py-4",
          showImage &&
            media &&
            "grid grid-cols-[minmax(0,1fr)_96px] gap-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-5",
          className
        )}
      >
        {showImage && media && (
          <div className="col-start-2 row-start-1 self-start sm:col-start-1">
            <ResponsiveImage
              media={media}
              alt=""
              sizes={SIZES.thumb}
              maxWidth={240}
              wrapperClassName="aspect-[4/3] sm:aspect-video"
            />
          </div>
        )}
        <div
          className={cn(
            "min-w-0",
            showImage && media && "col-start-1 row-start-1 sm:col-start-2"
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            {showCategory && (
              <CategoryBadge
                slug={article.subCategorySlug ?? article.categorySlug}
                name={article.subCategoryName ?? article.categoryName}
                accent={article.categoryAccent}
                parentSlug={
                  article.subCategorySlug ? article.categorySlug : undefined
                }
                variant="text"
              />
            )}
            {article.origin === "partenaire" && <PartnerTag size="small" />}
          </div>
          <Heading className="mt-1 font-display type-h3 text-balance">
            <ArticleLink
              slug={article.slug}
              className="underline-offset-4 after:absolute after:inset-0 hover:underline"
            >
              <EditorialText
                fr={article.title}
                en={article.englishSummary?.title}
              />
            </ArticleLink>
          </Heading>
          <p className="mt-2 line-clamp-2 type-small text-muted-foreground">
            <EditorialText fr={article.dek} en={article.englishSummary?.dek} />
          </p>
          <div className="mt-2">{meta}</div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "news-card group/card relative flex h-full flex-col border-t border-border",
        className
      )}
    >
      {showImage && media && (
        <ResponsiveImage
          media={media}
          alt=""
          sizes={SIZES.card}
          maxWidth={640}
          wrapperClassName="aspect-video"
        />
      )}
      <div className="flex flex-1 flex-col py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {showCategory && (
            <CategoryBadge
              slug={article.subCategorySlug ?? article.categorySlug}
              name={article.subCategoryName ?? article.categoryName}
              accent={article.categoryAccent}
              variant="text"
              parentSlug={
                article.subCategorySlug ? article.categorySlug : undefined
              }
            />
          )}
          {article.origin === "partenaire" && <PartnerTag size="small" />}
        </div>
        <Heading className="font-display type-h3 text-pretty">
          <ArticleLink
            slug={article.slug}
            className="underline-offset-4 after:absolute after:inset-0 hover:underline"
          >
            <EditorialText
              fr={article.title}
              en={article.englishSummary?.title}
            />
          </ArticleLink>
        </Heading>
        <p className="mt-2 line-clamp-3 flex-1 type-small text-muted-foreground">
          <EditorialText fr={article.dek} en={article.englishSummary?.dek} />
        </p>
        <div className="mt-3">{meta}</div>
      </div>
    </article>
  );
}
