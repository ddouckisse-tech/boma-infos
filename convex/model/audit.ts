/**
 * Audit trail and notification outbox — CDC §4.3, §4.4, §5.3.
 *
 * Both are append-only helpers used by the mutations, never exposed as
 * writable endpoints: there is no function anywhere that edits or deletes an
 * `auditLog` row. "Journal d'audit horodaté de toute action sensible" only
 * means something if the journal cannot be quietly tidied up afterwards.
 */

import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { Viewer } from "./access";

/** The sensitive actions §4.3 names, plus the ones §4.4 implies. */
export type AuditAction =
  | "article.create"
  | "article.update"
  | "article.publish"
  | "article.unpublish"
  | "article.schedule"
  | "article.delete"
  | "submission.review"
  | "submission.reject"
  | "submission.publish"
  | "organization.register"
  | "organization.approve"
  | "organization.reject"
  | "user.create"
  | "user.role_change"
  | "user.deactivate"
  | "user.reactivate"
  | "category.create"
  | "category.update"
  | "category.delete"
  | "settings.update"
  | "agent.toggle"
  | "agent.suggestion_accepted"
  | "agent.suggestion_rejected"
  | "media.update"
  | "newsletter.approve";

export async function recordAudit(
  ctx: MutationCtx,
  viewer: Pick<Viewer, "subject" | "name" | "role">,
  action: AuditAction,
  targetType: string,
  targetId: string,
  summary: string
): Promise<void> {
  await ctx.db.insert("auditLog", {
    at: Date.now(),
    actorSubject: viewer.subject,
    actorName: viewer.name,
    actorRole: viewer.role.slug,
    action,
    targetType,
    targetId,
    summary,
  });
}

/** Same shape, for the actions a visitor takes before having a profile. */
export async function recordAnonymousAudit(
  ctx: MutationCtx,
  action: AuditAction,
  targetType: string,
  targetId: string,
  summary: string
): Promise<void> {
  await ctx.db.insert("auditLog", {
    at: Date.now(),
    actorSubject: "-",
    actorName: "Visiteur",
    actorRole: "-",
    action,
    targetType,
    targetId,
    summary,
  });
}

/* -------------------------------------------------------------------------
   Notifications
   ------------------------------------------------------------------------- */

/**
 * Queues a transition notice.
 *
 * No mail or WhatsApp provider is wired into this deployment, and pretending
 * otherwise would be a lie the newsroom could not check — the same call the
 * newsletter made at milestone 2. The message is composed and stored; the
 * back office shows the outbox, and the company portal shows the same text.
 * Wiring a provider later means draining `notifications`, not touching the
 * workflow.
 */
export async function queueNotification(
  ctx: MutationCtx,
  args: {
    email: string;
    whatsapp?: string;
    subject: string;
    body: string;
    submissionId?: Id<"submissions">;
    organizationId?: Id<"organizations">;
  }
): Promise<void> {
  const now = Date.now();
  await ctx.db.insert("notifications", {
    channel: "email",
    to: args.email,
    subject: args.subject,
    body: args.body,
    status: "pending",
    submissionId: args.submissionId,
    organizationId: args.organizationId,
    createdAt: now,
  });

  // CDC §4.4 : « et par WhatsApp si le numéro est renseigné ». Sans numéro,
  // aucune ligne : une notification « ignorée » n'est pas une notification.
  if (args.whatsapp && args.whatsapp.trim() !== "") {
    await ctx.db.insert("notifications", {
      channel: "whatsapp",
      to: args.whatsapp.trim(),
      subject: args.subject,
      body: args.body,
      status: "pending",
      submissionId: args.submissionId,
      organizationId: args.organizationId,
      createdAt: now,
    });
  }
}
