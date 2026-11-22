import { getLatest, REVALIDATE_SECONDS } from "@/lib/content/server";
import { isDemoArticle } from "@/lib/content/demo";
import { fallbackVariant, getMediaAsset, variantUrl } from "@/lib/media";
import {
  absoluteUrl,
  PUBLISHER_NAME,
  SEARCH_INDEXABLE,
  SITE,
} from "@/lib/site";

// Littéral et non `REVALIDATE_SECONDS` : Next analyse statiquement les
// exports de configuration de segment et n'en résout pas les identifiants
// importés. La valeur de référence est dans `lib/content/server.ts`.
export const revalidate = 300;

/**
 * RSS 2.0 feed (CDC §4.2).
 *
 * Twenty items, full chapô, enclosure pointing at the 960 px AVIF so a reader
 * app shows a picture without pulling the full rendition. Generated from the
 * same query the pages use, so the feed can never drift from the site.
 */

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function GET() {
  const articles = (await getLatest(30))
    .filter(({ slug }) => !SEARCH_INDEXABLE || !isDemoArticle(slug))
    .slice(0, 20);
  const updated = articles[0]?.publishedAt ?? Date.now();

  const items = articles
    .map((article) => {
      const url = absoluteUrl(`/article/${article.slug}`);
      const cover = getMediaAsset(article.heroMediaKey);
      const image = cover?.webp.length
        ? fallbackVariant(cover, 960)
        : undefined;
      return `    <item>
      <title>${escape(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <dc:creator>${escape(article.authorName)}</dc:creator>
      <category>${escape(article.categoryName)}</category>
      <description>${escape(article.dek)}</description>${
        cover && image
          ? `
      <enclosure url="${escape(new URL(variantUrl(cover, image.w, "webp"), url).href)}" type="image/webp" length="${image.bytes}"/>`
          : ""
      }
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE.name)} — ${escape(SITE.tagline)}</title>
    <link>${absoluteUrl("/")}</link>
    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml"/>
    <description>${escape(SITE.description)}</description>
    <language>fr-GA</language>
    <copyright>© ${new Date().getFullYear()} ${escape(PUBLISHER_NAME)}</copyright>
    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=3600`,
    },
  });
}
