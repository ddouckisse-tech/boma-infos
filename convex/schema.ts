import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  articleFeature,
  articleOrigin,
  articleStatus,
  blockValidator,
  linkValidator,
  mediaVariantValidator,
  seoValidator,
} from "./model/content";

/**
 * Application data model — CAHIER-DES-CHARGES.md §5.2.
 *
 * Milestone 2 fills in the editorial half (Article, Category, Author, Media)
 * plus the two public-facing side tables the journal needs (newsletter,
 * contact). `organizations`, `submissions`, `users` and `roles` are declared
 * here so milestone 3 inherits a stable shape, but nothing reads or writes
 * them yet.
 *
 * Authentication tables belong to the Better Auth component declared in
 * `convex/convex.config.ts`, not here.
 */
export default defineSchema({
  /* ---------------------------------------------------------------- éditorial */

  /**
   * Sections and sub-sections (CDC §4.1), administrable rather than hard-coded
   * in components: `parentSlug` empty means a top-level section.
   */
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    parentSlug: v.optional(v.string()),
    /** Accent token, restricted to the brand ramps of CDC §3.1. */
    accent: v.string(),
    order: v.number(),
    description: v.string(),
    isActive: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_parent", ["parentSlug", "order"]),

  authors: defineTable({
    name: v.string(),
    slug: v.string(),
    /** Job title shown in the byline ("Rédactrice en chef"…). */
    role: v.string(),
    bio: v.string(),
    portraitMediaKey: v.optional(v.string()),
    links: v.array(linkValidator),
  }).index("by_slug", ["slug"]),

  /**
   * Media library. The bytes live under `public/medias/` (see
   * `scripts/fetch-media.ts`); this table carries the editorial metadata a
   * press outlet is accountable for: alternative text, caption, credit and
   * licence.
   */
  media: defineTable({
    /** Manifest key = file stem under public/medias/. */
    key: v.string(),
    alt: v.string(),
    caption: v.string(),
    credit: v.string(),
    license: v.string(),
    source: v.string(),
    width: v.number(),
    height: v.number(),
    /** Dominant colour, painted while the picture loads (no layout shift). */
    color: v.string(),
    variants: v.array(mediaVariantValidator),
  }).index("by_key", ["key"]),

  articles: defineTable({
    title: v.string(),
    slug: v.string(),
    /** Chapô. */
    dek: v.string(),
    body: v.array(blockValidator),
    status: articleStatus,
    categorySlug: v.string(),
    subCategorySlug: v.optional(v.string()),
    authorSlug: v.string(),
    heroMediaKey: v.optional(v.string()),
    galleryMediaKeys: v.array(v.string()),
    /** « L'essentiel en 3 points » (CDC §4.2). */
    keyPoints: v.array(v.string()),
    seo: seoValidator,
    origin: articleOrigin,
    feature: articleFeature,
    readingMinutes: v.number(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    publishedAt: v.number(),
    updatedAt: v.number(),
    views: v.number(),
    /** Title + dek + body, flattened once so the search index stays cheap. */
    searchText: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_status_date", ["status", "publishedAt"])
    .index("by_category", ["status", "categorySlug", "publishedAt"])
    .index("by_subcategory", ["status", "subCategorySlug", "publishedAt"])
    .index("by_author", ["status", "authorSlug", "publishedAt"])
    .index("by_feature", ["status", "feature", "publishedAt"])
    .searchIndex("search_articles", {
      searchField: "searchText",
      filterFields: ["status", "categorySlug"],
    }),

  /** Docuthèque (CDC §4.2) — downloadable reference documents. */
  documents: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    /** Free-text family: « Réglementation », « Étude »… */
    kind: v.string(),
    fileUrl: v.string(),
    fileFormat: v.string(),
    fileBytes: v.number(),
    pages: v.optional(v.number()),
    publisher: v.string(),
    publishedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_date", ["publishedAt"]),

  /* ------------------------------------------------------------- newsletter */

  /**
   * Double opt-in (CDC §4.2): a row is created `pending` with a one-shot
   * token, and only a click on the confirmation link flips it to `confirmed`.
   * Unsubscribing is a single click on a token link — no account, no form.
   */
  newsletterSubscribers: defineTable({
    email: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("unsubscribed")
    ),
    confirmToken: v.string(),
    unsubscribeToken: v.string(),
    createdAt: v.number(),
    confirmedAt: v.optional(v.number()),
    unsubscribedAt: v.optional(v.number()),
    /** Kept so the newsroom can tell the footer form from the dedicated page. */
    source: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_confirm_token", ["confirmToken"])
    .index("by_unsubscribe_token", ["unsubscribeToken"]),

  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    organization: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
    consent: v.boolean(),
    createdAt: v.number(),
    handled: v.boolean(),
  }).index("by_date", ["createdAt"]),

  /* ------------------------------------------------- lot 3 — déclaré, inerte */

  /**
   * Partner companies (CDC §4.4). Declared now so milestone 3 does not have to
   * migrate published data; no function reads or writes this table yet.
   */
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    /** Numéro d'identification fiscale / RCCM gabonais. */
    taxId: v.optional(v.string()),
    registrationId: v.optional(v.string()),
    sector: v.string(),
    logoMediaKey: v.optional(v.string()),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    /** Validated by hand by an administrator before any deposit. */
    approved: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_approved", ["approved"]),

  /** Company deposits and their review history (CDC §4.4). */
  submissions: defineTable({
    organizationId: v.id("organizations"),
    title: v.string(),
    dek: v.string(),
    body: v.array(blockValidator),
    requestedCategorySlug: v.string(),
    requestedPublishAt: v.optional(v.number()),
    kind: v.union(
      v.literal("communique"),
      v.literal("nomination"),
      v.literal("resultats"),
      v.literal("evenement"),
      v.literal("publi_redactionnel")
    ),
    status: articleStatus,
    mediaKeys: v.array(v.string()),
    reviewNotes: v.array(
      v.object({
        authorSlug: v.string(),
        at: v.number(),
        status: articleStatus,
        comment: v.string(),
      })
    ),
    publishedArticleSlug: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId", "createdAt"])
    .index("by_status", ["status", "updatedAt"]),

  /**
   * Application-side profile of an account. Credentials, sessions and 2FA are
   * owned by Better Auth; this table only carries the editorial role and the
   * scope it applies to (CDC §4.3).
   */
  users: defineTable({
    /** Better Auth subject identifier. */
    authSubject: v.string(),
    displayName: v.string(),
    email: v.string(),
    roleSlug: v.string(),
    authorSlug: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_subject", ["authSubject"])
    .index("by_email", ["email"]),

  /** The four roles of CDC §4.3, with their permission set. */
  roles: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    permissions: v.array(v.string()),
    /** 2FA is mandatory for Administrateur and Éditeur. */
    requiresTwoFactor: v.boolean(),
  }).index("by_slug", ["slug"]),
});
