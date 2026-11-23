import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { MEDIA } from "./mediaManifest";
import { articleMediaKeys } from "./model/media";
import {
  englishArticleValidator,
  englishSearchText,
  translationSource,
} from "./model/translation";

const DONE = Number.MAX_SAFE_INTEGER;
const LEASE_MS = 10 * 60_000;
const RETRY_MS = 60 * 60_000;
const BATCH_SIZE = 4;

export const claim = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const claimedUntil = now + LEASE_MS;
    const rows = await ctx.db
      .query("articles")
      .withIndex("by_english_queue", (q) =>
        q.eq("status", "published").lt("englishRetryAt", now)
      )
      .order("desc")
      .take(BATCH_SIZE);

    return Promise.all(
      rows.map(async (row) => {
        await ctx.db.patch(row._id, { englishRetryAt: claimedUntil });
        const media = Object.fromEntries(
          await Promise.all(
            [...articleMediaKeys(row)].map(async (key) => {
              const asset = await ctx.db
                .query("media")
                .withIndex("by_key", (q) => q.eq("key", key))
                .unique();
              const { alt = "", caption = "" } = asset ?? MEDIA[key] ?? {};
              return [key, { alt, caption }] as const;
            })
          )
        );
        const author = await ctx.db
          .query("authors")
          .withIndex("by_slug", (q) => q.eq("slug", row.authorSlug))
          .unique();
        return {
          id: row._id,
          claimedUntil,
          source: translationSource(row),
          media,
          author: {
            authorRole: author?.role ?? "",
            authorBio: author?.bio ?? "",
          },
        };
      })
    );
  },
});

/** A late reply cannot publish the translation of a previous edit. */
export const finish = internalMutation({
  args: {
    id: v.id("articles"),
    claimedUntil: v.number(),
    english: v.optional(englishArticleValidator),
    sourceAuthor: v.optional(
      v.object({
        authorRole: v.string(),
        authorBio: v.string(),
      })
    ),
  },
  handler: async (ctx, { id, claimedUntil, english, sourceAuthor }) => {
    const row = await ctx.db.get(id);
    if (
      !row ||
      row.status !== "published" ||
      row.englishRetryAt !== claimedUntil
    )
      return;

    await ctx.db.patch(
      id,
      english
        ? {
            english,
            englishSearchText: englishSearchText(english),
            englishRetryAt: DONE,
          }
        : { englishRetryAt: Date.now() + RETRY_MS }
    );

    if (!english || !sourceAuthor) return;
    const author = await ctx.db
      .query("authors")
      .withIndex("by_slug", (q) => q.eq("slug", row.authorSlug))
      .unique();
    if (
      author &&
      author.role === sourceAuthor.authorRole &&
      author.bio === sourceAuthor.authorBio &&
      (author.englishProfile?.sourceRole !== author.role ||
        author.englishProfile?.sourceBio !== author.bio)
    ) {
      await ctx.db.patch(author._id, {
        englishProfile: {
          role: english.authorRole,
          bio: english.authorBio,
          sourceRole: author.role,
          sourceBio: author.bio,
        },
      });
    }
  },
});
