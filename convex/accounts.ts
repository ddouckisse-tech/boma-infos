import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { createAuth } from "./auth";
import type { ViewerSummary } from "./guard";
import {
  accessError,
  isRoleSlug,
  loadViewer,
  PERMISSIONS,
  requirePermission,
  requireViewer,
  ROLES,
  ROLE_LIST,
  roleOf,
} from "./model/access";
import {
  recordAnonymousAudit,
  recordAudit,
  queueNotification,
} from "./model/audit";

/**
 * Accounts, roles and company registration — CDC §4.3 and §4.4.
 *
 * Two rules shape this module:
 *
 *  - **No account enumeration.** `registerCompany` answers the same thing
 *    whether the address was known or not, and nothing here lists users to
 *    anyone but an administrator.
 *  - **Roles are checked here, not in a layout.** `setRole`, `setActive`,
 *    `approveOrganization` all start with `requirePermission`, so an Éditeur
 *    calling them straight from the CLI is refused exactly as in the UI.
 */

/* -------------------------------------------------------------------------
   Shapes
   ------------------------------------------------------------------------- */

const viewerShape = v.object({
  subject: v.string(),
  email: v.string(),
  name: v.string(),
  roleSlug: v.string(),
  roleName: v.string(),
  permissions: v.array(v.string()),
  twoFactorEnabled: v.boolean(),
  twoFactorRequired: v.boolean(),
  active: v.boolean(),
  home: v.string(),
  authorSlug: v.optional(v.string()),
  sectionSlugs: v.array(v.string()),
  organizationId: v.optional(v.id("organizations")),
  organizationName: v.optional(v.string()),
  organizationApproved: v.optional(v.boolean()),
});

const accountShape = v.object({
  _id: v.id("users"),
  subject: v.string(),
  displayName: v.string(),
  email: v.string(),
  roleSlug: v.string(),
  roleName: v.string(),
  authorSlug: v.optional(v.string()),
  sectionSlugs: v.array(v.string()),
  organizationId: v.optional(v.id("organizations")),
  organizationName: v.optional(v.string()),
  active: v.boolean(),
  createdAt: v.number(),
});

const organizationShape = v.object({
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
  createdAt: v.number(),
  submissionCount: v.number(),
});

/* -------------------------------------------------------------------------
   Who am I
   ------------------------------------------------------------------------- */

/**
 * The one query every private page starts with.
 *
 * Returns `null` rather than throwing when nobody is signed in: the layout
 * needs to redirect, not to crash.
 */
export const me = query({
  args: {},
  returns: v.union(viewerShape, v.null()),
  handler: async (ctx) => {
    const viewer = await loadViewer(ctx);
    if (!viewer) return null;

    const organization = viewer.profile.organizationId
      ? await ctx.db.get(viewer.profile.organizationId)
      : null;

    return {
      subject: viewer.subject,
      email: viewer.email,
      name: viewer.name,
      roleSlug: viewer.role.slug,
      roleName: viewer.role.name,
      permissions: [...viewer.role.permissions],
      twoFactorEnabled: viewer.twoFactorEnabled,
      twoFactorRequired: viewer.role.requiresTwoFactor,
      active: viewer.profile.active,
      home: viewer.role.home,
      authorSlug: viewer.profile.authorSlug,
      sectionSlugs: viewer.profile.sectionSlugs ?? [],
      organizationId: organization?._id,
      organizationName: organization?.name,
      organizationApproved: organization?.approved,
    };
  },
});

/** The four roles of §4.3, for the account form. */
export const roles = query({
  args: {},
  returns: v.array(
    v.object({
      slug: v.string(),
      name: v.string(),
      description: v.string(),
      requiresTwoFactor: v.boolean(),
      permissions: v.array(v.string()),
    })
  ),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.accountsManage);
    return ROLE_LIST.map((role) => ({
      slug: role.slug,
      name: role.name,
      description: role.description,
      requiresTwoFactor: role.requiresTwoFactor,
      permissions: [...role.permissions],
    }));
  },
});

