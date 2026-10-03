import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import {
  accessError,
  PERMISSIONS,
  requireOrganizationScope,
  requirePermission,
  requireViewer,
} from "./model/access";
import { insertArticle, patchArticle } from "./model/articleWrites";
import { queueNotification, recordAudit } from "./model/audit";
import { articleStatus, blockValidator } from "./model/content";
import { syncArticleMedia } from "./model/media";
import { plainText, readingMinutes, searchText, slugify } from "./model/text";

/**
 * Company portal and review workflow — CDC §4.4, the heart of the brief.
 *
 * ## Compartmentalisation
 *
 * Every company-facing function resolves its scope through
 * `requireOrganizationScope`, which reads the organisation **from the
 * session**. A company account cannot widen its scope by passing another
 * identifier: the argument is compared to its own and refused, with the same
 * `FORBIDDEN` a non-existent row would produce, so the API is not an oracle
 * for "does submission X exist".
 *
 * ## The mention
 *
 * A deposit published from here becomes an article with
 * `origin: "partenaire"`. That field is set by this module and is not part
 * of any form the company fills in — the "Communiqué / Contenu partenaire"
 * badge of §4.4 therefore cannot be turned off from the portal. It is a
 * deontological requirement, not a display option.
 */

const KINDS = {
  communique: "Communiqué",
  nomination: "Nomination",
  resultats: "Résultats",
  evenement: "Événement",
  publi_redactionnel: "Publi-rédactionnel",
} as const;

const submissionKind = v.union(
  v.literal("communique"),
  v.literal("nomination"),
  v.literal("resultats"),
  v.literal("evenement"),
  v.literal("publi_redactionnel")
);

const summaryShape = v.object({
  _id: v.id("submissions"),
  title: v.string(),
  dek: v.string(),
  kind: v.string(),
  kindLabel: v.string(),
  status: articleStatus,
  requestedCategorySlug: v.string(),
  requestedPublishAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  submittedAt: v.optional(v.number()),
  organizationId: v.id("organizations"),
  organizationName: v.string(),
  publishedArticleSlug: v.optional(v.string()),
  rejectionReason: v.optional(v.string()),
  lastComment: v.optional(v.string()),
  hasModerationCard: v.boolean(),
});

const detailShape = v.object({
  _id: v.id("submissions"),
  organizationId: v.id("organizations"),
  organizationName: v.string(),
  organizationSector: v.string(),
  organizationContact: v.string(),
  title: v.string(),
  dek: v.string(),
  body: v.array(blockValidator),
  kind: v.string(),
  kindLabel: v.string(),
  status: articleStatus,
  requestedCategorySlug: v.string(),
  requestedPublishAt: v.optional(v.number()),
  mediaKeys: v.array(v.string()),
  reviewNotes: v.array(
    v.object({
      authorSlug: v.string(),
      at: v.number(),
      status: articleStatus,
      comment: v.string(),
    })
  ),
  rejectionReason: v.optional(v.string()),
  publishedArticleSlug: v.optional(v.string()),
  moderationRunId: v.optional(v.id("agentRuns")),
  createdAt: v.number(),
  updatedAt: v.number(),
  submittedAt: v.optional(v.number()),
  editable: v.boolean(),
});

const toSummary = (
  row: Doc<"submissions">,
  organizationName: string,
  hasCard: boolean
) => ({
  _id: row._id,
  title: row.title,
  dek: row.dek,
  kind: row.kind,
  kindLabel: KINDS[row.kind],
  status: row.status,
  requestedCategorySlug: row.requestedCategorySlug,
  requestedPublishAt: row.requestedPublishAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  submittedAt: row.submittedAt,
  organizationId: row.organizationId,
  organizationName,
  publishedArticleSlug: row.publishedArticleSlug,
  rejectionReason: row.rejectionReason,
  lastComment: row.reviewNotes.at(-1)?.comment,
  hasModerationCard: hasCard,
});

/** A company may still edit a deposit in these two states, and no other. */
const EDITABLE = new Set(["draft", "changes_requested"]);

/* -------------------------------------------------------------------------
   Company side
   ------------------------------------------------------------------------- */

