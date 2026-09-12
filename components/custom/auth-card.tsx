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
    <Modal open onClose={onClose} label={title} variant="panel" className="lc-auth">
      <ConvexClientProvider>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-popover px-5 py-4 md:px-7">
          <div className="min-w-0">
            <h2 id={titleId} className="font-serif type-h3 text-foreground">
              {title}
            </h2>
            <span
              aria-hidden="true"
              className="mt-2 block h-[3px] w-10 rounded-xs bg-brand-magenta"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="-me-1 inline-flex shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors touch-target hover:text-foreground"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="px-5 py-5 md:px-7 md:py-6">
          {!done && (
            <div
              role="tablist"
              aria-label="Accès à l'espace privé"
              className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-surface-muted p-1"
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
                    "rounded-md px-3 py-2 type-small font-semibold transition-colors touch-target " +
                    (tab === value
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {signingIn ? (
            <>
              <p className="mb-5 type-small text-muted-foreground">
                Espace réservé à la rédaction et aux entreprises partenaires.
              </p>
              <SignInForm onSwitchToRegister={() => onTabChange("entreprise")} />
            </>
          ) : (
            <>
              {!done && (
                <p className="mb-5 type-small text-muted-foreground">
                  Déposez vos communiqués, nominations, résultats et annonces
                  d&apos;événements. La rédaction garde la main éditoriale&nbsp;:
                  tout contenu partenaire est publié avec la mention
                  «&nbsp;Contenu partenaire&nbsp;».
                </p>
              )}
              <CompanyRegistrationForm
                onDone={() => setDoneFor("entreprise")}
                onSwitchToSignIn={() => onTabChange("connexion")}
              />
            </>
          )}

          <p className="mt-6 border-t border-border pt-4 type-small text-muted-foreground">
            <Link
              href={signingIn ? "/connexion" : "/inscription-entreprise"}
              className="underline underline-offset-2 hover:text-foreground"
            >
              Ouvrir dans une page entière
            </Link>
          </p>
        </div>
      </ConvexClientProvider>
    </Modal>
  );
}
