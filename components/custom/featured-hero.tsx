import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryBadge } from "@/components/custom/category-badge";
import { Container } from "@/components/custom/container";
import { PartnerTag } from "@/components/custom/partner-tag";
import { ResponsiveImage } from "@/components/custom/responsive-image";
import { formatDate, formatReadingTime, isoDate } from "@/lib/format";
import { getMediaAsset, SIZES } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/convex/model/content";

/**
 * The lead story: headline and dek on a dark panel at the left, the
 * photograph at the right, the two fused by a horizontal gradient
 * (`.lc-hero`, app/globals.css). One screen tall, text centred.
 *
 * Its picture is the only one on the page rendered with `priority`: it is the
 * Largest Contentful Paint, so it is fetched eagerly and at high priority
 * while everything else waits for the reader to scroll.
 *
 * Text next to a photograph is only acceptable because the contrast does not
 * depend on the photograph: the band is painted dark before the first byte
 * arrives, and the scrim is opaque under the text column whatever the
 * picture (CDC §3.5). The height is dictated by the text, never by the
 * image, so nothing moves when it lands.
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
    // `dark` : île sombre — les composants imbriqués prennent leurs jetons
    // sombres quel que soit le thème de la page (voir `.lc-hero`).
    <section
      aria-label="Article à la une"
      className={cn("lc-hero dark", className)}
    >
      {media && (
        <ResponsiveImage
          media={media}
          alt=""
          sizes={SIZES.hero}
          maxWidth={1280}
          priority
        />
      )}

      {/* Non positionné : le lien étiré du titre s'étend jusqu'aux bords du
          bandeau, pas seulement à la colonne de texte. */}
      <Container
        as="article"
        className="lc-hero-body flex flex-col justify-end py-10 md:justify-center md:py-14"
      >
        {/* La colonne de texte : 58 % de la grille dès 768 px, 54 % au-delà
            de 1280 — le voile est opaque là où elle s'arrête. */}
        <div className="md:max-w-[58%] xl:max-w-[54%]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 type-small font-semibold tracking-wide text-magenta-300 uppercase">
              <span
                aria-hidden="true"
                className="inline-block h-[3px] w-6 bg-magenta-300"
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

          <h2 className="mt-5 font-serif type-display text-balance text-white">
            <Link
              href={`/article/${article.slug}`}
              prefetch={false}
              className="underline-offset-[6px] after:absolute after:inset-0 hover:underline"
            >
              {article.title}
            </Link>
          </h2>

          <p className="mt-4 max-w-[40rem] type-body text-neutral-100">
            {article.dek}
          </p>

          <p className="relative z-10 mt-4 type-small text-neutral-300">
            Par{" "}
            <Link
              href={`/auteur/${article.authorSlug}`}
              prefetch={false}
              className="inline-flex min-h-11 items-center font-semibold text-white underline-offset-4 hover:underline"
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

          <div className="mt-6">
            <Link
              href={`/article/${article.slug}`}
              prefetch={false}
              className="relative z-10 inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
            >
              Lire l&apos;article
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
