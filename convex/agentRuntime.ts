"use node";

import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import {
  action,
  internalAction,
  type ActionCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { accessError, PERMISSIONS } from "./model/access";
import { agentKey, AGENTS, type AgentKey } from "./model/agents";
import {
  buildPrompt,
  costMicros,
  parseOutcome,
  simulate,
  SIMULATION_NOTE,
  type AgentContext,
  type AgentOutcome,
} from "./model/agentEngine";
import { isoWeek } from "./model/text";

/**
 * Where the seven agents actually run — CDC §4.6.
 *
 * A Convex **action**, so the Convex scheduler owns the long jobs
 * (transcription, weekly newsletter) and the interface never waits on a
 * model: the form returns, the card appears when it is ready.
 *
 * ## The key
 *
 * One variable, `ANTHROPIC_API_KEY`, read from the process environment.
 * Present → the Claude API is called. Absent or empty → the offline
 * stand-in of `model/agentEngine.ts` runs instead, every proposal is
 * labelled "simulation", and the run row says `mode: simulated`. Switching
 * to the real thing is `bunx convex env set ANTHROPIC_API_KEY …` (or
 * `bun run agents:cle`, which copies it out of `.env.local`) — no code
 * change, no redeploy of anything but the variable.
 *
 * ## Three gates before any call
 *
 *  1. the agent's own switch (§4.6 "désactivation individuelle") ;
 *  2. the monthly spend cap (§4.6 "plafond de dépense mensuel … et arrêt") ;
 *  3. for the interactive agents, the caller's permission.
 *
 * A blocked run is still written to the journal, with the reason. Silence
 * would leave the newsroom wondering why nothing happened.
 */

const MAX_TOKENS = 4000;

type Target = "article" | "submission" | "media" | "newsletter";

type ExecuteArgs = {
  agent: AgentKey;
  targetType: Target;
  targetId: string;
  targetLabel: string;
  context: AgentContext;
  triggeredBy: string;
};

const apiKey = (): string => (process.env.ANTHROPIC_API_KEY ?? "").trim();

/** Rough token count when the API did not report one (offline mode). */
const estimateTokens = (text: string): number => Math.ceil(text.length / 3.6);

async function execute(
  ctx: ActionCtx,
  args: ExecuteArgs
): Promise<Id<"agentRuns"> | null> {
  const config = await ctx.runQuery(internal.agents.agentEnabled, {
    key: args.agent,
  });
  if (!config.enabled) {
    return await ctx.runMutation(internal.agents.blockRun, {
      agentKey: args.agent,
      targetType: args.targetType,
      targetId: args.targetId,
      targetLabel: args.targetLabel,
      reason: `Agent « ${AGENTS[args.agent].name} » désactivé dans les réglages. ${AGENTS[args.agent].fallback}`,
      triggeredBy: args.triggeredBy,
    });
  }

  const budget = await ctx.runQuery(internal.agents.budgetState, {});
  if (budget.stopped) {
    return await ctx.runMutation(internal.agents.blockRun, {
      agentKey: args.agent,
      targetType: args.targetType,
      targetId: args.targetId,
      targetLabel: args.targetLabel,
      reason: `Plafond de dépense mensuel atteint (${(budget.spentMicros / 1_000_000).toFixed(2)} $ sur ${(budget.capMicros / 1_000_000).toFixed(2)} $) : les agents sont arrêtés jusqu'au mois prochain. ${AGENTS[args.agent].fallback}`,
      triggeredBy: args.triggeredBy,
    });
  }

  const key = apiKey();
  const prompt = buildPrompt(args.agent, args.context);
  const runId: Id<"agentRuns"> = await ctx.runMutation(
    internal.agents.startRun,
    {
      agentKey: args.agent,
      mode: key ? ("live" as const) : ("simulated" as const),
      model: key ? config.model : "hors-ligne",
      targetType: args.targetType,
      targetId: args.targetId,
      targetLabel: args.targetLabel,
      inputDigest: `${prompt.user.slice(0, 600)}…`,
      triggeredBy: args.triggeredBy,
    }
  );

  const offline = (reason?: string): Promise<unknown> => {
    const outcome = simulate(args.agent, args.context);
    return ctx.runMutation(internal.agents.completeRun, {
      id: runId,
      summary: `${outcome.summary} — ${SIMULATION_NOTE}`,
      payload: outcome.payload,
      fallbackError: reason,
      inputTokens: 0,
      outputTokens: 0,
      costMicros: 0,
      proposals: outcome.proposals.map((item) => ({ ...item })),
    });
  };

  if (!key) {
    await offline();
    return runId;
  }

  try {
    const client = new Anthropic({ apiKey: key });
    const response = await client.messages.create({
      model: config.model,
      max_tokens: MAX_TOKENS,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const outcome: AgentOutcome = parseOutcome(args.agent, text);
    const inputTokens =
      response.usage.input_tokens || estimateTokens(prompt.user);
    const outputTokens = response.usage.output_tokens || estimateTokens(text);

    await ctx.runMutation(internal.agents.completeRun, {
      id: runId,
      summary: outcome.summary,
      payload: outcome.payload,
      inputTokens,
      outputTokens,
      costMicros: costMicros(config.model, inputTokens, outputTokens),
      proposals: outcome.proposals.map((item) => ({ ...item })),
    });
  } catch (error) {
    // Repli : l'agent est indisponible, la chaîne éditoriale ne s'arrête
    // pas pour autant (§4.6). Les propositions hors ligne prennent le
    // relais, et la ligne du journal dit exactement ce qui s'est passé.
    await offline(
      error instanceof Error ? error.message : "Appel à l'API Claude en échec"
    );
  }

  return runId;
}

/* -------------------------------------------------------------------------
   Interactive agents — the editor
   ------------------------------------------------------------------------- */

export const runOnArticle = action({
  args: { articleId: v.id("articles"), agent: agentKey },
  returns: v.union(v.id("agentRuns"), v.null()),
  handler: async (ctx, { articleId, agent }): Promise<Id<"agentRuns"> | null> => {
    const viewer = await ctx.runQuery(internal.guard.check, {
      permission: PERMISSIONS.agentsRun,
    });
    if (!viewer) throw accessError("FORBIDDEN");

    const context = await ctx.runQuery(internal.agents.articleContext, {
      id: articleId,
    });
    if (!context) throw accessError("FORBIDDEN");

    return await execute(ctx, {
      agent,
      targetType: "article",
      targetId: articleId,
      targetLabel: context.title,
      triggeredBy: viewer.name,
      context: {
        title: context.title,
        dek: context.dek,
        bodyText: context.bodyText,
        blocks: context.blocks,
        categoryName: context.categoryName,
        tags: context.tags,
        slug: context.slug,
        metaDescription: context.metaDescription,
        corpus: context.corpus,
        transcriptSource: context.bodyText,
        url: `/article/${context.slug}`,
      },
    });
  },
});

export const runOnMedia = action({
  args: { mediaId: v.id("media") },
  returns: v.union(v.id("agentRuns"), v.null()),
  handler: async (ctx, { mediaId }): Promise<Id<"agentRuns"> | null> => {
    const viewer = await ctx.runQuery(internal.guard.check, {
      permission: PERMISSIONS.mediaWrite,
    });
    if (!viewer) throw accessError("FORBIDDEN");

    const media = await ctx.runQuery(internal.agents.mediaContext, {
      id: mediaId,
    });
    if (!media) throw accessError("FORBIDDEN");

    return await execute(ctx, {
      agent: "media",
      targetType: "media",
      targetId: mediaId,
      targetLabel: media.key,
      triggeredBy: viewer.name,
      context: {
        title: media.caption || media.key,
        dek: "",
        bodyText: "",
        categoryName: "Médiathèque",
        tags: [],
        mediaKey: media.key,
        mediaCaption: media.caption,
        mediaCredit: media.credit,
      },
    });
  },
});

/* -------------------------------------------------------------------------
   Deferred agents — the Convex scheduler
   ------------------------------------------------------------------------- */

/**
 * Agent 5, scheduled by `portal.submitForReview`.
 *
 * Internal: it is the workflow that triggers it, never a caller. The card
 * is attached to the deposit when it is ready; the newsroom can review
 * without it.
 */
export const moderateSubmission = internalAction({
  args: { submissionId: v.id("submissions") },
  returns: v.null(),
  handler: async (ctx, { submissionId }) => {
    const context = await ctx.runQuery(internal.agents.submissionContext, {
      id: submissionId,
    });
    if (!context) return null;

    const runId = await execute(ctx, {
      agent: "moderation",
      targetType: "submission",
      targetId: submissionId,
      targetLabel: context.title,
      triggeredBy: "Workflow — soumission",
      context: {
        title: context.title,
        dek: context.dek,
        bodyText: context.bodyText,
        categoryName: context.categoryName,
        tags: [],
        corpus: context.corpus,
        submissionKind: context.kind,
        organizationName: context.organizationName,
      },
    });

    if (runId) {
      await ctx.runMutation(internal.agents.attachModerationRun, {
        submissionId,
        runId,
      });
    }
    return null;
  },
});

/** Agent 6, scheduled at publication. */
export const composeSocial = internalAction({
  args: { articleId: v.id("articles") },
  returns: v.null(),
  handler: async (ctx, { articleId }) => {
    const context = await ctx.runQuery(internal.agents.articleContext, {
      id: articleId,
    });
    if (!context) return null;

    await execute(ctx, {
      agent: "diffusion",
      targetType: "article",
      targetId: articleId,
      targetLabel: context.title,
      triggeredBy: "Workflow — publication",
      context: {
        title: context.title,
        dek: context.dek,
        bodyText: context.bodyText,
        categoryName: context.categoryName,
        tags: context.tags,
        slug: context.slug,
        url: `${process.env.SITE_URL ?? ""}/article/${context.slug}`,
      },
    });
    return null;
  },
});

/** Agent 7 — long job, hence the scheduler rather than the form. */
export const transcribe = action({
  args: { articleId: v.id("articles") },
  returns: v.null(),
  handler: async (ctx, { articleId }) => {
    const viewer = await ctx.runQuery(internal.guard.check, {
      permission: PERMISSIONS.agentsRun,
    });
    if (!viewer) throw accessError("FORBIDDEN");
    await ctx.scheduler.runAfter(0, internal.agentRuntime.transcribeNow, {
      articleId,
      triggeredBy: viewer.name,
    });
    return null;
  },
});

export const transcribeNow = internalAction({
  args: { articleId: v.id("articles"), triggeredBy: v.string() },
  returns: v.null(),
  handler: async (ctx, { articleId, triggeredBy }) => {
    const context = await ctx.runQuery(internal.agents.articleContext, {
      id: articleId,
    });
    if (!context) return null;
    await execute(ctx, {
      agent: "transcription",
      targetType: "article",
      targetId: articleId,
      targetLabel: context.title,
      triggeredBy,
      context: {
        title: context.title,
        dek: context.dek,
        bodyText: context.bodyText,
        categoryName: context.categoryName,
        tags: context.tags,
        transcriptSource: context.bodyText,
      },
    });
    return null;
  },
});

/** Agent 6's second job, driven by the weekly cron. */
export const composeWeeklyNewsletter = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const week = isoWeek(Date.now());
    const articles = await ctx.runQuery(internal.newsletterDraft.weekArticles, {});
    if (articles.length === 0) return null;

    const runId = await execute(ctx, {
      agent: "diffusion",
      targetType: "newsletter",
      targetId: week,
      targetLabel: `Newsletter ${week}`,
      triggeredBy: "Ordonnanceur — hebdomadaire",
      context: {
        title: week,
        dek: "",
        bodyText: "",
        categoryName: "Newsletter",
        tags: [],
        weekArticles: articles,
      },
    });

    if (runId) {
      await ctx.runMutation(internal.newsletterDraft.upsert, {
        week,
        runId,
        articles,
      });
    }
    return null;
  },
});

/** Lets an administrator compose the newsletter now instead of waiting. */
export const composeNewsletterNow = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const viewer = await ctx.runQuery(internal.guard.check, {
      permission: PERMISSIONS.agentsRun,
    });
    if (!viewer) throw accessError("FORBIDDEN");
    await ctx.scheduler.runAfter(
      0,
      internal.agentRuntime.composeWeeklyNewsletter,
      {}
    );
    return null;
  },
});
