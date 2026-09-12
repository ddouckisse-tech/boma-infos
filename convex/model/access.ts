/**
 * Roles, permissions and the server-side gate — CDC §4.3 and §5.3.
 *
 * Everything in this file runs **inside Convex**. The interface hides what a
 * role cannot do, but hiding is decoration: the checks below are the control.
 * Every mutation and every non-public query in `convex/` starts with one of
 * `requireViewer`, `requirePermission` or `requireOrganizationScope` — there
 * is no other way in, and calling a function straight from the CLI or from
 * `npx convex run` goes through exactly the same gate.
 *
 * Two invariants this file is responsible for:
 *
 *  1. **Two-factor authentication is mandatory for Administrateur and
 *     Éditeur.** An account of either role that has not enrolled can reach
 *     its own profile and nothing else — not the articles, not the deposits,
 *     not the settings. Enforced here, not in a layout.
 *  2. **A company sees its own data and no one else's.** Every read and
 *     write that touches `organizations` or `submissions` resolves the scope
 *     from the *session*, never from an argument the caller chose.
 */

import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";

/* -------------------------------------------------------------------------
   Permissions
   ------------------------------------------------------------------------- */

export const PERMISSIONS = {
  /** Read the newsroom back office at all. */
  newsroom: "newsroom:access",
  articlesRead: "articles:read",
  articlesWrite: "articles:write",
  articlesPublish: "articles:publish",
  submissionsReview: "submissions:review",
  mediaWrite: "media:write",
  categoriesWrite: "categories:write",
  accountsManage: "accounts:manage",
  settingsManage: "settings:manage",
  agentsRun: "agents:run",
  agentsManage: "agents:manage",
  auditRead: "audit:read",
  statsAll: "stats:read:all",
  /** Company portal. */
  portal: "portal:access",
  statsOwn: "stats:read:own",
  /** Reader account. */
  readerAccount: "reader:account",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type RoleSlug = "administrateur" | "editeur" | "entreprise" | "lecteur";

export type RoleDefinition = {
  readonly slug: RoleSlug;
  readonly name: string;
  readonly description: string;
  readonly permissions: readonly Permission[];
  readonly requiresTwoFactor: boolean;
  /** Where a member of this role lands after signing in. */
  readonly home: string;
};

const EDITOR_PERMISSIONS: readonly Permission[] = [
  PERMISSIONS.newsroom,
  PERMISSIONS.articlesRead,
  PERMISSIONS.articlesWrite,
  PERMISSIONS.articlesPublish,
  PERMISSIONS.submissionsReview,
  PERMISSIONS.mediaWrite,
  PERMISSIONS.agentsRun,
  PERMISSIONS.statsAll,
];

export const ROLES: Record<RoleSlug, RoleDefinition> = {
  administrateur: {
    slug: "administrateur",
    name: "Administrateur",
    description:
      "Rédaction en chef. Publication, rubriques, comptes, réglages, agents, statistiques.",
    permissions: [
      ...EDITOR_PERMISSIONS,
      PERMISSIONS.categoriesWrite,
      PERMISSIONS.accountsManage,
      PERMISSIONS.settingsManage,
      PERMISSIONS.agentsManage,
      PERMISSIONS.auditRead,
    ],
    requiresTwoFactor: true,
    home: "/redaction",
  },
  editeur: {
    slug: "editeur",
    name: "Éditeur / Journaliste",
    description:
      "Rédige, soumet et publie dans ses rubriques autorisées. Ne gère ni les comptes ni les réglages.",
    permissions: EDITOR_PERMISSIONS,
    requiresTwoFactor: true,
    home: "/redaction",
  },
  entreprise: {
    slug: "entreprise",
    name: "Client / Entreprise",
    description:
      "Dépose ses actualités, suit leur statut et consulte les statistiques de ses seules publications.",
    permissions: [PERMISSIONS.portal, PERMISSIONS.statsOwn],
    requiresTwoFactor: false,
    home: "/entreprise",
  },
  lecteur: {
    slug: "lecteur",
    name: "Lecteur",
    description: "Favoris, historique et préférences de newsletter.",
    permissions: [PERMISSIONS.readerAccount],
    requiresTwoFactor: false,
    home: "/compte",
  },
};

export const ROLE_LIST: readonly RoleDefinition[] = [
  ROLES.administrateur,
  ROLES.editeur,
  ROLES.entreprise,
  ROLES.lecteur,
];

export const isRoleSlug = (value: string): value is RoleSlug =>
  value === "administrateur" ||
  value === "editeur" ||
  value === "entreprise" ||
  value === "lecteur";

export const roleOf = (slug: string): RoleDefinition =>
  isRoleSlug(slug) ? ROLES[slug] : ROLES.lecteur;

export const roleHas = (slug: string, permission: Permission): boolean =>
  roleOf(slug).permissions.includes(permission);

/* -------------------------------------------------------------------------
   Failures
   ------------------------------------------------------------------------- */

export type AccessErrorCode =
  | "UNAUTHENTICATED"
  | "NO_PROFILE"
  | "SUSPENDED"
  | "TWO_FACTOR_REQUIRED"
  | "PASSWORD_CHANGE_REQUIRED"
  | "FORBIDDEN"
  | "ORGANIZATION_REQUIRED"
  | "ORGANIZATION_PENDING";

/**
 * Deliberately uniform.
 *
 * `FORBIDDEN` never says *which* permission was missing and never says
 * whether the row exists: telling a company that submission `x` "belongs to
 * someone else" is already a leak. The interface maps these codes to French
 * sentences; the payload carries no data about the target.
 */
export const accessError = (code: AccessErrorCode): ConvexError<string> =>
  new ConvexError(code);

/* -------------------------------------------------------------------------
   The gate
   ------------------------------------------------------------------------- */

export type Viewer = {
  readonly subject: string;
  readonly email: string;
  readonly name: string;
  readonly twoFactorEnabled: boolean;
  readonly profile: Doc<"users">;
  readonly role: RoleDefinition;
};

/**
 * Resolves the signed-in account, or `null`.
 *
 * The Better Auth user (credentials, 2FA state) and the application profile
 * (role, organisation) are two different records on purpose: Better Auth
 * owns authentication, the application owns authorisation.
 */
export async function loadViewer(ctx: QueryCtx): Promise<Viewer | null> {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) return null;

  const profile = await ctx.db
    .query("users")
    .withIndex("by_subject", (q) => q.eq("authSubject", authUser._id))
    .unique();
  if (!profile) return null;

  return {
    subject: authUser._id,
    email: authUser.email,
    name: profile.displayName || authUser.name || authUser.email,
    twoFactorEnabled: authUser.twoFactorEnabled === true,
    profile,
    role: roleOf(profile.roleSlug),
  };
}

