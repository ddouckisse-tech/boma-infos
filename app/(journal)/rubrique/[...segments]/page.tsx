import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { Advertising } from "@/components/custom/advertising";
import { ArticleCard } from "@/components/custom/article-card";
import { Container } from "@/components/custom/container";
import { EmptyState } from "@/components/custom/empty-state";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { Pagination } from "@/components/custom/pagination";
import { Section } from "@/components/custom/section";
import { BreadcrumbStructuredData } from "@/components/custom/structured-data";
import { isDemoArticle } from "@/lib/content/demo";
import {
  getNavigation,
  getSectionCounts,
  getSectionPage,
} from "@/lib/content/server";
import { categoryDescription, categoryLabel } from "@/lib/i18n";
import {
  buildSections,
  findSection,
  sectionHref,
  subSectionHref,
  type Section as EditorialSection,
  type SubSection,
} from "@/lib/navigation";
import {
  ARTICLES_PER_PAGE,
  DEMO_CONTENT_NOTICE,
  EDITORIAL_ROBOTS,
} from "@/lib/site";
import { cn } from "@/lib/utils";

// Littéral et non `REVALIDATE_SECONDS` : Next analyse statiquement les
// exports de configuration de segment et n'en résout pas les identifiants
// importés. La valeur de référence est dans `lib/content/server.ts`.
export const revalidate = 300;
export const dynamicParams = true;

/**
 * Section and sub-section listing (CDC §4.2).
 *
 * **Pagination and sorting live in the path, not in a query string.**
 * `?page=2` would make the route dynamic in Next 16 — every listing rendered
 * per request, straight through to Convex, on the critical path of a reader
 * in Libreville. `/rubrique/espace-pro/page/2` and
 * `/rubrique/espace-pro/anciens` are prerendered, crawlable and cacheable.
 * The sorted variant carries a canonical back to the default order so the two
 * never compete in the index.
 *
 * Grammar accepted:
 *   /rubrique/<section>
 *   /rubrique/<section>/<sous-section>
 *   /rubrique/<section>[/<sous-section>][/anciens][/page/<n>]
 */

const OLDEST = "anciens";

type Resolved = {
  section: EditorialSection;
  child?: SubSection;
  page: number;
  order: "recent" | "ancien";
};

function resolve(
  sections: readonly EditorialSection[],
  segments: readonly string[]
): Resolved | null {
  const parts = [...segments];
  if (parts.length === 0) return null;

  const section = findSection(sections, parts.shift() as string);
  if (!section) return null;

  let child: SubSection | undefined;
  if (parts.length > 0 && parts[0] !== OLDEST && parts[0] !== "page") {
    child = section.children.find((item) => item.slug === parts[0]);
    if (!child) return null;
    parts.shift();
  }

  let order: "recent" | "ancien" = "recent";
  if (parts[0] === OLDEST) {
    order = "ancien";
    parts.shift();
  }

  let page = 1;
  if (parts.length > 0) {
    if (parts[0] !== "page" || parts.length !== 2) return null;
    const parsed = Number(parts[1]);
    if (!Number.isInteger(parsed) || parsed < 2 || parsed > 999) return null;
    page = parsed;
  }

  return { section, child, page, order };
}

function buildHref(
  section: string,
  child: string | undefined,
  order: "recent" | "ancien",
  page: number
): string {
  const parts = ["/rubrique", section];
  if (child) parts.push(child);
  if (order === "ancien") parts.push(OLDEST);
  if (page > 1) parts.push("page", String(page));
  return parts.join("/");
}

export async function generateStaticParams() {
  // Les premières pages de chaque rubrique et sous-rubrique sont prégénérées.
  // Les pages 2 et suivantes, et l'ordre inverse, sont rendues à la demande
  // puis mises en cache : les prégénérer toutes multiplierait le temps de
  // compilation pour des pages que peu de lecteurs ouvrent.
  const sections = buildSections(await getNavigation());
  return sections.flatMap((section) => [
    { segments: [section.slug] },
    ...section.children.map((child) => ({
      segments: [section.slug, child.slug],
    })),
  ]);
}

