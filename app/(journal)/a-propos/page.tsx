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
import { DEMO_CONTENT_NOTICE, SITE } from "@/lib/site";

// Littéral et non `REVALIDATE_SECONDS` : Next analyse statiquement les
// exports de configuration de segment et n'en résout pas les identifiants
// importés. La valeur de référence est dans `lib/content/server.ts`.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "À propos",
  description: `${SITE.name}, média gabonais d'information générale en ligne : ligne éditoriale, rubriques, équipe, méthode et règles de transparence.`,
  alternates: { canonical: "/a-propos" },
  openGraph: {
    type: "website",
    url: "/a-propos",
    title: `À propos — ${SITE.name}`,
    description: `Ligne éditoriale, équipe et règles de transparence de ${SITE.name}, média d'information générale sur le Gabon.`,
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
          <LocalizedText
            fr={`À propos de ${SITE.name}`}
            en={`About ${SITE.name}`}
          />
        }
        description={
          <LocalizedText
            fr="Un média gabonais d'information générale en ligne : toute l'actualité du Gabon, de la politique au sport, pour les Gabonais, la diaspora et toute personne qui suit ou visite le pays."
            en="A Gabonese online news outlet covering all the news from Gabon, from politics to sport, for Gabonese readers, the diaspora and anyone who follows or visits the country."
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
              fr={`${SITE.name} couvre toute l'actualité du Gabon : politique, économie, société, tourisme, environnement, culture et sport. Nous écrivons pour les Gabonais, pour la diaspora et pour toute personne qui suit ou visite le pays. Notre objectif : une information vérifiée et expliquée, plutôt qu'un commentaire.`}
              en={`${SITE.name} covers all the news from Gabon: politics, the economy, society, tourism, the environment, culture and sport. We write for Gabonese readers, for the diaspora and for anyone who follows or visits the country. Our aim is checked and explained information rather than commentary.`}
            />
          </p>
          <p>
            <LocalizedText
              fr="Le journal s'organise en rubriques, consultables depuis le menu, chacune annonçant ce qu'elle contient. L'actualité se répartit entre Politique, Économie, Société, Tourisme, Environnement, Culture et Sport. L'Éditorial porte la position de la rédaction, Idées accueille tribunes et entretiens, et l'Espace pro réunit l'information utile aux professionnels. Une rubrique sans article le dit : nous ne remplaçons jamais un contenu absent par un flux générique."
              en="The journal is organised into sections, all available from the menu, and each one explains what it contains. The news is divided between Politics, Economy, Society, Tourism, Environment, Culture and Sport. Editorial carries the newsroom's position, Ideas hosts opinion pieces and interviews, and Professional resources gathers information that is useful to professionals. An empty section says so clearly: we never replace missing content with a generic feed."
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
                fr="Les faits sont vérifiés avant publication. Les chiffres sont sourcés, et la source est indiquée à côté du chiffre."
                en="Facts are checked before publication. Figures are sourced, with the source shown beside each figure."
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
              fr="Les entreprises peuvent déposer leur actualité. Tout contenu d'origine commerciale porte la mention « Contenu partenaire », visible sur la carte comme sur la page de l'article : il ne se confond jamais avec un article de la rédaction. Cette mention ne peut pas être retirée à la demande de l'annonceur. La rédaction conserve la décision de publier, la date et le titre."
              en="Companies may submit their news. Commercial content is clearly labelled “Partner content” on both the card and the article page, so it is never mistaken for a newsroom article. Advertisers cannot request its removal, and the editorial team retains control over publication, date and title."
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
        description={
          DEMO_CONTENT_NOTICE && (
            <span role="note">
              <LocalizedText
                fr={DEMO_CONTENT_NOTICE.teamFr}
                en={DEMO_CONTENT_NOTICE.teamEn}
              />
            </span>
          )
        }
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
              {SITE.phone && SITE.phoneHref && (
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
              )}
              {SITE.address && (
                <div className="flex flex-wrap gap-2">
                  <dt className="text-muted-foreground">
                    <LocalizedText fr="Adresse :" en="Address:" />
                  </dt>
                  <dd>{SITE.address}</dd>
                </div>
              )}
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
