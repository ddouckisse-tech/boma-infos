"use server";

import { api } from "@/convex/_generated/api";
import { runMutation } from "@/lib/content/server";
import { antiRobot, isRobot } from "@/lib/anti-robot";
import { contactSchema, newsletterSchema } from "@/lib/schemas";

/**
 * Server actions of the public journal.
 *
 * They are the only write path a reader has: no client-side Convex mutation,
 * no API key in the browser. Each one revalidates the payload with the shared
 * Zod schema before touching the database, then lets the Convex mutation
 * apply its own checks and rate limit (§5.3 — defence in depth, not a single
 * gate).
 */

export type NewsletterState =
  | { status: "idle" }
  | { status: "pending"; confirmPath: string; email: string }
  | { status: "already"; email: string }
  | { status: "error"; message: string };

export async function subscribeToNewsletter(
  _previous: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  if (
    isRobot(
      formData.get(antiRobot.honeypotField),
      formData.get(antiRobot.timestampField)
    )
  ) {
    // Réponse volontairement identique à un succès : un robot ne doit rien
    // apprendre du refus.
    return {
      status: "pending",
      confirmPath: "",
      email: String(formData.get("email") ?? ""),
    };
  }

  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ??
        "Cette adresse électronique n'est pas valide.",
    };
  }

  const source = String(formData.get("source") ?? "site");

  try {
    const result = await runMutation(
      api.newsletter.subscribe,
      { email: parsed.data.email, source },
      "newsletter.subscribe"
    );

    if (result.status === "already_confirmed") {
      return { status: "already", email: parsed.data.email };
    }
    if (result.status === "invalid") {
      return {
        status: "error",
        message: "Cette adresse électronique n'est pas valide.",
      };
    }
    if (result.status === "throttled") {
      return {
        status: "error",
        message:
          "Une demande vient d'être envoyée pour cette adresse. Patientez une minute.",
      };
    }

    return {
      status: "pending",
      email: parsed.data.email,
      confirmPath: result.confirmToken
        ? `/newsletter/confirmation?jeton=${result.confirmToken}`
        : "",
    };
  } catch {
    return {
      status: "error",
      message:
        "L'inscription n'a pas pu être enregistrée. Réessayez dans un instant.",
    };
  }
}

export type ContactState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; message: string; field?: string };

export async function sendContactMessage(
  _previous: ContactState,
  formData: FormData
): Promise<ContactState> {
  if (
    isRobot(
      formData.get(antiRobot.honeypotField),
      formData.get(antiRobot.timestampField)
    )
  ) {
    return { status: "sent" };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    organization: formData.get("organization") || undefined,
    subject: formData.get("subject"),
    message: formData.get("message"),
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      status: "error",
      message: issue?.message ?? "Le formulaire comporte une erreur.",
      field: issue?.path[0] ? String(issue.path[0]) : undefined,
    };
  }

  try {
    const result = await runMutation(
      api.contact.send,
      {
        name: parsed.data.name,
        email: parsed.data.email,
        organization: parsed.data.organization,
        subject: parsed.data.subject,
        message: parsed.data.message,
        consent: true,
      },
      "contact.send"
    );

    if (result.status === "throttled") {
      return {
        status: "error",
        message:
          "Un message vient d'être envoyé depuis cette adresse. Patientez trente secondes.",
      };
    }
    if (result.status === "invalid") {
      return {
        status: "error",
        message: "Le formulaire comporte une erreur.",
        field: result.reason,
      };
    }
    return { status: "sent" };
  } catch {
    return {
      status: "error",
      message:
        "Le message n'a pas pu être transmis. Réessayez, ou écrivez-nous directement.",
    };
  }
}
