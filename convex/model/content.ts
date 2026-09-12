/**
 * Editorial content model — CAHIER-DES-CHARGES.md §5.2.
 *
 * Single source of truth for the shapes shared by the Convex functions and
 * the Next.js pages. Convex validators (`v.*`) and the TypeScript types are
 * declared side by side so a drift is a compile error, not a runtime surprise.
 *
 * Body is a list of typed blocks rather than an HTML string: the newsroom gets
 * a predictable rendering, the pages get no `dangerouslySetInnerHTML`, and the
 * milestone-3 editor has a schema to write against.
 */

import { v, type Infer } from "convex/values";

/* -------------------------------------------------------------------------
   Blocks
   ------------------------------------------------------------------------- */

/**
 * Inline markup allowed inside a paragraph, deliberately minimal:
 * `**gras**`, `*italique*`, `[libellé](/lien)`. Parsed at render time by
 * `components/custom/rich-text.tsx`.
 */
export const paragraphBlock = v.object({
  type: v.literal("paragraph"),
  text: v.string(),
});

export const headingBlock = v.object({
  type: v.literal("heading"),
  /** 2 or 3 only: the page already owns its single <h1> (CDC §3.5). */
  level: v.union(v.literal(2), v.literal(3)),
  text: v.string(),
});

export const listBlock = v.object({
  type: v.literal("list"),
  ordered: v.boolean(),
  items: v.array(v.string()),
});

export const quoteBlock = v.object({
  type: v.literal("quote"),
  text: v.string(),
  attribution: v.optional(v.string()),
});

export const imageBlock = v.object({
  type: v.literal("image"),
  /** Key into the photographic manifest (`convex/mediaManifest.ts`). */
  mediaKey: v.string(),
  caption: v.optional(v.string()),
});

/** A single economic figure, pulled out of the flow. */
export const statBlock = v.object({
  type: v.literal("stat"),
  value: v.string(),
  label: v.string(),
  source: v.optional(v.string()),
});

/**
 * Heavy media. Never preloaded, and replaced by a clickable placeholder when
 * the reader has data saver on (CDC §2.2).
 */
export const videoBlock = v.object({
  type: v.literal("video"),
  title: v.string(),
  posterMediaKey: v.string(),
  src: v.string(),
  durationLabel: v.optional(v.string()),
});

export const blockValidator = v.union(
  paragraphBlock,
  headingBlock,
  listBlock,
  quoteBlock,
  imageBlock,
  statBlock,
  videoBlock
);

export type Block = Infer<typeof blockValidator>;

/* -------------------------------------------------------------------------
   Scalars
   ------------------------------------------------------------------------- */

/** Editorial workflow (CDC §4.4). Only `published` is public in milestone 2. */
export const articleStatus = v.union(
  v.literal("draft"),
  v.literal("submitted"),
  v.literal("in_review"),
  v.literal("changes_requested"),
  v.literal("scheduled"),
  v.literal("published"),
  v.literal("rejected")
);

/**
 * Where the piece comes from. `partenaire` forces the visible, unavoidable
 * "Communiqué / Contenu partenaire" mention required by CDC §4.4.
 */
export const articleOrigin = v.union(
  v.literal("redaction"),
  v.literal("partenaire")
);

/** Home-page placement, chosen by the newsroom rather than by recency alone. */
export const articleFeature = v.union(
  v.literal("lead"),
  v.literal("top"),
  v.literal("dossier"),
  v.literal("none")
);

export const seoValidator = v.object({
  /** Overrides the headline in <title> when the headline is too long. */
  title: v.optional(v.string()),
  description: v.string(),
  keywords: v.array(v.string()),
});

export const linkValidator = v.object({
  label: v.string(),
  url: v.string(),
});

export const mediaVariantValidator = v.object({
  format: v.union(v.literal("avif"), v.literal("webp")),
  w: v.number(),
  h: v.number(),
  bytes: v.number(),
});

/**
 * A rendition uploaded from the back office and held in Convex file storage.
 * WebP only: the browser encodes it before sending, and browsers do not
 * write AVIF.
 */
export const storedRenditionValidator = v.object({
  format: v.literal("webp"),
  w: v.number(),
  h: v.number(),
  bytes: v.number(),
  storageId: v.id("_storage"),
});

/* -------------------------------------------------------------------------
   Public read shapes
   ------------------------------------------------------------------------- */

export type ArticleSummary = {
  slug: string;
  title: string;
  dek: string;
  categorySlug: string;
  categoryName: string;
  categoryAccent: string;
  subCategorySlug?: string;
  subCategoryName?: string;
  authorSlug: string;
  authorName: string;
  heroMediaKey?: string;
  publishedAt: number;
  readingMinutes: number;
  origin: "redaction" | "partenaire";
  feature: "lead" | "top" | "dossier" | "none";
  views: number;
};

export type ArticleDetail = ArticleSummary & {
  body: Block[];
  keyPoints: string[];
  galleryMediaKeys: string[];
  seo: { title?: string; description: string; keywords: string[] };
  updatedAt: number;
  authorRole: string;
  authorBio: string;
  tags: string[];
};
