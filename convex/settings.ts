import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { accessError, PERMISSIONS, requirePermission } from "./model/access";
import { recordAudit } from "./model/audit";
import { AGENT_KEYS, AGENT_LIST, AGENT_MODELS, agentKey } from "./model/agents";
import { linkValidator } from "./model/content";
import { periodOf } from "./model/text";

/**
 * Settings — CDC §4.4 "Réglages": site identity, social accounts,
 * newsletter, agents (individual switch, spend cap) and redirects.
 *
 * Administrator only. An Éditeur calling `save` or `setAgentEnabled` from
 * the CLI is refused by `requirePermission`, not by the absence of a menu
 * entry.
 */

const DEFAULTS = {
  key: "site",
  siteName: "Le Corporate",
  tagline: "L'économie du Gabon et de la zone CEMAC",
  contactEmail: "redaction@le-corporate.com",
  contactPhone: "+241 77 86 10 08",
  social: [
    { label: "WhatsApp", url: "https://wa.me/" },
    { label: "LinkedIn", url: "https://www.linkedin.com/" },
    { label: "Facebook", url: "https://www.facebook.com/" },
  ],
  newsletterSenderName: "La rédaction du Corporate",
  /** 4 = jeudi, jour d'envoi de l'hebdomadaire. */
  newsletterDay: 4,
  /** 25 $ par mois : de quoi faire tourner les sept agents sur un rythme
   *  d'un article par jour, et un plafond qui se voit passer. */
  agentsMonthlyCapMicros: 25_000_000,
  agentsAlertRatio: 0.8,
} as const;

const settingsShape = v.object({
  siteName: v.string(),
  tagline: v.string(),
  contactEmail: v.string(),
  contactPhone: v.string(),
  social: v.array(linkValidator),
  newsletterSenderName: v.string(),
  newsletterDay: v.number(),
  agentsMonthlyCapMicros: v.number(),
  agentsAlertRatio: v.number(),
  updatedAt: v.number(),
  updatedBy: v.optional(v.string()),
});

const agentShape = v.object({
  key: agentKey,
  number: v.number(),
  name: v.string(),
  what: v.string(),
  trigger: v.string(),
  fallback: v.string(),
  deferred: v.boolean(),
  enabled: v.boolean(),
  model: v.string(),
  runs: v.number(),
  costMicros: v.number(),
});

export const read = query({
  args: {},
  returns: settingsShape,
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    return {
      siteName: row?.siteName ?? DEFAULTS.siteName,
      tagline: row?.tagline ?? DEFAULTS.tagline,
      contactEmail: row?.contactEmail ?? DEFAULTS.contactEmail,
      contactPhone: row?.contactPhone ?? DEFAULTS.contactPhone,
      social: row?.social ?? [...DEFAULTS.social],
      newsletterSenderName:
        row?.newsletterSenderName ?? DEFAULTS.newsletterSenderName,
      newsletterDay: row?.newsletterDay ?? DEFAULTS.newsletterDay,
      agentsMonthlyCapMicros:
        row?.agentsMonthlyCapMicros ?? DEFAULTS.agentsMonthlyCapMicros,
      agentsAlertRatio: row?.agentsAlertRatio ?? DEFAULTS.agentsAlertRatio,
      updatedAt: row?.updatedAt ?? 0,
      updatedBy: row?.updatedBy,
    };
  },
});

export const save = mutation({
  args: {
    siteName: v.string(),
    tagline: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    social: v.array(linkValidator),
    newsletterSenderName: v.string(),
    newsletterDay: v.number(),
    agentsMonthlyCapMicros: v.number(),
    agentsAlertRatio: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.settingsManage);
    const payload = {
      key: "site",
      ...args,
      agentsMonthlyCapMicros: Math.max(
        0,
        Math.round(args.agentsMonthlyCapMicros)
      ),
      agentsAlertRatio: Math.min(1, Math.max(0.1, args.agentsAlertRatio)),
      updatedAt: Date.now(),
      updatedBy: viewer.name,
    };
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    if (row) await ctx.db.patch(row._id, payload);
    else await ctx.db.insert("settings", payload);

    await recordAudit(
      ctx,
      viewer,
      "settings.update",
      "settings",
      "site",
      "Réglages du site"
    );
    return null;
  },
});

/* -------------------------------------------------------------------------
   Agents
   ------------------------------------------------------------------------- */

