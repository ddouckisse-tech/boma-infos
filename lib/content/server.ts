import "server-only";
import { cache } from "react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";

/**
 * Server-side access to the journal.
 *
 * The public pages are React **Server** Components: they read Convex over
 * HTTP while rendering, and the result is baked into an ISR page. The Convex
 * *browser* client is therefore never shipped — that is worth roughly 60 Ko
 * of JavaScript on every page, and the budget of CAHIER-DES-CHARGES.md §5.4
 * leaves no room for it.
 *
 * `cache()` deduplicates a query inside one render pass (the masthead and the
 * page body both need the section tree); ISR deduplicates across readers.
 */

const url = process.env.NEXT_PUBLIC_CONVEX_URL;

/**
 * Revalidation window of the editorial pages. A newsroom publishing about one
 * piece a day does not need a shorter one, and every second here is a page
 * served straight from cache.
 */
export const REVALIDATE_SECONDS = 300;

class ContentUnavailableError extends Error {
  constructor(functionName: string, cause: unknown) {
    super(
      `Le journal n'a pas pu être lu depuis Convex (${functionName}). ` +
        `Vérifiez NEXT_PUBLIC_CONVEX_URL et que les fonctions sont déployées ` +
        `(bunx convex dev --once).`
    );
    this.name = "ContentUnavailableError";
    this.cause = cause;
  }
}

async function run<Query extends FunctionReference<"query", "public">>(
  reference: Query,
  args: FunctionArgs<Query>,
  label: string
): Promise<FunctionReturnType<Query>> {
  if (!url) {
    throw new ContentUnavailableError(
      label,
      new Error("NEXT_PUBLIC_CONVEX_URL absent")
    );
  }
  try {
    // Un client par appel : `ConvexHttpClient` est un simple enrobage de
    // `fetch`, sans connexion persistante à réutiliser.
    return await new ConvexHttpClient(url).query(reference, args);
  } catch (error) {
    throw new ContentUnavailableError(label, error);
  }
}

/* ------------------------------------------------------------------ lecture */

export const getNavigation = cache(() =>
  run(api.journal.navigation, {}, "journal.navigation")
);

export const getHomepage = cache(() =>
  run(api.journal.homepage, {}, "journal.homepage")
);

export const getPublishedSlugs = cache(() =>
  run(api.journal.publishedSlugs, {}, "journal.publishedSlugs")
);

export const getLatest = cache((limit: number) =>
  run(api.journal.latest, { limit }, "journal.latest")
);

export const getSectionPage = cache(
  (
    categorySlug: string,
    subCategorySlug: string | undefined,
    page: number,
    perPage: number,
    order: "recent" | "ancien"
  ) =>
    run(
      api.journal.bySection,
      { categorySlug, subCategorySlug, page, perPage, order },
      "journal.bySection"
    )
);

export const getSectionCounts = cache(() =>
  run(api.journal.sectionCounts, {}, "journal.sectionCounts")
);

export const getArticle = cache((slug: string) =>
  run(api.journal.article, { slug }, "journal.article")
);

export const getRelated = cache((slug: string, limit: number) =>
  run(api.journal.related, { slug, limit }, "journal.related")
);

export const getAuthor = cache((slug: string) =>
  run(api.journal.authorBySlug, { slug }, "journal.authorBySlug")
);

export const getAuthors = cache(() =>
  run(api.journal.authors, {}, "journal.authors")
);

export const getDocuments = cache(() =>
  run(api.journal.documents, {}, "journal.documents")
);

export const searchArticles = (
  term: string,
  categorySlug: string | undefined,
  limit: number
) =>
  run(
    api.journal.search,
    { term, categorySlug, limit },
    "journal.search"
  );

/* ------------------------------------------------------------------ écriture */

/** Mutations are only ever called from server actions and route handlers. */
export async function runMutation<
  Mutation extends FunctionReference<"mutation", "public">,
>(
  reference: Mutation,
  args: FunctionArgs<Mutation>,
  label: string
): Promise<FunctionReturnType<Mutation>> {
  if (!url) throw new ContentUnavailableError(label, new Error("URL absente"));
  try {
    return await new ConvexHttpClient(url).mutation(reference, args);
  } catch (error) {
    throw new ContentUnavailableError(label, error);
  }
}
