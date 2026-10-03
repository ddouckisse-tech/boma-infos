"use node";

import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { action, internalAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { accessError, PERMISSIONS } from "./model/access";
import { agentKey, AGENTS, type AgentKey } from "./model/agents";
import {
  buildPrompt,
  costMicros,
  parseOutcome,
  parseWatch,
  simulate,
  SIMULATION_NOTE,
  WATCH_DAYS,
  type AgentContext,
  type AgentOutcome,
} from "./model/agentEngine";
import { isoWeek } from "./model/text";
import { findWatchDomain, WATCH_ALL, WATCH_TARGET_ID } from "./model/watch";

/**
 * Where the eight agents actually run — CDC §4.6.
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
 *  2. the monthly spend cap (§4.6 "plafond de dépense mensuel … et arrêt") —
 *     the web searches of the watch are charged to it like tokens ;
 *  3. for the interactive agents, the caller's permission.
 *
 * A blocked run is still written to the journal, with the reason. Silence
 * would leave the newsroom wondering why nothing happened.
 */

const MAX_TOKENS = 4000;

type Target = "article" | "submission" | "media" | "newsletter" | "veille";

type Prompt = { system: string; user: string };

/** What a call to the model hands back, whatever the shape of the call. */
type LiveResult = {
  outcome: AgentOutcome;
  inputTokens: number;
  outputTokens: number;
  costMicros: number;
};

type LiveCall = (call: {
  key: string;
  model: string;
  prompt: Prompt;
}) => Promise<LiveResult>;

type ExecuteArgs = {
  agent: AgentKey;
  targetType: Target;
  targetId: string;
  targetLabel: string;
  context: AgentContext;
  triggeredBy: string;
  /**
   * How this agent talks to the model. Seven of them send one message and
   * read one answer (`askOnce`); the watch searches the web first
   * (`searchTheWeb`). Gates, journal and offline fallback are the same.
   */
  live?: LiveCall;
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
      summary:
        args.agent === "veille"
          ? outcome.summary
          : `${outcome.summary} — ${SIMULATION_NOTE}`,
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
    const live = args.live ?? askOnce(args.agent);
    const result = await live({ key, model: config.model, prompt });

    await ctx.runMutation(internal.agents.completeRun, {
      id: runId,
      summary: result.outcome.summary,
      payload: result.outcome.payload,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costMicros: result.costMicros,
      proposals: result.outcome.proposals.map((item) => ({ ...item })),
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

/** One message, one answer: the seven agents that work on a text. */
const askOnce =
  (agent: AgentKey): LiveCall =>
  async ({ key, model, prompt }) => {
    const client = new Anthropic({ apiKey: key });
    const response = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const outcome: AgentOutcome = parseOutcome(agent, text);
    const inputTokens =
      response.usage.input_tokens || estimateTokens(prompt.user);
    const outputTokens = response.usage.output_tokens || estimateTokens(text);
    return {
      outcome,
      inputTokens,
      outputTokens,
      costMicros: costMicros(model, inputTokens, outputTokens),
    };
  };

/* -------------------------------------------------------------------------
   The watch — agent 8 searches the web
   ------------------------------------------------------------------------- */

/** Room for the reasoning of the model and for five sourced leads. */
const WATCH_MAX_TOKENS = 16_000;
/** Searches per run: each one is billed (`WEB_SEARCH_MICROS`). */
const WATCH_MAX_SEARCHES = 6;
/** A server-side search loop may pause; this is how often it is resumed. */
const WATCH_MAX_RESUMES = 4;

/**
 * Models whose safety classifiers can decline a request, and which accept
 * the server-side fallback: a declined run is re-run on the model Anthropic
 * recommends for that category instead of coming back empty.
 */
const ACCEPTS_FALLBACK = new Set([
  "claude-fable-5-1",
  "claude-opus-5-5",
  "claude-opus-5",
  "claude-sonnet-5-5",
]);

/**
 * Searches the web, then reads the leads.
 *
 * The search tool runs on Anthropic's servers: the request declares it, the
 * model decides what to look for, and the results come back inside the same
 * answer. Three things are done with that answer, in this order:
 *
 *  1. every address the search returned is collected — from the result
 *     blocks and from the citations of the text ;
 *  2. the text written after the last search is read as the leads ;
 *  3. `parseWatch` keeps only the sources found in (1).
 *
 * `allowed_callers: ["direct"]` asks for plain searches rather than searches
 * launched from the model's own code: the results then travel in the answer,
 * which is what makes step 1 possible.
 */
const searchTheWeb =
  (context: AgentContext): LiveCall =>
  async ({ key, model, prompt }) => {
    const client = new Anthropic({ apiKey: key });
    const messages: Anthropic.Beta.BetaMessageParam[] = [
      { role: "user", content: prompt.user },
    ];
    const tools: Anthropic.Beta.BetaToolUnion[] = [
      {
        type: "web_search_20260209",
        name: "web_search",
        max_uses: WATCH_MAX_SEARCHES,
        allowed_callers: ["direct"],
        user_location: {
          type: "approximate",
          country: "GA",
          city: "Libreville",
          timezone: "Africa/Libreville",
        },
      },
    ];
    const fallback = ACCEPTS_FALLBACK.has(model)
      ? {
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default" as const,
        }
      : {};

    const retrieved = new Set<string>();
    let inputTokens = 0;
    let outputTokens = 0;
    let searches = 0;
    let final: Anthropic.Beta.BetaMessage | null = null;

    for (let turn = 0; turn <= WATCH_MAX_RESUMES; turn += 1) {
      // En flux : une recherche web dure parfois plusieurs minutes, et une
      // réponse attendue d'un bloc buterait sur le délai HTTP.
      const response = await client.beta.messages
        .stream({
          model,
          max_tokens: WATCH_MAX_TOKENS,
          system: prompt.system,
          tools,
          messages,
          ...fallback,
        })
        .finalMessage();

      inputTokens += response.usage.input_tokens;
      outputTokens += response.usage.output_tokens;
      searches += response.usage.server_tool_use?.web_search_requests ?? 0;

      for (const block of response.content) {
        if (
          block.type === "web_search_tool_result" &&
          Array.isArray(block.content)
        ) {
          for (const result of block.content) retrieved.add(result.url);
        } else if (block.type === "text") {
          for (const citation of block.citations ?? []) {
            if (citation.type === "web_search_result_location") {
              retrieved.add(citation.url);
            }
          }
        }
      }

      if (response.stop_reason === "refusal") {
        throw new Error(
          "La veille a été déclinée par les garde-fous du modèle : aucune piste n'a été produite."
        );
      }
      // La boucle de recherche côté serveur s'est mise en pause : on renvoie
      // le tour tel quel, sans rien ajouter, et elle reprend où elle était.
      if (response.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: response.content });
        continue;
      }
      final = response;
      break;
    }

    if (!final) {
      throw new Error(
        "La recherche ne s'est pas terminée dans le nombre de reprises prévu."
      );
    }
    if (final.stop_reason === "max_tokens") {
      throw new Error(
        "La réponse de la veille a été tronquée avant la fin des pistes."
      );
    }

    // Les pistes sont le texte écrit APRÈS la dernière recherche : ce qui
    // précède est le commentaire du modèle sur ce qu'il cherche.
    let lastTool = -1;
    final.content.forEach((block, index) => {
      if (block.type !== "text" && block.type !== "thinking") lastTool = index;
    });
    const text = final.content
      .slice(lastTool + 1)
      .filter(
        (block): block is Anthropic.Beta.BetaTextBlock => block.type === "text"
      )
      .map((block) => block.text)
      .join("");

    return {
      outcome: parseWatch(text, [...retrieved], context),
      inputTokens,
      outputTokens,
      costMicros: costMicros(model, inputTokens, outputTokens, searches),
    };
  };

async function watch(
  ctx: ActionCtx,
  domainKey: string,
  triggeredBy: string
): Promise<Id<"agentRuns"> | null> {
  const domain = findWatchDomain(domainKey);
  const newsroom = await ctx.runQuery(internal.agents.watchContext, {});
  const context: AgentContext = {
    title: `Veille — ${domain.label}`,
    dek: "",
    bodyText: "",
    categoryName: domain.label,
    tags: [],
    corpus: newsroom.corpus,
    watch: {
      domainKey: domain.key,
      domainLabel: domain.label,
      focus: domain.focus,
      queries: domain.queries,
      today: newsroom.today,
      days: WATCH_DAYS,
      sections: newsroom.sections,
      coverage: newsroom.coverage,
      now: newsroom.now,
    },
  };
  return await execute(ctx, {
    agent: "veille",
    targetType: "veille",
    targetId: WATCH_TARGET_ID,
    targetLabel: `Veille — ${domain.label}`,
    triggeredBy,
    context,
    live: searchTheWeb(context),
  });
}

/**
 * Launches the watch on one domain, or on all of them. A long job — several
 * searches — so it goes through the scheduler: the screen returns at once
 * and the leads appear on the board when they are ready.
 */
export const runWatch = action({
  args: { domain: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, { domain }) => {
    const viewer = await ctx.runQuery(internal.guard.check, {
      permission: PERMISSIONS.agentsRun,
    });
    if (!viewer) throw accessError("FORBIDDEN");
    await ctx.scheduler.runAfter(0, internal.agentRuntime.watchNow, {
      domain: findWatchDomain(domain).key,
      triggeredBy: viewer.name,
    });
    return null;
  },
});

export const watchNow = internalAction({
  args: { domain: v.string(), triggeredBy: v.string() },
  returns: v.null(),
  handler: async (ctx, { domain, triggeredBy }) => {
    await watch(ctx, domain, triggeredBy);
    return null;
  },
});

/** The morning round-up, driven by the daily cron: every domain, one run. */
export const watchDaily = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await watch(ctx, WATCH_ALL, "Ordonnanceur — quotidien");
    return null;
  },
});

/* -------------------------------------------------------------------------
   Interactive agents — the editor
   ------------------------------------------------------------------------- */

export const runOnArticle = action({
  args: { articleId: v.id("articles"), agent: agentKey },
  returns: v.union(v.id("agentRuns"), v.null()),
  handler: async (
    ctx,
    { articleId, agent }
  ): Promise<Id<"agentRuns"> | null> => {
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
    const articles = await ctx.runQuery(
      internal.newsletterDraft.weekArticles,
      {}
    );
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