export const myOrganization = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("organizations"),
      name: v.string(),
      slug: v.string(),
      sector: v.string(),
      taxId: v.optional(v.string()),
      registrationId: v.optional(v.string()),
      contactName: v.string(),
      contactEmail: v.string(),
      contactPhone: v.optional(v.string()),
      whatsapp: v.optional(v.string()),
      approved: v.boolean(),
      reviewState: v.string(),
      reviewNote: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const viewer = await requireViewer(ctx);
    if (!viewer.profile.organizationId) return null;
    const row = await ctx.db.get(viewer.profile.organizationId);
    if (!row) return null;
    return {
      _id: row._id,
      name: row.name,
      slug: row.slug,
      sector: row.sector,
      taxId: row.taxId,
      registrationId: row.registrationId,
      contactName: row.contactName,
      contactEmail: row.contactEmail,
      contactPhone: row.contactPhone,
      whatsapp: row.whatsapp,
      approved: row.approved,
      reviewState: row.reviewState ?? (row.approved ? "approved" : "pending"),
      reviewNote: row.reviewNote,
    };
  },
});

export const mySubmissions = query({
  args: {},
  returns: v.array(summaryShape),
  handler: async (ctx) => {
    const { organizationId } = await requireOrganizationScope(ctx);
    const organization = await ctx.db.get(organizationId);
    const rows = await ctx.db
      .query("submissions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId)
      )
      .order("desc")
      .collect();
    return rows.map((row) =>
      toSummary(row, organization?.name ?? "", Boolean(row.moderationRunId))
    );
  },
});

/**
 * One deposit.
 *
 * Loads the row **then** compares its `organizationId` to the scope. A
 * company asking for someone else's identifier gets `FORBIDDEN`, exactly
 * like one asking for an identifier that does not exist.
 */
export const submission = query({
  args: { id: v.id("submissions") },
  returns: v.union(detailShape, v.null()),
  handler: async (ctx, { id }) => {
    const viewer = await requireViewer(ctx);
    const row = await ctx.db.get(id);
    if (!row) throw accessError("FORBIDDEN");

    const newsroom = viewer.role.permissions.includes(
      PERMISSIONS.submissionsReview
    );
    if (newsroom) {
      if (viewer.role.requiresTwoFactor && !viewer.twoFactorEnabled) {
        throw accessError("TWO_FACTOR_REQUIRED");
      }
    } else {
      const { organizationId } = await requireOrganizationScope(ctx);
      if (row.organizationId !== organizationId) throw accessError("FORBIDDEN");
    }

    const organization = await ctx.db.get(row.organizationId);
    return {
      _id: row._id,
      organizationId: row.organizationId,
      organizationName: organization?.name ?? "—",
      organizationSector: organization?.sector ?? "—",
      organizationContact: organization
        ? `${organization.contactName} · ${organization.contactEmail}`
        : "—",
      title: row.title,
      dek: row.dek,
      body: row.body,
      kind: row.kind,
      kindLabel: KINDS[row.kind],
      status: row.status,
      requestedCategorySlug: row.requestedCategorySlug,
      requestedPublishAt: row.requestedPublishAt,
      mediaKeys: row.mediaKeys,
      reviewNotes: row.reviewNotes,
      rejectionReason: row.rejectionReason,
      publishedArticleSlug: row.publishedArticleSlug,
      moderationRunId: row.moderationRunId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      submittedAt: row.submittedAt,
      editable: !newsroom && EDITABLE.has(row.status),
    };
  },
});

