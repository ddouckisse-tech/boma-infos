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
import { getArticle, getRecentSlugs, getRelated } from "@/lib/content/server";
import { formatViews } from "@/lib/format";
import { fallbackVariant, getMediaAsset, SIZES, type MediaAsset } from "@/lib/media";
import { sectionHref, subSectionHref } from "@/lib/navigation";
import {
  absoluteUrl,
  DEMO_CONTENT_NOTICE,
  EDITORIAL_ROBOTS,
  SITE,
} from "@/lib/site";

// Littéral et non `REVALIDATE_SECONDS` : Next analyse statiquement les
// exports de configuration de segment et n'en résout pas les identifiants
// importés. La valeur de référence est dans `lib/content/server.ts`.
export const revalidate = 300;
export const dynamicParams = true;

const formatViewsEn = (views: number) =>
  `${new Intl.NumberFormat("en-GB").format(views)} ${views === 1 ? "view" : "views"}`;

const ARTICLE_HERO_WIDTH = 960;
const ARTICLE_UPLOAD_BUDGET = 72 * 1024;

function articleMediaFor(article: ArticleDetail) {
  const widths = new Map<string, number>();
  if (article.heroMediaKey) widths.set(article.heroMediaKey, ARTICLE_HERO_WIDTH);

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
  const preferredBytes = uploads.reduce((sum, { preferred }) => sum + preferred.bytes, 0);
  if (preferredBytes <= ARTICLE_UPLOAD_BUDGET) return getMediaAsset;

  // Reserve the smallest rendition for each picture, then allot more of the
  // remaining transfer budget to the lead. Originals stay available for sharing.
  const minimumBytes = uploads.reduce((sum, { media }) => sum + media.webp[0].bytes, 0);
  const available = Math.max(0, ARTICLE_UPLOAD_BUDGET - minimumBytes);
  const totalWeight = uploads.reduce((sum, { key }) => sum + (key === article.heroMediaKey ? 2 : 1), 0);
  const capped = new Map<string, MediaAsset>();

  for (const { key, media, width } of uploads) {
    const smallest = media.webp[0];
    const weight = key === article.heroMediaKey ? 2 : 1;
    const limit = smallest.bytes + Math.floor(available * weight / totalWeight);
    const webp = media.webp.filter((variant) => variant.w <= width && variant.bytes <= limit);
    capped.set(key, { ...media, webp: webp.length ? webp : [smallest] });
  }

  return (key: string | undefined) => (key && capped.get(key)) || getMediaAsset(key);
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

export async function generateStaticParams() {
  // The archive renders on first visit with ISR; prebuild the latest edition.
  const slugs = await getRecentSlugs(30);
  return slugs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/article/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article introuvable" };

  const path = `/article/${article.slug}`;
  const title = article.seo.title?.trim() || article.title;
  const description =
    article.seo.description.trim() || article.dek.trim() || article.title;
  const shareTitle = article.title.trim() || title;
  const shareSummary = article.dek.trim() || description;
  const shareDescription = article.authorName.trim()
    ? `Par ${article.authorName.trim()} — ${shareSummary}`
    : shareSummary;
  const image = {
    url: socialImageUrl(article.slug, article.updatedAt),
    ...socialImageSize,
    type: "image/jpeg",
    alt: articleImageSources(article)[0]?.media.alt || article.title,
  };

  return {
    title,
    description,
    keywords: [...article.seo.keywords],
    authors: [
      { name: article.authorName, url: `/auteur/${article.authorSlug}` },
    ],
    alternates: { canonical: path },
    robots: isDemoArticle(article.slug)
      ? { index: false, follow: true }
      : EDITORIAL_ROBOTS,
    openGraph: {
      type: "article",
      url: path,
      title: shareTitle,
      description: shareDescription,
      siteName: SITE.name,
      locale: SITE.locale,
      publishedTime: new Date(article.publishedAt).toISOString(),
      modifiedTime: new Date(article.updatedAt).toISOString(),
      authors: [absoluteUrl(`/auteur/${article.authorSlug}`)],
      section: article.categoryName,
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

export default async function ArticlePage({
  params,
}: PageProps<"/article/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const demo = isDemoArticle(article.slug);
  const related = (await getRelated(slug, 2)).filter(
    (item) => demo || !isDemoArticle(item.slug)
  );
  const mediaFor = articleMediaFor(article);
  const hero = mediaFor(article.heroMediaKey);
  const url = absoluteUrl(`/article/${article.slug}`);
  const preferredImage = articleImageSources(article)[0];
  const imageUrls = preferredImage
    ? [
        socialImageUrl(article.slug, article.updatedAt),
        new URL(preferredImage.source, url).href,
      ]
    : [];

  const trail = [
    { name: "Accueil", href: "/" },
    { name: article.categoryName, href: sectionHref(article.categorySlug) },
    ...(article.subCategorySlug && article.subCategoryName
      ? [
          {
            name: article.subCategoryName,
            href: subSectionHref(article.categorySlug, article.subCategorySlug),
          },
        ]
      : []),
    { name: article.title, href: `/article/${article.slug}` },
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
  const adBreak = article.body.length >= 8
    ? article.body.findIndex((block, index) =>
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
          imageUrls={imageUrls}
          publishedAt={article.publishedAt}
          updatedAt={article.updatedAt}
          authorName={article.authorName}
          authorSlug={article.authorSlug}
          sectionName={article.categoryName}
          keywords={article.seo.keywords}
          wordCount={wordCount}
        />
      )}
      <BreadcrumbStructuredData trail={trail} />

      <article lang="fr">
        {/* En-tête fondu dans la photo (`.lc-hero`) : fil d'Ariane en haut,
            titre, chapeau et signature en bas, sur le marine de la charte.
            `dark` en fait une île marine dans les deux thèmes. */}
        <header className="lc-hero dark">
          {hero && (
            <ResponsiveImage
              media={hero}
              sizes={SIZES.articleHero}
              maxWidth={ARTICLE_HERO_WIDTH}
              priority
            />
          )}

          <Container className="lc-hero-body flex flex-col pt-4 pb-10 md:pb-12">
            {/* La colonne de texte : 58 % de la grille dès 768 px, 54 % au-delà
                de 1280 — le voile est opaque là où elle s'arrête. Le fil
                d'Ariane y est enfermé aussi, pour ne pas courir sur la photo. */}
            <div className="flex flex-1 flex-col md:max-w-[58%] xl:max-w-[54%]">
              <nav aria-label="Navigation" className="type-small">
                <ol className="flex flex-wrap items-center gap-x-1">
                  {trail.slice(0, -1).map((item) => (
                    <li key={item.href} className="flex items-center gap-1">
                      <Link
                        href={item.href}
                        prefetch={false}
                        className="inline-flex min-h-11 items-center text-foreground/80 underline-offset-4 hover:underline"
                      >
                        {item.href === "/" ? (
                          <LocalizedText fr="Accueil" en="Home" />
                        ) : (
                          <span lang="fr">{item.name}</span>
                        )}
                      </Link>
                      <span
                        aria-hidden="true"
                        className="text-muted-foreground"
                      >
                        ›
                      </span>
                    </li>
                  ))}
                  <li className="min-w-0 truncate text-muted-foreground">
                    {article.title}
                  </li>
                </ol>
              </nav>

              {/* En bas sur petit écran, centré dans l'espace restant au-delà. */}
              <div className="mt-auto pt-12 md:my-auto md:pt-8">
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge
                    slug={article.categorySlug}
                    name={article.categoryName}
                    accent={article.categoryAccent}
                  />
                  {article.subCategorySlug && article.subCategoryName && (
                    <CategoryBadge
                      slug={article.subCategorySlug}
                      name={article.subCategoryName}
                      accent={article.categoryAccent}
                      parentSlug={article.categorySlug}
                      variant="text"
                    />
                  )}
                  {article.origin === "partenaire" && <PartnerTag />}
                </div>

                <h1 className="mt-4 font-display type-display text-balance text-foreground">
                  {article.title}
                </h1>

                <span
                  aria-hidden="true"
                  className="mt-5 boma-rule w-40 md:w-56"
                />

                <p className="mt-5 max-w-[40rem] type-body font-medium text-foreground/90">
                  {article.dek}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <AuthorByline
                    authorSlug={article.authorSlug}
                    authorName={article.authorName}
                    authorRole={article.authorRole}
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
            </div>
          </Container>
        </header>

        {/* Légende et crédit sous le bandeau, pas dessus : une licence
            Creative Commons exige la mention, et elle se lit mieux sur le fond
            de la page que dans un coin de la photo. */}
        {hero && (hero.caption || hero.credit) && (
          <Container className="mt-3">
            <p className="max-w-[52rem] type-small text-muted-foreground">
              {hero.caption}
              {hero.credit && (
                <span>
                  {hero.caption ? " " : ""}({hero.credit}
                  {hero.license ? `, ${hero.license}` : ""})
                </span>
              )}
            </p>
          </Container>
        )}

        <Container className="py-8 md:py-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
            <div className="max-w-reading min-w-0">
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
                className="mb-8 border-y border-border py-4"
              />

              {adBreak >= 0 ? (
                <>
                  <ArticleBody blocks={article.body.slice(0, adBreak + 1)} mediaFor={mediaFor} />
                  <Advertising
                    placement="article-inline"
                    pageKey={`/article/${article.slug}`}
                    className="my-10"
                  />
                  <ArticleBody blocks={article.body.slice(adBreak + 1)} mediaFor={mediaFor} />
                </>
              ) : (
                <ArticleBody blocks={article.body} mediaFor={mediaFor} />
              )}

              {article.tags.length > 0 && (
                <div className="mt-10 border-t border-border pt-6">
                  <h2 className="type-small font-semibold tracking-wide text-muted-foreground uppercase">
                    <LocalizedText fr="Mots-clés" en="Keywords" />
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <li key={tag}>
                        <Link
                          href={`/recherche?q=${encodeURIComponent(tag)}`}
                          prefetch={false}
                          className="inline-flex items-center rounded-xs border border-border px-3 type-small text-muted-foreground transition-colors touch-target hover:border-border-strong hover:text-foreground"
                        >
                          {tag}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <ShareBar
                url={url}
                title={article.title}
                className="mt-8 border-y border-border py-4"
              />

              <aside className="mt-10 flex gap-4 rounded-md border border-border bg-surface-muted p-5">
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
              <TableOfContents blocks={article.body} className="mb-6" />
              <ReadingRail>
                {related.length > 0 && (
                  <section
                    aria-labelledby="a-lire-aussi"
                    className="rounded-md border border-border bg-surface-subtle p-5"
                  >
                    <p className="type-small font-semibold tracking-wide text-accent uppercase">
                      <LocalizedText
                        fr="La sélection de la rédaction"
                        en="Editor’s picks"
                      />
                    </p>
                    <h2 id="a-lire-aussi" className="mt-2 font-display type-h3">
                      <LocalizedText fr="À lire aussi" en="Read next" />
                    </h2>
                    <ul
                      lang="fr"
                      className="lc-reading-related mt-2 divide-y divide-border"
                    >
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
