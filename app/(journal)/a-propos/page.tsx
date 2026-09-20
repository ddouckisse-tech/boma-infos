import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuthorMonogram } from "@/components/custom/author-byline";
import { Container } from "@/components/custom/container";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { BreadcrumbStructuredData } from "@/components/custom/structured-data";
import { getAuthors } from "@/lib/content/server";
import { SITE } from "@/lib/site";

// Littéral et non `REVALIDATE_SECONDS` : Next analyse statiquement les
// exports de configuration de segment et n'en résout pas les identifiants
// importés. La valeur de référence est dans `lib/content/server.ts`.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Le Corporate, magazine économique gabonais édité par Up Concept : ligne éditoriale, équipe, méthode et règles de transparence.",
  alternates: { canonical: "/a-propos" },
  openGraph: {
    type: "website",
    url: "/a-propos",
    title: "À propos — Le Corporate",
    description:
      "Ligne éditoriale, équipe et règles de transparence du magazine économique Le Corporate.",
  },
};

/** À propos (CDC §4.1) — qui écrit, comment, et selon quelles règles. */
export default async function AboutPage() {
  const authors = await getAuthors();

  return (
    <>
      <BreadcrumbStructuredData
        trail={[
          { name: "Accueil", href: "/" },
          { name: "À propos", href: "/a-propos" },
        ]}
      />

      <PageHeader
        eyebrow={<LocalizedText fr="Le journal" en="The journal" />}
        title={
          <LocalizedText fr="À propos du Corporate" en="About Le Corporate" />
        }
        description={
          <LocalizedText
            fr="Un magazine économique gabonais, édité par Up Concept, qui traite l'économie du Gabon et de la zone CEMAC pour les dirigeants, les cadres et les institutions."
            en="A Gabonese business magazine published by Up Concept, covering the economies of Gabon and the CEMAC region for executives, professionals and institutions."
          />
        }
      />

      <Section width="reading">
        <div className="article-body type-body">
          <h2 className="font-display type-h2">
            <LocalizedText fr="Ce que nous publions" en="What we publish" />
          </h2>
          <p>
            <LocalizedText
              fr="Le Corporate couvre l'économie réelle : opérations d'entreprise, filières extractives, logistique et infrastructures, réglementation, financement, formation. Nous écrivons pour des lecteurs qui décident — dirigeants, cadres, institutions, bailleurs et partenaires régionaux — et qui ont besoin d'une information vérifiable plutôt que d'un commentaire."
              en="Le Corporate covers the real economy: corporate operations, extractive industries, logistics and infrastructure, regulation, finance and training. We write for decision-makers who need verifiable information rather than commentary."
            />
          </p>
          <p>
            <LocalizedText
              fr="Huit rubriques structurent le journal. Elles sont consultables depuis le menu, et chacune annonce ce qu'elle contient. Une rubrique sans article le dit : nous ne remplaçons jamais un contenu absent par un flux générique."
              en="Eight sections structure the journal. Each one is available from the menu and explains what it contains. An empty section says so clearly: we never replace missing content with a generic feed."
            />
          </p>

          <h2 className="font-display type-h2">
            <LocalizedText fr="Notre méthode" en="Our method" />
          </h2>
          <ul className="list-disc space-y-2 ps-6">
            <li>
              <LocalizedText
                fr="Chaque article est signé par une personne nommée, jointe à une page d'auteur."
                en="Every article has a named byline linked to an author page."
              />
            </li>
            <li>
              <LocalizedText
                fr="Les chiffres sont sourcés, et la source est indiquée à côté du chiffre."
                en="Figures are sourced, with the source shown beside each figure."
              />
            </li>
            <li>
              <LocalizedText
                fr="« L'essentiel en trois points » ouvre chaque article : le lecteur sait en trente secondes ce qu'il va apprendre et décide en connaissance de cause s'il poursuit sa lecture."
                en="A three-point summary opens every article, so readers know within thirty seconds what they will learn and can decide whether to read on."
              />
            </li>
            <li>
              <LocalizedText
                fr="Une correction est signalée dans l'article, datée, et non effacée."
                en="Corrections are dated and disclosed in the article rather than erased."
              />
            </li>
          </ul>

          <h2 className="font-display type-h2">
            <LocalizedText fr="Contenus partenaires" en="Partner content" />
          </h2>
          <p>
            <LocalizedText
              fr="Les entreprises peuvent déposer leur actualité. Tout contenu d'origine commerciale porte la mention « Contenu partenaire », visible sur la carte comme sur la page de l'article. Cette mention ne peut pas être retirée à la demande de l'annonceur. La rédaction conserve la décision de publier, la date et le titre."
              en="Companies may submit their news. Commercial content is clearly labelled “Partner content” on both the card and article page. Advertisers cannot request its removal, and the editorial team retains control over publication, date and title."
            />
          </p>

          <h2 className="font-display type-h2">
            <LocalizedText fr="Le poids d'une page" en="Page weight" />
          </h2>
          <p>
            <LocalizedText
              fr="Au Gabon, chaque mégaoctet compte. Nous limitons la page d'accueil à 600 kilo-octets et un article à 400 kilo-octets. Le mode économie de données réduit encore la définition des images et ne télécharge aucune vidéo sans votre accord."
              en="In Gabon, every megabyte matters. We cap the home page at 600 kilobytes and an article at 400 kilobytes. Data saver further reduces image resolution and never downloads video without your consent."
            />
          </p>
        </div>
      </Section>

      <Section
        tone="muted"
        title={<LocalizedText fr="La rédaction" en="Editorial team" />}
      >
        <ul lang="fr" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <li key={author.slug}>
              <article className="flex h-full flex-col rounded-md border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <AuthorMonogram name={author.name} className="size-11" />
                  <div className="min-w-0">
                    <h3 className="font-display type-h3">
                      <Link
                        href={`/auteur/${author.slug}`}
                        prefetch={false}
                        className="underline-offset-4 hover:underline"
                      >
                        {author.name}
                      </Link>
                    </h3>
                    <p className="type-small text-muted-foreground">
                      {author.role}
                    </p>
                  </div>
                </div>
                <p className="mt-3 flex-1 type-small text-muted-foreground">
                  {author.bio}
                </p>
                <p className="mt-4 type-small text-muted-foreground">
                  <span className="lc-fr" lang="fr">
                    <span data-numeric>{author.articleCount}</span> article
                    {author.articleCount > 1 ? "s" : ""}
                  </span>
                  <span className="lc-en" lang="en">
                    <span data-numeric>{author.articleCount}</span> article
                    {author.articleCount === 1 ? "" : "s"}
                  </span>
                </p>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <Container width="reading" className="px-0">
          <div className="rounded-md border border-border bg-card p-6">
            <h2 className="font-display type-h2">
              <LocalizedText fr="Nous joindre" en="Contact us" />
            </h2>
            <p className="mt-2 type-body text-muted-foreground">
              <LocalizedText
                fr="Une information, un communiqué, un droit de réponse, une proposition de tribune : écrivez à la rédaction."
                en="For news, press releases, a right of reply or an opinion proposal, contact the editorial team."
              />
            </p>
            <dl className="mt-4 grid gap-2 type-body">
              <div className="flex flex-wrap gap-2">
                <dt className="text-muted-foreground">
                  <LocalizedText fr="Courriel :" en="Email:" />
                </dt>
                <dd>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="text-accent underline underline-offset-4"
                  >
                    {SITE.email}
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap gap-2">
                <dt className="text-muted-foreground">
                  <LocalizedText fr="Téléphone :" en="Phone:" />
                </dt>
                <dd>
                  <a
                    href={SITE.phoneHref}
                    className="text-accent underline underline-offset-4"
                  >
                    {SITE.phone}
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap gap-2">
                <dt className="text-muted-foreground">
                  <LocalizedText fr="Adresse :" en="Address:" />
                </dt>
                <dd>{SITE.address}</dd>
              </div>
            </dl>
            <Link
              href="/contacts"
              prefetch={false}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
            >
              <LocalizedText
                fr="Ouvrir le formulaire de contact"
                en="Open the contact form"
              />
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
