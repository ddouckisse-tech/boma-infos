"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import {
  FacebookIcon,
  LinkedInIcon,
  WhatsAppIcon,
} from "@/components/custom/brand-icons";
import type { LocaleChoice } from "@/lib/preferences";
import { localize } from "@/lib/i18n";
import { cx } from "@/lib/cx";

/** La capacité de partage natif ne change jamais : rien à écouter. */
const subscribeNothing = () => () => {};

/**
 * Sharing, WhatsApp first.
 *
 * WhatsApp is the first channel, followed by LinkedIn, Facebook and the
 * copy action.
 *
 * `navigator.share` is offered when the browser has it: on Android it opens
 * the system sheet, which is faster than any of these buttons.
 *
 * The `data-partage` attributes are read by the inline beacon of
 * `components/custom/audience-beacon.tsx`, which counts shares per channel
 * without adding a byte of JavaScript to this component (CDC §4.4, §5.4).
 */
export function ShareBar({
  url,
  title,
  locale,
  className,
}: {
  url: string;
  title: string;
  locale: LocaleChoice;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  // Lu par `useSyncExternalStore` : le serveur rend `false`, le client la
  // vraie valeur, sans effet ni rendu en cascade — et sans divergence
  // d'hydratation, que lire `navigator` pendant le rendu provoquerait.
  const canShareNatively = useSyncExternalStore(
    subscribeNothing,
    () => "share" in navigator,
    () => false
  );

  const encodedUrl = encodeURIComponent(url);
  const [copyFailed, setCopyFailed] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setCopyFailed(false);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Retour en ligne plutôt qu'une notification flottante : le message
      // reste à côté du bouton qui l'a produit, et le journal n'embarque
      // pas de bibliothèque de notifications (§5.4).
      setCopyFailed(true);
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        await copy();
      }
    }
  };

  const control =
    "inline-flex items-center gap-2 rounded-xs px-2 type-small font-medium text-foreground transition-colors touch-target hover:bg-surface-muted";

  return (
    <div className={cx("flex flex-wrap items-center gap-2", className)}>
      <span className="me-1 type-small font-semibold text-muted-foreground">
        {localize(locale, { fr: "Partager", en: "Share" })}
      </span>

      <a
        href={`https://wa.me/?text=${encodedUrl}`}
        data-partage="whatsapp"
        target="_blank"
        rel="noopener noreferrer"
        className={control}
      >
        <WhatsAppIcon className="size-4 shrink-0" />
        WhatsApp
        <span className="sr-only">
          {localize(locale, {
            fr: "(nouvelle fenêtre)",
            en: "(opens in a new window)",
          })}
        </span>
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        data-partage="linkedin"
        target="_blank"
        rel="noopener noreferrer"
        className={control}
      >
        <LinkedInIcon className="size-4 shrink-0" />
        LinkedIn
        <span className="sr-only">
          {localize(locale, {
            fr: "(nouvelle fenêtre)",
            en: "(opens in a new window)",
          })}
        </span>
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        data-partage="facebook"
        target="_blank"
        rel="noopener noreferrer"
        className={control}
      >
        <FacebookIcon className="size-4 shrink-0" />
        Facebook
        <span className="sr-only">
          {localize(locale, {
            fr: "(nouvelle fenêtre)",
            en: "(opens in a new window)",
          })}
        </span>
      </a>

      <button
        type="button"
        onClick={copy}
        data-partage="lien"
        className={control}
      >
        {copied ? (
          <Check aria-hidden="true" className="size-4 shrink-0" />
        ) : (
          <Copy aria-hidden="true" className="size-4 shrink-0" />
        )}
        {copied
          ? localize(locale, { fr: "Lien copié", en: "Link copied" })
          : localize(locale, { fr: "Copier le lien", en: "Copy link" })}
      </button>

      {copyFailed && (
        <p role="alert" className="basis-full type-small text-destructive">
          {localize(locale, {
            fr: "La copie automatique a été refusée par le navigateur. Sélectionnez l'adresse dans la barre du navigateur.",
            en: "The browser blocked automatic copying. Select the address in the browser's address bar.",
          })}
        </p>
      )}

      {canShareNatively && (
        <button type="button" onClick={nativeShare} className={control}>
          <Share2 aria-hidden="true" className="size-4 shrink-0" />
          {localize(locale, { fr: "Autre", en: "More" })}
        </button>
      )}
    </div>
  );
}
