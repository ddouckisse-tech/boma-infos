"use client";

import { useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

/**
 * Convex client wired to Better Auth.
 *
 * When `NEXT_PUBLIC_CONVEX_URL` is missing the app still renders: the design
 * system must remain reviewable without a backend. Components that read Convex
 * data guard on `useConvexAvailable()`.
 */
export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useMemo(
    // Public queries must run without a session: the journal is readable by
    // anyone, so `expectAuth` stays off.
    () => (convexUrl ? new ConvexReactClient(convexUrl) : undefined),
    []
  );

  if (!client) return <>{children}</>;

  return (
    <ConvexBetterAuthProvider
      client={client}
      // @convex-dev/better-auth 0.12 dérive le type de `authClient` de sa
      // propre copie de better-auth ; d'une version mineure à l'autre
      // l'inférence du plugin convex() diverge alors que le contrat
      // d'exécution est identique. Le transtypage est restreint à cette prop
      // et ne masque aucun `any`.
      authClient={
        authClient as unknown as React.ComponentProps<
          typeof ConvexBetterAuthProvider
        >["authClient"]
      }
    >
      {children}
    </ConvexBetterAuthProvider>
  );
}

export const isConvexConfigured = Boolean(convexUrl);
