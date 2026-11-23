import "server-only";
import { cache } from "react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";
import type { LocaleChoice } from "@/lib/preferences";
import {
  bundledArticleEnglish,
  bundledEnglishSearch,
  hasBundledEditorialEdition,
  withArticleEdition,
  withArticleSummaryEdition,
  withAuthorEdition,
} from "@/lib/content/article-editions";
import { registerMedia, type MediaAsset } from "@/lib/media";

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

/* ------------------------------------------------------------------ médias */

/**
 * Pictures uploaded from the back office (12/09/2026) are not in the static
 * manifest: their renditions live in Convex file storage. Before a page that
 * shows pictures renders, the ones published articles display are fetched
 * and registered with `lib/media.ts`, so `getMediaAsset` resolves them like
 * the demo library. Deduplicated per render pass by `cache()` and limited
 * to the articles displayed on the current page.
 */
export const hydrateUploadedMedia = cache(
  async (slugsJson: string): Promise<void> => {
    const articleSlugs = JSON.parse(slugsJson) as string[];
    const assets = await run(
      api.library.publicAssets,
      { articleSlugs },
      "library.publicAssets"
    );
    registerMedia(
      assets.map((asset): MediaAsset => ({
        id: asset.key,
        alt: asset.alt,
        caption: asset.caption,
        credit: asset.credit,
        license: asset.license,
        source: asset.source,
        color: asset.color,
        width: asset.width,
        height: asset.height,
        avif: [],
        webp: asset.renditions.map(({ w, h, bytes }) => ({ w, h, bytes })),
        urls: Object.fromEntries(
          asset.renditions.map((r) => [`webp-${r.w}`, r.url])
        ),
      }))
    );
  }
);

/** Resolve only images referenced by the articles this page actually renders. */
async function withMedia<T>(read: Promise<T>): Promise<T> {
  const result = await read;
  const slugs = new Set<string>();
  const visit = (value: unknown): void => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    const record = value as Record<string, unknown>;
    if (
      typeof record.slug === "string" &&
      typeof record.categorySlug === "string"
    ) {
      slugs.add(record.slug);
    }
    Object.values(record).forEach(visit);
  };
  visit(result);
  const ordered = [...slugs].sort();
  for (let offset = 0; offset < ordered.length; offset += 100) {
    await hydrateUploadedMedia(
      JSON.stringify(ordered.slice(offset, offset + 100))
    );
  }
  return result;
}

/* ------------------------------------------------------------------ lecture */

export const getNavigation = cache(() =>
  run(api.journal.navigation, {}, "journal.navigation")
);

export const getHomepage = cache(() =>
  withMedia(
    run(api.journal.homepage, {}, "journal.homepage").then((home) => ({
      ...home,
      lead: withArticleSummaryEdition(home.lead),
      dossier: withArticleSummaryEdition(home.dossier),
      top: home.top.map(withArticleSummaryEdition),
      latest: home.latest.map(withArticleSummaryEdition),
      bySection: home.bySection.map((section) => ({
        ...section,
        articles: section.articles.map(withArticleSummaryEdition),
      })),
      espacePro: home.espacePro.map(withArticleSummaryEdition),
    }))
  )
);

type SlugPage = FunctionReturnType<typeof api.journal.publishedSlugPage>;

const readArticleEdition = cache((slug: string) =>
  run(api.journal.article, { slug }, "journal.article").then(withArticleEdition)
);

/**
 * Every published slug, newest first — the sitemap. Read 200 at a time: one
 * call over the whole archive would reach the 16 Mio a Convex query may read.
 */
