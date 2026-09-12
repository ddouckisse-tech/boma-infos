import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

/**
 * Convex identity providers. Better Auth issues the JWTs; `CONVEX_SITE_URL`
 * is injected by the Convex runtime and points at the deployment's HTTP
 * actions URL, where `convex/http.ts` mounts the Better Auth routes.
 */
export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
