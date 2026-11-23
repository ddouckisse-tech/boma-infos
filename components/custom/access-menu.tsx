"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Building2, LogIn, UserRound } from "lucide-react";
import type { AuthTab } from "@/components/custom/auth-card";
import { usePreferences } from "@/components/providers/preferences-provider";
import { localize } from "@/lib/i18n";

/**
 * Access to the private areas, from the masthead — CDC §4.3, §4.4.
 *
 * The card that holds the forms is a **separate chunk, fetched on the first
 * click**. This component is all the public journal pays for: two links and
 * a boolean. Better Auth's client, the Convex client and the eleven-field
 * registration form stay out of the budget of §5.4 until a reader actually
 * asks for them — which most readers, here to read an article, never do.
 *
 * The triggers are real `<a href>`. Middle-click, ⌘-click and a visitor
 * without JavaScript all reach `/connexion` and `/inscription-entreprise`,
 * which remain the canonical routes. The card is an enhancement layered on
 * top of navigation that already worked, never a replacement for it.
 */
const AuthCard = dynamic(
  () => import("@/components/custom/auth-card").then((m) => m.AuthCard),
  { ssr: false }
);

/** Laisse passer les gestes qui veulent une vraie page ou un nouvel onglet. */
function opensElsewhere(event: React.MouseEvent) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

export function AccessMenu() {
  const { locale } = usePreferences();
  const [tab, setTab] = useState<AuthTab | null>(null);
  const invoker = useRef<HTMLElement | null>(null);

  // Un seul gestionnaire, référencé et non appelé dans le rendu : l'onglet
  // voulu voyage par `data-tab`. Une fabrique `open(tab)` invoquée dans le
  // JSX ferait lire la ref pendant le rendu, ce que React 19 refuse.
  const open = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (opensElsewhere(event)) return;
    event.preventDefault();
    // Le déclencheur est mémorisé ICI, au clic. `Modal` le fait aussi, mais
    // trop tard : la carte est un module chargé à la demande, et pendant
    // l'aller-retour réseau le focus a déjà quitté le lien. Sans cela, une
    // fermeture par Échap renvoie le clavier sur `<body>` et le lecteur
    // repart du haut de la page (WCAG 2.4.3) — mesuré, pas supposé.
    invoker.current = event.currentTarget;
    setTab(event.currentTarget.dataset.tab as AuthTab);
  };

  // Le focus revient au déclencheur APRÈS le démontage, pas pendant `close`.
  // Fermer la carte et rappeler le focus dans la même passe ne marche pas :
  // le navigateur retire `<dialog>` du top layer après le commit et remet
  // alors le focus sur `<body>`, écrasant ce qu'on vient de faire — constaté.
  useEffect(() => {
    if (tab !== null) return;
    const trigger = invoker.current;
    invoker.current = null;
    if (trigger && document.contains(trigger)) trigger.focus();
  }, [tab]);

  return (
    <>
      {/* Sous md : un seul point d'entrée. La carte porte les deux onglets,
          donc rien n'est perdu — seule la place l'est. */}
      <Link
        href="/connexion"
        onClick={open}
        data-tab="connexion"
        aria-label={localize(locale, {
          fr: "Espace privé — connexion et espace entreprise",
          en: "Private area — sign in and company workspace",
        })}
        className="inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors touch-target hover:text-foreground md:hidden"
      >
        <UserRound aria-hidden="true" className="size-5" />
      </Link>

      <Link
        href="/inscription-entreprise"
        onClick={open}
        data-tab="entreprise"
        className="hidden items-center gap-1.5 rounded-md px-2.5 type-small font-semibold text-muted-foreground transition-colors touch-target hover:text-foreground md:inline-flex"
      >
        <Building2 aria-hidden="true" className="size-4" />
        {localize(locale, {
          fr: "Inscription entreprise",
          en: "Register a company",
        })}
      </Link>

      <Link
        href="/connexion"
        onClick={open}
        data-tab="connexion"
        className="journal-control hidden items-center gap-1.5 rounded-md px-3 type-small font-semibold text-foreground transition-colors touch-target hover:bg-surface-muted md:inline-flex"
      >
        <LogIn aria-hidden="true" className="size-4" />
        {localize(locale, { fr: "Connexion", en: "Sign in" })}
      </Link>

      {tab && (
        <AuthCard tab={tab} onTabChange={setTab} onClose={() => setTab(null)} />
      )}
    </>
  );
}
