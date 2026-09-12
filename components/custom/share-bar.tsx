"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import {
  FacebookIcon,
  LinkedInIcon,
  WhatsAppIcon,
} from "@/components/custom/brand-icons";
import { cn } from "@/lib/utils";

/**
 * Sharing, WhatsApp first.
 *
 * At Libreville an article travels by WhatsApp, so it is the first control
 * and the only one with a filled button — not a small icon at the end of a
 * row (CDC §2.2). LinkedIn and Facebook follow, then copying the link, which
 * is what people actually use when the share sheet is in the way.
 *
 * `navigator.share` is offered when the browser has it: on Android it opens
 * the system sheet, which is faster than any of these buttons.
 */
export function ShareBar({
  url,
  title,
  className,
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  // Décidé après hydratation : lire `navigator` pendant le rendu produirait
  // un balisage serveur différent du balisage client.
  const [canShareNatively, setCanShareNatively] = useState(false);

  useEffect(() => {
    setCanShareNatively(
      typeof navigator !== "undefined" && "share" in navigator
    );
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

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
    } catch {
      // L'utilisateur a fermé la feuille de partage : rien à signaler.
    }
  };

  const secondary =
    "inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 type-small font-medium text-foreground transition-colors touch-target hover:border-border-strong";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="me-1 type-small font-semibold text-muted-foreground">
        Partager
      </span>

      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md bg-success-token px-4 type-small font-semibold text-white transition-opacity touch-target hover:opacity-90 dark:text-neutral-950"
      >
        <WhatsAppIcon className="size-4 shrink-0" />
        WhatsApp
        <span className="sr-only">(nouvelle fenêtre)</span>
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={secondary}
      >
        <LinkedInIcon className="size-4 shrink-0" />
        LinkedIn
        <span className="sr-only">(nouvelle fenêtre)</span>
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={secondary}
      >
        <FacebookIcon className="size-4 shrink-0" />
        Facebook
        <span className="sr-only">(nouvelle fenêtre)</span>
      </a>

      <button type="button" onClick={copy} className={secondary}>
        {copied ? (
          <Check aria-hidden="true" className="size-4 shrink-0" />
        ) : (
          <Copy aria-hidden="true" className="size-4 shrink-0" />
        )}
        {copied ? "Lien copié" : "Copier le lien"}
      </button>

      {copyFailed && (
        <p role="alert" className="basis-full type-small text-destructive">
          La copie automatique a été refusée par le navigateur. Sélectionnez
          l&apos;adresse dans la barre du navigateur.
        </p>
      )}

      {canShareNatively && (
        <button
          type="button"
          onClick={nativeShare}
          className={cn(secondary, "sm:hidden")}
        >
          <Share2 aria-hidden="true" className="size-4 shrink-0" />
          Autre
        </button>
      )}
    </div>
  );
}