export async function generateMetadata({
  params,
}: PageProps<"/rubrique/[...segments]">): Promise<Metadata> {
  const { segments } = await params;
  const sections = buildSections(await getNavigation());
  const resolved = resolve(sections, segments);
  if (!resolved) return { title: "Rubrique introuvable" };

  const { section, child, page, order } = resolved;
  const { items } = await getSectionPage(
    section.slug,
    child?.slug,
    page,
    ARTICLES_PER_PAGE,
    order
  );
  const label = child ? `${child.label} — ${section.label}` : section.label;
  const suffix = page > 1 ? ` (page ${page})` : "";

  return {
    title: `${label}${suffix}`,
    description: child?.description || section.description,
    alternates: {
      // L'ordre inverse est une commodité de lecture, pas une page distincte :
      // sa valeur canonique est celle de l'ordre par défaut.
      canonical: buildHref(section.slug, child?.slug, "recent", page),
    },
    robots:
      order === "ancien" ||
      items.length === 0 ||
      items.some(({ slug }) => isDemoArticle(slug))
        ? { index: false, follow: true }
        : EDITORIAL_ROBOTS,
    openGraph: {
      type: "website",
      title: `${label}${suffix}`,
      description: child?.description || section.description,
      url: buildHref(section.slug, child?.slug, "recent", page),
    },
  };
}

