import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { ArticleCard } from "@/components/custom/article-card";
import { AuthorMonogram } from "@/components/custom/author-byline";
import { Container } from "@/components/custom/container";
import { EmptyState } from "@/components/custom/empty-state";
import { Section } from "@/components/custom/section";
import { BreadcrumbStructuredData } from "@/components/custom/structured-data";
import { getAuthor, getAuthors } from "@/lib/content/server";
import { absoluteUrl } from "@/lib/site";

// Littéral et non `REVALIDATE_SECONDS` : Next analyse statiquement les
// exports de configuration de segment et n'en résout pas les identifiants
// importés. La valeur de référence est dans `lib/content/server.ts`.
export const revalidate = 300;
export const dynamicParams = true;

/**
 * Author page (CDC §4.2).
 *
 * The legacy site attributed all 1 019 articles to a single `admin` account
 * and had no author page at all — which the audit flagged twice: as a
 * credibility problem for a press outlet, and as a condition of eligibility
 * for Google Actualités. Each signature now has a page, a job title, a
 * biography and its archive.
 */

export async function generateStaticParams() {
  const authors = await getAuthors();
  return authors.map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/auteur/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAuthor(slug);
  if (!data) return { title: "Auteur introuvable" };

  const { author, articles } = data;
  return {
    title: author.name,
    description: `${author.role} au Corporate. ${author.bio}`.slice(0, 158),
    alternates: { canonical: `/auteur/${author.slug}` },
    openGraph: {
      type: "profile",
      title: `${author.name} — ${author.role}`,
      description: `${articles.length} article${articles.length > 1 ? "s" : ""} publié${articles.length > 1 ? "s" : ""} au Corporate.`,
      url: `/auteur/${author.slug}`,
    },
  };
}

export default async function AuthorPage({
  params,
}: PageProps<"/auteur/[slug]">) {
  const { slug } = await params;
  const data = await getAuthor(slug);
  if (!data) notFound();

  const { author, articles } = data;

  return (
    <>
      <BreadcrumbStructuredData
        trail={[
          { name: "Accueil", href: "/" },
          { name: author.name, href: `/auteur/${author.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: {
              "@type": "Person",
              name: author.name,
              jobTitle: author.role,
              description: author.bio,
              url: absoluteUrl(`/auteur/${author.slug}`),
              worksFor: { "@type": "Organization", name: "Le Corporate" },
            },
          }).replace(/</g, "\\u003c"),
        }}
      />

      <header className="border-b border-border py-8 md:py-10">
        <Container>
          <nav aria-label="Fil d'Ariane" className="mb-4 type-small">
            <Link
              href="/"
              prefetch={false}
              className="inline-flex min-h-11 items-center text-accent underline-offset-4 hover:underline"
            >
              Accueil
            </Link>
            <span aria-hidden="true" className="text-muted-foreground">
              {" › "}
            </span>
            <span className="text-muted-foreground">{author.name}</span>
          </nav>

          <div className="flex flex-wrap items-start gap-5">
            <AuthorMonogram
              name={author.name}
              className="size-16 type-h2 sm:size-20"
            />
            <div className="min-w-0 flex-1">
              <p className="type-small font-semibold tracking-wide text-accent uppercase">
                {author.role}
              </p>
              <h1 className="mt-1 font-display type-h1">{author.name}</h1>
              <span
                aria-hidden="true"
                className="mt-4 block h-[3px] w-16 rounded-xs bg-brand-magenta"
              />
              <p className="mt-4 max-w-reading type-body text-muted-foreground">
                {author.bio}
              </p>
              <p className="mt-4 type-small text-muted-foreground">
                <span data-numeric>{articles.length}</span> article
                {articles.length > 1 ? "s" : ""} publié
                {articles.length > 1 ? "s" : ""}.
              </p>
              {author.links.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {author.links.map((link) => (
                    <li key={link.url}>
                      <Link
                        href={link.url}
                        prefetch={false}
                        className="inline-flex items-center gap-2 rounded-md border border-border px-3 type-small transition-colors touch-target hover:border-border-strong"
                      >
                        <Mail aria-hidden="true" className="size-4" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Container>
      </header>

      <Section title="Ses articles">
        {articles.length === 0 ? (
          <EmptyState
            title="Aucun article publié"
            description="Cette signature n'a pas encore d'article en ligne."
          />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.slug} className="min-w-0">
                <ArticleCard article={article} headingLevel={2} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
