import type { MetadataRoute } from "next";
import {
  getAuthors,
  getNavigation,
  getPublishedSlugs,
} from "@/lib/content/server";
import { absoluteUrl, ARTICLES_PER_PAGE } from "@/lib/site";

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
  const [slugs, categories, authors] = await Promise.all([
    getPublishedSlugs(),
    getNavigation(),
    getAuthors(),
  ]);

  const newest = slugs[0]?.publishedAt ?? Date.now();
  const perCategory = new Map<string, number>();
  for (const item of slugs) {
    perCategory.set(
      item.categorySlug,
      (perCategory.get(item.categorySlug) ?? 0) + 1
    );
  }

  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(newest),
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
    const base = category.parentSlug
      ? `/rubrique/${category.parentSlug}/${category.slug}`
      : `/rubrique/${category.slug}`;
    entries.push({
      url: absoluteUrl(base),
      lastModified: new Date(newest),
      changeFrequency: "daily",
      priority: category.parentSlug ? 0.6 : 0.8,
    });

    if (!category.parentSlug) {
      const pages = Math.ceil(
        (perCategory.get(category.slug) ?? 0) / ARTICLES_PER_PAGE
      );
      for (let page = 2; page <= pages; page += 1) {
        entries.push({
          url: absoluteUrl(`${base}/page/${page}`),
          changeFrequency: "weekly",
          priority: 0.4,
        });
      }
    }
  }

  for (const author of authors) {
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
