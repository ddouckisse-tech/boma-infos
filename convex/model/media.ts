import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Pictures uploaded from the back office (12/09/2026).
 *
 * The demo library is pre-encoded offline and served from `public/medias/`;
 * a picture added from the médiathèque lives in Convex file storage instead,
 * as WebP renditions the browser encoded before sending. These two helpers
 * turn the stored identifiers into signed URLs, for the grids, the pickers
 * and the public journal.
 */

export type ResolvedRendition = {
  format: "webp";
  w: number;
  h: number;
  bytes: number;
  url: string;
};

/** Renditions with a URL each, smallest first; `undefined` for the demo library. */
export async function resolveRenditions(
  ctx: QueryCtx,
  row: Doc<"media">
): Promise<ResolvedRendition[] | undefined> {
  if (!row.storage || row.storage.length === 0) return undefined;
  const resolved: ResolvedRendition[] = [];
  for (const rendition of row.storage) {
    const url = await ctx.storage.getUrl(rendition.storageId);
    if (url) {
      resolved.push({
        format: "webp",
        w: rendition.w,
        h: rendition.h,
        bytes: rendition.bytes,
        url,
      });
    }
  }
  return resolved.sort((a, b) => a.w - b.w);
}

/**
 * URL of ONE rendition — the smallest at least `minWidth` wide, else the
 * largest — for a single storage lookup; `undefined` for the demo library.
 *
 * Every `storage.getUrl` counts among the 4,096 reads a Convex query may
 * make. Resolving the five renditions of every picture to keep one crossed
 * that line in production on 19/09/2026, once the WordPress archive had
 * brought 1,297 pictures: the médiathèque, the article editor and the
 * advertising screen all failed. The other renditions are only tried when
 * the preferred file is gone, in the order `resolveRenditions` would have
 * picked them.
 */
export async function renditionUrlOf(
  ctx: Pick<QueryCtx, "storage">,
  row: Pick<Doc<"media">, "storage">,
  minWidth: number
): Promise<string | undefined> {
  if (!row.storage || row.storage.length === 0) return undefined;
  const bySize = [...row.storage].sort((a, b) => a.w - b.w);
  const candidates = [
    ...bySize.filter((rendition) => rendition.w >= minWidth),
    ...bySize.filter((rendition) => rendition.w < minWidth).reverse(),
  ];
  for (const rendition of candidates) {
    const url = await ctx.storage.getUrl(rendition.storageId);
    if (url) return url;
  }
  return undefined;
}

/** A small rendition for a grid or a picker; `undefined` when the file lives under `public/medias/`. */
export async function thumbUrlOf(
  ctx: QueryCtx,
  row: Doc<"media">
): Promise<string | undefined> {
  return await renditionUrlOf(ctx, row, 320);
}

/** Keys of the pictures ONE article displays: hero, gallery, image blocks, video posters. */
export function articleMediaKeys(
  article: Pick<Doc<"articles">, "heroMediaKey" | "galleryMediaKeys" | "body">
): Set<string> {
  const keys = new Set<string>();
  const add = (key?: string) => {
    if (key) keys.add(key);
  };
  add(article.heroMediaKey);
  for (const key of article.galleryMediaKeys) add(key);
  for (const block of article.body) {
    if (block.type === "image") add(block.mediaKey);
    if (block.type === "video") add(block.posterMediaKey);
  }
  return keys;
}

/** Keys of every picture a set of articles displays, with how many articles show each. */
export function mediaKeysUsedBy(
  articles: readonly Doc<"articles">[]
): Map<string, number> {
  const usage = new Map<string, number>();
  for (const article of articles) {
    for (const key of articleMediaKeys(article)) {
      usage.set(key, (usage.get(key) ?? 0) + 1);
    }
  }
  return usage;
}

/* -------------------------------------------------------------------------
   Médiathèque at any size (19/09/2026)

   The screens used to load the whole photothèque and the whole `articles`
   table, then sort, search and count in the browser: one read per stored
   picture, 6.7 MB of articles per call. Since the WordPress archive, that
   ran into Convex's per-execution limits (4,096 reads, 16 MiB). What they
   show is now read page by page through indexes, and what they count is
   bounded — whatever the size of the library.
   ------------------------------------------------------------------------- */

