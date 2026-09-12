import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Honours the publication dates the newsroom set — CDC §4.4 step 5
 * ("Publication par la rédaction, à la date convenue").
 *
 * Internal only, driven by `convex/crons.ts`. Note what it does **not** do:
 * it never decides that something should be published. It moves a row a
 * human already put in `scheduled`, on a date that same human chose. The
 * audit line names "Ordonnanceur" as the actor so the trail stays honest.
 */
export const releaseDue = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.db
      .query("articles")
      .withIndex("by_status_date", (q) =>
        q.eq("status", "scheduled").lte("publishedAt", now)
      )
      .take(20);

    for (const article of due) {
      await ctx.db.patch(article._id, { status: "published", updatedAt: now });
      await ctx.db.insert("auditLog", {
        at: now,
        actorSubject: "-",
        actorName: "Ordonnanceur",
        actorRole: "système",
        action: "article.publish",
        targetType: "article",
        targetId: article._id,
        summary: `${article.title} — publication programmée honorée`,
      });

      const submission = (
        await ctx.db
          .query("submissions")
          .withIndex("by_status", (q) => q.eq("status", "scheduled"))
          .collect()
      ).find((row) => row.publishedArticleSlug === article.slug);
      if (submission) {
        await ctx.db.patch(submission._id, {
          status: "published",
          updatedAt: now,
        });
      }
    }

    return due.length;
  },
});
