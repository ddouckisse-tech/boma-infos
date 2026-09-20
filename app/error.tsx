"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- The root fallback must navigate even when the router or journal layout fails. */

import { useEffect } from "react";
import { LocalizedText } from "@/components/custom/localized-text";
import { BRAND_LOGO } from "@/lib/brand";

/**
 * Error boundary of the public journal.
 *
 * In practice the failure this catches is the journal being unreachable —
 * the database down, or the functions not deployed. It says so in French and
 * offers a retry, rather than showing the reader a stack trace or a blank
 * page. The technical detail (`digest`) is logged, never displayed.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[le-corporate] rendu interrompu", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-reading page-gutter py-8">
      {/* Cette limite d'erreur est celle de la racine : elle attrape aussi
          les pannes de la mise en page du journal, donc elle ne peut pas
          compter sur l'en-tête. Elle porte son propre bandeau. */}
      <div className="mb-8 border-b border-border pb-4">
        <a
          href="/"
          className="inline-flex min-h-11 w-44 max-w-full min-w-0 items-center sm:w-56"
        >
          <LocalizedText
            fr="Le Corporate — accueil"
            en="Le Corporate — home"
            className="sr-only"
          />
          <svg
            aria-hidden="true"
            focusable="false"
            width={BRAND_LOGO.width}
            height={BRAND_LOGO.height}
            viewBox={`0 0 ${BRAND_LOGO.width} ${BRAND_LOGO.height}`}
            className="block h-auto w-full"
          >
            <use
              href={`${BRAND_LOGO.sprite}#corporate`}
              className="fill-brand-navy dark:fill-white"
            />
            <use
              href={`${BRAND_LOGO.sprite}#accent`}
              className="fill-brand-magenta dark:fill-brand-magenta-dark"
            />
          </svg>
        </a>
      </div>
      <div className="flex gap-4 rounded-md border border-l-2 border-border border-l-destructive bg-card p-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="mt-1 size-6 shrink-0 text-destructive"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        <div className="min-w-0">
          <h1 className="font-display type-h2">
            <LocalizedText
              fr="Le journal n'a pas pu être affiché"
              en="The journal could not be displayed"
            />
          </h1>
          <p className="mt-3 type-body text-muted-foreground">
            <LocalizedText
              fr="Une erreur est survenue en chargeant cette page. Ce n'est pas votre connexion : le problème est de notre côté."
              en="An error occurred while loading this page. Your connection is not the problem; the issue is on our side."
            />
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-4"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              <LocalizedText fr="Réessayer" en="Try again" />
            </button>
            <a
              href="/"
              className="inline-flex items-center rounded-md border border-border px-4 type-small font-semibold transition-colors touch-target hover:bg-surface-muted"
            >
              <LocalizedText fr="Retour à l'accueil" en="Back to home" />
            </a>
          </div>
          {error.digest && (
            <p className="mt-4 type-small text-muted-foreground">
              <LocalizedText
                fr="Référence technique : "
                en="Technical reference: "
              />
              <code className="font-mono">{error.digest}</code>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
