"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  dismissPwaInvitation,
  getPwaServerSnapshot,
  getPwaSnapshot,
  requestPwaInstall,
  subscribePwa,
} from "@/lib/pwa-browser";
import { isInstallInvitationPage, shouldOfferInstall } from "@/lib/pwa-policy";
import "./pwa-install.css";

function useInstall() {
  return useSyncExternalStore(
    subscribePwa,
    getPwaSnapshot,
    getPwaServerSnapshot
  );
}

export function PwaInstallAction({ className = "" }: { className?: string }) {
  const state = useInstall();
  const [failed, setFailed] = useState(false);
  const href = state.embedded
    ? "/installer#navigateur-integre"
    : state.platform === "ios"
      ? "/installer#iphone-ipad"
      : state.platform === "android"
        ? "/installer#android"
        : "/installer#instructions";
  if (state.installed || state.standalone)
    return (
      <p className="type-small" role="status">
        L’application est installée.{" "}
        <Link
          href="/"
          prefetch={false}
          className="underline underline-offset-4"
        >
          Ouvrir le journal
        </Link>
      </p>
    );
  if (state.requested)
    return (
      <p className="type-small" role="status">
        Installation demandée. Suivez la confirmation de votre navigateur.
      </p>
    );
  return (
    <div className={className}>
      {(state.nativeReady || state.busy) && !state.embedded ? (
        <button
          type="button"
          className="boma-pwa-button"
          disabled={state.busy}
          onClick={async () => {
            const result = await requestPwaInstall();
            setFailed(result === "error" || result === "unavailable");
          }}
        >
          {state.busy ? "Installation en cours…" : "Installer l’application"}
        </button>
      ) : (
        <a className="boma-pwa-button" href={href}>
          {state.platform === "ios"
            ? "Ajouter à l’écran d’accueil"
            : "Comment installer l’application"}
        </a>
      )}
      {failed && (
        <p className="mt-3 type-small" role="status">
          La fenêtre d’installation n’a pas pu s’ouvrir.{" "}
          <a href={href} className="underline underline-offset-4">
            Suivez les étapes d’installation.
          </a>
        </p>
      )}
    </div>
  );
}

/** Home only: reading articles does not download this installation UI. */
export function PwaInstallInvitation() {
  const state = useInstall();
  const pathname = usePathname();
  if (
    !state.ready ||
    state.installed ||
    state.requested ||
    !isInstallInvitationPage(pathname) ||
    !shouldOfferInstall({ ...state, now: state.checkedAt })
  )
    return null;
  return (
    <aside className="boma-pwa-invitation" aria-labelledby="boma-pwa-title">
      {/* The existing application icon is reused without changing its artwork. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="boma-pwa-brand"
        src="/icons/apple-touch-icon.png?v=boma-1"
        width={48}
        height={48}
        alt=""
        loading="lazy"
      />
      <div className="boma-pwa-copy">
        <p className="type-small text-muted-foreground">
          Votre journal, à portée de main
        </p>
        <h2 id="boma-pwa-title" className="font-display type-h3">
          Installez BOMA Infos
        </h2>
        <p className="mt-2 type-small text-muted-foreground">
          Ajoutez gratuitement l’application à votre écran d’accueil pour
          retrouver le journal en un geste.
        </p>
        <PwaInstallAction className="mt-4" />
      </div>
      <button
        type="button"
        className="boma-pwa-dismiss"
        onClick={() => {
          dismissPwaInvitation();
          requestAnimationFrame(() =>
            document.getElementById("contenu")?.focus({ preventScroll: true })
          );
        }}
        aria-label="Masquer la proposition d’installation pendant 14 jours"
      >
        Plus tard
      </button>
    </aside>
  );
}
