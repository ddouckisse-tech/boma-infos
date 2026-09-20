import type { WithoutSystemFields } from "convex/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { applyCountDelta } from "./articleCounts";
import { syncStatSection } from "./audience";

/**
 * The only way `convex/` writes to `articles`.
 *
 * What is derived from an article is moved in the same transaction: the
 * counts of `articleCounts` (status, sections, author) and the section of
 * its audience row. A write that bypassed these three functions would leave
 * the counts wrong until the next `articleCounts.rebuild`.
 */

export type ArticleFields = WithoutSystemFields<Doc<"articles">>;

export async function insertArticle(
  ctx: MutationCtx,
  fields: ArticleFields
): Promise<Id<"articles">> {
  const id = await ctx.db.insert("articles", fields);
  await applyCountDelta(ctx, null, fields);
  return id;
}

/**
 * `row` is the article as this mutation read it, before this patch. A field
 * set to `undefined` is removed, as with `db.patch`.
 */
export async function patchArticle(
  ctx: MutationCtx,
  row: Doc<"articles">,
  patch: Partial<ArticleFields>
): Promise<void> {
  await ctx.db.patch(row._id, patch);
  const after = { ...row, ...patch };
  await applyCountDelta(ctx, row, after);
  if (after.categorySlug !== row.categorySlug) {
    // The audience stays under the slug it was counted with.
    for (const slug of new Set([row.slug, after.slug])) {
      await syncStatSection(ctx, slug, after.categorySlug);
    }
  }
}

export async function deleteArticle(
  ctx: MutationCtx,
  row: Doc<"articles">
): Promise<void> {
  await ctx.db.delete(row._id);
  await applyCountDelta(ctx, row, null);
}
