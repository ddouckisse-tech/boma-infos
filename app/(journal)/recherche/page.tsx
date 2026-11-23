import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { isLocaleChoice, LOCALE_COOKIE } from "@/lib/preferences";
import { ArticleCard } from "@/components/custom/article-card";
import { EmptyState } from "@/components/custom/empty-state";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SearchForm } from "@/components/custom/search-form";
import { getLatest, searchArticles } from "@/lib/content/server";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recherche",
  description: `Rechercher dans les articles publiés par ${SITE.name} : titres, chapôs et corps de texte.`,
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
  const locale = isLocaleChoice(params.lang)
    ? params.lang
    : (await cookies()).get(LOCALE_COOKIE)?.value === "en"
      ? "en"
      : "fr";
  const raw = params.q;
  const term = (Array.isArray(raw) ? raw[0] : (raw ?? "")).trim().slice(0, 120);

  const results =
    term.length >= 2 ? await searchArticles(term, undefined, 30, locale) : [];
  const suggestions =
    term.length >= 2 && results.length === 0 ? await getLatest(3) : [];

  return (
    <>
      <PageHeader
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

      {term.length >= 2 && (
        <Section width="reading" spacing="compact">
          {results.length === 0 ? (
            <>
              <div className="lc-fr" lang="fr">
                <EmptyState
                  title="Aucun article ne correspond"
                  description="Essayez un mot-clé plus court ou parcourez les rubriques depuis le menu."
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
                  description="Try a shorter term or browse the sections from the menu."
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
      )}

      {suggestions.length > 0 && (
        <Section
          tone="muted"
          title={
            <LocalizedText fr="Les derniers articles" en="Latest articles" />
          }
        >
          <ul className="news-card-grid">
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
