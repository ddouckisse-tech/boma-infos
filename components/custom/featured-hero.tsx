import Link from "next/link";
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
import { getMediaAsset } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/convex/model/content";

export function FeaturedHero({
  article,
  stacked = false,
  showCategory = true,
  headingLevel = 2,
}: {
  article: ArticleSummary;
  stacked?: boolean;
  showCategory?: boolean;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const media = getMediaAsset(article.heroMediaKey);

  return (
    <article
      className={cn(
        "news-feature relative",
        media && !stacked && "news-feature--split"
      )}
    >
      {media && (
        <ResponsiveImage
          media={media}
          alt=""
          sizes={
            stacked
              ? "(min-width: 1280px) 832px, (min-width: 1024px) 66vw, calc(100vw - 32px)"
              : "(min-width: 1280px) 686px, (min-width: 768px) 55vw, calc(100vw - 32px)"
          }
          maxWidth={960}
          wrapperClassName="news-feature__image"
          priority
        />
      )}

      <div className="news-feature__copy">
        <div className="flex flex-wrap items-center gap-2">
          {showCategory && (
            <CategoryBadge
              slug={article.categorySlug}
              name={article.categoryName}
              accent={article.categoryAccent}
              variant="text"
            />
          )}
          {article.origin === "partenaire" && <PartnerTag />}
        </div>

        <Heading className="news-feature__title font-display text-balance">
          <ArticleLink
            slug={article.slug}
            className="underline-offset-[5px] after:absolute after:inset-0 hover:underline"
          >
            <EditorialText
              fr={article.title}
              en={article.englishSummary?.title}
            />
          </ArticleLink>
        </Heading>

        <p className="news-feature__dek text-muted-foreground">
          <EditorialText fr={article.dek} en={article.englishSummary?.dek} />
        </p>

        <p className="news-feature__meta text-muted-foreground">
          <Link
            href={`/auteur/${article.authorSlug}`}
            prefetch={false}
            className="relative z-10 font-semibold text-foreground underline-offset-4 hover:underline"
          >
            {article.authorName}
          </Link>
          <span aria-hidden="true"> · </span>
          <time dateTime={isoDate(article.publishedAt)}>
            <LocalizedText
              fr={formatDate(article.publishedAt)}
              en={localeDate(article.publishedAt, "en", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Africa/Libreville",
              })}
            />
          </time>
          <span aria-hidden="true"> · </span>
          <LocalizedText
            fr={formatReadingTime(article.readingMinutes)}
            en={`${article.englishSummary?.readingMinutes ?? article.readingMinutes}\u00a0min read`}
          />
        </p>
      </div>
    </article>
  );
}
