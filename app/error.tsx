"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { BrandWordmark } from "@/components/custom/brand-wordmark";
import { Container } from "@/components/custom/container";

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
    <Container width="reading" className="py-8">
      {/* Cette limite d'erreur est celle de la racine : elle attrape aussi
          les pannes de la mise en page du journal, donc elle ne peut pas
          compter sur l'en-tête. Elle porte son propre bandeau. */}
      <div className="mb-8 border-b border-border pb-4">
        <BrandWordmark />
      </div>
      <div className="flex gap-4 rounded-md border border-l-2 border-border border-l-destructive bg-card p-6">
        <AlertTriangle
          aria-hidden="true"
          className="mt-1 size-6 shrink-0 text-destructive"
        />
        <div className="min-w-0">
          <h1 className="font-display type-h2">
            Le journal n&apos;a pas pu être affiché
          </h1>
          <p className="mt-3 type-body text-muted-foreground">
            Une erreur est survenue en chargeant cette page. Ce n&apos;est pas
            votre connexion&nbsp;: le problème est de notre côté.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
            >
              <RefreshCw aria-hidden="true" className="size-4" />
              Réessayer
            </button>
            <Link
              href="/"
              prefetch={false}
              className="inline-flex items-center rounded-md border border-border px-4 type-small font-semibold transition-colors touch-target hover:bg-surface-muted"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
          {error.digest && (
            <p className="mt-4 type-small text-muted-foreground">
              Référence technique&nbsp;:{" "}
              <code className="font-mono">{error.digest}</code>
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}