export default async function SectionPage({
  params,
}: PageProps<"/rubrique/[...segments]">) {
  const { segments } = await params;
  const sections = buildSections(await getNavigation());
  const resolved = resolve(sections, segments);
  if (!resolved) notFound();

  const { section, child, page, order } = resolved;
  const [list, counts] = await Promise.all([
    getSectionPage(section.slug, child?.slug, page, ARTICLES_PER_PAGE, order),
    getSectionCounts(),
  ]);

  const countFor = (slug: string) =>
    counts.find((entry) => entry.slug === slug)?.count ?? 0;

  const trail = [
    { name: "Accueil", href: "/" },
    { name: section.label, href: sectionHref(section.slug) },
    ...(child
      ? [
          {
            name: child.label,
            href: subSectionHref(section.slug, child.slug),
          },
        ]
      : []),
  ];

  const filterClass =
    "inline-flex items-center gap-2 rounded-md border px-3 type-small font-medium transition-colors touch-target";

  return (
    <>
      <BreadcrumbStructuredData trail={trail} />

      <PageHeader
        eyebrow={
          child ? (
            <LocalizedText
              fr={section.label}
              en={categoryLabel("en", section.slug, section.label)}
            />
          ) : (
            <LocalizedText fr="Rubrique" en="Section" />
          )
        }
        title={
          <LocalizedText
            fr={child ? child.label : section.label}
            en={categoryLabel(
              "en",
              child ? child.slug : section.slug,
              child ? child.label : section.label
            )}
          />
        }
        description={
          <LocalizedText
            fr={child?.description || section.description}
            en={categoryDescription(
              "en",
              child ? child.slug : section.slug,
              child?.description || section.description
            )}
          />
        }
        breadcrumb={
          <nav aria-label="Navigation">
            <ol className="flex flex-wrap items-center gap-x-1">
              {trail.slice(0, -1).map((item) => (
                <li key={item.href} className="flex items-center gap-1">
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="inline-flex min-h-11 items-center text-accent underline-offset-4 hover:underline"
                  >
                    {item.href === "/" ? (
                      <LocalizedText fr="Accueil" en="Home" />
                    ) : (
                      <LocalizedText
                        fr={item.name}
                        en={categoryLabel(
                          "en",
                          item.href.split("/").filter(Boolean).at(-1) ?? "",
                          item.name
                        )}
                      />
                    )}
                  </Link>
                  <span aria-hidden="true" className="text-muted-foreground">
                    ›
                  </span>
                </li>
              ))}
              <li className="text-muted-foreground">
                <LocalizedText
                  fr={trail[trail.length - 1].name}
                  en={categoryLabel(
                    "en",
                    trail[trail.length - 1].href
                      .split("/")
                      .filter(Boolean)
                      .at(-1) ?? "",
                    trail[trail.length - 1].name
                  )}
                />
              </li>
            </ol>
          </nav>
        }
      />

      <Container className="pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          {section.children.length > 0 && (
            <nav aria-label="Sections" className="min-w-0">
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link
                    href={buildHref(section.slug, undefined, order, 1)}
                    prefetch={false}
                    aria-current={!child ? "page" : undefined}
                    className={cn(
                      filterClass,
                      !child
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-surface-muted"
                    )}
                  >
                    <LocalizedText fr="Tout" en="All" />
                    <span data-numeric className="opacity-70">
                      {countFor(section.slug)}
                    </span>
                  </Link>
                </li>
                {section.children.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={buildHref(section.slug, item.slug, order, 1)}
                      prefetch={false}
                      aria-current={
                        child?.slug === item.slug ? "page" : undefined
                      }
                      className={cn(
                        filterClass,
                        child?.slug === item.slug
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-surface-muted"
                      )}
                    >
                      <LocalizedText
                        fr={item.label}
                        en={categoryLabel("en", item.slug, item.label)}
                      />
                      <span data-numeric className="opacity-70">
                        {countFor(item.slug)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="flex items-center gap-2">
            <span className="type-small text-muted-foreground">
              <LocalizedText fr="Trier" en="Sort" />
            </span>
            <Link
              href={buildHref(section.slug, child?.slug, "recent", 1)}
              prefetch={false}
              aria-current={order === "recent" ? "true" : undefined}
              className={cn(
                filterClass,
                order === "recent"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-surface-muted"
              )}
            >
              <ArrowDownWideNarrow aria-hidden="true" className="size-4" />
              <LocalizedText fr="Plus récents" en="Newest" />
            </Link>
            <Link
              href={buildHref(section.slug, child?.slug, "ancien", 1)}
              prefetch={false}
              aria-current={order === "ancien" ? "true" : undefined}
              className={cn(
                filterClass,
                order === "ancien"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-surface-muted"
              )}
            >
              <ArrowUpNarrowWide aria-hidden="true" className="size-4" />
              <LocalizedText fr="Plus anciens" en="Oldest" />
            </Link>
          </div>
        </div>
      </Container>

      <Section spacing="compact">
        {list.items.some(({ slug }) => isDemoArticle(slug)) && (
          <p
            role="note"
            className="mb-5 rounded-md border border-border bg-surface-muted p-3 type-small text-muted-foreground"
          >
            <LocalizedText
              fr={DEMO_CONTENT_NOTICE.articleFr}
              en={DEMO_CONTENT_NOTICE.articleEn}
            />
          </p>
        )}
        {list.items.length === 0 ? (
          <>
            <div className="lc-fr" lang="fr">
              <EmptyState
                title="Aucun article publié dans cette rubrique"
                description="Cette rubrique existe dans l'arborescence mais n'a pas encore d'article. Elle ne présente volontairement aucun contenu d'une autre rubrique à la place."
                action={
                  <Link
                    href="/"
                    prefetch={false}
                    className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
                  >
                    Revenir à l&apos;accueil
                  </Link>
                }
              />
            </div>
            <div className="lc-en" lang="en">
              <EmptyState
                title="No published articles in this section"
                description="This section exists but does not have an article yet. It deliberately does not substitute content from another section."
                action={
                  <Link
                    href="/"
                    prefetch={false}
                    className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
                  >
                    Back to home
                  </Link>
                }
              />
            </div>
          </>
        ) : (
          <>
            <p className="mb-6 type-small text-muted-foreground">
              <span className="lc-fr" lang="fr">
                <span data-numeric>{list.total}</span> article
                {list.total > 1 ? "s" : ""} publié{list.total > 1 ? "s" : ""}
                {list.pageCount > 1 && (
                  <>
                    {" "}
                    — page <span data-numeric>{list.page}</span> sur{" "}
                    <span data-numeric>{list.pageCount}</span>
                  </>
                )}
              </span>
              <span className="lc-en" lang="en">
                <span data-numeric>{list.total}</span> published article
                {list.total === 1 ? "" : "s"}
                {list.pageCount > 1 && (
                  <>
                    {" "}
                    — page <span data-numeric>{list.page}</span> of{" "}
                    <span data-numeric>{list.pageCount}</span>
                  </>
                )}
              </span>
            </p>
            <ul lang="fr" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.items.map((article) => (
                <li key={article.slug} className="min-w-0">
                  <ArticleCard
                    article={article}
                    headingLevel={2}
                    showCategory={!child}
                  />
                </li>
              ))}
            </ul>
            <Pagination
              page={list.page}
              pageCount={list.pageCount}
              hrefFor={(target) =>
                buildHref(section.slug, child?.slug, order, target)
              }
            />
          </>
        )}
      </Section>
      {list.items.length >= 4 && (
        <Advertising
          placement="listing"
          pageKey={`/rubrique/${segments.join("/")}`}
          className="mx-auto my-10 w-[calc(100%-2rem)] max-w-[728px] md:my-14"
        />
      )}
    </>
  );
}
