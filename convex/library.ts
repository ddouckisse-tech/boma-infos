import {
  paginationOptsValidator,
  paginationResultValidator,
  type PaginationOptions,
} from "convex/server";
import { v, type Infer } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalMutation,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { accessError, PERMISSIONS, requirePermission } from "./model/access";
import { recordAudit } from "./model/audit";
import {
  mediaVariantValidator,
  storedRenditionValidator,
} from "./model/content";
import {
  articlesUsing,
  countMissingAlt,
  MEDIA_INDEX_BUILD,
  mediaDerivedFields,
  mediaIndexReady,
  mediaKeysUsedBy,
  renditionUrlOf,
  resolveRenditions,
  searchTermsOf,
  syncArticleMedia,
  thumbUrlOf,
  USAGE_CAP,
} from "./model/media";

/**
 * Media library — CDC §4.4, and the client's request of 12/09/2026: an
 * administrator adds pictures from the screen.
 *
 * Two kinds of picture live side by side.
 *
 *  - The **demo library**, pre-encoded offline by `scripts/fetch-media.ts`
 *    in AVIF and WebP at four widths and served from `public/medias/`. That
 *    is what makes the performance budget of §5.4 computable at build time,
 *    and it does not change.
 *  - **Uploads** from the médiathèque: the browser encodes the picture in
 *    WebP at up to five widths (240, 320, 640, 960, 1280) and sends each file to
 *    Convex file storage; the row records the renditions and the journal
 *    resolves their URLs at render time. No image pipeline at request time,
 *    no native library on the server.
 *
 * The alternative text is mandatory (§3.5) before a picture is worth
 * placing; an upload starts without one and the screen says so until it is
 * written. Agent 4 proposes one — it never writes it.
 *
 * Since 19/09/2026 no screen receives the whole library: the médiathèque and
 * the picker read it page by page, searched and filtered by index
 * (`search_media`, `by_uploaded`, `by_alt_missing`), and a picture already
 * chosen is looked up by its key (`byKeys`). Each page costs the same
 * whatever the size of the library.
 */

const renditionShape = v.object({
  format: v.literal("webp"),
  w: v.number(),
  h: v.number(),
  bytes: v.number(),
  url: v.string(),
});

const mediaShape = v.object({
  _id: v.id("media"),
  key: v.string(),
  alt: v.string(),
  caption: v.string(),
  credit: v.string(),
  license: v.string(),
  source: v.string(),
  width: v.number(),
  height: v.number(),
  color: v.string(),
  variants: v.array(mediaVariantValidator),
  /**
   * Articles displaying the picture, up to `USAGE_CAP + 1`; `null` until
   * `reindex` has filled `mediaUsages` once.
   */
  usedBy: v.union(v.number(), v.null()),
  /** An advertising campaign, even paused, still shows it. */
  usedByCampaign: v.boolean(),
  pendingSuggestions: v.number(),
  /**
   * Small rendition for the grid, the only URL resolved per picture (see
   * `renditionUrlOf`); the demo library computes its own client-side.
   */
  thumbUrl: v.optional(v.string()),
  uploadedAt: v.optional(v.number()),
});

/** What a picker needs to show a picture — and the advertising preview to size it. */
const pickShape = v.object({
  key: v.string(),
  alt: v.string(),
  width: v.number(),
  height: v.number(),
  color: v.string(),
  variants: v.array(mediaVariantValidator),
  thumbUrl: v.optional(v.string()),
});

const filterValidator = v.union(
  v.literal("all"),
  v.literal("uploaded"),
  v.literal("missingAlt")
);
type LibraryFilter = Infer<typeof filterValidator>;

/** Most pictures served per page, whatever the client asks. */
const PAGE_MAX = 60;
/** Most keys looked up at once (`byKeys`). */
const KEYS_MAX = 50;

/**
 * Pagination options bounded on the server: a page never carries more than
 * `PAGE_MAX` pictures, and a page the client re-reads between two cursors
 * stops after twice that and asks to be split (`maximumRowsRead`) rather
 * than growing with every upload that lands in its range.
 */
function bounded(options: PaginationOptions): PaginationOptions {
  return {
    ...options,
    numItems: Math.max(1, Math.min(PAGE_MAX, Math.floor(options.numItems))),
    maximumRowsRead: PAGE_MAX * 2,
  };
}

/**
 * The pictures a screen asks for, in the order it shows them: the latest
 * additions first (demo library last), or by relevance when searching.
 */
