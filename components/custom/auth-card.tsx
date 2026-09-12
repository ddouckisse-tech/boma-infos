"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { Modal } from "@/components/custom/modal";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { SignInForm } from "@/components/custom/sign-in-form";
import { CompanyRegistrationForm } from "@/components/custom/company-registration-form";
import { AdminTrigger } from "@/components/custom/admin-trigger";

export type AuthTab = "connexion" | "entreprise" | "admin";

const SWITCH = [
  ["connexion", "Connexion"],
  ["entreprise", "Inscription entreprise"],
] as const;

/**
 * Access card — the floating form opened from the masthead (§4.3, §4.4).
 *
 * This module is **loaded on demand**, never on first paint. Everything
 * expensive lives behind that boundary: Better Auth's browser client, the
 * Convex reactive client, the form fields. The journal's JavaScript budget
 * is 180 Ko for the whole site (§5.4) — the ~40 Ko this card costs are paid
 * by the reader who clicks "Connexion", not by the reader who came to read
 * an article. That is the entire reason this is a separate chunk.
 *
 * `ConvexClientProvider` is mounted here rather than in the journal's layout,
 * for the same reason: the registration form calls a Convex action, and a
 * reactive client on every public page would open a WebSocket for data that
 * never changes between two revalidations.
 *
 * Three states. `connexion` and `entreprise` share a centred switch, so a
 * visitor can never confuse signing in with asking for an account — the two
 * labels say exactly what they do. `admin` is reached from the discreet key
 * in the footers (double click) and lands on the newsroom rather than on the
 * profile page; it is the same sign-in endpoint underneath, the server alone
 * decides what the account may do.
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

  const admin = tab === "admin";
  const signingIn = tab === "connexion";
  const title = admin
    ? "Administration"
    : signingIn
      ? "Connexion"
      : done
        ? "Demande enregistrée"
        : "Inscription entreprise";
  const heading = admin ? "Administration" : done ? title : "Espace privé";
  const fullPage =
    signingIn || admin ? "/connexion" : "/inscription-entreprise";

  return (
    <Modal
      open
      onClose={onClose}
      label={title}
      variant="panel"
      className="lc-auth"
    >
      <ConvexClientProvider>
        {/* En-tête discret : l'interrupteur porte la hiérarchie, lui ne fait
            qu'identifier la boîte et offrir la sortie. */}
        <div className="flex items-center justify-between gap-3 border-b border-border py-2 ps-5 pe-3 md:ps-8 md:pe-4">
          <h2
            id={titleId}
            className="type-small font-semibold tracking-wide text-muted-foreground uppercase"
          >
            {heading}
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

        <div className="lc-auth-body px-5 py-3 md:px-8">
          {admin ? (
            <>
              <p className="mb-5 type-small text-muted-foreground">
                Accès réservé à l&apos;administration du journal. La double
                authentification est obligatoire.
              </p>
              <SignInForm variant="admin" />
              <p className="mt-5 type-small">
                <button
                  type="button"
                  onClick={() => onTabChange("connexion")}
                  className="inline-flex items-center gap-1 text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  <ArrowLeft aria-hidden="true" className="size-3.5" />
                  Retour à la connexion
                </button>
              </p>
            </>
          ) : (
            <>
              {!done && (
                <>
                  {/* Interrupteur centré : deux positions, deux libellés qui
                      disent ce qu'ils font. Fond `background` + filet fort,
                      pour rester visible que la carte soit blanche (clair) ou
                      #1F1F1F (sombre) ; l'état actif prend l'action primaire. */}
                  <div
                    role="tablist"
                    aria-label="Connexion ou inscription"
                    className="mx-auto flex w-fit rounded-full border border-border-strong bg-background p-1"
                  >
                    {SWITCH.map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={tab === value}
                        onClick={() => onTabChange(value)}
                        className={
                          "min-h-11 rounded-full px-5 type-small font-semibold transition-colors " +
                          (tab === value
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground")
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <p className="mx-auto mt-4 mb-4 text-center type-small text-muted-foreground">
                    {signingIn
                      ? "Espace réservé à la rédaction et aux entreprises partenaires."
                      : "Relu par la rédaction, tout contenu partenaire porte la mention « Contenu partenaire »."}
                  </p>
                </>
              )}

              {signingIn ? (
                <SignInForm
                  onSwitchToRegister={() => onTabChange("entreprise")}
                />
              ) : (
                <CompanyRegistrationForm
                  compact
                  onDone={() => setDoneFor("entreprise")}
                  onSwitchToSignIn={() => onTabChange("connexion")}
                />
              )}
            </>
          )}
        </div>

        {/* Pied fixe : la sortie vers la page entière, et — discrète, à
            droite — la clé de l'administration, au double-clic. */}
        <div className="flex items-center justify-between gap-4 border-t border-border py-2 ps-5 pe-2 md:ps-8 md:pe-4">
          <Link
            href={fullPage}
            className="type-small text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Ouvrir dans une page entière
          </Link>
          {!admin && <AdminTrigger onOpen={() => onTabChange("admin")} />}
        </div>
      </ConvexClientProvider>
    </Modal>
  );
}
