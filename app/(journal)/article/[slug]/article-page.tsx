import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Advertising } from "@/components/custom/advertising";
import { ReadingRail } from "@/components/custom/reading-rail";
import { ArticleBody } from "@/components/custom/article-body";
import { ArticleCard } from "@/components/custom/article-card";
import {
  AuthorByline,
  AuthorMonogram,
} from "@/components/custom/author-byline";
import { CategoryBadge } from "@/components/custom/category-badge";
import { Container } from "@/components/custom/container";
import { KeyPoints } from "@/components/custom/key-points";
import { LocalizedText } from "@/components/custom/localized-text";
import { PartnerTag } from "@/components/custom/partner-tag";
import { ResponsiveImage } from "@/components/custom/responsive-image";
import { AudienceBeacon } from "@/components/custom/audience-beacon";
import { ShareBar } from "@/components/custom/share-bar";
import {
  BreadcrumbStructuredData,
  NewsArticleStructuredData,
} from "@/components/custom/structured-data";
import { TableOfContents } from "@/components/custom/table-of-contents";
import type { ArticleDetail } from "@/convex/model/content";
import {
  articleImageSources,
  socialImageSize,
  socialImageUrl,
} from "@/lib/content/article-images";
import { isDemoArticle } from "@/lib/content/demo";
import { getArticle, getRelated } from "@/lib/content/server";
import { articlePath } from "@/lib/article-locale";
import { categoryLabel, localize } from "@/lib/i18n";
import type { LocaleChoice } from "@/lib/preferences";
import { formatViews } from "@/lib/format";
import {
  fallbackVariant,
  getMediaAsset,
  SIZES,
  type MediaAsset,
} from "@/lib/media";
import { sectionHref, subSectionHref } from "@/lib/navigation";
import {
  absoluteUrl,
  DEMO_CONTENT_NOTICE,
  EDITORIAL_ROBOTS,
  SITE,
} from "@/lib/site";

const formatViewsEn = (views: number) =>
  `${new Intl.NumberFormat("en-GB").format(views)} ${views === 1 ? "view" : "views"}`;

const ARTICLE_HERO_WIDTH = 960;
const ARTICLE_UPLOAD_BUDGET = 72 * 1024;

function articleMediaFor(article: ArticleDetail) {
  const widths = new Map<string, number>();
  if (article.heroMediaKey)
    widths.set(article.heroMediaKey, ARTICLE_HERO_WIDTH);

  for (const block of article.body) {
    if (block.type !== "image" && block.type !== "video") continue;
    const key = block.type === "image" ? block.mediaKey : block.posterMediaKey;
    if (!widths.has(key)) widths.set(key, 768);
  }

  const uploads = [...widths].flatMap(([key, width]) => {
    const media = getMediaAsset(key);
    if (!media?.urls || media.webp.length === 0) return [];
    return [{ key, media, width, preferred: fallbackVariant(media, width) }];
  });
  const preferredBytes = uploads.reduce(
    (sum, { preferred }) => sum + preferred.bytes,
    0
  );
  if (preferredBytes <= ARTICLE_UPLOAD_BUDGET) return getMediaAsset;

  // Reserve the smallest rendition for each picture, then allot more of the
  // remaining transfer budget to the lead. Originals stay available for sharing.
  const minimumBytes = uploads.reduce(
    (sum, { media }) => sum + media.webp[0].bytes,
    0
  );
  const available = Math.max(0, ARTICLE_UPLOAD_BUDGET - minimumBytes);
  const totalWeight = uploads.reduce(
    (sum, { key }) => sum + (key === article.heroMediaKey ? 2 : 1),
    0
  );
  const capped = new Map<string, MediaAsset>();

  for (const { key, media, width } of uploads) {
    const smallest = media.webp[0];
    const weight = key === article.heroMediaKey ? 2 : 1;
    const limit =
      smallest.bytes + Math.floor((available * weight) / totalWeight);
    const webp = media.webp.filter(
      (variant) => variant.w <= width && variant.bytes <= limit
    );
    capped.set(key, { ...media, webp: webp.length ? webp : [smallest] });
  }

  return (key: string | undefined) =>
    (key && capped.get(key)) || getMediaAsset(key);
}

