"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "@/components/custom/action-button";
import { subscribeToNewsletter, type NewsletterState } from "@/lib/actions";
import { antiRobot } from "@/lib/anti-robot";
import { cn } from "@/lib/utils";

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
            ? "Cette adresse est déjà inscrite."
            : "Demande enregistrée."}
        </p>
        {state.status === "pending" && (
          <p className="mt-2 type-small text-muted-foreground">
            Il reste une étape : confirmer l&apos;inscription. Le service
            d&apos;envoi de courriels n&apos;étant pas encore branché, le lien
            de confirmation est affiché ici.
          </p>
        )}
        {state.status === "pending" && state.confirmPath && (
          <Link
            href={state.confirmPath}
            className="mt-3 inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
          >
            Confirmer mon inscription
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
        Recevoir la lettre hebdomadaire
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
        <label htmlFor={`${id}-hp`}>Ne pas remplir</label>
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
          placeholder="vous@exemple.ga"
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : `${id}-aide`}
          className="h-11 w-full min-w-0 type-body sm:flex-1"
        />
        <ActionButton type="submit" disabled={pending}>
          <Send aria-hidden="true" className="size-4" />
          {pending ? "Envoi…" : "S'inscrire"}
        </ActionButton>
      </div>

      {hasError && (
        <p id={errorId} role="alert" className="type-small text-destructive">
          {state.message}
        </p>
      )}

      <p id={`${id}-aide`} className="type-small text-muted-foreground">
        Un courriel par semaine. Confirmation demandée, désinscription en un
        clic.
      </p>
    </form>
  );
}
