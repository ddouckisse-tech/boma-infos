import { convexAuthNextjs } from "@/lib/auth-server";

/**
 * Proxies Better Auth's HTTP routes, which are served by the Convex
 * deployment, under the site's own origin. Keeping them same-origin is what
 * lets the Content-Security-Policy stay at `connect-src 'self'` for auth.
 */
export const { GET, POST } = convexAuthNextjs.handler;
