import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/custom/article-card";
import { EmptyState } from "@/components/custom/empty-state";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SearchForm } from "@/components/custom/search-form";
import { getLatest, searchArticles } from "@/lib/content/server";

export const metadata: Metadata = {
  title: "Recherche",
  description:
    "Rechercher dans les articles publiés par Le Corporate : titres, chapôs et corps de texte.",
  // Un espace infini de chaînes de requête n'a rien à faire dans un index.
  robots: { index: false, follow: true },
};

/**
 * Full-text search page (CDC §4.2).
 *
 * Rendered on the server for each query — the only dynamic page of the
 * public site, and the one where it is warranted. The form works with
 * JavaScript disabled: it is a plain `GET` on this route, so the results are
 * a shareable URL.
 */
export default async function SearchPage({
  searchParams,
}: PageProps<"/recherche">) {
  const params = await searchParams;
  const raw = params.q;
  const term = (Array.isArray(raw) ? raw[0] : (raw ?? "")).trim().slice(0, 120);

  const results =
    term.length >= 2 ? await searchArticles(term, undefined, 30) : [];
  const suggestions =
    term.length >= 2 && results.length === 0 ? await getLatest(3) : [];

  return (
    <>
      <PageHeader
        eyebrow={<LocalizedText fr="Recherche" en="Search" />}
        title={
          term ? (
            <>
              <span className="lc-fr" lang="fr">
                Résultats pour « {term} »
              </span>
              <span className="lc-en" lang="en">
                Results for “{term}”
              </span>
            </>
          ) : (
            <LocalizedText fr="Rechercher un article" en="Search articles" />
          )
        }
        description={
          term.length >= 2 ? (
            <>
              <span className="lc-fr" lang="fr">
                {results.length} article{results.length > 1 ? "s" : ""}{" "}
                correspond{results.length > 1 ? "ent" : ""} à votre recherche.
              </span>
              <span className="lc-en" lang="en">
                {results.length} article{results.length === 1 ? "" : "s"} match
                your search.
              </span>
            </>
          ) : (
            <LocalizedText
              fr="Saisissez au moins deux caractères. La recherche porte sur le titre, le chapô et le corps de chaque article publié."
              en="Enter at least two characters. Search covers the title, introduction and body of every published article."
            />
          )
        }
        width="reading"
      />

      <Section width="reading" spacing="compact">
        <SearchForm defaultValue={term} />
      </Section>

      <Section spacing="compact">
        {term.length < 2 ? null : results.length === 0 ? (
          <>
            <div className="lc-fr" lang="fr">
              <EmptyState
                title="Aucun article ne correspond"
                description="Essayez un terme plus court, ou parcourez les rubriques depuis le menu. Rien d'autre ne vous est présenté à la place de ce que vous cherchiez."
                action={
                  <Link
                    href="/"
                    className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
                  >
                    Revenir à l&apos;accueil
                  </Link>
                }
              />
            </div>
            <div className="lc-en" lang="en">
              <EmptyState
                title="No matching article"
                description="Try a shorter term or browse the sections from the menu. We do not substitute unrelated content for what you searched for."
                action={
                  <Link
                    href="/"
                    className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
                  >
                    Back to home
                  </Link>
                }
              />
            </div>
          </>
        ) : (
          <ul
            lang="fr"
            className="divide-y divide-border border-y border-border"
          >
            {results.map((article) => (
              <li key={article.slug}>
                <ArticleCard
                  article={article}
                  variant="list"
                  headingLevel={2}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {suggestions.length > 0 && (
        <Section
          tone="muted"
          title={
            <LocalizedText fr="Les derniers articles" en="Latest articles" />
          }
          description={
            <LocalizedText
              fr="À défaut de résultat, voici ce qui vient de paraître."
              en="While there are no matches, here are the latest publications."
            />
          }
        >
          <ul lang="fr" className="grid gap-6 sm:grid-cols-3">
            {suggestions.map((article) => (
              <li key={article.slug} className="min-w-0">
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
