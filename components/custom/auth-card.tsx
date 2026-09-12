"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Modal } from "@/components/custom/modal";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { SignInForm } from "@/components/custom/sign-in-form";
import { CompanyRegistrationForm } from "@/components/custom/company-registration-form";

export type AuthTab = "connexion" | "entreprise";

/**
 * Access card — the floating form opened from the masthead (§4.3, §4.4).
 *
 * This module is **loaded on demand**, never on first paint. Everything
 * expensive lives behind that boundary: Better Auth's browser client, the
 * Convex reactive client, the form fields. The journal's JavaScript budget
 * is 180 Ko for the whole site (§5.4) and was at 159 Ko before this card
 * existed — the twenty-odd kilobytes it costs are paid by the reader who
 * clicks "Connexion", not by the reader who came to read an article. That is
 * the entire reason this is a separate chunk.
 *
 * `ConvexClientProvider` is mounted here rather than in the journal's layout,
 * for the same reason: the registration form calls a Convex action, and a
 * reactive client on every public page would open a WebSocket for data that
 * never changes between two revalidations.
 *
 * The card is an enhancement. `/connexion` and `/inscription-entreprise`
 * remain the canonical routes: the triggers are real links, so a middle
 * click, a bookmark or a visitor without JavaScript all reach the full page.
 */
export function AuthCard({
  tab,
  onTabChange,
  onClose,
}: {
  tab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
  onClose: () => void;
}) {
  const titleId = useId();
  // Quel onglet a abouti, plutôt qu'un booléen remis à zéro par un effet :
  // changer d'onglet redonne un formulaire neuf sans rien synchroniser.
  const [doneFor, setDoneFor] = useState<AuthTab | null>(null);
  const done = doneFor === tab;

  const signingIn = tab === "connexion";
  const title = signingIn
    ? "Connexion"
    : done
      ? "Demande enregistrée"
      : "Ouvrir un espace entreprise";

  return (
    <Modal
      open
      onClose={onClose}
      label={title}
      variant="panel"
      className="lc-auth"
    >
      <ConvexClientProvider>
        {/* En-tête discret : les onglets portent la hiérarchie, lui ne fait
            qu'identifier la boîte et offrir la sortie. Un gros titre répéterait
            l'onglet actif mot pour mot. */}
        <div className="flex items-center justify-between gap-3 border-b border-border py-3 ps-5 pe-3 md:ps-7 md:pe-4">
          <h2
            id={titleId}
            className="type-small font-semibold tracking-wide text-muted-foreground uppercase"
          >
            {done ? title : "Espace privé"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="lc-auth-body px-5 py-6 md:px-7">
          {!done && (
            <>
              {/* Onglets soulignés plutôt qu'en pastilles : en thème sombre,
                  un conteneur `surface-muted` a exactement la couleur de la
                  carte (#1F1F1F) et disparaissait. Un filet sous l'onglet actif
                  se lit dans les deux thèmes et tient le rythme éditorial. */}
              <div
                role="tablist"
                aria-label="Accès à l'espace privé"
                className="-mt-1 flex gap-6 border-b border-border"
              >
                {(
                  [
                    ["connexion", "Connexion"],
                    ["entreprise", "Espace entreprise"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={tab === value}
                    onClick={() => onTabChange(value)}
                    className={
                      "-mb-px border-b-2 px-0.5 pb-3 type-small font-semibold transition-colors " +
                      (tab === value
                        ? "border-accent text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground")
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              <p className="mt-5 mb-6 type-small text-muted-foreground">
                {signingIn
                  ? "Espace réservé à la rédaction et aux entreprises partenaires."
                  : "Déposez vos communiqués, nominations, résultats et annonces d'événements. La rédaction garde la main éditoriale : tout contenu partenaire est publié avec la mention « Contenu partenaire »."}
              </p>
            </>
          )}

          {signingIn ? (
            <SignInForm onSwitchToRegister={() => onTabChange("entreprise")} />
          ) : (
            <CompanyRegistrationForm
              onDone={() => setDoneFor("entreprise")}
              onSwitchToSignIn={() => onTabChange("connexion")}
            />
          )}
        </div>

        {/* Pied fixe : la sortie vers la page entière reste atteignable même
            quand le formulaire d'inscription fait défiler le corps. */}
        <div className="border-t border-border px-5 py-3 md:px-7">
          <Link
            href={signingIn ? "/connexion" : "/inscription-entreprise"}
            className="type-small text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Ouvrir dans une page entière
          </Link>
        </div>
      </ConvexClientProvider>
    </Modal>
  );
}