/* -------------------------------------------------------------------------
   Directory — administrator only
   ------------------------------------------------------------------------- */

export const directory = query({
  args: {},
  returns: v.array(accountShape),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.accountsManage);
    const rows = await ctx.db.query("users").collect();
    const organizations = new Map(
      (await ctx.db.query("organizations").collect()).map((o) => [o._id, o])
    );
    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((row) => ({
        _id: row._id,
        subject: row.authSubject,
        displayName: row.displayName,
        email: row.email,
        roleSlug: row.roleSlug,
        roleName: roleOf(row.roleSlug).name,
        authorSlug: row.authorSlug,
        sectionSlugs: row.sectionSlugs ?? [],
        organizationId: row.organizationId,
        organizationName: row.organizationId
          ? organizations.get(row.organizationId)?.name
          : undefined,
        active: row.active,
        createdAt: row.createdAt,
      }));
  },
});

export const organizations = query({
  args: { state: v.optional(v.string()) },
  returns: v.array(organizationShape),
  handler: async (ctx, { state }) => {
    await requirePermission(ctx, PERMISSIONS.submissionsReview);
    const rows = await ctx.db.query("organizations").collect();
    const submissions = await ctx.db.query("submissions").collect();
    const counts = new Map<string, number>();
    for (const submission of submissions) {
      counts.set(
        submission.organizationId,
        (counts.get(submission.organizationId) ?? 0) + 1
      );
    }
    return rows
      .map((row) => ({
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
        createdAt: row.createdAt,
        submissionCount: counts.get(row._id) ?? 0,
      }))
      .filter((row) => !state || row.reviewState === state)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

/* -------------------------------------------------------------------------
   Mutations — administrator only
   ------------------------------------------------------------------------- */

export const setRole = mutation({
  args: {
    id: v.id("users"),
    roleSlug: v.string(),
    sectionSlugs: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, { id, roleSlug, sectionSlugs }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.accountsManage);
    if (!isRoleSlug(roleSlug)) throw accessError("FORBIDDEN");

    const target = await ctx.db.get(id);
    if (!target) throw accessError("FORBIDDEN");

    // Se retirer soi-même les droits d'administration ferme la porte de
    // l'intérieur : le dernier administrateur ne peut pas se rétrograder.
    if (
      target.authSubject === viewer.subject &&
      roleSlug !== "administrateur"
    ) {
      const admins = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("roleSlug", "administrateur"))
        .collect();
      if (admins.filter((a) => a.active).length <= 1) {
        throw new Error(
          "Vous êtes le dernier administrateur actif : nommez-en un autre avant de changer votre rôle."
        );
      }
    }

    const previous = roleOf(target.roleSlug).name;
    await ctx.db.patch(id, {
      roleSlug,
      sectionSlugs: sectionSlugs ?? target.sectionSlugs ?? [],
    });
    await recordAudit(
      ctx,
      viewer,
      "user.role_change",
      "user",
      id,
      `${target.displayName} : ${previous} → ${ROLES[roleSlug].name}`
    );
    return null;
  },
});

export const setActive = mutation({
  args: { id: v.id("users"), active: v.boolean() },
  returns: v.null(),
  handler: async (ctx, { id, active }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.accountsManage);
    const target = await ctx.db.get(id);
    if (!target) throw accessError("FORBIDDEN");
    if (target.authSubject === viewer.subject && !active) {
      throw new Error("On ne révoque pas son propre compte.");
    }
    await ctx.db.patch(id, { active });
    await recordAudit(
      ctx,
      viewer,
      active ? "user.reactivate" : "user.deactivate",
      "user",
      id,
      `${target.displayName} (${target.email})`
    );
    return null;
  },
});

