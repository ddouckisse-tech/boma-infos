import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Advertising } from "@/components/custom/advertising";
import { ArticleLink } from "@/components/custom/article-link";
import { ArticleCard } from "@/components/custom/article-card";
import { Container } from "@/components/custom/container";
import { EmptyState } from "@/components/custom/empty-state";
import { FeaturedHero } from "@/components/custom/featured-hero";
import { NewsletterForm } from "@/components/custom/newsletter-form";
import { EditorialText, LocalizedText } from "@/components/custom/localized-text";
import { Section } from "@/components/custom/section";
import { SiteStructuredData } from "@/components/custom/structured-data";
import { isDemoArticle } from "@/lib/content/demo";
import { getHomepage } from "@/lib/content/server";
import { formatDate, formatReadingTime, isoDate } from "@/lib/format";
import { categoryDescription, categoryLabel } from "@/lib/i18n";
import { sectionHref } from "@/lib/navigation";
import { SEARCH_INDEXABLE, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { PwaInstallInvitation } from "@/components/custom/pwa-install";

// Littéral et non `REVALIDATE_SECONDS` : Next analyse statiquement les
// exports de configuration de segment et n'en résout pas les identifiants
// importés. La valeur de référence est dans `lib/content/server.ts`.
export const revalidate = 300;

const formatDateEn = (value: number) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Libreville",
  }).format(value);

