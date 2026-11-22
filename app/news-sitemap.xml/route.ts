import { getLatest, REVALIDATE_SECONDS } from "@/lib/content/server";
import { isDemoArticle } from "@/lib/content/demo";
import { absoluteUrl, SEARCH_INDEXABLE, SITE } from "@/lib/site";

// Littéral et non `REVALIDATE_SECONDS` : Next analyse statiquement les
// exports de configuration de segment et n'en résout pas les identifiants
// importés. La valeur de référence est dans `lib/content/server.ts`.
export const revalidate = 300;

/**
 * Google News sitemap.
 *
 * The audit noted `/news-sitemap.xml` returning a 404 on the legacy site and
 * listed it among the conditions of eligibility for Google Actualités
 * (audit §07). The format only accepts articles published in the last two
 * days, capped at 1 000 entries.
 */

const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function GET() {
  const articles = SEARCH_INDEXABLE ? await getLatest(100) : [];
  const now = Date.now();
  const recent = articles.filter(
    (article) =>
      article.publishedAt >= now - TWO_DAYS &&
      article.publishedAt <= now &&
      article.origin === "redaction" &&
      !isDemoArticle(article.slug)
  );

  const entries = recent
    .map(
      (article) => `  <url>
    <loc>${absoluteUrl(`/article/${article.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escape(SITE.name)}</news:name>
        <news:language>fr</news:language>
      </news:publication>
      <news:publication_date>${new Date(article.publishedAt).toISOString()}</news:publication_date>
      <news:title>${escape(article.title)}</news:title>
    </news:news>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=3600`,
    },
  });
}
