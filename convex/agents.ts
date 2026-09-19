import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { accessError, PERMISSIONS, requirePermission } from "./model/access";
import { patchArticle } from "./model/articleWrites";
import { recordAudit } from "./model/audit";
import { agentKey, AGENTS, AGENT_MODELS } from "./model/agents";
import { mediaDerivedFields, syncArticleMedia } from "./model/media";
import { readingMinutes, searchText, slugify, periodOf } from "./model/text";

/**
 * Agent journal, suggestions and their fate — CDC §4.6.
 *
 * The guard rails live here, not in a document:
 *
 *  - **An agent proposes, a human disposes.** Nothing in this file writes a
 *    field on its own. `decide` is the only path from a suggestion to the
 *    content, and it needs a signed-in editor.
 *  - **A rejected suggestion is never re-applied.** Each proposal carries a
 *    fingerprint of (field, value); `pendingFingerprints` filters out
 *    anything already refused for the same target, so a later run cannot
 *    silently put it back.
 *  - **Monthly cap with warning and stop.** `budgetState` is consulted
 *    before every run and returns `stopped` once the cap is reached.
 *  - **Individual switch.** `agentEnabled` is read on the way in.
 */

const targetType = v.union(
  v.literal("article"),
  v.literal("submission"),
  v.literal("media"),
  v.literal("newsletter")
);

const runShape = v.object({
  _id: v.id("agentRuns"),
  agentKey: agentKey,
  agentName: v.string(),
  status: v.string(),
  mode: v.string(),
  model: v.string(),
  targetType: v.string(),
  targetId: v.string(),
  targetLabel: v.string(),
  summary: v.string(),
  error: v.optional(v.string()),
  inputTokens: v.number(),
  outputTokens: v.number(),
  costMicros: v.number(),
  triggeredBy: v.string(),
  createdAt: v.number(),
  finishedAt: v.optional(v.number()),
});

const suggestionShape = v.object({
  _id: v.id("agentSuggestions"),
  runId: v.id("agentRuns"),
  agentKey: agentKey,
  agentName: v.string(),
  mode: v.string(),
  field: v.string(),
  label: v.string(),
  rationale: v.string(),
  current: v.optional(v.string()),
  proposed: v.string(),
  status: v.string(),
  decidedBy: v.optional(v.string()),
  decidedAt: v.optional(v.number()),
  createdAt: v.number(),
  /** False for advisory output (moderation card, social copy, transcript). */
  applies: v.boolean(),
});

/** Fields that actually write something when accepted. */
const APPLIES = new Set([
  "title",
  "dek",
  "seo.slug",
  "seo.description",
  "seo.keywords",
  "alt",
  "caption",
  "interview",
]);

const isApplicable = (field: string): boolean =>
  APPLIES.has(field) || field.startsWith("body.");

