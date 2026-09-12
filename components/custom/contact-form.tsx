"use client";

import { useActionState, useId, useMemo } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "@/components/custom/action-button";
import { sendContactMessage, type ContactState } from "@/lib/actions";
import { antiRobot } from "@/lib/anti-robot";

/**
 * Contact form (CDC §4.2).
 *
 * Four things the audit found missing on the legacy form are here: a consent
 * checkbox, a statement of what the data is used for and how long it is
 * kept, native `required` attributes so the browser helps before anything is
 * sent, and an anti-robot that actually runs — a honeypot plus a minimum time
 * on the page, rather than a CAPTCHA that would tax every real reader.
 *
 * Submission goes through a server action, so the form works without
 * JavaScript and no validation library ships to the browser.
 */
export function ContactForm() {
  const id = useId();
  const [state, action, pending] = useActionState<ContactState, FormData>(
    sendContactMessage,
    { status: "idle" }
  );
  const openedAt = useMemo(() => String(Date.now()), []);

  if (state.status === "sent") {
    return (
      <div
        role="status"
        className="rounded-md border border-border border-l-2 border-l-success-token bg-card p-6"
      >
        <p className="flex items-start gap-2 font-serif type-h3 text-foreground">
          <CheckCircle2
            aria-hidden="true"
            className="mt-1 size-5 shrink-0 text-success-token"
          />
          Message transmis à la rédaction
        </p>
        <p className="mt-2 type-body text-muted-foreground">
          Nous accusons réception sous deux jours ouvrés. Pour une information
          urgente, le téléphone de la rédaction reste le moyen le plus rapide.
        </p>
      </div>
    );
  }

  const errorId = `${id}-erreur`;
  const invalid = (field: string) =>
    state.status === "error" && state.field === field;

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name={antiRobot.timestampField} value={openedAt} />
      <div aria-hidden="true" className="sr-only">
        <label htmlFor={`${id}-hp`}>Ne pas remplir</label>
        <input
          id={`${id}-hp`}
          type="text"
          name={antiRobot.honeypotField}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${id}-nom`} className="type-small font-medium">
            Nom et prénom <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${id}-nom`}
            name="name"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            aria-invalid={invalid("name") || undefined}
            className="h-11 type-body"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${id}-email`} className="type-small font-medium">
            Adresse électronique <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${id}-email`}
            name="email"
            type="email"
            inputMode="email"
            required
            autoComplete="email"
            aria-invalid={invalid("email") || undefined}
            className="h-11 type-body"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${id}-organisation`} className="type-small font-medium">
          Organisation{" "}
          <span className="font-normal text-muted-foreground">(facultatif)</span>
        </Label>
        <Input
          id={`${id}-organisation`}
          name="organization"
          maxLength={160}
          autoComplete="organization"
          className="h-11 type-body"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${id}-objet`} className="type-small font-medium">
          Objet <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${id}-objet`}
          name="subject"
          required
          minLength={3}
          maxLength={160}
          aria-invalid={invalid("subject") || undefined}
          className="h-11 type-body"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${id}-message`} className="type-small font-medium">
          Message <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id={`${id}-message`}
          name="message"
          required
          minLength={20}
          maxLength={4000}
          rows={7}
          aria-invalid={invalid("message") || undefined}
          aria-describedby={`${id}-aide-message`}
          className="type-body"
        />
        <p id={`${id}-aide-message`} className="type-small text-muted-foreground">
          Vingt caractères au minimum, quatre mille au maximum.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-md border border-border bg-surface-muted p-4">
        <Checkbox
          id={`${id}-consentement`}
          name="consent"
          required
          aria-describedby={`${id}-finalite`}
          className="mt-1"
        />
        <div className="min-w-0">
          <Label
            htmlFor={`${id}-consentement`}
            className="type-small font-medium"
          >
            J&apos;accepte que ces informations soient utilisées pour traiter
            ma demande. <span className="text-destructive">*</span>
          </Label>
          <p id={`${id}-finalite`} className="mt-1 type-small text-muted-foreground">
            Finalité : répondre à votre message. Destinataire : la rédaction du
            Corporate, elle seule. Conservation : douze mois. Vous pouvez
            demander l&apos;accès, la rectification ou la suppression de vos
            données en écrivant à la rédaction.
          </p>
        </div>
      </div>

      {state.status === "error" && (
        <p id={errorId} role="alert" className="type-small text-destructive">
          {state.message}
        </p>
      )}

      <ActionButton type="submit" disabled={pending} className="justify-self-start">
        <Send aria-hidden="true" className="size-4" />
        {pending ? "Envoi en cours…" : "Envoyer le message"}
      </ActionButton>
    </form>
  );
}
