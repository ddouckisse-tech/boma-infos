import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuthorMonogram } from "@/components/custom/author-byline";
import { Container } from "@/components/custom/container";
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
    "Le Corporate, magazine économique gabonais édité par Up Concept : ligne éditoriale, équipe, méthode et règles de transparence.",
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
        eyebrow="Le journal"
        title="À propos du Corporate"
        description="Un magazine économique gabonais, édité par Up Concept, qui traite l'économie du Gabon et de la zone CEMAC pour les dirigeants, les cadres et les institutions."
      />

      <Section width="reading">
        <div className="article-body type-body">
          <h2 className="font-serif type-h2">Ce que nous publions</h2>
          <p>
            Le Corporate couvre l&apos;économie réelle : opérations
            d&apos;entreprise, filières extractives, logistique et
            infrastructures, réglementation, financement, formation. Nous
            écrivons pour des lecteurs qui décident — dirigeants, cadres,
            institutions, bailleurs et partenaires régionaux — et qui ont besoin
            d&apos;une information vérifiable plutôt que d&apos;un commentaire.
          </p>
          <p>
            Huit rubriques structurent le journal. Elles sont consultables
            depuis le menu, et chacune annonce ce qu&apos;elle contient. Une
            rubrique sans article le dit&nbsp;: nous ne remplaçons jamais un
            contenu absent par un flux générique.
          </p>

          <h2 className="font-serif type-h2">Notre méthode</h2>
          <ul className="list-disc space-y-2 ps-6">
            <li>
              Chaque article est signé par une personne nommée, jointe à une
              page d&apos;auteur.
            </li>
            <li>
              Les chiffres sont sourcés, et la source est indiquée à côté du
              chiffre.
            </li>
            <li>
              « L&apos;essentiel en trois points » ouvre chaque article&nbsp;:
              le lecteur sait en trente secondes ce qu&apos;il va apprendre, et
              décide en connaissance de cause s&apos;il dépense la suite de sa
              data.
            </li>
            <li>
              Une correction est signalée dans l&apos;article, datée, et non
              effacée.
            </li>
          </ul>

          <h2 className="font-serif type-h2">Contenus partenaires</h2>
          <p>
            Les entreprises peuvent déposer leur actualité. Tout contenu
            d&apos;origine commerciale porte une mention{" "}
            <strong>« Contenu partenaire »</strong> visible, sur la carte comme
            sur la page de l&apos;article, et cette mention ne peut pas être
            retirée à la demande de l&apos;annonceur. La rédaction conserve la
            décision de publier, la date et le titre.
          </p>

          <h2 className="font-serif type-h2">Le poids d&apos;une page</h2>
          <p>
            Au Gabon, le mégaoctet se décompte. Nous nous imposons un plafond de
            600&nbsp;kilo-octets sur la page d&apos;accueil et de
            400&nbsp;kilo-octets sur un article&nbsp;; une version du site qui
            dépasse ces plafonds n&apos;est pas mise en ligne. Le mode
            «&nbsp;économie de données&nbsp;», activable en bas de page, abaisse
            encore la définition des images et ne télécharge aucune vidéo sans
            votre accord.
          </p>
        </div>
      </Section>

      <Section tone="muted" title="La rédaction">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <li key={author.slug}>
              <article className="flex h-full flex-col rounded-md border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <AuthorMonogram name={author.name} className="size-11" />
                  <div className="min-w-0">
                    <h3 className="font-serif type-h3">
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
                  <span data-numeric>{author.articleCount}</span> article
                  {author.articleCount > 1 ? "s" : ""}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <Container width="reading" className="px-0">
          <div className="rounded-md border border-border bg-card p-6">
            <h2 className="font-serif type-h2">Nous joindre</h2>
            <p className="mt-2 type-body text-muted-foreground">
              Une information, un communiqué, un droit de réponse, une
              proposition de tribune&nbsp;: écrivez à la rédaction.
            </p>
            <dl className="mt-4 grid gap-2 type-body">
              <div className="flex flex-wrap gap-2">
                <dt className="text-muted-foreground">Courriel :</dt>
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
                <dt className="text-muted-foreground">Téléphone :</dt>
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
                <dt className="text-muted-foreground">Adresse :</dt>
                <dd>{SITE.address}</dd>
              </div>
            </dl>
            <Link
              href="/contacts"
              prefetch={false}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
            >
              Ouvrir le formulaire de contact
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