export const approveOrganization = mutation({
  args: { id: v.id("organizations") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.accountsManage);
    const organization = await ctx.db.get(id);
    if (!organization) throw accessError("FORBIDDEN");

    await ctx.db.patch(id, {
      approved: true,
      reviewState: "approved",
      reviewedAt: Date.now(),
      reviewedBy: viewer.name,
      reviewNote: undefined,
    });
    await recordAudit(
      ctx,
      viewer,
      "organization.approve",
      "organization",
      id,
      organization.name
    );
    await queueNotification(ctx, {
      email: organization.contactEmail,
      whatsapp: organization.whatsapp,
      subject: `Le Corporate — votre espace entreprise est ouvert`,
      body:
        `Bonjour ${organization.contactName},\n\n` +
        `Le compte de ${organization.name} a été validé par la rédaction. ` +
        `Vous pouvez déposer vos actualités depuis votre espace :\n` +
        `/entreprise\n\nLa rédaction du Corporate`,
      organizationId: id,
    });
    return null;
  },
});

export const rejectOrganization = mutation({
  args: { id: v.id("organizations"), reason: v.string() },
  returns: v.null(),
  handler: async (ctx, { id, reason }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.accountsManage);
    const trimmed = reason.trim();
    if (trimmed.length < 10) {
      throw new Error(
        "Le motif de refus est obligatoire (dix caractères au moins)."
      );
    }
    const organization = await ctx.db.get(id);
    if (!organization) throw accessError("FORBIDDEN");

    await ctx.db.patch(id, {
      approved: false,
      reviewState: "rejected",
      reviewedAt: Date.now(),
      reviewedBy: viewer.name,
      reviewNote: trimmed,
    });
    await recordAudit(
      ctx,
      viewer,
      "organization.reject",
      "organization",
      id,
      `${organization.name} — ${trimmed}`
    );
    await queueNotification(ctx, {
      email: organization.contactEmail,
      whatsapp: organization.whatsapp,
      subject: "Le Corporate — votre demande d'espace entreprise",
      body:
        `Bonjour ${organization.contactName},\n\n` +
        `La rédaction n'a pas donné suite à la demande d'espace de ` +
        `${organization.name}.\n\nMotif : ${trimmed}\n\n` +
        `La rédaction du Corporate`,
      organizationId: id,
    });
    return null;
  },
});

/* -------------------------------------------------------------------------
   Account creation
   ------------------------------------------------------------------------- */

const REGISTRATION_THROTTLE_MS = 60_000;

export const findProfileByEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx, { email }) => {
    const row = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .unique();
    return row?._id ?? null;
  },
});

export const attachProfile = internalMutation({
  args: {
    authSubject: v.string(),
    displayName: v.string(),
    email: v.string(),
    roleSlug: v.string(),
    organizationId: v.optional(v.id("organizations")),
    authorSlug: v.optional(v.string()),
    sectionSlugs: v.optional(v.array(v.string())),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("authSubject", args.authSubject))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
        roleSlug: args.roleSlug,
        organizationId: args.organizationId,
        authorSlug: args.authorSlug,
        sectionSlugs: args.sectionSlugs ?? [],
      });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      authSubject: args.authSubject,
      displayName: args.displayName,
      email: args.email.toLowerCase(),
      roleSlug: args.roleSlug,
      organizationId: args.organizationId,
      authorSlug: args.authorSlug,
      sectionSlugs: args.sectionSlugs ?? [],
      active: true,
      createdAt: Date.now(),
    });
  },
});

/** Records the company request itself, before any account exists. */
export const createOrganizationRequest = internalMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    sector: v.string(),
    taxId: v.optional(v.string()),
    registrationId: v.optional(v.string()),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
  },
  returns: v.union(v.id("organizations"), v.null()),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) {
      // Deux demandes pour la même raison sociale en moins d'une minute :
      // c'est un double clic ou un robot, pas deux entreprises.
      if (now - existing.createdAt < REGISTRATION_THROTTLE_MS) return null;
      if (existing.approved) return null;
      await ctx.db.patch(existing._id, {
        ...args,
        reviewState: "pending",
        createdAt: now,
      });
      return existing._id;
    }
    const id = await ctx.db.insert("organizations", {
      ...args,
      approved: false,
      reviewState: "pending",
      createdAt: now,
    });
    await recordAnonymousAudit(
      ctx,
      "organization.register",
      "organization",
      id,
      `${args.name} — ${args.sector}`
    );
    return id;
  },
});

