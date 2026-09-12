"use client";

import { useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

/**
 * Convex client wired to Better Auth — **not mounted by the public journal**.
 *
 * Milestone 2 reads Convex from the server only (`lib/content/server.ts`):
 * the pages are prerendered, so a reactive browser client would ship tens of
 * kilobytes of JavaScript and open a WebSocket on every page for data that
 * never changes between two revalidations. On a budget of 180 Ko of
 * JavaScript for the whole site (CDC §5.4), that is not affordable.
 *
 * Milestone 3 mounts this provider around the private areas, which are
 * reactive by nature and rendered per request anyway.
 */
export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useMemo(
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