/** FNV-1a, 32 bits. Enough to recognise "the same suggestion again". */
export function fingerprint(field: string, proposed: string): string {
  let hash = 0x811c9dc5;
  const input = `${field}\u0000${proposed}`;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/* -------------------------------------------------------------------------
   Reads
   ------------------------------------------------------------------------- */

export const forTarget = query({
  args: { targetType, targetId: v.string() },
  returns: v.object({
    runs: v.array(runShape),
    suggestions: v.array(suggestionShape),
  }),
  handler: async (ctx, args) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const runs = await ctx.db
      .query("agentRuns")
      .withIndex("by_target", (q) =>
        q.eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .order("desc")
      .take(20);
    const modeOf = new Map(runs.map((run) => [run._id, run.mode]));

    const suggestions = (
      await ctx.db
        .query("agentSuggestions")
        .withIndex("by_target", (q) =>
          q.eq("targetType", args.targetType).eq("targetId", args.targetId)
        )
        .collect()
    ).sort((a, b) => b.createdAt - a.createdAt);

    return {
      runs: runs.map((run) => ({
        _id: run._id,
        agentKey: run.agentKey,
        agentName: AGENTS[run.agentKey].name,
        status: run.status,
        mode: run.mode,
        model: run.model,
        targetType: run.targetType,
        targetId: run.targetId,
        targetLabel: run.targetLabel,
        summary: run.summary,
        error: run.error,
        inputTokens: run.inputTokens,
        outputTokens: run.outputTokens,
        costMicros: run.costMicros,
        triggeredBy: run.triggeredBy,
        createdAt: run.createdAt,
        finishedAt: run.finishedAt,
      })),
      suggestions: suggestions.map((row) => ({
        _id: row._id,
        runId: row.runId,
        agentKey: row.agentKey,
        agentName: AGENTS[row.agentKey].name,
        mode: modeOf.get(row.runId) ?? "simulated",
        field: row.field,
        label: row.label,
        rationale: row.rationale,
        current: row.current,
        proposed: row.proposed,
        status: row.status,
        decidedBy: row.decidedBy,
        decidedAt: row.decidedAt,
        createdAt: row.createdAt,
        applies: isApplicable(row.field),
      })),
    };
  },
});

export const journal = query({
  args: { agent: v.optional(agentKey), limit: v.optional(v.number()) },
  returns: v.array(runShape),
  handler: async (ctx, { agent, limit }) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const take = Math.min(limit ?? 60, 300);
    const runs = agent
      ? await ctx.db
          .query("agentRuns")
          .withIndex("by_agent", (q) => q.eq("agentKey", agent))
          .order("desc")
          .take(take)
      : await ctx.db
          .query("agentRuns")
          .withIndex("by_created")
          .order("desc")
          .take(take);
    return runs.map((run) => ({
      _id: run._id,
      agentKey: run.agentKey,
      agentName: AGENTS[run.agentKey].name,
      status: run.status,
      mode: run.mode,
      model: run.model,
      targetType: run.targetType,
      targetId: run.targetId,
      targetLabel: run.targetLabel,
      summary: run.summary,
      error: run.error,
      inputTokens: run.inputTokens,
      outputTokens: run.outputTokens,
      costMicros: run.costMicros,
      triggeredBy: run.triggeredBy,
      createdAt: run.createdAt,
      finishedAt: run.finishedAt,
    }));
  },
});

export const run = query({
  args: { id: v.id("agentRuns") },
  returns: v.union(
    v.object({
      run: runShape,
      suggestions: v.array(suggestionShape),
    }),
    v.null()
  ),
  handler: async (ctx, { id }) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const row = await ctx.db.get(id);
    if (!row) return null;
    const suggestions = await ctx.db
      .query("agentSuggestions")
      .withIndex("by_run", (q) => q.eq("runId", id))
      .collect();
    return {
      run: {
        _id: row._id,
        agentKey: row.agentKey,
        agentName: AGENTS[row.agentKey].name,
        status: row.status,
        mode: row.mode,
        model: row.model,
        targetType: row.targetType,
        targetId: row.targetId,
        targetLabel: row.targetLabel,
        summary: row.summary,
        error: row.error,
        inputTokens: row.inputTokens,
        outputTokens: row.outputTokens,
        costMicros: row.costMicros,
        triggeredBy: row.triggeredBy,
        createdAt: row.createdAt,
        finishedAt: row.finishedAt,
      },
      suggestions: suggestions.map((item) => ({
        _id: item._id,
        runId: item.runId,
        agentKey: item.agentKey,
        agentName: AGENTS[item.agentKey].name,
        mode: row.mode,
        field: item.field,
        label: item.label,
        rationale: item.rationale,
        current: item.current,
        proposed: item.proposed,
        status: item.status,
        decidedBy: item.decidedBy,
        decidedAt: item.decidedAt,
        createdAt: item.createdAt,
        applies: isApplicable(item.field),
      })),
    };
  },
});

/* -------------------------------------------------------------------------
   Decision — the human half
   ------------------------------------------------------------------------- */