const slugify = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "entreprise";

/**
 * Company registration — CDC §4.4 step 1.
 *
 * Always returns `{ status: "received" }`. If the address already has an
 * account, the request is still recorded and an administrator sorts it out
 * by hand; the caller learns nothing. That is the difference between a form
 * and an oracle (§5.3).
 */
export const registerCompany = action({
  args: {
    name: v.string(),
    sector: v.string(),
    taxId: v.optional(v.string()),
    registrationId: v.optional(v.string()),
    contactName: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    password: v.string(),
    /** Anti-robot : champ piège, qui doit rester vide. */
    honeypot: v.optional(v.string()),
    /** Anti-robot : instant d'ouverture du formulaire. */
    openedAt: v.optional(v.number()),
  },
  returns: v.object({ status: v.literal("received") }),
  handler: async (ctx, args): Promise<{ status: "received" }> => {
    // CDC §5.3 : anti-robot sur les formulaires publics. Même réponse qu'un
    // succès : un robot n'apprend rien de son refus.
    if (
      (args.honeypot ?? "").trim() !== "" ||
      !args.openedAt ||
      Date.now() - args.openedAt < 2000
    ) {
      return { status: "received" };
    }

    const email = args.contactEmail.trim().toLowerCase();
    const organizationId: Id<"organizations"> | null = await ctx.runMutation(
      internal.accounts.createOrganizationRequest,
      {
        name: args.name.trim(),
        slug: slugify(args.name),
        sector: args.sector.trim(),
        taxId: args.taxId?.trim() || undefined,
        registrationId: args.registrationId?.trim() || undefined,
        contactName: args.contactName.trim(),
        contactEmail: email,
        contactPhone: args.contactPhone?.trim() || undefined,
        whatsapp: args.whatsapp?.trim() || undefined,
      }
    );

    if (!organizationId) return { status: "received" };

    try {
      const auth = createAuth(ctx);
      const created = await auth.api.signUpEmail({
        body: {
          email,
          password: args.password,
          name: args.contactName.trim(),
        },
      });
      await ctx.runMutation(internal.accounts.attachProfile, {
        authSubject: created.user.id,
        displayName: args.contactName.trim(),
        email,
        roleSlug: "entreprise",
        organizationId,
      });
    } catch {
      // L'adresse est déjà connue, ou le mot de passe est refusé par la
      // politique. Dans les deux cas la demande d'entreprise est enregistrée
      // et la réponse est la même : le formulaire ne dit jamais lequel.
    }

    return { status: "received" };
  },
});

/**
 * Nominative staff account, created by an administrator (§4.3: "aucun
 * identifiant par défaut"). The password is chosen at creation and handed
 * over out of band; the holder changes it and enrols a second factor before
 * the account can do anything at all.
 */