function libraryQuery(
  ctx: QueryCtx,
  filter: LibraryFilter,
  term: string | undefined
) {
  const media = ctx.db.query("media");
  const terms = searchTermsOf(term);
  if (terms !== "") {
    const found = media.withSearchIndex("search_media", (q) =>
      filter === "missingAlt"
        ? q.search("searchText", terms).eq("altMissing", true)
        : q.search("searchText", terms)
    );
    return filter === "uploaded"
      ? found.filter((q) => q.neq(q.field("uploadedAt"), undefined))
      : found;
  }
  if (filter === "missingAlt") {
    return media
      .withIndex("by_alt_missing", (q) => q.eq("altMissing", true))
      .order("desc");
  }
  if (filter === "uploaded") {
    return media
      .withIndex("by_uploaded", (q) => q.gte("uploadedAt", 0))
      .order("desc");
  }
  return media.withIndex("by_uploaded").order("desc");
}

/** Both posters remain protected while referenced, including paused campaigns. */
async function campaignUsesMedia(ctx: QueryCtx, key: string): Promise<boolean> {
  const [primary, mobile] = await Promise.all([
    ctx.db.query("adCampaigns").withIndex("by_media", (q) => q.eq("mediaKey", key)).first(),
    ctx.db.query("adCampaigns").withIndex("by_mobile_media", (q) => q.eq("mobileMediaKey", key)).first(),
  ]);
  return primary !== null || mobile !== null;
}

/** One card of the médiathèque: a handful of indexed reads, whatever the library holds. */
async function libraryItem(
  ctx: QueryCtx,
  row: Doc<"media">,
  indexReady: boolean
): Promise<Infer<typeof mediaShape>> {
  const [thumbUrl, usedBy, pending, campaign] = await Promise.all([
    thumbUrlOf(ctx, row),
    indexReady ? articlesUsing(ctx, row.key) : null,
    ctx.db
      .query("agentSuggestions")
      .withIndex("by_target", (q) =>
        q
          .eq("targetType", "media")
          .eq("targetId", row._id)
          .eq("status", "pending")
      )
      .take(USAGE_CAP + 1),
    campaignUsesMedia(ctx, row.key),
  ]);
  return {
    _id: row._id,
    key: row.key,
    alt: row.alt,
    caption: row.caption,
    credit: row.credit,
    license: row.license,
    source: row.source,
    width: row.width,
    height: row.height,
    color: row.color,
    variants: row.variants,
    usedBy,
    usedByCampaign: campaign,
    pendingSuggestions: pending.length,
    thumbUrl,
    uploadedAt: row.uploadedAt,
  };
}

async function pickItem(
  ctx: QueryCtx,
  row: Doc<"media">
): Promise<Infer<typeof pickShape>> {
  return {
    key: row.key,
    alt: row.alt,
    width: row.width,
    height: row.height,
    color: row.color,
    variants: row.variants,
    thumbUrl: await thumbUrlOf(ctx, row),
  };
}

/**
 * One page of the médiathèque — « Toutes », « Ajoutées ici » (stored in
 * Convex, WordPress archive included) or « Sans texte alternatif », searched
 * on the key, the alternative text, the caption and the credit.
 */
export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    term: v.optional(v.string()),
    filter: v.optional(filterValidator),
  },
  returns: paginationResultValidator(mediaShape),
  handler: async (ctx, { paginationOpts, term, filter }) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const indexReady = await mediaIndexReady(ctx);
    const result = await libraryQuery(ctx, filter ?? "all", term).paginate(
      bounded(paginationOpts)
    );
    return {
      ...result,
      page: await Promise.all(
        result.page.map((row) => libraryItem(ctx, row, indexReady))
      ),
    };
  },
});

/** The picture open in the editing panel, wherever the grid has moved since. */
export const get = query({
  args: { id: v.id("media") },
  returns: v.union(mediaShape, v.null()),
  handler: async (ctx, { id }) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const row = await ctx.db.get(id);
    if (!row) return null;
    return await libraryItem(ctx, row, await mediaIndexReady(ctx));
  },
});

/**
 * The médiathèque's counters: pictures without alternative text (up to
 * `MISSING_ALT_CAP + 1`), and whether `reindex` has run — until then the
 * search, the filter and the usage are incomplete, and the screen says so.
 */