export const decide = mutation({
  args: {
    id: v.id("agentSuggestions"),
    accept: v.boolean(),
  },
  returns: v.object({ applied: v.boolean(), message: v.string() }),
  handler: async (ctx, { id, accept }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.agentsRun);
    const suggestion = await ctx.db.get(id);
    if (!suggestion) throw accessError("FORBIDDEN");
    if (suggestion.status !== "pending") {
      return {
        applied: false,
        message: "Cette proposition a déjà été tranchée.",
      };
    }

    await ctx.db.patch(id, {
      status: accept ? "accepted" : "rejected",
      decidedBy: viewer.name,
      decidedAt: Date.now(),
    });

    await recordAudit(
      ctx,
      viewer,
      accept ? "agent.suggestion_accepted" : "agent.suggestion_rejected",
      suggestion.targetType,
      suggestion.targetId,
      `${AGENTS[suggestion.agentKey].name} · ${suggestion.label}`
    );

    if (!accept) {
      return {
        applied: false,
        message:
          "Proposition rejetée. Elle ne sera pas re-proposée pour ce contenu.",
      };
    }

    const applied = await apply(ctx, suggestion);
    return {
      applied,
      message: applied
        ? "Proposition appliquée."
        : "Proposition retenue. Elle est consignée : ce champ n'est pas modifiable automatiquement.",
    };
  },
});

/**
 * Writes an accepted suggestion into the content.
 *
 * Returns `false` for advisory output — the moderation card, the social
 * copy, the internal-linking list. Accepting those records that the
 * newsroom used them; there is no field to overwrite, and inventing one
 * would be worse than saying so.
 */
async function apply(
  ctx: MutationCtx,
  suggestion: Doc<"agentSuggestions">
): Promise<boolean> {
  const { field, proposed } = suggestion;

  if (suggestion.targetType === "media") {
    const media = await ctx.db.get(suggestion.targetId as Id<"media">);
    if (!media) return false;
    if (field !== "alt" && field !== "caption") return false;
    const alt = field === "alt" ? proposed.trim() : media.alt;
    const caption = field === "caption" ? proposed.trim() : media.caption;
    await ctx.db.patch(media._id, {
      alt,
      caption,
      ...mediaDerivedFields({ ...media, alt, caption }),
    });
    return true;
  }

  if (suggestion.targetType !== "article") return false;

  const article = await ctx.db.get(suggestion.targetId as Id<"articles">);
  if (!article) return false;

  let title = article.title;
  let dek = article.dek;
  let body = [...article.body];
  const seo = { ...article.seo };
  let tags = article.tags;
  let slug = article.slug;

  if (field === "title") {
    title = proposed.trim();
  } else if (field === "dek") {
    dek = proposed.trim();
  } else if (field.startsWith("body.")) {
    const index = Number(field.slice(5));
    const block = body[index];
    if (!block) return false;
    if (
      block.type === "paragraph" ||
      block.type === "heading" ||
      block.type === "quote"
    ) {
      body[index] = { ...block, text: proposed };
    } else if (block.type === "list") {
      body[index] = { ...block, items: proposed.split(" · ") };
    } else {
      return false;
    }
  } else if (field === "seo.slug") {
    const candidate = slugify(proposed);
    const clash = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .unique();
    if (clash && clash._id !== article._id) return false;
    slug = candidate;
  } else if (field === "seo.description") {
    seo.description = proposed.trim();
  } else if (field === "seo.keywords") {
    const words = proposed
      .split(/[,\n]/)
      .map((word) => word.trim())
      .filter(Boolean);
    seo.keywords = words;
    tags = words;
  } else if (field === "interview") {
    // La trame questions/réponses remplace le corps : c'est bien un acte
    // éditorial, validé bloc par bloc en amont par l'humain qui accepte.
    body = proposed
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((text) => ({ type: "paragraph" as const, text }));
  } else {
    return false;
  }

  await patchArticle(ctx, article, {
    title,
    slug,
    dek,
    body,
    seo,
    tags,
    readingMinutes: readingMinutes(title, dek, body),
    searchText: searchText(title, dek, tags, body),
    updatedAt: Date.now(),
  });
  // La trame d'interview remplace tout le corps, images comprises.
  await syncArticleMedia(ctx, article._id);
  return true;
}

/* -------------------------------------------------------------------------
   Internals used by the runtime
   ------------------------------------------------------------------------- */

export const agentEnabled = internalQuery({
  args: { key: agentKey },
  returns: v.object({ enabled: v.boolean(), model: v.string() }),
  handler: async (ctx, { key }) => {
    const row = await ctx.db
      .query("agentConfigs")
      .withIndex("by_key", (q) => q.eq("agentKey", key))
      .unique();
    return {
      enabled: row?.enabled ?? true,
      model: row?.model ?? AGENT_MODELS[key],
    };
  },
});

