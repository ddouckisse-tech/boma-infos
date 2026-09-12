import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/custom/article-card";
import { Container } from "@/components/custom/container";
import { EmptyState } from "@/components/custom/empty-state";
import { FeaturedHero } from "@/components/custom/featured-hero";
import { NewsletterForm } from "@/components/custom/newsletter-form";
import { Section } from "@/components/custom/section";
import { SiteStructuredData } from "@/components/custom/structured-data";
import { getHomepage } from "@/lib/content/server";
import { formatDate } from "@/lib/format";
import { accentTextClass, sectionHref, toAccent } from "@/lib/navigation";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

// Littéral et non `REVALIDATE_SECONDS` : Next analyse statiquement les
// exports de configuration de segment et n'en résout pas les identifiants
// importés. La valeur de référence est dans `lib/content/server.ts`.
export const revalidate = 300;

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
  const { lead, top, dossier, latest, bySection, espacePro } =
    await getHomepage();

  if (!lead && latest.length === 0) {
    return (
      <Section>
        <EmptyState
          title="Aucun article publié"
          description="Le journal est en place mais le fonds éditorial n'a pas encore été chargé. Exécutez « bunx convex run seeding:run » pour installer le jeu de démonstration."
        />
      </Section>
    );
  }

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
          <h1 className="font-serif type-h3 text-foreground">{SITE.tagline}</h1>
          {editionDate !== undefined && (
            <p className="type-small text-muted-foreground">
              Édition du {formatDate(editionDate)}
            </p>
          )}
        </Container>
      </div>

      {/* Pleine largeur, hors `Section` : la photo tapisse le bandeau d'un
          bord à l'autre de l'écran, le texte reste dans la grille. */}
      {lead && <FeaturedHero article={lead} />}

      {top.length > 0 && (
        <Section
          tone="muted"
          title="À la une"
          description="La sélection de la rédaction."
          action={
            <Link
              href="/rubrique/business-lifestyle"
              prefetch={false}
              className="inline-flex min-h-11 items-center gap-1 type-small font-semibold text-accent underline-offset-4 hover:underline"
            >
              Toute l&apos;actualité
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

      {dossier && (
        <Section spacing="loose">
          <div className="grid gap-6 rounded-md border border-l-2 border-border border-l-brand-magenta bg-card p-6 lg:grid-cols-[2fr_1fr] lg:items-center lg:gap-10 lg:p-8">
            <div className="min-w-0">
              <p className="type-small font-semibold tracking-wide text-accent uppercase">
                Dossier spécial
              </p>
              <h2 className="mt-3 font-serif type-h1 text-balance">
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
                Ouvrir le dossier
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              <div className="rounded-md bg-surface-muted p-4">
                <dt className="type-small text-muted-foreground">Signature</dt>
                <dd className="mt-1 type-body font-semibold">
                  {dossier.authorName}
                </dd>
              </div>
              <div className="rounded-md bg-surface-muted p-4">
                <dt className="type-small text-muted-foreground">Lecture</dt>
                <dd data-numeric className="mt-1 type-body font-semibold">
                  {dossier.readingMinutes} minutes
                </dd>
              </div>
            </dl>
          </div>
        </Section>
      )}

      {latest.length > 0 && (
        <Section
          title="Derniers articles"
          description="Ce qui vient d'être publié, toutes rubriques confondues."
        >
          <ul className="divide-y divide-border border-y border-border">
            {latest.map((article) => (
              <li key={article.slug}>
                <ArticleCard article={article} variant="list" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {bySection.map((section, index) => (
        <Section
          key={section.slug}
          tone={index % 2 === 0 ? "muted" : "default"}
          title={
            <span className={cn(accentTextClass[toAccent(section.accent)])}>
              {section.name}
            </span>
          }
          description={section.description}
          action={
            <Link
              href={sectionHref(section.slug)}
              prefetch={false}
              className="inline-flex min-h-11 items-center gap-1 type-small font-semibold text-accent underline-offset-4 hover:underline"
            >
              Voir la rubrique
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          }
        >
          {/* Un article illustré par rubrique — en vignette, pas en grande
              carte — et les suivants en titres seuls. Vingt-et-une photos
              pleine largeur sur une page d'accueil, c'est un mur d'images et,
              sur un téléphone haute densité, un demi-mégaoctet : le §5.4 en
              plafonne 600 Ko pour la page entière. La densité d'images
              décroît donc en descendant, comme sur une une imprimée. */}
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
            <ArticleCard
              article={section.articles[0]}
              variant="list"
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
          title="Espace pro"
          description="Réglementation, appels d'offres, formation et documentation — l'information directement utilisable."
          action={
            <Link
              href="/rubrique/espace-pro"
              prefetch={false}
              className="inline-flex min-h-11 items-center gap-1 type-small font-semibold text-accent underline-offset-4 hover:underline"
            >
              Tout l&apos;espace pro
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
              <h3 className="font-serif type-h3">Docuthèque</h3>
              <p className="mt-2 type-small text-muted-foreground">
                Rapports, textes réglementaires et études, téléchargeables — le
                poids du fichier est annoncé avant le clic.
              </p>
              <Link
                href="/docutheque"
                prefetch={false}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
              >
                Ouvrir la docuthèque
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </Section>
      )}

      <Section tone="muted" spacing="loose">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12">
          <div className="min-w-0">
            <h2 className="font-serif type-h2">La lettre hebdomadaire</h2>
            <p className="mt-2 max-w-reading type-body text-muted-foreground">
              Un courriel par semaine : les articles à retenir, les échéances
              réglementaires, les appels d&apos;offres ouverts. Inscription
              confirmée par courriel, désinscription en un clic.
            </p>
          </div>
          <NewsletterForm source="accueil" variant="block" />
        </div>
      </Section>
    </>
  );
}
