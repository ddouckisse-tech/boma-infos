import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Advertising } from "@/components/custom/advertising";
import { ArticleCard } from "@/components/custom/article-card";
import { Container } from "@/components/custom/container";
import { EmptyState } from "@/components/custom/empty-state";
import { FeaturedHero } from "@/components/custom/featured-hero";
import { NewsletterForm } from "@/components/custom/newsletter-form";
import { LocalizedText } from "@/components/custom/localized-text";
import { Section } from "@/components/custom/section";
import { SiteStructuredData } from "@/components/custom/structured-data";
import { isDemoArticle } from "@/lib/content/demo";
import { getHomepage } from "@/lib/content/server";
import { formatDate } from "@/lib/format";
import { categoryDescription, categoryLabel } from "@/lib/i18n";
import { accentTextClass, sectionHref, toAccent } from "@/lib/navigation";
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

/**
 * Home page (CDC §4.2).
 *
 * The order answers one question — what matters today: the lead story, then
 * "À la une", then the standing dossier, then the latest, then one rail per
 * section, then "Espace pro". Nine `<h1>` on the legacy home page become
 * exactly one here, carried by the positioning line under the masthead
 * (CDC §3.5).
 *
 * Fully static, revalidated every five minutes: a reader in Libreville gets a
 * cached document, not a database round trip.
 */
export default async function HomePage() {
  const edition = await getHomepage();
  const visible = ({ slug }: { slug: string }) =>
    !SEARCH_INDEXABLE || !isDemoArticle(slug);
  const lead = edition.lead && visible(edition.lead) ? edition.lead : null;
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
  const empty =
    !lead &&
    !dossier &&
    !top.length &&
    !latest.length &&
    !bySection.length &&
    !espacePro.length;

  // Date de la dernière publication, et non l'horloge du serveur : c'est la
  // date d'édition du journal, et le rendu reste pur (règle React 19).
  const editionDate =
    lead?.publishedAt ?? top[0]?.publishedAt ?? latest[0]?.publishedAt;

  return (
    <>
      <SiteStructuredData />

      {/* Bandeau de une : porte l'unique <h1> de la page. */}
      <div className="border-b border-border bg-surface-subtle py-4">
        <Container className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h1 className="font-display type-h3 text-foreground">
            <LocalizedText fr={SITE.tagline} en={SITE.taglineEn} />
          </h1>
          {editionDate !== undefined && (
            <p className="type-small text-muted-foreground">
              <span className="lc-fr" lang="fr">
                Édition du {formatDate(editionDate)}
              </span>
              <span className="lc-en" lang="en">
                Edition of {formatDateEn(editionDate)}
              </span>
            </p>
          )}
        </Container>
      </div>

      {empty && (
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

      {/* Pleine largeur, hors `Section` : la photo tapisse le bandeau d'un
          bord à l'autre de l'écran, le texte reste dans la grille. */}
      {lead && <FeaturedHero article={lead} />}

      {top.length > 0 && (
        <Section
          tone="muted"
          title={<LocalizedText fr="À la une" en="Top stories" />}
          description={
            <LocalizedText
              fr="La sélection de la rédaction."
              en="Selected by our editorial team."
            />
          }
          action={
            // Il n'existe pas de rubrique « tout » : le lien descend aux
            // derniers articles, toutes rubriques confondues, sur cette page.
            <Link
              href="#derniers-articles"
              prefetch={false}
              className="inline-flex min-h-11 items-center gap-1 type-small font-semibold text-accent underline-offset-4 hover:underline"
            >
              <LocalizedText fr="Les derniers articles" en="Latest articles" />
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          }
        >
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {top.map((article) => (
              <li key={article.slug} className="min-w-0">
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Container><PwaInstallInvitation /></Container>

      <Advertising
        placement="home-primary"
        pageKey="/"
        className="mx-auto my-10 w-[calc(100%-2rem)] max-w-[728px] md:my-14"
      />

      {dossier && (
        <Section spacing="loose">
          <div className="grid gap-6 rounded-md border border-l-2 border-border border-l-brand-gold bg-card p-6 lg:grid-cols-[2fr_1fr] lg:items-center lg:gap-10 lg:p-8">
            <div className="min-w-0" lang="fr">
              <p className="type-small font-semibold tracking-wide text-accent uppercase">
                <LocalizedText fr="Dossier spécial" en="Special report" />
              </p>
              <h2 className="mt-3 font-display type-h1 text-balance">
                <Link
                  href={`/article/${dossier.slug}`}
                  prefetch={false}
                  className="underline-offset-4 hover:underline"
                >
                  {dossier.title}
                </Link>
              </h2>
              <p className="mt-3 max-w-reading type-body text-muted-foreground">
                {dossier.dek}
              </p>
              <Link
                href={`/article/${dossier.slug}`}
                prefetch={false}
                className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 type-small font-semibold transition-colors touch-target hover:bg-surface-muted"
              >
                <LocalizedText fr="Ouvrir le dossier" en="Open the report" />
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              <div className="rounded-md bg-surface-muted p-4">
                <dt className="type-small text-muted-foreground">
                  <LocalizedText fr="Signature" en="Byline" />
                </dt>
                <dd className="mt-1 type-body font-semibold">
                  {dossier.authorName}
                </dd>
              </div>
              <div className="rounded-md bg-surface-muted p-4">
                <dt className="type-small text-muted-foreground">
                  <LocalizedText fr="Lecture" en="Reading time" />
                </dt>
                <dd data-numeric className="mt-1 type-body font-semibold">
                  <span className="lc-fr" lang="fr">
                    {dossier.readingMinutes} minutes
                  </span>
                  <span className="lc-en" lang="en">
                    {dossier.readingMinutes} min
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </Section>
      )}

      {latest.length > 0 && (
        <Section
          id="derniers-articles"
          title={<LocalizedText fr="Derniers articles" en="Latest articles" />}
          description={
            <LocalizedText
              fr="Ce qui vient d'être publié, toutes rubriques confondues."
              en="The latest articles from across the journal."
            />
          }
        >
          <ul
            lang="fr"
            className="divide-y divide-border border-y border-border"
          >
            {latest.map((article) => (
              <li key={article.slug}>
                <ArticleCard article={article} variant="list" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {latest.length >= 4 && (
        <Advertising
          placement="home-secondary"
          pageKey="/"
          className="mx-auto my-14 w-[calc(100%-2rem)] max-w-[728px]"
        />
      )}

      {bySection.map((section, index) => (
        <Section
          key={section.slug}
          tone={index % 2 === 0 ? "muted" : "default"}
          title={
            <LocalizedText
              fr={section.name}
              en={categoryLabel("en", section.slug, section.name)}
              className={cn(accentTextClass[toAccent(section.accent)])}
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
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
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

      {espacePro.length > 0 && (
        <Section
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
            <ul className="divide-y divide-border rounded-md border border-border px-4">
              {espacePro.map((article) => (
                <li key={article.slug}>
                  <ArticleCard article={article} variant="compact" />
                </li>
              ))}
            </ul>
            <div className="rounded-md border border-border bg-surface-muted p-6">
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
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
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

      <Section tone="muted" spacing="loose">
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
                fr="Un courriel par semaine : l'essentiel de l'actualité du Gabon — politique, économie, société, tourisme, culture, sport. Inscription confirmée par courriel, désinscription en un clic."
                en="One email a week with the essential news from Gabon: politics, the economy, society, tourism, culture and sport. Confirm by email and unsubscribe in one click."
              />
            </p>
          </div>
          <NewsletterForm source="accueil" variant="block" />
        </div>
      </Section>
    </>
  );
}
