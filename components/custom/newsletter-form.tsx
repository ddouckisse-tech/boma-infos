"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/components/custom/action-button";
import { usePreferences } from "@/components/providers/preferences-provider";
import { subscribeToNewsletter, type NewsletterState } from "@/lib/actions";
import { antiRobot } from "@/lib/anti-robot";
import { localize } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function newsletterError(message: string, locale: "fr" | "en") {
  if (locale === "fr") return message;
  if (message === "Indiquez votre adresse électronique.") {
    return "Enter your email address.";
  }
  if (message === "Cette adresse est trop longue.") {
    return "This email address is too long.";
  }
  if (message.includes("pas valide")) return "This email address is invalid.";
  if (message.includes("Patientez une minute")) {
    return "A request was just sent for this address. Please wait one minute.";
  }
  return "Your subscription could not be saved. Please try again shortly.";
}

/**
 * Newsletter sign-up, with double opt-in (CDC §4.2).
 *
 * The form posts to a server action, so it works with JavaScript disabled and
 * ships no validation library to the browser. No mail provider exists in
 * milestone 2: rather than claim an email was sent, the confirmation link is
 * shown plainly and labelled as standing in for it.
 */
export function NewsletterForm({
  className,
  source = "pied-de-page",
  variant = "inline",
}: {
  className?: string;
  source?: string;
  variant?: "inline" | "block";
}) {
  const id = useId();
  const { locale } = usePreferences();
  const [state, action, pending] = useActionState<NewsletterState, FormData>(
    subscribeToNewsletter,
    { status: "idle" }
  );

  // Horodatage posé après montage : lire l'horloge pendant le rendu est un
  // appel impur (React 19). La valeur sert à repérer une soumission
  // instantanée, donc robotique.
  const openedAt = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (openedAt.current) openedAt.current.value = String(Date.now());
  }, []);

  if (state.status === "pending" || state.status === "already") {
    return (
      <div
        className={cn(
          "rounded-md border border-border bg-background p-4",
          className
        )}
        role="status"
      >
        <p className="flex items-start gap-2 type-small font-semibold text-foreground">
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-success-token"
          />
          {state.status === "already"
            ? localize(locale, {
                fr: "Cette adresse est déjà inscrite.",
                en: "This address is already subscribed.",
              })
            : localize(locale, {
                fr: "Demande enregistrée.",
                en: "Request saved.",
              })}
        </p>
        {state.status === "pending" && (
          <p className="mt-2 type-small text-muted-foreground">
            {localize(locale, {
              fr: "Il reste une étape : confirmer l'inscription. Le service d'envoi de courriels n'étant pas encore branché, le lien de confirmation est affiché ici.",
              en: "One step remains: confirm your subscription. As the email service is not connected yet, the confirmation link is shown here.",
            })}
          </p>
        )}
        {state.status === "pending" && state.confirmPath && (
          <Link
            href={state.confirmPath}
            className="mt-3 inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
          >
            {localize(locale, {
              fr: "Confirmer mon inscription",
              en: "Confirm my subscription",
            })}
          </Link>
        )}
      </div>
    );
  }

  const errorId = `${id}-erreur`;
  const hasError = state.status === "error";

  return (
    <form action={action} className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="type-small font-medium">
        {localize(locale, {
          fr: "Recevoir la lettre hebdomadaire",
          en: "Receive the weekly newsletter",
        })}
      </Label>

      <input type="hidden" name="source" value={source} />
      <input
        ref={openedAt}
        type="hidden"
        name={antiRobot.timestampField}
        defaultValue="0"
      />
      {/* Piège à robots : hors écran, hors ordre de tabulation, hors arbre
          d'accessibilité. Un lecteur d'écran ne le rencontre jamais. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor={`${id}-hp`}>
          {localize(locale, { fr: "Ne pas remplir", en: "Leave blank" })}
        </label>
        <input
          id={`${id}-hp`}
          type="text"
          name={antiRobot.honeypotField}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* `flex-1` sur le champ ne vaut qu'en ligne : dans un conteneur en
          colonne, il s'applique à la hauteur et écrase les 44 px de la
          cible tactile (§3.5). D'où la grille en dessous de `sm`. */}
      <div
        className={cn(
          "gap-2",
          variant === "inline" ? "flex flex-wrap" : "grid sm:flex"
        )}
      >
        <Input
          id={id}
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          required
          placeholder={localize(locale, {
            fr: "vous@exemple.ga",
            en: "you@example.com",
          })}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : `${id}-aide`}
          className="h-11 w-full min-w-0 type-body sm:flex-1"
        />
        <ActionButton type="submit" disabled={pending}>
          <Send aria-hidden="true" className="size-4" />
          {pending
            ? localize(locale, { fr: "Envoi…", en: "Sending…" })
            : localize(locale, { fr: "S'inscrire", en: "Subscribe" })}
        </ActionButton>
      </div>

      {hasError && (
        <p id={errorId} role="alert" className="type-small text-destructive">
          {newsletterError(state.message, locale)}
        </p>
      )}

      <p id={`${id}-aide`} className="type-small text-muted-foreground">
        {localize(locale, {
          fr: "Un courriel par semaine. Confirmation demandée, désinscription en un clic.",
          en: "One email a week. Confirmation required, unsubscribe in one click.",
        })}
      </p>
    </form>
  );
}