export const createStaff = action({
  args: {
    email: v.string(),
    displayName: v.string(),
    password: v.string(),
    roleSlug: v.string(),
    authorSlug: v.optional(v.string()),
    sectionSlugs: v.optional(v.array(v.string())),
  },
  returns: v.object({
    status: v.union(
      v.literal("created"),
      v.literal("exists"),
      v.literal("refused")
    ),
    message: v.string(),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    status: "created" | "exists" | "refused";
    message: string;
  }> => {
    // Le contrôle de rôle passe par une query : une action n'a pas de base.
    const viewer: ViewerSummary | null = await ctx.runQuery(
      internal.guard.check,
      { permission: PERMISSIONS.accountsManage }
    );
    if (!viewer) throw accessError("FORBIDDEN");
    if (!isRoleSlug(args.roleSlug)) throw accessError("FORBIDDEN");

    const email = args.email.trim().toLowerCase();
    const already: Id<"users"> | null = await ctx.runQuery(
      internal.accounts.findProfileByEmail,
      { email }
    );
    if (already) {
      return {
        status: "exists",
        message: "Un compte existe déjà pour cette adresse.",
      };
    }

    try {
      const auth = createAuth(ctx);
      const created = await auth.api.signUpEmail({
        body: {
          email,
          password: args.password,
          name: args.displayName.trim(),
        },
      });
      await ctx.runMutation(internal.accounts.attachProfile, {
        authSubject: created.user.id,
        displayName: args.displayName.trim(),
        email,
        roleSlug: args.roleSlug,
        authorSlug: args.authorSlug,
        sectionSlugs: args.sectionSlugs,
      });
      await ctx.runMutation(internal.accounts.logStaffCreation, {
        actorSubject: viewer.subject,
        actorName: viewer.name,
        actorRole: viewer.roleSlug,
        summary: `${args.displayName.trim()} (${email}) — ${ROLES[args.roleSlug].name}`,
      });
      return {
        status: "created",
        message: ROLES[args.roleSlug].requiresTwoFactor
          ? "Compte créé. Il restera inutilisable tant que son titulaire n'aura pas activé la double authentification."
          : "Compte créé.",
      };
    } catch (error) {
      return {
        status: "refused",
        message:
          error instanceof Error && /password/i.test(error.message)
            ? "Le mot de passe ne respecte pas la politique (douze caractères au minimum)."
            : "Le compte n'a pas pu être créé.",
      };
    }
  },
});

export const logStaffCreation = internalMutation({
  args: {
    actorSubject: v.string(),
    actorName: v.string(),
    actorRole: v.string(),
    summary: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLog", {
      at: Date.now(),
      actorSubject: args.actorSubject,
      actorName: args.actorName,
      actorRole: args.actorRole,
      action: "user.create",
      targetType: "user",
      targetId: "-",
      summary: args.summary,
    });
    return null;
  },
});

/* -------------------------------------------------------------------------
   Bootstrap
   ------------------------------------------------------------------------- */

/**
 * Attaches an application profile to a Better Auth account created out of
 * band (`scripts/create-account.ts`). Internal: the CLI authenticates as the
 * developer, the browser cannot reach it.
 */
export const bootstrapProfile = internalMutation({
  args: {
    email: v.string(),
    roleSlug: v.string(),
    displayName: v.string(),
    authorSlug: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    if (!isRoleSlug(args.roleSlug)) throw new Error("Rôle inconnu.");
    const email = args.email.toLowerCase();
    const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", value: email }],
    });
    if (!user) {
      throw new Error(
        `Aucun compte Better Auth pour ${email} : créez-le d'abord.`
      );
    }
    const subject = (user as { _id: string })._id;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_subject", (q) => q.eq("authSubject", subject))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        roleSlug: args.roleSlug,
        displayName: args.displayName,
        authorSlug: args.authorSlug,
        active: true,
      });
      return `Profil mis à jour : ${email} → ${args.roleSlug}`;
    }
    await ctx.db.insert("users", {
      authSubject: subject,
      displayName: args.displayName,
      email,
      roleSlug: args.roleSlug,
      authorSlug: args.authorSlug,
      sectionSlugs: [],
      active: true,
      createdAt: Date.now(),
    });
    return `Profil créé : ${email} → ${args.roleSlug}`;
  },
});

/** Touches `lastSeenAt`, used by the account list to show who is active. */
export const touch = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const viewer = await requireViewer(ctx);
    await ctx.db.patch(viewer.profile._id, { lastSeenAt: Date.now() });
    return null;
  },
});

/** Exposed so the sign-in screen can route to the right home. */
export const homeFor = query({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const viewer = await loadViewer(ctx);
    return viewer ? viewer.role.home : "/connexion";
  },
});
