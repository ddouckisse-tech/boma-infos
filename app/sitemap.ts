import type { MetadataRoute } from "next";
import {
  getAuthors,
  getNavigation,
  getPublishedSlugs,
  getSectionCounts,
} from "@/lib/content/server";
import { isDemoArticle, isDemoAuthor } from "@/lib/content/demo";
import { absoluteUrl, ARTICLES_PER_PAGE, SEARCH_INDEXABLE } from "@/lib/site";

// Littéral et non `REVALIDATE_SECONDS` : Next analyse statiquement les
// exports de configuration de segment et n'en résout pas les identifiants
// importés. La valeur de référence est dans `lib/content/server.ts`.
export const revalidate = 300;

/**
 * sitemap.xml — every page a search engine should know about.
 *
 * Articles, sections and their paginated pages, authors, and the standing
 * editorial pages. Deliberately absent: `/recherche`, the newsletter token
 * pages and `/design-system`, all of which `robots.ts` closes too.
 *
 * The legacy Yoast sitemap also offered two `attachment-sitemap` files,
 * proposing media attachment pages with no content for indexing; nothing of
 * the sort is generated here.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!SEARCH_INDEXABLE) return [];
  const [published, categories, authors, sectionCounts] = await Promise.all([
    getPublishedSlugs(),
    getNavigation(),
    getAuthors(),
    getSectionCounts(),
  ]);

  const slugs = published.filter(({ slug }) => !isDemoArticle(slug));
  const demoCategories = new Set(
    published
      .filter(({ slug }) => isDemoArticle(slug))
      .map(({ categorySlug }) => categorySlug)
  );
  const newest = slugs[0]?.publishedAt;
  const counts = new Map(sectionCounts.map(({ slug, count }) => [slug, count]));

  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: newest === undefined ? undefined : new Date(newest),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/a-propos"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/contacts"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/docutheque"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/newsletter"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/mentions-legales"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/confidentialite"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  for (const category of categories) {
    const count = counts.get(category.slug) ?? 0;
    if (count === 0 || demoCategories.has(category.parentSlug ?? category.slug))
      continue;
    const base = category.parentSlug
      ? `/rubrique/${category.parentSlug}/${category.slug}`
      : `/rubrique/${category.slug}`;
    entries.push({
      url: absoluteUrl(base),
      changeFrequency: "daily",
      priority: category.parentSlug ? 0.6 : 0.8,
    });

    for (
      let page = 2;
      page <= Math.ceil(count / ARTICLES_PER_PAGE);
      page += 1
    ) {
      entries.push({
        url: absoluteUrl(`${base}/page/${page}`),
        changeFrequency: "weekly",
        priority: 0.4,
      });
    }
  }

  for (const author of authors) {
    if (isDemoAuthor(author.slug)) continue;
    entries.push({
      url: absoluteUrl(`/auteur/${author.slug}`),
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  for (const item of slugs) {
    entries.push({
      url: absoluteUrl(`/article/${item.slug}`),
      lastModified: new Date(item.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
