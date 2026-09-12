import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { accessError, PERMISSIONS, requirePermission } from "./model/access";
import { recordAudit } from "./model/audit";
import { slugify } from "./model/text";

/**
 * Sections — CDC §4.1: "administrables (ajout, renommage, réordonnancement,
 * couleur d'accent) sans intervention technique".
 *
 * The accent is not free text: it is one of the six ramps of §3.1, because a
 * section painted in an arbitrary hex would break the contrast guarantees of
 * §3.5 the first time someone picked a light one.
 */

const ACCENTS = [
  "navy-900",
  "navy-700",
  "navy-600",
  "magenta-600",
  "magenta-700",
  "magenta-800",
] as const;

const categoryShape = v.object({
  _id: v.id("categories"),
  name: v.string(),
  slug: v.string(),
  parentSlug: v.optional(v.string()),
  accent: v.string(),
  order: v.number(),
  description: v.string(),
  isActive: v.boolean(),
  articleCount: v.number(),
});

export const accents = ACCENTS;

export const list = query({
  args: {},
  returns: v.array(categoryShape),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const rows = await ctx.db.query("categories").collect();
    const articles = await ctx.db.query("articles").collect();
    const counts = new Map<string, number>();
    for (const article of articles) {
      counts.set(
        article.categorySlug,
        (counts.get(article.categorySlug) ?? 0) + 1
      );
      if (article.subCategorySlug) {
        counts.set(
          article.subCategorySlug,
          (counts.get(article.subCategorySlug) ?? 0) + 1
        );
      }
    }
    return rows
      .sort((a, b) => a.order - b.order)
      .map((row) => ({
        _id: row._id,
        name: row.name,
        slug: row.slug,
        parentSlug: row.parentSlug,
        accent: row.accent,
        order: row.order,
        description: row.description,
        isActive: row.isActive,
        articleCount: counts.get(row.slug) ?? 0,
      }));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    parentSlug: v.optional(v.string()),
    accent: v.string(),
    description: v.string(),
  },
  returns: v.id("categories"),
  handler: async (ctx, args) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.categoriesWrite);
    const name = args.name.trim();
    if (name.length < 2)
      throw new Error("Le nom de la rubrique est trop court.");
    const accent = (ACCENTS as readonly string[]).includes(args.accent)
      ? args.accent
      : "navy-900";

    let slug = slugify(name);
    const clash = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (clash) slug = `${slug}-2`;

    const siblings = await ctx.db.query("categories").collect();
    const order =
      Math.max(
        0,
        ...siblings
          .filter((row) => row.parentSlug === args.parentSlug)
          .map((row) => row.order)
      ) + 1;

    const id = await ctx.db.insert("categories", {
      name,
      slug,
      parentSlug: args.parentSlug || undefined,
      accent,
      order,
      description: args.description.trim(),
      isActive: true,
    });
    await recordAudit(ctx, viewer, "category.create", "category", id, name);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.string(),
    accent: v.string(),
    description: v.string(),
    isActive: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.categoriesWrite);
    const row = await ctx.db.get(args.id);
    if (!row) throw accessError("FORBIDDEN");
    const accent = (ACCENTS as readonly string[]).includes(args.accent)
      ? args.accent
      : row.accent;

    // Le slug ne bouge pas : il est dans les URL publiques et dans le plan
    // de redirection du §5.6. Renommer ne doit pas casser un lien.
    await ctx.db.patch(args.id, {
      name: args.name.trim() || row.name,
      accent,
      description: args.description.trim(),
      isActive: args.isActive,
    });
    await recordAudit(
      ctx,
      viewer,
      "category.update",
      "category",
      args.id,
      `${row.name} → ${args.name.trim()}`
    );
    return null;
  },
});

export const reorder = mutation({
  args: { ids: v.array(v.id("categories")) },
  returns: v.null(),
  handler: async (ctx, { ids }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.categoriesWrite);
    let order = 1;
    for (const id of ids) {
      const row = await ctx.db.get(id);
      if (!row) continue;
      await ctx.db.patch(id, { order: order++ });
    }
    await recordAudit(
      ctx,
      viewer,
      "category.update",
      "category",
      "-",
      "Réordonnancement des rubriques"
    );
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.categoriesWrite);
    const row = await ctx.db.get(id);
    if (!row) return null;
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_category", (q) =>
        q.eq("status", "published").eq("categorySlug", row.slug)
      )
      .take(1);
    if (articles.length > 0) {
      throw new Error(
        "Cette rubrique porte des articles publiés : désactivez-la plutôt que de la supprimer."
      );
    }
    await ctx.db.delete(id);
    await recordAudit(ctx, viewer, "category.delete", "category", id, row.name);
    return null;
  },
});