export const budgetState = internalQuery({
  args: {},
  returns: v.object({
    period: v.string(),
    spentMicros: v.number(),
    capMicros: v.number(),
    stopped: v.boolean(),
    alerting: v.boolean(),
  }),
  handler: async (ctx) => {
    const period = periodOf(Date.now());
    const runs = await ctx.db
      .query("agentRuns")
      .withIndex("by_period", (q) => q.eq("period", period))
      .collect();
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    const capMicros = settings?.agentsMonthlyCapMicros ?? 25_000_000;
    const ratio = settings?.agentsAlertRatio ?? 0.8;
    const spentMicros = runs.reduce((sum, item) => sum + item.costMicros, 0);
    return {
      period,
      spentMicros,
      capMicros,
      stopped: spentMicros >= capMicros,
      alerting: spentMicros >= capMicros * ratio,
    };
  },
});

export const rejectedFingerprints = internalQuery({
  args: { targetType, targetId: v.string() },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("agentSuggestions")
      .withIndex("by_target", (q) =>
        q
          .eq("targetType", args.targetType)
          .eq("targetId", args.targetId)
          .eq("status", "rejected")
      )
      .collect();
    return rows.map((row) => row.fingerprint);
  },
});

export const startRun = internalMutation({
  args: {
    agentKey,
    mode: v.union(v.literal("live"), v.literal("simulated")),
    model: v.string(),
    targetType,
    targetId: v.string(),
    targetLabel: v.string(),
    inputDigest: v.string(),
    triggeredBy: v.string(),
  },
  returns: v.id("agentRuns"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("agentRuns", {
      ...args,
      status: "running",
      summary: "",
      inputTokens: 0,
      outputTokens: 0,
      costMicros: 0,
      period: periodOf(now),
      createdAt: now,
    });
  },
});

export const blockRun = internalMutation({
  args: {
    agentKey,
    targetType,
    targetId: v.string(),
    targetLabel: v.string(),
    reason: v.string(),
    triggeredBy: v.string(),
  },
  returns: v.id("agentRuns"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("agentRuns", {
      agentKey: args.agentKey,
      status: "blocked",
      mode: "simulated",
      model: "-",
      targetType: args.targetType,
      targetId: args.targetId,
      targetLabel: args.targetLabel,
      inputDigest: "",
      summary: args.reason,
      inputTokens: 0,
      outputTokens: 0,
      costMicros: 0,
      period: periodOf(now),
      triggeredBy: args.triggeredBy,
      createdAt: now,
      finishedAt: now,
    });
  },
});

export const failRun = internalMutation({
  args: { id: v.id("agentRuns"), error: v.string() },
  returns: v.null(),
  handler: async (ctx, { id, error }) => {
    await ctx.db.patch(id, {
      status: "failed",
      error,
      summary: "L'agent n'a pas abouti. La tâche reste faisable à la main.",
      finishedAt: Date.now(),
    });
    return null;
  },
});

export const completeRun = internalMutation({
  args: {
    id: v.id("agentRuns"),
    summary: v.string(),
    payload: v.optional(v.string()),
    /** Set when a live call failed and the offline stand-in took over. */
    fallbackError: v.optional(v.string()),
    inputTokens: v.number(),
    outputTokens: v.number(),
    costMicros: v.number(),
    proposals: v.array(
      v.object({
        field: v.string(),
        label: v.string(),
        rationale: v.string(),
        current: v.optional(v.string()),
        proposed: v.string(),
      })
    ),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.id);
    if (!run) return 0;

    await ctx.db.patch(args.id, {
      status: "succeeded",
      summary: args.summary,
      payload: args.payload,
      ...(args.fallbackError
        ? { mode: "simulated" as const, error: args.fallbackError }
        : {}),
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      costMicros: args.costMicros,
      finishedAt: Date.now(),
    });

    const refused = new Set(
      (
        await ctx.db
          .query("agentSuggestions")
          .withIndex("by_target", (q) =>
            q
              .eq("targetType", run.targetType)
              .eq("targetId", run.targetId)
              .eq("status", "rejected")
          )
          .collect()
      ).map((row) => row.fingerprint)
    );

    const now = Date.now();
    let kept = 0;
    for (const proposal of args.proposals) {
      const print = fingerprint(proposal.field, proposal.proposed);
      // CDC §4.6 : « une suggestion rejetée n'est jamais réappliquée
      // silencieusement ». Elle n'est même pas re-proposée.
      if (refused.has(print)) continue;
      await ctx.db.insert("agentSuggestions", {
        runId: args.id,
        agentKey: run.agentKey,
        targetType: run.targetType,
        targetId: run.targetId,
        field: proposal.field,
        label: proposal.label,
        rationale: proposal.rationale,
        current: proposal.current,
        proposed: proposal.proposed,
        fingerprint: print,
        status: "pending",
        createdAt: now,
      });
      kept += 1;
    }
    return kept;
  },
});