/** Lower case, no accents, words separated by one space — for `search_media`. */
export function foldForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Longest indexed text per picture — a caption is shorter in practice. */
const SEARCH_TEXT_MAX = 2000;
/** Most terms a Convex text search accepts. */
const SEARCH_TERMS_MAX = 16;

/**
 * Fields derived from a picture's metadata, which every writer of the
 * `media` table stores with it (`library.reindex` repairs the others): the
 * folded text of `search_media` — key, alternative text, caption, credit —
 * and the flag behind « Sans texte alternatif ».
 */
export function mediaDerivedFields(
  row: Pick<Doc<"media">, "key" | "alt" | "caption" | "credit">
): { searchText: string; altMissing: boolean } {
  return {
    searchText: foldForSearch(
      `${row.key} ${row.alt} ${row.caption} ${row.credit}`
    ).slice(0, SEARCH_TEXT_MAX),
    altMissing: row.alt.trim() === "",
  };
}

/** A typed search folded like the index; `""` when nothing is left to search. */
export function searchTermsOf(term: string | undefined): string {
  return foldForSearch(term ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, SEARCH_TERMS_MAX)
    .join(" ");
}

/**
 * Rewrites the `mediaUsages` rows of one article from what it displays
 * now. Call it after every write that can change an article's pictures —
 * insert, patch of the hero, gallery or body, delete. Idempotent: a deleted
 * article loses its rows, a duplicate row is dropped. Pass the document when
 * it is already in hand; otherwise it is read.
 */
export async function syncArticleMedia(
  ctx: MutationCtx,
  articleId: Id<"articles">,
  article?: Doc<"articles"> | null
): Promise<void> {
  const current = article === undefined ? await ctx.db.get(articleId) : article;
  const wanted = current ? articleMediaKeys(current) : new Set<string>();
  const rows = await ctx.db
    .query("mediaUsages")
    .withIndex("by_article", (q) => q.eq("articleId", articleId))
    .collect();
  const kept = new Set<string>();
  for (const row of rows) {
    if (wanted.has(row.mediaKey) && !kept.has(row.mediaKey)) {
      kept.add(row.mediaKey);
    } else {
      await ctx.db.delete(row._id);
    }
  }
  for (const key of wanted) {
    if (!kept.has(key)) {
      await ctx.db.insert("mediaUsages", { mediaKey: key, articleId });
    }
  }
}

/** Past this many articles, a picture's usage reads « 99+ » and no further. */
export const USAGE_CAP = 99;

/** Articles displaying a picture, counted up to `USAGE_CAP + 1`. */
export async function articlesUsing(
  ctx: QueryCtx,
  key: string
): Promise<number> {
  const rows = await ctx.db
    .query("mediaUsages")
    .withIndex("by_media", (q) => q.eq("mediaKey", key))
    .take(USAGE_CAP + 1);
  return rows.length;
}

/** Past this many pictures, the counters read « 999+ » and no further. */
export const MISSING_ALT_CAP = 999;

/** Pictures still without alternative text, counted up to `MISSING_ALT_CAP + 1`. */
export async function countMissingAlt(ctx: QueryCtx): Promise<number> {
  const rows = await ctx.db
    .query("media")
    .withIndex("by_alt_missing", (q) => q.eq("altMissing", true))
    .take(MISSING_ALT_CAP + 1);
  return rows.length;
}

/** Row of `indexBuilds` written once `library.reindex` has run through. */
export const MEDIA_INDEX_BUILD = "media";

/**
 * Whether `library.reindex` has completed a full pass. Until then the rows
 * written before 19/09/2026 are missing from `mediaUsages`: usage is not
 * shown, and deleting a picture checks the articles themselves.
 */
export async function mediaIndexReady(ctx: QueryCtx): Promise<boolean> {
  const build = await ctx.db
    .query("indexBuilds")
    .withIndex("by_name", (q) => q.eq("name", MEDIA_INDEX_BUILD))
    .unique();
  return build !== null;
}
