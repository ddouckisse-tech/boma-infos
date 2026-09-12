import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";

/**
 * Convex application composition.
 *
 * The Better Auth component owns its own tables (users, sessions, accounts,
 * verification tokens). Application tables live in `convex/schema.ts`.
 */
const app = defineApp();
app.use(betterAuth);

export default app;