/** Context loaders — an action has no database handle. */
export const articleContext = internalQuery({
  args: { id: v.id("articles") },
  returns: v.union(
    v.object({
      title: v.string(),
      dek: v.string(),
      slug: v.string(),
      categoryName: v.string(),
      tags: v.array(v.string()),
      metaDescription: v.string(),
      blocks: v.array(
        v.object({ index: v.number(), type: v.string(), text: v.string() })
      ),
      bodyText: v.string(),
      corpus: v.array(v.object({ slug: v.string(), title: v.string() })),
    }),
    v.null()
  ),
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) return null;
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", row.categorySlug))
      .unique();
    const corpus = await ctx.db
      .query("articles")
      .withIndex("by_status_date", (q) => q.eq("status", "published"))
      .order("desc")
      .take(60);

    const blocks: { index: number; type: string; text: string }[] = [];
    row.body.forEach((block, index) => {
      if (block.type === "paragraph" || block.type === "heading") {
        blocks.push({ index, type: block.type, text: block.text });
      } else if (block.type === "quote") {
        blocks.push({ index, type: "quote", text: block.text });
      } else if (block.type === "list") {
        blocks.push({ index, type: "list", text: block.items.join(" · ") });
      }
    });

    return {
      title: row.title,
      dek: row.dek,
      slug: row.slug,
      categoryName: category?.name ?? row.categorySlug,
      tags: row.tags,
      metaDescription: row.seo.description,
      blocks,
      bodyText: blocks.map((block) => block.text).join("\n\n"),
      corpus: corpus.map((item) => ({ slug: item.slug, title: item.title })),
    };
  },
});

export const submissionContext = internalQuery({
  args: { id: v.id("submissions") },
  returns: v.union(
    v.object({
      title: v.string(),
      dek: v.string(),
      bodyText: v.string(),
      categoryName: v.string(),
      kind: v.string(),
      organizationName: v.string(),
      corpus: v.array(v.object({ slug: v.string(), title: v.string() })),
    }),
    v.null()
  ),
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) return null;
    const organization = await ctx.db.get(row.organizationId);
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", row.requestedCategorySlug))
      .unique();
    const corpus = await ctx.db
      .query("articles")
      .withIndex("by_status_date", (q) => q.eq("status", "published"))
      .order("desc")
      .take(60);
    const bodyText = row.body
      .map((block) =>
        block.type === "paragraph" || block.type === "heading"
          ? block.text
          : block.type === "quote"
            ? block.text
            : block.type === "list"
              ? block.items.join(" · ")
              : ""
      )
      .filter(Boolean)
      .join("\n\n");
    return {
      title: row.title,
      dek: row.dek,
      bodyText,
      categoryName: category?.name ?? row.requestedCategorySlug,
      kind: row.kind,
      organizationName: organization?.name ?? "—",
      corpus: corpus.map((item) => ({ slug: item.slug, title: item.title })),
    };
  },
});

export const mediaContext = internalQuery({
  args: { id: v.id("media") },
  returns: v.union(
    v.object({
      key: v.string(),
      alt: v.string(),
      caption: v.string(),
      credit: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) return null;
    return {
      key: row.key,
      alt: row.alt,
      caption: row.caption,
      credit: row.credit,
    };
  },
});

export const attachModerationRun = internalMutation({
  args: { submissionId: v.id("submissions"), runId: v.id("agentRuns") },
  returns: v.null(),
  handler: async (ctx, { submissionId, runId }) => {
    await ctx.db.patch(submissionId, { moderationRunId: runId });
    return null;
  },
});
