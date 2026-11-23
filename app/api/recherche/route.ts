import { NextResponse } from "next/server";
import { searchArticles } from "@/lib/content/server";

/**
 * Search endpoint behind the `Cmd+K` dialog.
 *
 * The dialog could query Convex straight from the browser — and that is
 * exactly what this route exists to avoid. Shipping the Convex React client
 * to every page costs tens of kilobytes of JavaScript on a budget of 180 Ko
 * total (CDC §5.4), for a feature a handful of readers open. The query runs
 * on the server instead, and the browser receives eight lines of JSON.
 *
 * The page `/recherche` does not call this: it is a server component and
 * queries Convex directly.
 */

export const dynamic = "force-dynamic";

const MAX_TERM_LENGTH = 120;

export async function GET(request: Request) {
  const term = (new URL(request.url).searchParams.get("q") ?? "")
    .trim()
    .slice(0, MAX_TERM_LENGTH);

  if (term.length < 2) {
    return NextResponse.json(
      { term, results: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const locale =
      new URL(request.url).searchParams.get("lang") === "en" ? "en" : "fr";
    const results = await searchArticles(term, undefined, 8, locale);
    return NextResponse.json(
      {
        term,
        results: results.map((item) => {
          const english = locale === "en" ? item.englishSummary : undefined;
          return {
            slug: item.slug,
            title: english?.title ?? item.title,
            language: english ? "en" : "fr",
            categorySlug: item.categorySlug,
            categoryName: item.categoryName,
            readingMinutes: english?.readingMinutes ?? item.readingMinutes,
          };
        }),
      },
      {
        headers: {
          // Une même requête revient souvent : 60 s de cache partagé évitent
          // un aller-retour Convex par frappe d'un autre lecteur.
          "Cache-Control": "public, max-age=0, s-maxage=60",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { term, results: [], error: "indisponible" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