/**
 * Article page — the most important page of the site (CDC §4.2).
 *
 * Typography carries it: a 65–75 character measure, 1,7 leading, 17 px body
 * on mobile and 19 px above. One `<h1>`, and the body's sub-headings continue
 * the hierarchy under it — the legacy template put the headline in an `<h3>`,
 * below footer blocks marked up as `<h2>`, on all 1 019 articles.
 *
 * Statically generated for every published slug, revalidated every five
 * minutes; a slug published after the build renders on demand and is then
 * cached like the others.
 */

export async function articleMetadata(
  slug: string,
  locale: LocaleChoice
): Promise<Metadata> {
  const original = await getArticle(slug);
  if (!original)
    return {
      title: localize(locale, {
        fr: "Article introuvable",
        en: "Article not found",
      }),
    };
  const english = original.english;
  if (locale === "en" && !english) {
    return {
      title: "English translation pending",
      alternates: { canonical: articlePath(slug, "fr") },
      robots: { index: false, follow: true },
    };
  }

  const article =
    locale === "en" && english ? { ...original, ...english } : original;
  const path = articlePath(article.slug, locale);
  const title = article.seo.title?.trim() || article.title;
  const description =
    article.seo.description.trim() || article.dek.trim() || article.title;
  const shareTitle = article.title.trim() || title;
  const shareSummary = article.dek.trim() || description;
  const shareDescription = article.authorName.trim()
    ? `${locale === "en" ? "By" : "Par"} ${article.authorName.trim()} — ${shareSummary}`
    : shareSummary;
  const image = {
    url: socialImageUrl(article.slug, article.updatedAt),
    ...socialImageSize,
    type: "image/jpeg",
    alt:
      locale === "en"
        ? article.title
        : articleImageSources(article)[0]?.media.alt || article.title,
  };

  return {
    title,
    description,
    keywords: [...article.seo.keywords],
    authors: [
      { name: article.authorName, url: `/auteur/${article.authorSlug}` },
    ],
    alternates: {
      canonical: path,
      ...(english && {
        languages: {
          "fr-GA": articlePath(slug, "fr"),
          en: articlePath(slug, "en"),
          "x-default": articlePath(slug, "fr"),
        },
      }),
    },
    robots: isDemoArticle(article.slug)
      ? { index: false, follow: true }
      : EDITORIAL_ROBOTS,
    openGraph: {
      type: "article",
      url: path,
      title: shareTitle,
      description: shareDescription,
      siteName: SITE.name,
      locale: locale === "en" ? "en_GB" : SITE.locale,
      publishedTime: new Date(article.publishedAt).toISOString(),
      modifiedTime: new Date(article.updatedAt).toISOString(),
      authors: [absoluteUrl(`/auteur/${article.authorSlug}`)],
      section: categoryLabel(
        locale,
        article.categorySlug,
        article.categoryName
      ),
      tags: [...article.tags],
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: shareDescription,
      images: [image],
    },
  };
}

