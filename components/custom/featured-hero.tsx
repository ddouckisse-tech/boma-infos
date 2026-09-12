import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryBadge } from "@/components/custom/category-badge";
import { PartnerTag } from "@/components/custom/partner-tag";
import { ResponsiveImage } from "@/components/custom/responsive-image";
import { formatDate, formatReadingTime, isoDate } from "@/lib/format";
import { getMediaAsset, SIZES } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/convex/model/content";

/**
 * The lead story.
 *
 * Its picture is the only one on the page rendered with `priority`: it is the
 * Largest Contentful Paint, so it is fetched eagerly and at high priority
 * while everything else waits for the reader to scroll.
 *
 * The headline is deliberately *not* laid over the photograph. The audit
 * found the legacy "Interview" block unreadable for exactly that reason —
 * white text on an unloaded image measured 1,0:1 — and no overlay survives
 * every picture. Text sits on the page background, where its contrast is
 * known (CDC §3.5).
 */
export function FeaturedHero({
  article,
  className,
}: {
  article: ArticleSummary;
  className?: string;
}) {
  const media = getMediaAsset(article.heroMediaKey);

  return (
    <article
      className={cn(
        "relative grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-10",
        className
      )}
    >
      <div>
        {media ? (
          <ResponsiveImage
            media={media}
            alt=""
            sizes={SIZES.hero}
            maxWidth={960}
            priority
            wrapperClassName="aspect-[16/9] rounded-md"
          />
        ) : (
          <span className="block aspect-[16/9] rounded-md bg-surface-muted" />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 type-small font-semibold tracking-wide text-accent uppercase">
            <span
              aria-hidden="true"
              className="inline-block h-[3px] w-6 bg-brand-magenta"
            />
            À la une
          </span>
          <CategoryBadge
            slug={article.categorySlug}
            name={article.categoryName}
            accent={article.categoryAccent}
          />
          {article.origin === "partenaire" && <PartnerTag />}
        </div>

        <h2 className="mt-4 font-serif type-display text-balance">
          <Link
            href={`/article/${article.slug}`}
            prefetch={false}
            className="underline-offset-[6px] after:absolute after:inset-0 hover:underline"
          >
            {article.title}
          </Link>
        </h2>

        <p className="mt-4 max-w-reading type-body text-muted-foreground">
          {article.dek}
        </p>

        <p className="relative z-10 mt-4 type-small text-muted-foreground">
          Par{" "}
          <Link
            href={`/auteur/${article.authorSlug}`}
            prefetch={false}
            className="inline-flex min-h-11 items-center font-semibold text-foreground underline-offset-4 hover:underline"
          >
            {article.authorName}
          </Link>
          <span aria-hidden="true"> · </span>
          <time dateTime={isoDate(article.publishedAt)}>
            {formatDate(article.publishedAt)}
          </time>
          <span aria-hidden="true"> · </span>
          {formatReadingTime(article.readingMinutes)}
        </p>

        <Link
          href={`/article/${article.slug}`}
          prefetch={false}
          className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
        >
          Lire l&apos;article
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  );
}