export const counts = query({
  args: {},
  returns: v.object({ missingAlt: v.number(), indexReady: v.boolean() }),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const [missingAlt, indexReady] = await Promise.all([
      countMissingAlt(ctx),
      mediaIndexReady(ctx),
    ]);
    return { missingAlt, indexReady };
  },
});

/** One page of the picture chooser (`MediaPicker`), searched like the médiathèque. */
export const pick = query({
  args: {
    paginationOpts: paginationOptsValidator,
    term: v.optional(v.string()),
  },
  returns: paginationResultValidator(pickShape),
  handler: async (ctx, { paginationOpts, term }) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const result = await libraryQuery(ctx, "all", term).paginate(
      bounded(paginationOpts)
    );
    return {
      ...result,
      page: await Promise.all(result.page.map((row) => pickItem(ctx, row))),
    };
  },
});

/**
 * Pictures already chosen — an article's, a campaign's — looked up by key
 * (`by_key`). Unknown keys are left out: the caller says what is missing.
 */
export const byKeys = query({
  args: { keys: v.array(v.string()) },
  returns: v.array(pickShape),
  handler: async (ctx, { keys }) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const wanted = [...new Set(keys.filter((key) => key !== ""))];
    if (wanted.length > KEYS_MAX) {
      throw new Error(`${KEYS_MAX} images au plus par recherche.`);
    }
    const rows = await Promise.all(
      wanted.map((key) =>
        ctx.db
          .query("media")
          .withIndex("by_key", (q) => q.eq("key", key))
          .unique()
      )
    );
    return await Promise.all(
      rows
        .filter((row): row is Doc<"media"> => row !== null)
        .map((row) => pickItem(ctx, row))
    );
  },
});

/**
 * The advertising preview's file: the rendition at least 640 px wide of
 * one picture, looked up for the picture on screen rather than for the
 * whole library (see `renditionUrlOf`). `null` for the demo library, whose
 * files the screen derives from the key.
 */
export const previewUrl = query({
  args: { key: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { key }) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const row = await ctx.db
      .query("media")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (!row) return null;
    return (await renditionUrlOf(ctx, row, 640)) ?? null;
  },
});

export const update = mutation({
  args: {
    id: v.id("media"),
    alt: v.string(),
    caption: v.string(),
    credit: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { id, alt, caption, credit }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.mediaWrite);
    const row = await ctx.db.get(id);
    if (!row) throw accessError("FORBIDDEN");
    const cleaned = alt.trim();
    if (cleaned === "") {
      // CDC §3.5 : « toute image porte un alt pertinent ». Le champ n'est
      // pas facultatif, l'agent ne fait que proposer.
      throw new Error("Le texte alternatif est obligatoire.");
    }
    const fields = {
      alt: cleaned,
      caption: caption.trim(),
      credit: credit.trim() || row.credit,
    };
    await ctx.db.patch(id, {
      ...fields,
      ...mediaDerivedFields({ key: row.key, ...fields }),
    });
    await recordAudit(ctx, viewer, "media.update", "media", id, row.key);
    return null;
  },
});

/* -------------------------------------------------------------------------
   Uploads
   ------------------------------------------------------------------------- */

/** One short-lived URL per file; the browser POSTs the WebP blob to it. */
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.mediaWrite);
    return await ctx.storage.generateUploadUrl();
  },
});

const KEY = /^[a-z0-9][a-z0-9-]{2,79}$/;

/**
 * Records an uploaded picture once every rendition is in storage. The key is
 * made unique here — two people can upload `conseil-des-ministres.jpg` the
 * same morning — and returned, since that is what an article references.
 */
export const createUploaded = mutation({
  args: {
    key: v.string(),
    alt: v.string(),
    caption: v.string(),
    credit: v.string(),
    width: v.number(),
    height: v.number(),
    color: v.string(),
    renditions: v.array(storedRenditionValidator),
  },
  returns: v.object({ id: v.id("media"), key: v.string() }),
  handler: async (ctx, args) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.mediaWrite);
    if (!KEY.test(args.key)) throw new Error("Clé de média invalide.");
    if (args.renditions.length === 0) {
      throw new Error("Aucune version de l'image n'a été reçue.");
    }
    if (!/^#[0-9a-f]{6}$/i.test(args.color)) {
      throw new Error("Couleur dominante invalide.");
    }

    let key = args.key;
    for (let attempt = 2; attempt < 100; attempt += 1) {
      const clash = await ctx.db
        .query("media")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();
      if (!clash) break;
      key = `${args.key}-${attempt}`;
    }

    const renditions = [...args.renditions].sort((a, b) => a.w - b.w);
    const text = {
      key,
      alt: args.alt.trim(),
      caption: args.caption.trim(),
      credit: args.credit.trim() || "BOMA Infos",
    };
    const id = await ctx.db.insert("media", {
      ...text,
      ...mediaDerivedFields(text),
      license: "Droits réservés",
      source: "upload",
      width: args.width,
      height: args.height,
      color: args.color.toLowerCase(),
      variants: renditions.map((r) => ({
        format: "webp" as const,
        w: r.w,
        h: r.h,
        bytes: r.bytes,
      })),
      storage: renditions,
      uploadedAt: Date.now(),
    });
    await recordAudit(ctx, viewer, "media.upload", "media", id, key);
    return { id, key };
  },
});

