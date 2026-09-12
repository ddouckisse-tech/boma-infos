import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Minimal reactive query used by the footer badge to prove that the browser
 * really is connected to the Convex deployment (milestone 1 acceptance
 * criterion: "connexion fonctionnelle").
 */
export const status = query({
  args: {},
  returns: v.object({ ok: v.boolean(), serverTime: v.number() }),
  handler: async () => ({
    ok: true,
    // Server-side timestamp: if the value renders, the round trip worked.
    serverTime: Date.now(),
  }),
});