export async function ArticlePage({
  slug,
  locale,
}: {
  slug: string;
  locale: LocaleChoice;
}) {
  const original = await getArticle(slug);
  if (!original) notFound();

  const english = locale === "en" ? original.english : undefined;
  if (locale === "en" && !english) {
    return (
      <Container width="reading" className="py-12" as="article">
        <div lang="en">
          <h1 className="font-display type-h1">English translation pending</h1>
          <p className="mt-4 type-body">
            The English version of this article is being prepared.
          </p>
          <a
            href={`${articlePath(slug)}?original=1`}
            className="mt-4 inline-flex items-center type-small font-semibold text-accent underline touch-target"
          >
            Read the original in French
          </a>
        </div>
      </Container>
    );
  }
  const article = english ? { ...original, ...english } : original;

  const demo = isDemoArticle(article.slug);
  const related = (await getRelated(slug, 2)).filter(
    (item) => demo || !isDemoArticle(item.slug)
  );
  const resolveMedia = articleMediaFor(article);
  const mediaFor = (key: string | undefined) => {
    const asset = resolveMedia(key);
    const text = key && english?.media[key];
    return asset && text ? { ...asset, ...text } : asset;
  };
  const hero = mediaFor(article.heroMediaKey);
  const path = articlePath(article.slug, locale);
  const url = absoluteUrl(path);
  const section = categoryLabel(
    locale,
    article.categorySlug,
    article.categoryName
  );
  const preferredImage = articleImageSources(article)[0];
  const imageUrls = preferredImage
    ? [
        socialImageUrl(article.slug, article.updatedAt),
        new URL(preferredImage.source, url).href,
      ]
    : [];

  const trail = [
    { name: locale === "en" ? "Home" : "Accueil", href: "/" },
    { name: section, href: sectionHref(article.categorySlug) },
    ...(article.subCategorySlug && article.subCategoryName
      ? [
          {
            name: categoryLabel(
              locale,
              article.subCategorySlug,
              article.subCategoryName
            ),
            href: subSectionHref(article.categorySlug, article.subCategorySlug),
          },
        ]
      : []),
    { name: article.title, href: path },
  ];

  const wordCount = article.body.reduce((total, block) => {
    if (block.type === "paragraph" || block.type === "heading") {
      return total + block.text.split(/\s+/).length;
    }
    if (block.type === "list") {
      return total + block.items.join(" ").split(/\s+/).length;
    }
    return total;
  }, 0);

  // One break in a long article, between complete blocks and away from the
  // introduction. Short stories keep their uninterrupted reading column.
  const adBreak =
    article.body.length >= 8
      ? article.body.findIndex(
          (block, index) =>
            index >= Math.floor(article.body.length / 2) &&
            index < article.body.length - 2 &&
            block.type === "paragraph"
        )
      : -1;

  return (
    <>
      {/* Filet de progression : piloté par `animation-timeline: scroll()`,
          donc sans une ligne de JavaScript (CDC §5.4). */}
      <div
        aria-hidden="true"
        className="reading-progress"
        data-slot="reading-progress"
      />

      {!demo && (
        <NewsArticleStructuredData
          headline={article.title}
          description={article.seo.description.trim() || article.dek}
          slug={article.slug}
          locale={locale}
          imageUrls={imageUrls}
          publishedAt={article.publishedAt}
          updatedAt={article.updatedAt}
          authorName={article.authorName}
          authorSlug={article.authorSlug}
          sectionName={section}
          keywords={article.seo.keywords}
          wordCount={wordCount}
        />
      )}
      <BreadcrumbStructuredData trail={trail} />

      <article lang={locale} data-edition={locale} className="news-article">
        <Container
          as="header"
          className="news-article__frame news-article__header"
        >
          <nav
            aria-label={locale === "en" ? "Breadcrumb" : "Fil d’Ariane"}
            className="type-small text-muted-foreground"
          >
            <ol className="flex flex-wrap items-center gap-x-2">
              {trail.slice(0, -1).map((item, index) => (
                <li key={item.href} className="flex items-center gap-2">
                  {index > 0 && <span aria-hidden="true">›</span>}
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="inline-flex min-h-11 items-center underline-offset-4 hover:text-accent hover:underline"
                  >
                    {item.href === "/" ? (
                      <LocalizedText fr="Accueil" en="Home" />
                    ) : (
                      item.name
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <div className="news-article__intro">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge
                slug={article.categorySlug}
                name={article.categoryName}
                accent={article.categoryAccent}
                variant="text"
              />
              {article.origin === "partenaire" && <PartnerTag />}
            </div>

            <h1 className="news-article__title font-display text-balance">
              {article.title}
            </h1>
            <p className="news-article__dek text-muted-foreground">
              {article.dek}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-border pt-3">
              <AuthorByline
                authorSlug={article.authorSlug}
                authorName={article.authorName}
                authorRole={article.authorRole}
                locale={locale}
                publishedAt={article.publishedAt}
                updatedAt={article.updatedAt}
                readingMinutes={article.readingMinutes}
              />
              <p className="type-small text-muted-foreground" data-numeric>
                <LocalizedText
                  fr={formatViews(article.views)}
                  en={formatViewsEn(article.views)}
                />
              </p>
            </div>
          </div>

          {hero && (
            <figure className="mt-5 md:mt-7">
              <ResponsiveImage
                media={hero}
                sizes={SIZES.articleHero}
                maxWidth={ARTICLE_HERO_WIDTH}
                wrapperClassName="news-article__photo"
                priority
              />
              {(hero.caption || hero.credit) && (
                <figcaption className="mt-2 max-w-reading type-small text-muted-foreground">
                  {hero.caption}
                  {hero.credit && (
                    <span>
                      {hero.caption ? " " : ""}({hero.credit}
                      {hero.license ? `, ${hero.license}` : ""})
                    </span>
                  )}
                </figcaption>
              )}
            </figure>
          )}
        </Container>

        <Container className="news-article__frame py-6 md:py-9">
          <div className="news-article__grid">
            <div className="news-article__reading min-w-0">
              {/* Tant que le corpus de démonstration est en ligne, chaque
                  article le dit avant sa première ligne. */}
              {demo && (
                <p
                  role="note"
                  className="mb-8 rounded-md border border-warning-token/40 bg-warning-token/10 px-4 py-3 type-small text-foreground"
                >
                  <LocalizedText
                    fr={DEMO_CONTENT_NOTICE.articleFr}
                    en={DEMO_CONTENT_NOTICE.articleEn}
                  />
                </p>
              )}
              {article.keyPoints.length > 0 && (
                <KeyPoints points={article.keyPoints} className="mb-8" />
              )}

              <ShareBar
                url={url}
                title={article.title}
                locale={locale}
                className="mb-8 border-b border-border pb-3"
              />

              <TableOfContents
                blocks={article.body}
                sourceBlocks={original.body}
                className="mb-6"
              />

              {adBreak >= 0 ? (
                <>
                  <ArticleBody
                    blocks={article.body.slice(0, adBreak + 1)}
                    sourceBlocks={original.body.slice(0, adBreak + 1)}
                    mediaFor={mediaFor}
                  />
                  <Advertising
                    placement="article-inline"
                    pageKey={`/article/${article.slug}`}
                    className="my-10"
                  />
                  <ArticleBody
                    blocks={article.body.slice(adBreak + 1)}
                    sourceBlocks={original.body.slice(adBreak + 1)}
                    mediaFor={mediaFor}
                  />
                </>
              ) : (
                <ArticleBody
                  blocks={article.body}
                  sourceBlocks={original.body}
                  mediaFor={mediaFor}
                />
              )}

              {article.tags.length > 0 && (
                <div className="mt-10 border-t border-border pt-6">
                  <h2 className="type-small font-semibold text-muted-foreground">
                    <LocalizedText fr="Mots-clés" en="Keywords" />
                  </h2>
                  <ul className="mt-2 flex flex-wrap gap-x-4">
                    {article.tags.map((tag) => (
                      <li key={tag}>
                        <Link
                          href={`/recherche?q=${encodeURIComponent(tag)}&lang=${locale}`}
                          prefetch={false}
                          className="inline-flex items-center type-small text-muted-foreground underline-offset-4 touch-target hover:text-foreground hover:underline"
                        >
                          {tag}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {article.body.length >= 8 && (
                <ShareBar
                  url={url}
                  title={article.title}
                  locale={locale}
                  className="mt-8 border-t border-border pt-3"
                />
              )}

              <aside className="mt-10 flex gap-4 border-t border-border pt-5">
                <AuthorMonogram
                  name={article.authorName}
                  className="size-12 shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="font-display type-h3">
                    <Link
                      href={`/auteur/${article.authorSlug}`}
                      prefetch={false}
                      className="underline-offset-4 hover:underline"
                    >
                      {article.authorName}
                    </Link>
                  </h2>
                  <p className="type-small text-muted-foreground">
                    {article.authorRole}
                  </p>
                  <p className="mt-2 type-small">{article.authorBio}</p>
                </div>
              </aside>
            </div>

            <div className="min-w-0">
              <ReadingRail>
                {related.length > 0 && (
                  <section
                    aria-labelledby="a-lire-aussi"
                    className="border-t border-border pt-4"
                  >
                    <h2 id="a-lire-aussi" className="font-display type-h3">
                      <LocalizedText fr="À lire aussi" en="Read next" />
                    </h2>
                    <ul className="lc-reading-related mt-2 divide-y divide-border">
                      {related.map((item) => (
                        <li key={item.slug}>
                          <ArticleCard
                            article={item}
                            variant="compact"
                            showCategory={false}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                <Advertising
                  placement="article"
                  pageKey={`/article/${article.slug}`}
                  className={related.length > 0 ? "mt-8" : undefined}
                />
              </ReadingRail>
            </div>
          </div>
        </Container>
      </article>

      {/* Mesure d'audience sans traqueur tiers (CDC §4.4, §5.4) : les vues
          sont comptées par `proxy.ts`, ce script n'ajoute que la durée de
          lecture et le canal de partage. */}
      {process.env.AUDIENCE_DISABLED !== "1" && (
        <AudienceBeacon slug={article.slug} />
      )}
    </>
  );
}
