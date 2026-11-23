"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { usePreferences } from "@/components/providers/preferences-provider";
import { subscribeToNewsletter, type NewsletterState } from "@/lib/actions";
import { antiRobot } from "@/lib/anti-robot";
import { cx } from "@/lib/cx";
import { localize } from "@/lib/i18n";

/**
 * The classes shadcn's `Label`, `Input` and the house `ActionButton` produced
 * here once merged with this form's overrides — computed with the `cn`
 * engine and frozen on native elements to limit the frontend bundle (§5.4).
 */
const FIELD_LABEL =
  "flex items-center gap-2 text-sm leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 type-small font-medium";
const FIELD_INPUT =
  "rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-11 w-full min-w-0 type-body sm:flex-1";
const SUBMIT_BUTTON =
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-primary text-primary-foreground hover:bg-primary/80 h-9 gap-1.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 rounded-md type-small font-semibold touch-target px-4";

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
 * Newsletter sign-up with on-screen confirmation.
 *
 * The form posts to a server action, so it works with JavaScript disabled and
 * ships no validation library to the browser. No mail provider exists in
 * milestone 2: rather than claim an email was sent, the confirmation link is
 * shown plainly and labelled as standing in for it.
 */
export function NewsletterForm({
  className,
  source,
}: {
  className?: string;
  source: string;
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
        className={cx(
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
    <form action={action} className={cx("grid gap-2", className)}>
      <label htmlFor={id} data-slot="label" className={FIELD_LABEL}>
        {localize(locale, {
          fr: "Adresse électronique",
          en: "Email address",
        })}
      </label>

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
      <div className="grid gap-2 sm:flex">
        <input
          data-slot="input"
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
          aria-describedby={hasError ? `${errorId} ${id}-aide` : `${id}-aide`}
          className={FIELD_INPUT}
        />
        <button
          type="submit"
          disabled={pending}
          data-slot="button"
          data-variant="default"
          data-size="lg"
          className={SUBMIT_BUTTON}
        >
          <Send aria-hidden="true" className="size-4" />
          {pending
            ? localize(locale, { fr: "Envoi…", en: "Sending…" })
            : localize(locale, { fr: "S'inscrire", en: "Subscribe" })}
        </button>
      </div>

      {hasError && (
        <p id={errorId} role="alert" className="type-small text-destructive">
          {newsletterError(state.message, locale)}
        </p>
      )}

      <p id={`${id}-aide`} className="type-small text-muted-foreground">
        {localize(locale, {
          fr: "Votre adresse sert à gérer votre inscription à la lettre. La confirmation se fait à l’écran.",
          en: "Your email address is used to manage your newsletter subscription. Confirmation takes place on screen.",
        })}{" "}
        <Link
          href="/confidentialite#lettre-hebdomadaire"
          prefetch={false}
          className="underline underline-offset-4 hover:text-foreground"
        >
          {localize(locale, { fr: "Données et droits", en: "Data and rights" })}
        </Link>
        .
      </p>
    </form>
  );
}
