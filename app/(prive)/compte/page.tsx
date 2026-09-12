"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AccountPanels } from "@/components/custom/account-panels";
import { Container } from "@/components/custom/container";
import { BrandWordmark } from "@/components/custom/brand-wordmark";
import { LocaleToggle } from "@/components/custom/locale-toggle";
import { LocalizedText } from "@/components/custom/localized-text";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { usePreferences } from "@/components/providers/preferences-provider";

/**
 * Account screen — CDC §4.3: profile, access code, optional verification by
 * app, revocable sessions. The panels themselves live in
 * `components/custom/account-panels.tsx` and are shared with « Mon compte »
 * inside the newsroom; this route stays the canonical address for company
 * and reader accounts, and for a bookmark.
 */
export default function AccountPage() {
  const { locale } = usePreferences();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.accounts.me, isAuthenticated ? {} : "skip");

  if (isLoading || (isAuthenticated && viewer === undefined)) {
    return (
      <Shell>
        <p className="type-body text-muted-foreground" role="status">
          {locale === "en" ? "Loading account…" : "Chargement du compte…"}
        </p>
      </Shell>
    );
  }

  if (!isAuthenticated || viewer === null || viewer === undefined) {
    return (
      <Shell>
        <p className="type-body">
          {locale === "en"
            ? "You are not signed in. "
            : "Vous n'êtes pas connecté. "}
          <Link href="/connexion" className="text-accent underline">
            {locale === "en" ? "Sign in" : "Se connecter"}
          </Link>
          .
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <AccountPanels viewer={viewer} showHome />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-muted">
      <div className="border-b border-border bg-background">
        <Container
          width="page"
          className="flex items-center justify-between py-3"
        >
          <BrandWordmark className="w-36 sm:w-56" />
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle compact />
            <LocaleToggle />
            <Link
              href="/"
              className="hidden items-center rounded-md px-3 type-small font-semibold text-muted-foreground touch-target hover:text-foreground sm:inline-flex"
            >
              <LocalizedText fr="Retour au journal" en="Back to the journal" />
            </Link>
          </div>
        </Container>
      </div>
      <main id="contenu" tabIndex={-1} className="focus-visible:outline-none">
        <Container width="page" className="py-8">
          <h1 className="mb-6 font-display type-h1">
            <LocalizedText fr="Mon compte" en="My account" />
          </h1>
          {children}
        </Container>
      </main>
    </div>
  );
}
