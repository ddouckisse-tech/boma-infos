import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import { Section } from "@/components/custom/section";
import { AudienceBeacon } from "@/components/custom/audience-beacon";
import { ShareBar } from "@/components/custom/share-bar";
import {
  BreadcrumbStructuredData,
  NewsArticleStructuredData,
} from "@/components/custom/structured-data";
import { TableOfContents } from "@/components/custom/table-of-contents";
import {
  getArticle,
  getPublishedSlugs,
  getRelated,
} from "@/lib/content/server";
import { formatViews } from "@/lib/format";
import { fallbackVariant, getMediaAsset, SIZES, variantUrl } from "@/lib/media";
import { sectionHref, subSectionHref } from "@/lib/navigation";
import { absoluteUrl, SITE } from "@/lib/site";

// Littéral et non `REVALIDATE_SECONDS` : Next analyse statiquement les
// exports de configuration de segment et n'en résout pas les identifiants
// importés. La valeur de référence est dans `lib/content/server.ts`.
export const revalidate = 300;
export const dynamicParams = true;

const formatViewsEn = (views: number) =>
  `${new Intl.NumberFormat("en-GB").format(views)} ${views === 1 ? "view" : "views"}`;

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
  const slugs = await getPublishedSlugs();
  // The archive renders on first visit with ISR; prebuild the latest edition.
  return slugs.slice(0, 30).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/article/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article introuvable" };

  const path = `/article/${article.slug}`;
  const title = article.seo.title ?? article.title;

  return {
    title,
    description: article.seo.description,
    keywords: [...article.seo.keywords],
    authors: [
      { name: article.authorName, url: `/auteur/${article.authorSlug}` },
    ],
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title,
      description: article.seo.description,
      siteName: SITE.name,
      locale: SITE.locale,
      publishedTime: new Date(article.publishedAt).toISOString(),
      modifiedTime: new Date(article.updatedAt).toISOString(),
      authors: [article.authorName],
      section: article.categoryName,
      tags: [...article.tags],
      // L'image 1200×630 est produite par opengraph-image.tsx ; Next l'ajoute
      // automatiquement à ces métadonnées.
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: article.seo.description,
    },
  };
}

export default async function ArticlePage({
  params,
}: PageProps<"/article/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const related = await getRelated(slug, 3);
  const hero = getMediaAsset(article.heroMediaKey);
  const url = absoluteUrl(`/article/${article.slug}`);
  // Image des données structurées : la plus large rendition disponible. Une
  // image envoyée depuis la médiathèque a déjà une adresse absolue (stockage
  // Convex) ; celle de la bibliothèque est un chemin du site.
  const heroImageUrl = hero
    ? (() => {
        const address = variantUrl(hero, fallbackVariant(hero, 1280).w, "webp");
        return address.startsWith("http") ? address : absoluteUrl(address);
      })()
    : undefined;

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

  return (
    <>
      {/* Filet de progression : piloté par `animation-timeline: scroll()`,
          donc sans une ligne de JavaScript (CDC §5.4). */}
      <div
        aria-hidden="true"
        className="reading-progress"
        data-slot="reading-progress"
      />

      <NewsArticleStructuredData
        headline={article.title}
        description={article.seo.description}
        slug={article.slug}
        imageUrls={
          heroImageUrl
            ? [
                heroImageUrl,
                absoluteUrl(`/article/${article.slug}/opengraph-image`),
              ]
            : [absoluteUrl(`/article/${article.slug}/opengraph-image`)]
        }
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        authorName={article.authorName}
        authorSlug={article.authorSlug}
        sectionName={article.categoryName}
        keywords={article.seo.keywords}
        wordCount={wordCount}
      />
      <BreadcrumbStructuredData trail={trail} />

      <article lang="fr">
        {/* En-tête fondu dans la photo (`.lc-hero`) : fil d'Ariane en haut,
            titre, chapeau et signature en bas, sur un voile aux couleurs du
            thème — blanc en clair, nuit en sombre. */}
        <header className="lc-hero">
          {hero && (
            <ResponsiveImage
              media={hero}
              sizes={SIZES.articleHero}
              maxWidth={960}
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

                <p className="mt-4 max-w-[40rem] type-body font-medium text-foreground/90">
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
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
            <div className="max-w-reading min-w-0">
              {article.keyPoints.length > 0 && (
                <KeyPoints points={article.keyPoints} className="mb-8" />
              )}

              <ShareBar
                url={url}
                title={article.title}
                className="mb-8 border-y border-border py-4"
              />

              <ArticleBody blocks={article.body} />

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

            {/* Sommaire seulement : les articles liés sont en fin de page,
                les répéter ici les faisait apparaître deux fois. */}
            <aside className="min-w-0 lg:sticky lg:top-32 lg:self-start">
              <TableOfContents blocks={article.body} />
            </aside>
          </div>
        </Container>
      </article>

      {related.length > 0 && (
        <Section
          tone="muted"
          title={
            <LocalizedText
              fr="Dans la même rubrique"
              en="In the same section"
            />
          }
          description={
            <LocalizedText
              fr="Trois articles choisis pour leur proximité de sujet."
              en="Three articles selected for their related subject matter."
            />
          }
        >
          {/* Variante en ligne : la vignette de 160 px coûte 6 Ko contre 25
              pour une carte pleine largeur, et trois cartes en fin
              d'article ne méritent pas un dixième du budget de la page. */}
          <ul lang="fr" className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug} className="min-w-0">
                <ArticleCard
                  article={item}
                  variant="list"
                  headingLevel={3}
                  className="h-full"
                />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Mesure d'audience sans traqueur tiers (CDC §4.4, §5.4) : les vues
          sont comptées par `proxy.ts`, ce script n'ajoute que la durée de
          lecture et le canal de partage. */}
      <AudienceBeacon slug={article.slug} />
    </>
  );
}
