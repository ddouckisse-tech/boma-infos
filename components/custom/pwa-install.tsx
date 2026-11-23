"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LocalizedText } from "@/components/custom/localized-text";
import { usePreferences } from "@/components/providers/preferences-provider";
import { localize } from "@/lib/i18n";
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
        <LocalizedText
          fr="L’application est installée."
          en="The app is installed."
        />{" "}
        <Link
          href="/"
          prefetch={false}
          className="underline underline-offset-4"
        >
          <LocalizedText fr="Ouvrir le journal" en="Open the newspaper" />
        </Link>
      </p>
    );
  if (state.requested)
    return (
      <p className="type-small" role="status">
        <LocalizedText
          fr="Installation demandée. Suivez la confirmation de votre navigateur."
          en="Follow your browser’s prompt to finish installation."
        />
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
          {state.busy ? (
            <LocalizedText fr="Installation en cours…" en="Installing…" />
          ) : (
            <LocalizedText fr="Installer l’application" en="Install the app" />
          )}
        </button>
      ) : (
        <a className="boma-pwa-button" href={href}>
          {state.platform === "ios" ? (
            <LocalizedText
              fr="Ajouter à l’écran d’accueil"
              en="Add to Home Screen"
            />
          ) : (
            <LocalizedText
              fr="Comment installer l’application"
              en="How to install the app"
            />
          )}
        </a>
      )}
      {failed && (
        <p className="mt-3 type-small" role="status">
          <LocalizedText
            fr="La fenêtre d’installation n’a pas pu s’ouvrir."
            en="The installation prompt could not be opened."
          />{" "}
          <a href={href} className="underline underline-offset-4">
            <LocalizedText
              fr="Suivez les étapes d’installation."
              en="Follow the installation steps."
            />
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
  const { locale } = usePreferences();
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
          <LocalizedText
            fr="Votre journal, à portée de main"
            en="Your newspaper at your fingertips"
          />
        </p>
        <h2 id="boma-pwa-title" className="font-display type-h3">
          <LocalizedText fr="Installez BOMA Infos" en="Install BOMA Infos" />
        </h2>
        <p className="mt-2 type-small text-muted-foreground">
          <LocalizedText
            fr="Ajoutez gratuitement l’application à votre écran d’accueil pour retrouver le journal en un geste."
            en="Add the free app to your home screen and open the newspaper with one tap."
          />
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
        aria-label={localize(locale, {
          fr: "Masquer la proposition d’installation pendant 14 jours",
          en: "Dismiss the installation invitation for 14 days",
        })}
      >
        <LocalizedText fr="Plus tard" en="Later" />
      </button>
    </aside>
  );
}