export const agents = query({
  args: {},
  returns: v.object({
    agents: v.array(agentShape),
    period: v.string(),
    spentMicros: v.number(),
    capMicros: v.number(),
    alertRatio: v.number(),
    /** True once the cap is reached: every agent stops until next month. */
    stopped: v.boolean(),
    alerting: v.boolean(),
    keyConfigured: v.boolean(),
  }),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.newsroom);
    const period = periodOf(Date.now());
    const configs = await ctx.db.query("agentConfigs").collect();
    const byKey = new Map(configs.map((row) => [row.agentKey, row]));
    const runs = await ctx.db
      .query("agentRuns")
      .withIndex("by_period", (q) => q.eq("period", period))
      .collect();

    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();
    const capMicros =
      settings?.agentsMonthlyCapMicros ?? DEFAULTS.agentsMonthlyCapMicros;
    const alertRatio = settings?.agentsAlertRatio ?? DEFAULTS.agentsAlertRatio;
    const spentMicros = runs.reduce((sum, run) => sum + run.costMicros, 0);

    return {
      agents: AGENT_LIST.map((agent) => {
        const config = byKey.get(agent.key);
        const own = runs.filter((run) => run.agentKey === agent.key);
        return {
          key: agent.key,
          number: agent.number,
          name: agent.name,
          what: agent.what,
          trigger: agent.trigger,
          fallback: agent.fallback,
          deferred: agent.deferred,
          enabled: config?.enabled ?? true,
          model: config?.model ?? AGENT_MODELS[agent.key],
          runs: own.length,
          costMicros: own.reduce((sum, run) => sum + run.costMicros, 0),
        };
      }),
      period,
      spentMicros,
      capMicros,
      alertRatio,
      stopped: spentMicros >= capMicros,
      alerting: spentMicros >= capMicros * alertRatio,
      keyConfigured: (process.env.ANTHROPIC_API_KEY ?? "").trim() !== "",
    };
  },
});

export const setAgentEnabled = mutation({
  args: { key: agentKey, enabled: v.boolean() },
  returns: v.null(),
  handler: async (ctx, { key, enabled }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.agentsManage);
    const row = await ctx.db
      .query("agentConfigs")
      .withIndex("by_key", (q) => q.eq("agentKey", key))
      .unique();
    if (row) {
      await ctx.db.patch(row._id, {
        enabled,
        updatedAt: Date.now(),
        updatedBy: viewer.name,
      });
    } else {
      await ctx.db.insert("agentConfigs", {
        agentKey: key,
        enabled,
        model: AGENT_MODELS[key],
        updatedAt: Date.now(),
        updatedBy: viewer.name,
      });
    }
    await recordAudit(
      ctx,
      viewer,
      "agent.toggle",
      "agent",
      key,
      `${key} → ${enabled ? "actif" : "désactivé"}`
    );
    return null;
  },
});

/** Seeds one config row per agent, all enabled. Idempotent. */
export const ensureAgentConfigs = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    for (const key of AGENT_KEYS) {
      const row = await ctx.db
        .query("agentConfigs")
        .withIndex("by_key", (q) => q.eq("agentKey", key))
        .unique();
      if (!row) {
        await ctx.db.insert("agentConfigs", {
          agentKey: key,
          enabled: true,
          model: AGENT_MODELS[key],
          updatedAt: Date.now(),
        });
      }
    }
    return null;
  },
});

/* -------------------------------------------------------------------------
   Redirects
   ------------------------------------------------------------------------- */

export const redirects = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("redirects"),
      from: v.string(),
      to: v.string(),
      permanent: v.boolean(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.settingsManage);
    const rows = await ctx.db.query("redirects").collect();
    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((row) => ({
        _id: row._id,
        from: row.from,
        to: row.to,
        permanent: row.permanent,
        createdAt: row.createdAt,
      }));
  },
});

export const addRedirect = mutation({
  args: { from: v.string(), to: v.string(), permanent: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.settingsManage);
    const from = args.from.trim();
    const to = args.to.trim();
    if (!from.startsWith("/") || !to.startsWith("/")) {
      throw new Error("Les deux chemins doivent commencer par « / ».");
    }
    if (from === to) throw new Error("Une redirection sur elle-même boucle.");
    await ctx.db.insert("redirects", {
      from,
      to,
      permanent: args.permanent,
      createdAt: Date.now(),
      createdBy: viewer.name,
    });
    await recordAudit(
      ctx,
      viewer,
      "settings.update",
      "redirect",
      from,
      `${from} → ${to}`
    );
    return null;
  },
});

export const removeRedirect = mutation({
  args: { id: v.id("redirects") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.settingsManage);
    const row = await ctx.db.get(id);
    if (!row) throw accessError("FORBIDDEN");
    await ctx.db.delete(id);
    await recordAudit(
      ctx,
      viewer,
      "settings.update",
      "redirect",
      row.from,
      `Suppression de ${row.from}`
    );
    return null;
  },
});
