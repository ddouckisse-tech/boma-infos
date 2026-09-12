import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "";

/**
 * Server-side Better Auth bridge.
 *
 * Better Auth's HTTP routes live on the Convex deployment; this helper
 * forwards `/api/auth/*` from the Next.js origin to them, and exposes the
 * token helpers that milestone 3 will use for server components and
 * authenticated Convex calls. No sign-in screen exists yet.
 */
export const convexAuthNextjs = convexBetterAuthNextJs({
  convexUrl,
  convexSiteUrl,
});
