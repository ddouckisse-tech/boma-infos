import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

/**
 * Browser-side Better Auth client — CDC §4.3.
 *
 * Used **only** inside `app/(prive)`. The public journal never imports it:
 * it is prerendered, has no account and no session, and the 180 Ko
 * JavaScript budget of §5.4 does not pay for an auth client nobody uses.
 *
 * `twoFactorClient` adds `authClient.twoFactor.*`. When a password is
 * correct but the second factor is still owed, `signIn.email` answers
 * `{ twoFactorRedirect: true }` and Better Auth has **not** opened a
 * session — which is exactly the guarantee §4.3 asks for. The sign-in
 * screen routes to `/connexion/verification` itself with the Next.js
 * router, rather than through the plugin's `onTwoFactorRedirect` hook: a
 * full page reload would throw away the client-side navigation for
 * nothing.
 */
export const authClient = createAuthClient({
  plugins: [twoFactorClient(), convexClient()],
});
