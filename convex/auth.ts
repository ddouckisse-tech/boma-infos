import { betterAuth } from "better-auth";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

/**
 * Public site URL, used by Better Auth to build absolute callback URLs.
 * Set `SITE_URL` on the Convex deployment (`npx convex env set SITE_URL ...`).
 */
const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

/** Backend handle on the Better Auth Convex component. */
export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Better Auth instance, rebuilt per Convex request context.
 *
 * Milestone 1 wires the plumbing only: no sign-in screen, no roles, no 2FA.
 * Those arrive in milestone 3 (CAHIER-DES-CHARGES.md §4.3).
 */
export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      // Account enumeration is a documented flaw of the legacy site
      // (CAHIER-DES-CHARGES.md §5.3): never confirm whether an address exists.
      disableSignUp: true,
    },
    plugins: [convex({ authConfig })],
  });