export default async function HomePage() {
  const edition = await getHomepage();
  const visible = ({ slug }: { slug: string }) =>
    !SEARCH_INDEXABLE || !isDemoArticle(slug);
  const dossier =
    edition.dossier && visible(edition.dossier) ? edition.dossier : null;
  const top = edition.top.filter(visible);
  const latest = edition.latest.filter(visible);
  const bySection = edition.bySection
    .map((section) => ({
      ...section,
      articles: section.articles.filter(visible),
    }))
    .filter((section) => section.articles.length > 0);
  const espacePro = edition.espacePro.filter(visible);

  const editorialLead =
    edition.lead && visible(edition.lead) ? edition.lead : null;
  const stories = [
    editorialLead,
    ...top,
    ...latest,
    dossier,
    ...bySection.flatMap(({ articles }) => articles),
    ...espacePro,
  ].filter((article) => article !== null);
  const lead = stories[0];
  const picks = top.filter((article) => article.slug !== lead?.slug);
  const recent = latest.filter((article) => article.slug !== lead?.slug);
  const separateDossier = dossier?.slug === lead?.slug ? null : dossier;
  const frontSlugs = new Set([
    lead?.slug,
    separateDossier?.slug,
    ...picks.map(({ slug }) => slug),
    ...recent.map(({ slug }) => slug),
  ]);
  const sections = bySection
    .map((section) => ({
      ...section,
      articles: section.articles.filter(({ slug }) => !frontSlugs.has(slug)),
    }))
    .filter(({ articles }) => articles.length > 0);
  const professional = espacePro.filter(({ slug }) => !frontSlugs.has(slug));

  const editionDate = lead
    ? Math.max(...stories.map(({ publishedAt }) => publishedAt))
    : undefined;

  return (
    <>
      <SiteStructuredData />

      <Container className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
        <h1 className="news-edition__title font-display">
          <LocalizedText fr={SITE.tagline} en={SITE.taglineEn} />
        </h1>
        {editionDate !== undefined && (
          <time className="news-edition__date" dateTime={isoDate(editionDate)}>
            <LocalizedText
              fr={`Édition du ${formatDate(editionDate)}`}
              en={`Edition of ${formatDateEn(editionDate)}`}
            />
          </time>
        )}
      </Container>

      {lead ? (
        <Container as="section" className="news-front">
          <h2 className="news-section-title">
            <LocalizedText fr="À la une" en="Top story" />
          </h2>
          <div
            className={cn(
              "news-front__grid",
              recent.length > 0 && "news-front__grid--with-rail"
            )}
          >
            <FeaturedHero
              article={lead}
              stacked={recent.length > 0}
              headingLevel={3}
            />
            {recent.length > 0 && (
              <section id="derniers-articles" className="news-latest">
                <h2 className="news-latest__title font-display">
                  <LocalizedText fr="Derniers articles" en="Latest articles" />
                </h2>
                <ul className="divide-y divide-border">
                  {recent.map((article) => (
                    <li key={article.slug}>
                      <ArticleCard article={article} variant="compact" />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </Container>
      ) : (
        <Section>
          <div className="lc-fr" lang="fr">
            <EmptyState
              title="Les prochaines publications"
              description={SITE.description}
            />
          </div>
          <div className="lc-en" lang="en">
            <EmptyState
              title="Upcoming news"
              description={SITE.descriptionEn}
            />
          </div>
        </Section>
      )}

      {picks.length > 0 && (
        <Section
          className="news-section"
          spacing="compact"
          title={
            <LocalizedText fr="Le choix de la rédaction" en="Editor’s picks" />
          }
        >
          <ul className="news-card-grid">
            {picks.map((article) => (
              <li key={article.slug} className="min-w-0">
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Advertising
        placement="home-primary"
        pageKey="/"
        className="mx-auto my-10 w-[calc(100%-2rem)] max-w-[728px] md:my-14"
      />

      {separateDossier && (
        <Section
          className="news-section"
          spacing="compact"
          title={<LocalizedText fr="Dossier spécial" en="Special report" />}
        >
          <article>
            <h3 className="font-display type-h1 text-balance">
              <ArticleLink
                slug={separateDossier.slug}
                className="underline-offset-4 hover:underline"
              >
                <EditorialText fr={separateDossier.title} en={separateDossier.englishSummary?.title} />
              </ArticleLink>
            </h3>
            <p className="mt-3 max-w-reading type-body text-muted-foreground">
              <EditorialText fr={separateDossier.dek} en={separateDossier.englishSummary?.dek} />
            </p>
            <p className="mt-3 type-small text-muted-foreground">
              {separateDossier.authorName}
              <span aria-hidden="true"> · </span>
              <LocalizedText
                fr={formatReadingTime(separateDossier.readingMinutes)}
                en={`${separateDossier.englishSummary?.readingMinutes ?? separateDossier.readingMinutes} min read`}
              />
            </p>
          </article>
        </Section>
      )}

      {recent.length >= 4 && (
        <Advertising
          placement="home-secondary"
          pageKey="/"
          className="mx-auto my-14 w-[calc(100%-2rem)] max-w-[728px]"
        />
      )}

      {sections.map((section, index) => (
        <Section
          key={section.slug}
          className="news-section"
          spacing="compact"
          title={
            <LocalizedText
              fr={section.name}
              en={categoryLabel("en", section.slug, section.name)}
            />
          }
          description={
            <LocalizedText
              fr={section.description}
              en={categoryDescription("en", section.slug, section.description)}
            />
          }
          action={
            <Link
              href={sectionHref(section.slug)}
              prefetch={false}
              className="inline-flex min-h-11 items-center gap-1 type-small font-semibold text-accent underline-offset-4 hover:underline"
            >
              <LocalizedText fr="Voir la rubrique" en="View section" />
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          }
        >
          {/* Un article illustré dans les six premières rubriques — en
              vignette, pas en grande carte — puis des titres seuls. Vingt-et-une photos
              pleine largeur sur une page d'accueil, c'est un mur d'images et,
              sur un téléphone haute densité, un demi-mégaoctet : le §5.4 en
              plafonne 600 Ko pour la page entière. La densité d'images
              décroît donc en descendant, comme sur une une imprimée. */}
          <div
            className={cn(
              "grid gap-4 lg:gap-10",
              section.articles.length > 1 && "lg:grid-cols-[1.2fr_1fr]"
            )}
          >
            <ArticleCard
              article={section.articles[0]}
              variant="list"
              showImage={index < 6}
              showCategory={false}
              className="min-w-0 border-b border-border pb-4 lg:border-0 lg:pb-0"
            />
            {section.articles.length > 1 && (
              <ul className="divide-y divide-border self-start">
                {section.articles.slice(1).map((article) => (
                  <li key={article.slug} className="min-w-0">
                    <ArticleCard article={article} variant="compact" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Section>
      ))}

      {professional.length > 0 && (
        <Section
          className="news-section"
          spacing="compact"
          title={<LocalizedText fr="Espace pro" en="Professional resources" />}
          description={
            <LocalizedText
              fr="Réglementation, appels d'offres, formation et documentation — l'information directement utilisable."
              en="Regulation, tenders, training and documentation — practical information for businesses."
            />
          }
          action={
            <Link
              href="/rubrique/espace-pro"
              prefetch={false}
              className="inline-flex min-h-11 items-center gap-1 type-small font-semibold text-accent underline-offset-4 hover:underline"
            >
              <LocalizedText
                fr="Tout l'espace pro"
                en="View all professional resources"
              />
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          }
        >
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <ul className="divide-y divide-border">
              {professional.map((article) => (
                <li key={article.slug}>
                  <ArticleCard article={article} variant="compact" />
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-4 lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0">
              <h3 className="font-display type-h3">
                <LocalizedText fr="Docuthèque" en="Document library" />
              </h3>
              <p className="mt-2 type-small text-muted-foreground">
                <LocalizedText
                  fr="Rapports, textes réglementaires et études, téléchargeables — le poids du fichier est annoncé avant le clic."
                  en="Downloadable reports, regulations and studies, with the file size shown before you click."
                />
              </p>
              <Link
                href="/docutheque"
                prefetch={false}
                className="mt-2 inline-flex items-center gap-2 type-small font-semibold text-accent underline-offset-4 touch-target hover:underline"
              >
                <LocalizedText
                  fr="Ouvrir la docuthèque"
                  en="Open the document library"
                />
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </Section>
      )}

      <Container>
        <PwaInstallInvitation />
      </Container>

      <Section className="news-newsletter" spacing="loose">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12">
          <div className="min-w-0">
            <h2 className="font-display type-h2">
              <LocalizedText
                fr="La lettre hebdomadaire"
                en="The weekly newsletter"
              />
            </h2>
            <p className="mt-2 max-w-reading type-body text-muted-foreground">
              <LocalizedText
                fr="L’essentiel de l’actualité du Gabon, chaque semaine dans votre boîte mail."
                en="The essential news from Gabon, in your inbox every week."
              />
            </p>
          </div>
          <NewsletterForm source="accueil" />
        </div>
      </Section>
    </>
  );
}
