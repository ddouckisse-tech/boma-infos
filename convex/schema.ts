import { defineSchema } from "convex/server";

/**
 * Application data model.
 *
 * Deliberately empty for milestone 1 ("Fondations"): the content model
 * (Article, Category, Author, Media, Organization, Submission, Newsletter,
 * AgentRun, AuditLog — see CAHIER-DES-CHARGES.md §5.2) is introduced in
 * milestone 2. Authentication tables are owned by the Better Auth component
 * declared in `convex/convex.config.ts`, not here.
 */
export default defineSchema({});
