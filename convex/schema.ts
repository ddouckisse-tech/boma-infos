import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { agentKey } from "./model/agents";
import {
  articleFeature,
  articleOrigin,
  articleStatus,
  blockValidator,
  linkValidator,
  mediaVariantValidator,
  storedRenditionValidator,
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
    /**
     * Renditions uploaded from the back office, held in Convex file storage
     * (WebP, up to four widths). Absent for the pre-encoded demo library,
     * whose files live under `public/medias/`.
     */
    storage: v.optional(v.array(storedRenditionValidator)),
    uploadedAt: v.optional(v.number()),
    /** WordPress provenance and the unmodified uploaded source file. */
    wordpressId: v.optional(v.number()),
    originalStorageId: v.optional(v.id("_storage")),
    originalMimeType: v.optional(v.string()),
    originalBytes: v.optional(v.number()),
  })
    .index("by_key", ["key"])
    .index("by_wordpress_id", ["wordpressId"]),

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
    /** Stable source identity, used to safely resume the WordPress migration. */
    wordpressId: v.optional(v.number()),
    sourceUrl: v.optional(v.string()),
    sourceModifiedAt: v.optional(v.number()),
    sourceCategorySlugs: v.optional(v.array(v.string())),
  })
    .index("by_slug", ["slug"])
    .index("by_wordpress_id", ["wordpressId"])
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
    /** Migration provenance; inactive documents stay archived in the database. */
    wordpressId: v.optional(v.number()),
    sourceUrl: v.optional(v.string()),
    originalStorageId: v.optional(v.id("_storage")),
    isActive: v.optional(v.boolean()),
  })
    .index("by_slug", ["slug"])
    .index("by_wordpress_id", ["wordpressId"])
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

  /* -------------------------------------------------- lot 3 — chaîne privée */

  /**
   * Partner companies (CDC §4.4).
   *
   * The shape was declared at milestone 2; milestone 3 only *adds* optional
   * columns, so nothing had to be migrated. `approved` stays the gate: no
   * deposit is possible before an administrator has ticked it by hand.
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
    /* --- lot 3 --- */
    /** WhatsApp number; when present, every transition is also sent there. */
    whatsapp: v.optional(v.string()),
    /** `pending` until an administrator decides; `rejected` keeps the trace. */
    reviewState: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("suspended")
      )
    ),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
    reviewNote: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_approved", ["approved"])
    .index("by_state", ["reviewState", "createdAt"]),

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
    /* --- lot 3 --- */
    /** Set the first time the company hands the deposit over for review. */
    submittedAt: v.optional(v.number()),
    /** Mandatory when `status` is `rejected` (CDC §4.4 step 4). */
    rejectionReason: v.optional(v.string()),
    /** Pre-qualification card produced by agent 5 at submission time. */
    moderationRunId: v.optional(v.id("agentRuns")),
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
    /* --- lot 3 --- */
    /** Sections an Éditeur may publish in; empty means "all of them". */
    sectionSlugs: v.optional(v.array(v.string())),
    lastSeenAt: v.optional(v.number()),
    /**
     * Provisional access code, handed over by an administrator or the command
     * line. Since 12/09/2026 it no longer locks anything: the interface
     * reminds the holder to choose their own code, and the flag falls when
     * Better Auth reports the change (`convex/auth.ts`, hooks.after).
     */
    mustChangePassword: v.optional(v.boolean()),
    /** Last time the floating security reminder was closed. */
    reminderDismissedAt: v.optional(v.number()),
  })
    .index("by_subject", ["authSubject"])
    .index("by_email", ["email"])
    .index("by_role", ["roleSlug"])
    .index("by_organization", ["organizationId"]),

  /** The four roles of CDC §4.3, with their permission set. */
  roles: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    permissions: v.array(v.string()),
    /** 2FA is mandatory for Administrateur and Éditeur. */
    requiresTwoFactor: v.boolean(),
  }).index("by_slug", ["slug"]),

  /* ------------------------------------------------------------- agents IA */

  /**
   * One execution of one agent (CDC §4.6 — "journal complet des exécutions").
   *
   * A row is written *before* the model is called, so a crash leaves a trace
   * rather than a hole, and the monthly spend cap can be enforced on the way
   * in. `mode` records whether the answer came from the Claude API or from
   * the offline stand-in used when no key is configured — nothing in the
   * interface is allowed to pass a simulation off as a real suggestion.
   */
  agentRuns: defineTable({
    agentKey: agentKey,
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("blocked")
    ),
    mode: v.union(v.literal("live"), v.literal("simulated")),
    model: v.string(),
    targetType: v.union(
      v.literal("article"),
      v.literal("submission"),
      v.literal("media"),
      v.literal("newsletter")
    ),
    /** Stringified document id; kept loose so one table covers four targets. */
    targetId: v.string(),
    targetLabel: v.string(),
    /** What the agent was shown, trimmed — enough to audit a suggestion. */
    inputDigest: v.string(),
    /** Free-form summary the card shows above the individual suggestions. */
    summary: v.string(),
    /** Structured payload for agents whose output is not a list of edits. */
    payload: v.optional(v.string()),
    error: v.optional(v.string()),
    inputTokens: v.number(),
    outputTokens: v.number(),
    /** Millionths of a US dollar. Anthropic bills in USD; so do we. */
    costMicros: v.number(),
    /** `YYYY-MM`, so the monthly cap is one indexed read. */
    period: v.string(),
    triggeredBy: v.string(),
    createdAt: v.number(),
    finishedAt: v.optional(v.number()),
  })
    .index("by_created", ["createdAt"])
    .index("by_agent", ["agentKey", "createdAt"])
    .index("by_period", ["period"])
    .index("by_target", ["targetType", "targetId", "createdAt"]),

  /**
   * One acceptable/rejectable proposal (CDC §4.6 — "un agent propose, un
   * humain dispose").
   *
   * `fingerprint` is what makes "une suggestion rejetée n'est jamais
   * réappliquée" true rather than aspirational: it hashes target + field +
   * proposed value, and a rejected fingerprint is filtered out of every later
   * run on the same target.
   */
  agentSuggestions: defineTable({
    runId: v.id("agentRuns"),
    agentKey: agentKey,
    targetType: v.union(
      v.literal("article"),
      v.literal("submission"),
      v.literal("media"),
      v.literal("newsletter")
    ),
    targetId: v.string(),
    /** `title` | `dek` | `body` | `slug` | `alt` | `social.linkedin`… */
    field: v.string(),
    label: v.string(),
    rationale: v.string(),
    current: v.optional(v.string()),
    proposed: v.string(),
    fingerprint: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    decidedBy: v.optional(v.string()),
    decidedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_run", ["runId"])
    .index("by_target", ["targetType", "targetId", "status"])
    .index("by_fingerprint", ["targetType", "targetId", "fingerprint"]),

  /** Per-agent switch (CDC §4.6 — "désactivation individuelle"). */
  agentConfigs: defineTable({
    agentKey: agentKey,
    enabled: v.boolean(),
    model: v.string(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  }).index("by_key", ["agentKey"]),

  /* ---------------------------------------------------------- exploitation */

  /**
   * Singleton row holding what an administrator can change without a
   * developer (CDC §4.4 "Réglages"). One row, `key: "site"`.
   */
  settings: defineTable({
    key: v.string(),
    siteName: v.string(),
    tagline: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    social: v.array(linkValidator),
    newsletterSenderName: v.string(),
    newsletterDay: v.number(),
    /** Monthly agent spend cap, in millionths of a US dollar. */
    agentsMonthlyCapMicros: v.number(),
    /** Ratio of the cap at which the back office starts warning (0–1). */
    agentsAlertRatio: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  }).index("by_key", ["key"]),

  /** Administrable 301s, on top of the static plan of `lib/legacyRedirects`. */
  redirects: defineTable({
    from: v.string(),
    to: v.string(),
    permanent: v.boolean(),
    createdAt: v.number(),
    createdBy: v.optional(v.string()),
  }).index("by_from", ["from"]),

  /**
   * Timestamped audit trail of every sensitive action (CDC §4.3, §5.3).
   *
   * Append-only by construction: no function in `convex/` patches or deletes
   * a row here.
   */
  auditLog: defineTable({
    at: v.number(),
    actorSubject: v.string(),
    actorName: v.string(),
    actorRole: v.string(),
    /** `article.publish`, `user.role_change`, `organization.approve`… */
    action: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    summary: v.string(),
  })
    .index("by_at", ["at"])
    .index("by_action", ["action", "at"])
    .index("by_target", ["targetType", "targetId"]),

  /** Snapshot of an article before each save (CDC §4.4 "historique"). */
  articleVersions: defineTable({
    articleId: v.id("articles"),
    at: v.number(),
    authorSubject: v.string(),
    authorName: v.string(),
    label: v.string(),
    title: v.string(),
    dek: v.string(),
    body: v.array(blockValidator),
    status: articleStatus,
  }).index("by_article", ["articleId", "at"]),

  /**
   * Audience, measured on our own servers (CDC §4.4 point 6, §5.4).
   *
   * No third-party tracker, no cookie, no identifier: `proxy.ts` counts the
   * request as it passes, and the reading-time beacon adds a duration when
   * the tab is hidden. Nothing here can be traced back to a person.
   */
  articleStats: defineTable({
    slug: v.string(),
    views: v.number(),
    readingSeconds: v.number(),
    readingSamples: v.number(),
    shares: v.number(),
    sharesByChannel: v.array(
      v.object({ channel: v.string(), count: v.number() })
    ),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  /** Daily buckets, so the back office can draw a curve. */
  articleStatDays: defineTable({
    slug: v.string(),
    /** `YYYY-MM-DD`, UTC. */
    day: v.string(),
    views: v.number(),
  })
    .index("by_slug_day", ["slug", "day"])
    .index("by_day", ["day"]),

  /**
   * Outbox of the transition notifications (CDC §4.4: courriel + WhatsApp).
   *
   * No mail or WhatsApp provider is wired — the same honesty as the
   * newsletter at milestone 2. The message is composed, stored and shown in
   * the back office as `pending`; plugging a provider means draining this
   * table, not rewriting the workflow.
   */
  notifications: defineTable({
    channel: v.union(v.literal("email"), v.literal("whatsapp")),
    to: v.string(),
    subject: v.string(),
    body: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("skipped")
    ),
    submissionId: v.optional(v.id("submissions")),
    organizationId: v.optional(v.id("organizations")),
    createdAt: v.number(),
    sentAt: v.optional(v.number()),
  })
    .index("by_created", ["createdAt"])
    .index("by_status", ["status", "createdAt"]),

  /** Weekly newsletter drafts composed by agent 6, never sent automatically. */
  newsletterEditions: defineTable({
    /** ISO week, `2026-W37`. */
    week: v.string(),
    subject: v.string(),
    intro: v.string(),
    items: v.array(
      v.object({ slug: v.string(), title: v.string(), teaser: v.string() })
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("approved"),
      v.literal("sent")
    ),
    runId: v.optional(v.id("agentRuns")),
    createdAt: v.number(),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.string()),
  }).index("by_week", ["week"]),
});
