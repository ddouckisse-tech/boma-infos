import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

/**
 * Browser-side Better Auth client.
 *
 * Milestone 1 only wires it up; there is no sign-in screen yet. Roles, 2FA and
 * revocable sessions (CAHIER-DES-CHARGES.md §4.3) land in milestone 3.
 */
export const authClient = createAuthClient({
  plugins: [convexClient()],
});