export async function requireViewer(ctx: QueryCtx): Promise<Viewer> {
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser) throw accessError("UNAUTHENTICATED");

  const profile = await ctx.db
    .query("users")
    .withIndex("by_subject", (q) => q.eq("authSubject", authUser._id))
    .unique();
  // A Better Auth account with no application profile is an account an
  // administrator has not finished creating. It can sign in and do nothing.
  if (!profile) throw accessError("NO_PROFILE");
  if (!profile.active) throw accessError("SUSPENDED");

  return {
    subject: authUser._id,
    email: authUser.email,
    name: profile.displayName || authUser.name || authUser.email,
    twoFactorEnabled: authUser.twoFactorEnabled === true,
    profile,
    role: roleOf(profile.roleSlug),
  };
}

/**
 * Permissions that stay reachable while an Administrateur or an Éditeur has
 * not enrolled a second factor — otherwise the requirement would lock the
 * very account that has to satisfy it.
 */
const SELF_SERVICE: readonly Permission[] = [PERMISSIONS.readerAccount];

export async function requirePermission(
  ctx: QueryCtx,
  permission: Permission
): Promise<Viewer> {
  const viewer = await requireViewer(ctx);

  if (
    viewer.profile.mustChangePassword === true &&
    !SELF_SERVICE.includes(permission)
  ) {
    // Mot de passe provisoire, posé par la ligne de commande : le compte ne
    // sert à rien tant qu'un mot de passe définitif n'a pas été choisi.
    // Vérifié AVANT le second facteur — c'est le geste que le titulaire peut
    // faire tout de suite, il connaît ce mot de passe-là.
    throw accessError("PASSWORD_CHANGE_REQUIRED");
  }

  if (
    viewer.role.requiresTwoFactor &&
    !viewer.twoFactorEnabled &&
    !SELF_SERVICE.includes(permission)
  ) {
    // CDC §4.3 : « double authentification obligatoire ». Obligatoire veut
    // dire que le compte ne sert à rien tant qu'elle n'est pas posée.
    throw accessError("TWO_FACTOR_REQUIRED");
  }

  if (!viewer.role.permissions.includes(permission)) {
    throw accessError("FORBIDDEN");
  }

  return viewer;
}

/**
 * Resolves the company the caller may act for — **from the session**.
 *
 * The identifier is never taken from the arguments: that is the whole point.
 * An administrator or an editor may pass one explicitly (they review every
 * company); a company account may not, and gets its own or nothing.
 */
export async function requireOrganizationScope(
  ctx: QueryCtx,
  requested?: Id<"organizations">
): Promise<{ viewer: Viewer; organizationId: Id<"organizations"> }> {
  const viewer = await requireViewer(ctx);

  if (viewer.role.permissions.includes(PERMISSIONS.submissionsReview)) {
    if (viewer.profile.mustChangePassword === true) {
      throw accessError("PASSWORD_CHANGE_REQUIRED");
    }
    if (viewer.role.requiresTwoFactor && !viewer.twoFactorEnabled) {
      throw accessError("TWO_FACTOR_REQUIRED");
    }
    if (!requested) throw accessError("ORGANIZATION_REQUIRED");
    return { viewer, organizationId: requested };
  }

  if (!viewer.role.permissions.includes(PERMISSIONS.portal)) {
    throw accessError("FORBIDDEN");
  }

  const own = viewer.profile.organizationId;
  if (!own) throw accessError("ORGANIZATION_REQUIRED");
  // Demander explicitement l'entreprise d'un autre n'est pas une erreur
  // « introuvable » mais un refus : on ne confirme pas l'existence de l'id.
  if (requested && requested !== own) throw accessError("FORBIDDEN");

  const organization = await ctx.db.get(own);
  if (!organization) throw accessError("ORGANIZATION_REQUIRED");
  if (!organization.approved) throw accessError("ORGANIZATION_PENDING");

  return { viewer, organizationId: own };
}

/** True when the viewer may act on every company rather than just one. */
export const isNewsroom = (viewer: Viewer): boolean =>
  viewer.role.permissions.includes(PERMISSIONS.submissionsReview);