export const getPublishedSlugs = cache(async () => {
  const slugs: SlugPage["page"] = [];
  let cursor: string | null = null;
  for (;;) {
    const result: SlugPage = await run(
      api.journal.publishedSlugPage,
      { cursor, numItems: 200 },
      "journal.publishedSlugPage"
    );
    slugs.push(...result.page);
    if (result.isDone) break;
    cursor = result.continueCursor;
  }
  return Promise.all(
    slugs.map(async (item) => {
      if (item.hasEnglish || !hasBundledEditorialEdition(item.slug)) return item;
      const article = await readArticleEdition(item.slug);
      return article?.english ? { ...item, hasEnglish: true as const } : item;
    })
  );
});

/** The newest published slugs — what the build prerenders. */
export const getRecentSlugs = cache(async (count: number) => {
  const result = await run(
    api.journal.publishedSlugPage,
    { cursor: null, numItems: count },
    "journal.publishedSlugPage"
  );
  return result.page;
});

export const getLatest = cache((limit: number) =>
  withMedia(
    run(api.journal.latest, { limit }, "journal.latest").then((rows) =>
      rows.map(withArticleSummaryEdition)
    )
  )
);

export const getSectionPage = cache(
  (
    categorySlug: string,
    subCategorySlug: string | undefined,
    page: number,
    perPage: number,
    order: "recent" | "ancien"
  ) =>
    withMedia(
      run(
        api.journal.bySection,
        { categorySlug, subCategorySlug, page, perPage, order },
        "journal.bySection"
      ).then((section) => ({
        ...section,
        items: section.items.map(withArticleSummaryEdition),
      }))
    )
);

export const getSectionCounts = cache(() =>
  run(api.journal.sectionCounts, {}, "journal.sectionCounts")
);

export const getArticle = cache((slug: string) =>
  withMedia(readArticleEdition(slug))
);

export const getRelated = cache((slug: string, limit: number) =>
  withMedia(
    run(api.journal.related, { slug, limit }, "journal.related").then((rows) =>
      rows.map(withArticleSummaryEdition)
    )
  )
);

export const getAuthor = cache((slug: string) =>
  withMedia(
    run(api.journal.authorBySlug, { slug }, "journal.authorBySlug").then(
      (result) =>
        result && {
          ...result,
          author: withAuthorEdition(result.author),
          articles: result.articles.map(withArticleSummaryEdition),
        }
    )
  )
);

export const getAuthors = cache(() =>
  run(api.journal.authors, {}, "journal.authors").then((authors) =>
    authors.map(withAuthorEdition)
  )
);

export const getDocuments = cache(() =>
  run(api.journal.documents, {}, "journal.documents")
);

export async function searchArticles(
  term: string,
  categorySlug: string | undefined,
  limit: number,
  locale: LocaleChoice = "fr"
) {
  const args = { term, categorySlug, limit };
  const search = async () => {
    if (locale === "fr") return run(api.journal.search, args, "journal.search");
    try {
      return await run(
        api.journal.search,
        { ...args, locale },
        "journal.search"
      );
    } catch (error) {
      // The web edition can be deployed before the optional Convex index.
      if (
        !(error instanceof ContentUnavailableError) ||
        !/(extra field|unexpected property)[^\n]*locale/i.test(
          String(error.cause)
        )
      )
        throw error;
      return run(api.journal.search, args, "journal.search");
    }
  };

  return withMedia(
    (async () => {
      const matches = await search();
      if (locale === "fr" || term.trim().length < 2)
        return matches.map(withArticleSummaryEdition);
      const found = new Map(
        matches.map((article) => [article.slug, withArticleSummaryEdition(article)])
      );
      const missing = bundledEnglishSearch(term)
        .filter((slug) => !found.has(slug))
        .slice(0, limit);
      const bundled = await Promise.all(
        missing.map((slug) =>
          run(api.journal.article, { slug }, "journal.article")
        )
      );
      for (const article of bundled) {
        if (
          article &&
          (!categorySlug || article.categorySlug === categorySlug) &&
          bundledArticleEnglish(article)
        )
          found.set(article.slug, withArticleSummaryEdition(article));
      }
      return [...found.values()].slice(0, limit);
    })()
  );
}

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
