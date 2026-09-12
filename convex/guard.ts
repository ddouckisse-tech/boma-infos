import { v } from "convex/values";
import { internalQuery } from "./_generated/server";
import { loadViewer, type Permission, roleOf } from "./model/access";

/**
 * Permission check for Convex **actions**.
 *
 * An action has no database handle, so it cannot run `requirePermission`
 * itself. It calls this internal query instead — which means an action is
 * gated by exactly the same code as a mutation, not by a second, looser
 * copy of the rule.
 *
 * It lives in its own module so that an action never has to reference the
 * `api` object of the module it is declared in (that self-reference makes
 * TypeScript infer types in a circle).
 */

export const viewerSummary = v.object({
  subject: v.string(),
  email: v.string(),
  name: v.string(),
  roleSlug: v.string(),
  organizationId: v.optional(v.id("organizations")),
  authorSlug: v.optional(v.string()),
});

export type ViewerSummary = {
  subject: string;
  email: string;
  name: string;
  roleSlug: string;
  organizationId?: string;
  authorSlug?: string;
};

/**
 * Returns the caller when they hold `permission` **and** satisfy the
 * two-factor requirement of their role, `null` otherwise. Never says why.
 */
export const check = internalQuery({
  args: { permission: v.string() },
  returns: v.union(viewerSummary, v.null()),
  handler: async (ctx, { permission }) => {
    const viewer = await loadViewer(ctx);
    if (!viewer) return null;
    if (!viewer.profile.active) return null;

    const role = roleOf(viewer.profile.roleSlug);
    if (role.requiresTwoFactor && !viewer.twoFactorEnabled) return null;
    if (!role.permissions.includes(permission as Permission)) return null;

    return {
      subject: viewer.subject,
      email: viewer.email,
      name: viewer.name,
      roleSlug: role.slug,
      organizationId: viewer.profile.organizationId,
      authorSlug: viewer.profile.authorSlug,
    };
  },
});