/**
 * Deletes an uploaded picture and its files. Refused while an article or a
 * campaign still displays it, and never offered for the demo library, whose
 * files are not in storage.
 */
export const remove = mutation({
  args: { id: v.id("media") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.mediaWrite);
    const row = await ctx.db.get(id);
    if (!row) throw accessError("FORBIDDEN");
    const campaign = await campaignUsesMedia(ctx, row.key);
    if (campaign) {
      throw new Error(
        "Cette image est encore utilisée par une campagne publicitaire, même inactive : remplacez son média avant de la supprimer."
      );
    }
    if (!row.storage || row.storage.length === 0) {
      throw new Error(
        "Cette photographie fait partie de la bibliothèque de démonstration : elle se retire depuis scripts/media-sources.ts."
      );
    }
    // Tant que `reindex` n'a pas rempli `mediaUsages`, les articles
    // antérieurs n'y figurent pas : on les relit plutôt que de risquer de
    // retirer l'image d'un article publié.
    const used = (await mediaIndexReady(ctx))
      ? await articlesUsing(ctx, row.key)
      : (mediaKeysUsedBy(await ctx.db.query("articles").collect()).get(
          row.key
        ) ?? 0);
    if (used > 0) {
      const count = used > USAGE_CAP ? `plus de ${USAGE_CAP}` : String(used);
      throw new Error(
        `Cette image est encore utilisée par ${count} article${used > 1 ? "s" : ""} : retirez-la d'abord.`
      );
    }
    for (const rendition of row.storage) {
      await ctx.storage.delete(rendition.storageId);
    }
    await ctx.db.delete(id);
    await recordAudit(ctx, viewer, "media.delete", "media", id, row.key);
    return null;
  },
});

/* -------------------------------------------------------------------------
   Derived indexes
   ------------------------------------------------------------------------- */

/** Rows per transaction of `reindex`, well under the per-execution limits. */
const REINDEX_BATCH = { media: 200, articles: 100, orphans: 200 } as const;
/** Bytes read per transaction, whatever the size of the articles met. */
const REINDEX_MAX_BYTES = 4 * 1024 * 1024;
/**
 * Pause between two batches. Chained without one, the batches wrote faster
 * than a deployment's 4 MiB per second (measured on 5,000 pictures) and had
 * to be retried; paced, they leave room for the site's own writes.
 */
const REINDEX_PAUSE_MS = 250;

/**
 * Rebuilds what the médiathèque derives from other tables, one bounded
 * batch per transaction, each batch scheduling the next:
 *
 *  1. `media` — `searchText` and `altMissing`, for rows written before
 *     19/09/2026 or by a writer that forgot them;
 *  2. `articles` — their `mediaUsages` rows (`syncArticleMedia`);
 *  3. `mediaUsages` — rows whose article no longer exists.
 *
 * The first complete pass writes `indexBuilds.media`; from then on usage is
 * read from `mediaUsages` alone. Run it once after deploying the 19/09/2026
 * schema (`bunx convex run library:reindex`); the nightly run (`crons.ts`)
 * repairs any drift. Every step is idempotent.
 */
