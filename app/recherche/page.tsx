import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/custom/article-card";
import { EmptyState } from "@/components/custom/empty-state";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SearchForm } from "@/components/custom/search-form";
import { getLatest, searchArticles } from "@/lib/content/server";

export const metadata: Metadata = {
  title: "Recherche",
  description:
    "Rechercher dans les articles publiés par Le Corporate : titres, chapôs et corps de texte.",
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
        eyebrow="Recherche"
        title={term ? `Résultats pour « ${term} »` : "Rechercher un article"}
        description={
          term.length >= 2
            ? `${results.length} article${results.length > 1 ? "s" : ""} correspond${results.length > 1 ? "ent" : ""} à votre recherche.`
            : "Saisissez au moins deux caractères. La recherche porte sur le titre, le chapô et le corps de chaque article publié."
        }
        width="reading"
      />

      <Section width="reading" spacing="compact">
        <SearchForm defaultValue={term} />
      </Section>

      <Section spacing="compact">
        {term.length < 2 ? null : results.length === 0 ? (
          <EmptyState
            title="Aucun article ne correspond"
            description={
              <>
                Essayez un terme plus court, ou parcourez les rubriques depuis
                le menu. Rien d&apos;autre ne vous est présenté à la place de ce
                que vous cherchiez.
              </>
            }
            action={
              <Link
                href="/"
                className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
              >
                Revenir à l&apos;accueil
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-border border-y border-border">
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
          title="Les derniers articles"
          description="À défaut de résultat, voici ce qui vient de paraître."
        >
          <ul className="grid gap-6 sm:grid-cols-3">
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