export const saveDraft = mutation({
  args: {
    id: v.optional(v.id("submissions")),
    title: v.string(),
    dek: v.string(),
    body: v.array(blockValidator),
    kind: submissionKind,
    requestedCategorySlug: v.string(),
    requestedPublishAt: v.optional(v.number()),
    mediaKeys: v.array(v.string()),
  },
  returns: v.id("submissions"),
  handler: async (ctx, args) => {
    const { organizationId } = await requireOrganizationScope(ctx);
    const now = Date.now();

    if (args.id) {
      const row = await ctx.db.get(args.id);
      if (!row || row.organizationId !== organizationId) {
        throw accessError("FORBIDDEN");
      }
      if (!EDITABLE.has(row.status)) {
        throw new Error(
          "Ce dépôt est en cours d'examen par la rédaction : il n'est plus modifiable."
        );
      }
      await ctx.db.patch(args.id, {
        title: args.title.trim(),
        dek: args.dek.trim(),
        body: args.body,
        kind: args.kind,
        requestedCategorySlug: args.requestedCategorySlug,
        requestedPublishAt: args.requestedPublishAt,
        mediaKeys: args.mediaKeys,
        updatedAt: now,
      });
      return args.id;
    }

    return await ctx.db.insert("submissions", {
      organizationId,
      title: args.title.trim() || "Dépôt sans titre",
      dek: args.dek.trim(),
      body: args.body,
      kind: args.kind,
      requestedCategorySlug: args.requestedCategorySlug,
      requestedPublishAt: args.requestedPublishAt,
      status: "draft",
      mediaKeys: args.mediaKeys,
      reviewNotes: [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Hands the deposit over — CDC §4.4 step 3.
 *
 * The moderation agent is scheduled, never awaited: a company must not wait
 * on a model call, and the newsroom must be able to review the deposit even
 * if the agent is disabled, out of budget, or unreachable. The card is a
 * bonus, not a gate.
 */
export const submitForReview = mutation({
  args: { id: v.id("submissions") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const { organizationId, viewer } = await requireOrganizationScope(ctx);
    const row = await ctx.db.get(id);
    if (!row || row.organizationId !== organizationId) {
      throw accessError("FORBIDDEN");
    }
    if (!EDITABLE.has(row.status)) {
      throw new Error("Ce dépôt a déjà été transmis.");
    }
    if (row.title.trim().length < 8) {
      throw new Error("Le titre est trop court.");
    }
    if (plainText(row.body).trim().length < 200) {
      throw new Error(
        "Le corps du dépôt doit compter au moins deux cents caractères."
      );
    }

    const now = Date.now();
    const resubmission = row.status === "changes_requested";
    await ctx.db.patch(id, {
      status: "submitted",
      submittedAt: row.submittedAt ?? now,
      updatedAt: now,
      reviewNotes: [
        ...row.reviewNotes,
        {
          authorSlug: viewer.name,
          at: now,
          status: "submitted" as const,
          comment: resubmission
            ? "Dépôt re-soumis après modifications."
            : "Dépôt transmis à la rédaction.",
        },
      ],
    });

    const organization = await ctx.db.get(organizationId);
    await queueNotification(ctx, {
      email: organization?.contactEmail ?? viewer.email,
      whatsapp: organization?.whatsapp,
      subject: `BOMA Infos — dépôt reçu : ${row.title}`,
      body:
        `Bonjour,\n\nVotre dépôt « ${row.title} » est bien arrivé à la ` +
        `rédaction${resubmission ? " après vos modifications" : ""}. ` +
        `Vous serez prévenu à chaque étape de son examen.\n\n` +
        `La rédaction de BOMA Infos`,
      submissionId: id,
      organizationId,
    });

    // Ordonnanceur Convex : la fiche de pré-qualification se fabrique après
    // la réponse, pas pendant (§4.6).
    await ctx.scheduler.runAfter(0, internal.agentRuntime.moderateSubmission, {
      submissionId: id,
    });
    return null;
  },
});

/* -------------------------------------------------------------------------
   Newsroom side
   ------------------------------------------------------------------------- */

export const queue = query({
  args: { status: v.optional(v.string()) },
  returns: v.array(summaryShape),
  handler: async (ctx, { status }) => {
    await requirePermission(ctx, PERMISSIONS.submissionsReview);
    const rows = await ctx.db.query("submissions").collect();
    const organizations = new Map(
      (await ctx.db.query("organizations").collect()).map((o) => [o._id, o])
    );
    return rows
      .filter((row) => !status || row.status === status)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((row) =>
        toSummary(
          row,
          organizations.get(row.organizationId)?.name ?? "—",
          Boolean(row.moderationRunId)
        )
      );
  },
});

export const startReview = mutation({
  args: { id: v.id("submissions") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.submissionsReview);
    const row = await ctx.db.get(id);
    if (!row) throw accessError("FORBIDDEN");
    if (row.status !== "submitted") return null;
    const now = Date.now();
    await ctx.db.patch(id, {
      status: "in_review",
      updatedAt: now,
      reviewNotes: [
        ...row.reviewNotes,
        {
          authorSlug: viewer.name,
          at: now,
          status: "in_review" as const,
          comment: "Prise en charge par la rédaction.",
        },
      ],
    });
    await recordAudit(
      ctx,
      viewer,
      "submission.review",
      "submission",
      id,
      `${row.title} → en revue`
    );
    return null;
  },
});

export const requestChanges = mutation({
  args: { id: v.id("submissions"), comment: v.string() },
  returns: v.null(),
  handler: async (ctx, { id, comment }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.submissionsReview);
    const text = comment.trim();
    if (text.length < 10) {
      throw new Error(
        "Précisez ce que l'entreprise doit modifier (dix caractères au moins)."
      );
    }
    const row = await ctx.db.get(id);
    if (!row) throw accessError("FORBIDDEN");

    const now = Date.now();
    await ctx.db.patch(id, {
      status: "changes_requested",
      updatedAt: now,
      reviewNotes: [
        ...row.reviewNotes,
        {
          authorSlug: viewer.name,
          at: now,
          status: "changes_requested" as const,
          comment: text,
        },
      ],
    });

    const organization = await ctx.db.get(row.organizationId);
    await queueNotification(ctx, {
      email: organization?.contactEmail ?? "",
      whatsapp: organization?.whatsapp,
      subject: `BOMA Infos — modifications demandées : ${row.title}`,
      body:
        `Bonjour,\n\nLa rédaction a examiné « ${row.title} » et demande des ` +
        `modifications avant publication :\n\n${text}\n\n` +
        `Votre dépôt est à nouveau modifiable dans votre espace.\n\n` +
        `La rédaction de BOMA Infos`,
      submissionId: id,
      organizationId: row.organizationId,
    });

    await recordAudit(
      ctx,
      viewer,
      "submission.review",
      "submission",
      id,
      `${row.title} → modifications demandées`
    );
    return null;
  },
});

export const reject = mutation({
  args: { id: v.id("submissions"), reason: v.string() },
  returns: v.null(),
  handler: async (ctx, { id, reason }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.submissionsReview);
    const text = reason.trim();
    // CDC §4.4 : « refuser (motif obligatoire) ». Obligatoire, donc refusé
    // côté serveur si absent — pas seulement marqué `required` dans le HTML.
    if (text.length < 10) {
      throw new Error(
        "Le motif de refus est obligatoire (dix caractères au moins)."
      );
    }
    const row = await ctx.db.get(id);
    if (!row) throw accessError("FORBIDDEN");

    const now = Date.now();
    await ctx.db.patch(id, {
      status: "rejected",
      rejectionReason: text,
      updatedAt: now,
      reviewNotes: [
        ...row.reviewNotes,
        {
          authorSlug: viewer.name,
          at: now,
          status: "rejected" as const,
          comment: text,
        },
      ],
    });

    const organization = await ctx.db.get(row.organizationId);
    await queueNotification(ctx, {
      email: organization?.contactEmail ?? "",
      whatsapp: organization?.whatsapp,
      subject: `BOMA Infos — dépôt non retenu : ${row.title}`,
      body:
        `Bonjour,\n\nLa rédaction n'a pas retenu « ${row.title} ».\n\n` +
        `Motif : ${text}\n\nLa rédaction de BOMA Infos`,
      submissionId: id,
      organizationId: row.organizationId,
    });

    await recordAudit(
      ctx,
      viewer,
      "submission.reject",
      "submission",
      id,
      `${row.title} — ${text}`
    );
    return null;
  },
});

/**
 * Accepts the deposit and turns it into an article — CDC §4.4 step 5.
 *
 * `origin: "partenaire"` is written here, by the newsroom's own mutation.
 * Nothing the company sends can change it, which is what makes the
 * "Communiqué / Contenu partenaire" mention non-negotiable.
 */
export const publishSubmission = mutation({
  args: {
    id: v.id("submissions"),
    categorySlug: v.string(),
    authorSlug: v.string(),
    heroMediaKey: v.optional(v.string()),
    publishAt: v.optional(v.number()),
    schedule: v.boolean(),
  },
  returns: v.object({ slug: v.string(), status: articleStatus }),
  handler: async (ctx, args) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.articlesPublish);
    const row = await ctx.db.get(args.id);
    if (!row) throw accessError("FORBIDDEN");
    if (row.status === "rejected") {
      throw new Error("Un dépôt refusé ne se publie pas : rouvrez-le d'abord.");
    }

    const now = Date.now();
    const publishedAt = args.publishAt ?? row.requestedPublishAt ?? now;
    const status = args.schedule
      ? ("scheduled" as const)
      : ("published" as const);

    let slug = row.publishedArticleSlug ?? slugify(row.title);
    let existing = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing && existing._id && !row.publishedArticleSlug) {
      slug = `${slug}-${String(now).slice(-4)}`;
      existing = null;
    }

    const tags = [KINDS[row.kind]];
    const common = {
      title: row.title,
      dek: row.dek,
      body: row.body,
      status,
      categorySlug: args.categorySlug,
      authorSlug: args.authorSlug,
      heroMediaKey: args.heroMediaKey || row.mediaKeys[0] || undefined,
      galleryMediaKeys: row.mediaKeys.slice(1),
      keyPoints: [] as string[],
      seo: {
        description: row.dek.slice(0, 160),
        keywords: tags,
      },
      // Non négociable : c'est la rédaction qui l'écrit, pas l'entreprise.
      origin: "partenaire" as const,
      feature: "none" as const,
      readingMinutes: readingMinutes(row.title, row.dek, row.body),
      tags,
      publishedAt,
      updatedAt: now,
      searchText: searchText(row.title, row.dek, tags, row.body),
    };

    let articleId: Id<"articles">;
    if (existing) {
      articleId = existing._id;
      await patchArticle(ctx, existing, common);
    } else {
      articleId = await insertArticle(ctx, {
        ...common,
        slug,
        createdAt: now,
        views: 0,
      });
    }
    await syncArticleMedia(ctx, articleId);

    await ctx.db.patch(args.id, {
      status,
      publishedArticleSlug: slug,
      updatedAt: now,
      reviewNotes: [
        ...row.reviewNotes,
        {
          authorSlug: viewer.name,
          at: now,
          status,
          comment: args.schedule
            ? `Programmé pour le ${new Date(publishedAt).toLocaleString("fr-FR")}.`
            : "Publié avec la mention « Contenu partenaire ».",
        },
      ],
    });

    const organization = await ctx.db.get(row.organizationId);
    await queueNotification(ctx, {
      email: organization?.contactEmail ?? "",
      whatsapp: organization?.whatsapp,
      subject: args.schedule
        ? `BOMA Infos — votre dépôt est programmé : ${row.title}`
        : `BOMA Infos — votre dépôt est publié : ${row.title}`,
      body: args.schedule
        ? `Bonjour,\n\n« ${row.title} » paraîtra le ` +
          `${new Date(publishedAt).toLocaleString("fr-FR")}.\n\n` +
          `La rédaction de BOMA Infos`
        : `Bonjour,\n\n« ${row.title} » est en ligne :\n` +
          `/article/${slug}\n\nIl porte la mention « Contenu partenaire », ` +
          `comme tout contenu d'origine entreprise. Les statistiques de ` +
          `diffusion apparaissent dans votre espace.\n\n` +
          `La rédaction de BOMA Infos`,
      submissionId: args.id,
      organizationId: row.organizationId,
    });

    await recordAudit(
      ctx,
      viewer,
      "submission.publish",
      "submission",
      args.id,
      `${row.title} → ${status} (/article/${slug})`
    );
    await recordAudit(
      ctx,
      viewer,
      args.schedule ? "article.schedule" : "article.publish",
      "article",
      articleId,
      `${row.title} — contenu partenaire`
    );

    if (!args.schedule) {
      await ctx.scheduler.runAfter(0, internal.agentRuntime.composeSocial, {
        articleId,
      });
    }
    return { slug, status };
  },
});

/** Reopens a refused deposit, so the company can rework it. */
export const reopen = mutation({
  args: { id: v.id("submissions") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.submissionsReview);
    const row = await ctx.db.get(id);
    if (!row) throw accessError("FORBIDDEN");
    const now = Date.now();
    await ctx.db.patch(id, {
      status: "changes_requested",
      rejectionReason: undefined,
      updatedAt: now,
      reviewNotes: [
        ...row.reviewNotes,
        {
          authorSlug: viewer.name,
          at: now,
          status: "changes_requested" as const,
          comment: "Dépôt rouvert par la rédaction.",
        },
      ],
    });
    await recordAudit(
      ctx,
      viewer,
      "submission.review",
      "submission",
      id,
      `${row.title} → rouvert`
    );
    return null;
  },
});