export const reindex = internalMutation({
  args: {
    phase: v.optional(
      v.union(v.literal("media"), v.literal("articles"), v.literal("orphans"))
    ),
    cursor: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.null(),
  handler: async (ctx, { phase = "media", cursor = null }) => {
    const next = (args: {
      phase: "media" | "articles" | "orphans";
      cursor: string | null;
    }) =>
      ctx.scheduler.runAfter(REINDEX_PAUSE_MS, internal.library.reindex, args);

    if (phase === "media") {
      const batch = await ctx.db.query("media").paginate({
        cursor,
        numItems: REINDEX_BATCH.media,
        maximumBytesRead: REINDEX_MAX_BYTES,
      });
      for (const row of batch.page) {
        const derived = mediaDerivedFields(row);
        if (
          row.searchText !== derived.searchText ||
          row.altMissing !== derived.altMissing
        ) {
          await ctx.db.patch(row._id, derived);
        }
      }
      await next(
        batch.isDone
          ? { phase: "articles", cursor: null }
          : { phase: "media", cursor: batch.continueCursor }
      );
      return null;
    }

    if (phase === "articles") {
      const batch = await ctx.db.query("articles").paginate({
        cursor,
        numItems: REINDEX_BATCH.articles,
        maximumBytesRead: REINDEX_MAX_BYTES,
      });
      for (const article of batch.page) {
        await syncArticleMedia(ctx, article._id, article);
      }
      await next(
        batch.isDone
          ? { phase: "orphans", cursor: null }
          : { phase: "articles", cursor: batch.continueCursor }
      );
      return null;
    }

    const batch = await ctx.db.query("mediaUsages").paginate({
      cursor,
      numItems: REINDEX_BATCH.orphans,
      maximumBytesRead: REINDEX_MAX_BYTES,
    });
    const exists = new Map<string, boolean>();
    for (const row of batch.page) {
      let found = exists.get(row.articleId);
      if (found === undefined) {
        found = (await ctx.db.get(row.articleId)) !== null;
        exists.set(row.articleId, found);
      }
      if (!found) await ctx.db.delete(row._id);
    }
    if (!batch.isDone) {
      await next({ phase: "orphans", cursor: batch.continueCursor });
      return null;
    }
    const build = await ctx.db
      .query("indexBuilds")
      .withIndex("by_name", (q) => q.eq("name", MEDIA_INDEX_BUILD))
      .unique();
    if (build) {
      await ctx.db.patch(build._id, { completedAt: Date.now() });
    } else {
      await ctx.db.insert("indexBuilds", {
        name: MEDIA_INDEX_BUILD,
        completedAt: Date.now(),
      });
    }
    return null;
  },
});

/* -------------------------------------------------------------------------
   Public journal
   ------------------------------------------------------------------------- */

const publicAssetShape = v.object({
  key: v.string(),
  alt: v.string(),
  caption: v.string(),
  credit: v.string(),
  license: v.string(),
  source: v.string(),
  color: v.string(),
  width: v.number(),
  height: v.number(),
  renditions: v.array(renditionShape),
});

/**
 * Uploaded pictures displayed by **published** articles, with their URLs —
 * what the public journal needs to render them (`lib/media.ts`). Only those:
 * a picture attached to a draft is not public yet, and this query has no
 * session to check.
 */
export const publicAssets = query({
  args: { articleSlugs: v.optional(v.array(v.string())) },
  returns: v.array(publicAssetShape),
  handler: async (ctx, { articleSlugs }) => {
    if (articleSlugs && articleSlugs.length > 100) {
      throw new Error("Cent articles maximum par lot de médias.");
    }
    // A page needs its pictures, not every image in the WordPress archive.
    const published = articleSlugs
      ? (
          await Promise.all(
            [...new Set(articleSlugs)].map((slug) =>
              ctx.db
                .query("articles")
                .withIndex("by_slug", (q) => q.eq("slug", slug))
                .unique()
            )
          )
        ).filter(
          (row): row is Doc<"articles"> =>
            row !== null && row.status === "published"
        )
      : await ctx.db
          .query("articles")
          .withIndex("by_status_date", (q) => q.eq("status", "published"))
          .collect();
    const visible = mediaKeysUsedBy(published);
    const rows = await Promise.all(
      [...visible.keys()].map((key) =>
        ctx.db
          .query("media")
          .withIndex("by_key", (q) => q.eq("key", key))
          .unique()
      )
    );
    const uploaded = rows.filter(
      (row) => row !== null && row.storage && row.storage.length
    );

    const assets = [];
    for (const row of uploaded) {
      if (!row) continue;
      if (!visible.has(row.key)) continue;
      const renditions = await resolveRenditions(ctx, row);
      if (!renditions || renditions.length === 0) continue;
      assets.push({
        key: row.key,
        alt: row.alt,
        caption: row.caption,
        credit: row.credit,
        license: row.license,
        source: row.source,
        color: row.color,
        width: row.width,
        height: row.height,
        renditions,
      });
    }
    return assets;
  },
});
