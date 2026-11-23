import type { MetadataRoute } from "next";
import {
  getAuthors,
  getNavigation,
  getPublishedSlugs,
} from "@/lib/content/server";
import { articlePath } from "@/lib/article-locale";
import { isDemoArticle, isDemoAuthor } from "@/lib/content/demo";
import { buildSections, sectionHref, subSectionHref } from "@/lib/navigation";
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
  const [published, categories, authors] = await Promise.all([
    getPublishedSlugs(),
    getNavigation(),
    getAuthors(),
  ]);

  const slugs = published.filter(({ slug }) => !isDemoArticle(slug));
  const newest = slugs[0]?.publishedAt;
  const sections = buildSections(categories);
  const categoriesByPath = new Map<string, typeof published>();
  for (const section of sections) {
    categoriesByPath.set(sectionHref(section.slug), []);
    for (const child of section.children) {
      categoriesByPath.set(subSectionHref(section.slug, child.slug), []);
    }
  }
  for (const item of published) {
    categoriesByPath.get(sectionHref(item.categorySlug))?.push(item);
    if (item.subCategorySlug) {
      categoriesByPath
        .get(subSectionHref(item.categorySlug, item.subCategorySlug))
        ?.push(item);
    }
  }

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

  // Mirror the recent-first listing, including the slots occupied by demos.
  for (const [base, items] of categoriesByPath) {
    for (let start = 0; start < items.length; start += ARTICLES_PER_PAGE) {
      const pageArticles = items
        .slice(start, start + ARTICLES_PER_PAGE)
        .filter(({ slug }) => !isDemoArticle(slug));
      if (pageArticles.length === 0) continue;

      const page = start / ARTICLES_PER_PAGE + 1;
      const lastModified = Math.max(
        ...pageArticles.map(({ updatedAt }) => updatedAt)
      );
      entries.push({
        url: absoluteUrl(page === 1 ? base : `${base}/page/${page}`),
        lastModified: new Date(lastModified),
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
      url: absoluteUrl(articlePath(item.slug)),
      lastModified: new Date(item.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    });
    if (item.hasEnglish) {
      entries.push({
        url: absoluteUrl(articlePath(item.slug, "en")),
        lastModified: new Date(item.updatedAt),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
