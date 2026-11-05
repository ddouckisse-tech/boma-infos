import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { MEDIA } from "./mediaManifest";
import { AD_DEMO_MEDIA } from "./adDemoManifest";
import { DEMO_ADS } from "../lib/ads/demo";
import { accessError, PERMISSIONS, requirePermission } from "./model/access";
import {
  AD_FEED_LIMIT,
  adDevice,
  adFormat,
  adKind,
  adPlacement,
  campaignFields,
  constrainAdMedia,
  selectActiveCampaigns,
  validateCampaign,
} from "./model/advertising";
import { recordAudit } from "./model/audit";
import { mediaDerivedFields, resolveRenditions } from "./model/media";
import type { AdCreative, AdFormat, AdPlacement } from "../lib/ads/types";
import type { MediaAsset } from "../lib/media-core";

const campaignShape = v.object({
  _id: v.id("adCampaigns"),
  ...campaignFields,
  demoKey: v.optional(v.string()),
  updatedAt: v.number(),
  updatedBy: v.string(),
});
const variantShape = v.object({
  w: v.number(),
  h: v.number(),
  bytes: v.number(),
});
const creativeShape = v.object({
  id: v.string(),
  title: v.string(),
  advertiser: v.string(),
  kind: adKind,
  format: adFormat,
  href: v.string(),
  placements: v.array(adPlacement),
  device: v.optional(adDevice),
  demo: v.optional(v.boolean()),
  startsAt: v.optional(v.number()),
  endsAt: v.optional(v.number()),
  priority: v.number(),
  media: v.object({
    id: v.string(),
    alt: v.string(),
    caption: v.string(),
    credit: v.string(),
    license: v.string(),
    source: v.string(),
    color: v.string(),
    width: v.number(),
    height: v.number(),
    avif: v.array(variantShape),
    webp: v.array(variantShape),
    urls: v.optional(v.record(v.string(), v.string())),
  }),
});

/** No third-party image URL input: use the manifest or this project's storage. */
async function campaignMedia(
  ctx: QueryCtx,
  key: string,
  format: AdFormat,
  placements: readonly AdPlacement[]
): Promise<MediaAsset> {
  const row = await ctx.db
    .query("media")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  if (!row)
    throw new Error("Le média choisi n'existe plus dans la médiathèque.");
  const metadata = {
    alt: row.alt,
    caption: row.caption,
    credit: row.credit,
    license: row.license,
    source: row.source,
  };
  if (!row.storage?.length) {
    const asset = MEDIA[key] ?? AD_DEMO_MEDIA[key];
    if (!asset)
      throw new Error("Ce média ne dispose d'aucun fichier disponible.");
    return constrainAdMedia({ ...asset, ...metadata }, format, placements);
  }
  if (
    row.storage.length > 8 ||
    new Set(row.storage.map((variant) => variant.w)).size !== row.storage.length
  ) {
    throw new Error("Versions du média publicitaire invalides.");
  }
  const renditions = await resolveRenditions(ctx, row);
  if (!renditions?.length)
    throw new Error("Les fichiers de ce média sont indisponibles.");
  // Upload byte counts are supplied by the browser. Verify the real stored
  // sizes and MIME type before using them for a public performance budget.
  const files = await Promise.all(
    row.storage.map(async (variant) => {
      const file = await ctx.db.system.get(variant.storageId);
      if (!file || file.contentType !== "image/webp")
        throw new Error("Fichier WebP publicitaire indisponible.");
      return { w: variant.w, bytes: file.size };
    })
  );
  const bytesByWidth = new Map(files.map((file) => [file.w, file.bytes]));
  const asset: MediaAsset = {
    id: row.key,
    ...metadata,
    color: row.color,
    width: row.width,
    height: row.height,
    avif: [],
    webp: renditions.map((variant) => ({
      w: variant.w,
      h: variant.h,
      bytes: bytesByWidth.get(variant.w)!,
    })),
    urls: Object.fromEntries(
      renditions.map((variant) => [`webp-${variant.w}`, variant.url])
    ),
  };
  return constrainAdMedia(asset, format, placements);
}

/** Schedule one boundary at a time; stale jobs cannot overwrite an admin edit. */
async function scheduleBoundary(
  ctx: MutationCtx,
  row: Pick<
    Doc<"adCampaigns">,
    "_id" | "enabled" | "startsAt" | "endsAt" | "updatedAt"
  >
): Promise<void> {
  if (!row.enabled) return;
  const now = Date.now();
  const boundary = [row.startsAt, row.endsAt]
    .filter((date): date is number => date !== undefined && date > now)
    .sort((a, b) => a - b)[0];
  if (boundary !== undefined) {
    await ctx.scheduler.runAt(boundary, internal.advertising.refreshDelivery, {
      id: row._id,
      expectedUpdatedAt: row.updatedAt,
    });
  }
}

export const list = query({
  args: {},
  returns: v.array(campaignShape),
  handler: async (ctx) => {
    await requirePermission(ctx, PERMISSIONS.settingsManage);
    const rows = await ctx.db.query("adCampaigns").collect();
    return rows
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((row) => ({
        _id: row._id,
        title: row.title,
        advertiser: row.advertiser,
        kind: row.kind,
        format: row.format,
        href: row.href,
        mediaKey: row.mediaKey,
        placements: row.placements,
        device: row.device ?? "all",
        demoKey: row.demoKey,
        startsAt: row.startsAt,
        endsAt: row.endsAt,
        enabled: row.enabled,
        priority: row.priority,
        updatedAt: row.updatedAt,
        updatedBy: row.updatedBy,
      }));
  },
});

export const save = mutation({
  args: { id: v.optional(v.id("adCampaigns")), ...campaignFields },
  returns: v.id("adCampaigns"),
  handler: async (ctx, { id, ...args }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.settingsManage);
    const input = validateCampaign(args);
    const existing = id ? await ctx.db.get(id) : null;
    if (id && !existing) throw accessError("FORBIDDEN");
    await campaignMedia(ctx, input.mediaKey, input.format, input.placements);
    const payload = {
      ...input,
      ...(existing?.demoKey !== undefined ? { demoKey: existing.demoKey } : {}),
      updatedAt: Date.now(),
      updatedBy: viewer.name,
    };
    let campaignId: Id<"adCampaigns">;
    if (id) {
      // replace clears an optional start/end removed in the editor as well.
      await ctx.db.replace(id, payload);
      campaignId = id;
    } else {
      campaignId = await ctx.db.insert("adCampaigns", payload);
    }
    await scheduleBoundary(ctx, { _id: campaignId, ...payload });
    await recordAudit(
      ctx,
      viewer,
      "settings.update",
      "adCampaigns",
      campaignId,
      `Campagne publicitaire : ${payload.title}`
    );
    return campaignId;
  },
});

export const setEnabled = mutation({
  args: { id: v.id("adCampaigns"), enabled: v.boolean() },
  returns: v.null(),
  handler: async (ctx, { id, enabled }) => {
    const viewer = await requirePermission(ctx, PERMISSIONS.settingsManage);
    const row = await ctx.db.get(id);
    if (!row) throw accessError("FORBIDDEN");
    if (enabled) {
      validateCampaign(row);
      await campaignMedia(ctx, row.mediaKey, row.format, row.placements);
    }
    const payload = { enabled, updatedAt: Date.now(), updatedBy: viewer.name };
    await ctx.db.patch(id, payload);
    await scheduleBoundary(ctx, { ...row, ...payload });
    await recordAudit(
      ctx,
      viewer,
      "settings.update",
      "adCampaigns",
      id,
      `${enabled ? "Activation" : "Désactivation"} de la campagne : ${row.title}`
    );
    return null;
  },
});

/** A timestamp write invalidates cached queries at the chosen start/end. */
export const refreshDelivery = internalMutation({
  args: { id: v.id("adCampaigns"), expectedUpdatedAt: v.number() },
  returns: v.null(),
  handler: async (ctx, { id, expectedUpdatedAt }) => {
    const row = await ctx.db.get(id);
    if (!row || !row.enabled || row.updatedAt !== expectedUpdatedAt)
      return null;
    const updatedAt = Date.now();
    await ctx.db.patch(id, { updatedAt });
    await scheduleBoundary(ctx, { ...row, updatedAt });
    return null;
  },
});

export const publicFeed = query({
  args: {},
  returns: v.array(creativeShape),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("adCampaigns")
      .withIndex("by_enabled_priority", (q) => q.eq("enabled", true))
      .collect();
    const active = selectActiveCampaigns(rows, Date.now(), rows.length);
    const creatives: AdCreative[] = [];
    for (const row of active) {
      if (creatives.length === AD_FEED_LIMIT) break;
      try {
        const campaign = validateCampaign(row);
        const media = await campaignMedia(
          ctx,
          campaign.mediaKey,
          campaign.format,
          campaign.placements
        );
        creatives.push({
          id: row._id,
          title: campaign.title,
          advertiser: campaign.advertiser,
          kind: campaign.kind,
          format: campaign.format,
          href: campaign.href,
          placements: campaign.placements,
          device: campaign.device,
          ...(row.demoKey !== undefined ? { demo: true } : {}),
          startsAt: campaign.startsAt,
          endsAt: campaign.endsAt,
          priority: campaign.priority,
          media,
        });
      } catch {
        // A deleted file, incomplete alt or outdated data never breaks reading.
        // Re-enabling/saving the campaign surfaces the validation in the editor.
      }
    }
    return creatives.map((creative) => ({
      ...creative,
      media: {
        ...creative.media,
        avif: [...creative.media.avif],
        webp: [...creative.media.webp],
      },
    }));
  },
});

const exampleResult = v.object({
  created: v.number(),
  existing: v.number(),
  total: v.number(),
});

type ExampleResult = { created: number; existing: number; total: number };

/** Insert-only: neither an edited campaign nor a library row is ever replaced. */
async function insertExamples(
  ctx: MutationCtx,
  actor: { subject: string; name: string; roleSlug: string }
): Promise<ExampleResult> {
  let created = 0;
  let mediaCreated = 0;
  const now = Date.now();
  for (const ad of DEMO_ADS) {
    const asset = AD_DEMO_MEDIA[ad.mediaKey];
    if (!asset)
      throw new Error(`Affiche de démonstration manquante : ${ad.slug}.`);
    const media = await ctx.db
      .query("media")
      .withIndex("by_key", (q) => q.eq("key", ad.mediaKey))
      .unique();
    if (!media) {
      const text = {
        key: ad.mediaKey,
        alt: asset.alt,
        caption: asset.caption,
        credit: asset.credit,
      };
      await ctx.db.insert("media", {
        ...text,
        ...mediaDerivedFields(text),
        license: asset.license,
        source: asset.source,
        color: asset.color,
        width: asset.width,
        height: asset.height,
        variants: [
          ...asset.avif.map((variant) => ({
            format: "avif" as const,
            ...variant,
          })),
          ...asset.webp.map((variant) => ({
            format: "webp" as const,
            ...variant,
          })),
        ],
      });
      mediaCreated += 1;
    }
    const existing = await ctx.db
      .query("adCampaigns")
      .withIndex("by_demo_key", (q) => q.eq("demoKey", ad.slug))
      .unique();
    if (existing) continue;
    const campaign = validateCampaign({
      title: ad.title,
      advertiser: ad.advertiser,
      kind: "house",
      format: ad.format,
      href: `/publicite/demo/${ad.slug}`,
      mediaKey: ad.mediaKey,
      placements: [...ad.placements],
      device: ad.device,
      enabled: true,
      priority: 25,
    });
    await campaignMedia(
      ctx,
      campaign.mediaKey,
      campaign.format,
      campaign.placements
    );
    await ctx.db.insert("adCampaigns", {
      ...campaign,
      demoKey: ad.slug,
      updatedAt: now,
      updatedBy: actor.name,
    });
    created += 1;
  }
  if (created > 0 || mediaCreated > 0) {
    await ctx.db.insert("auditLog", {
      at: now,
      actorSubject: actor.subject,
      actorName: actor.name,
      actorRole: actor.roleSlug,
      action: "settings.update",
      targetType: "adCampaigns",
      targetId: "demo-examples",
      summary: `Exemples publicitaires : ${created} campagne(s), ${mediaCreated} affiche(s) ajoutée(s), sans remplacement.`,
    });
  }
  return {
    created,
    existing: DEMO_ADS.length - created,
    total: DEMO_ADS.length,
  };
}

export const loadExamples = mutation({
  args: {},
  returns: exampleResult,
  handler: async (ctx): Promise<ExampleResult> => {
    const viewer = await requirePermission(ctx, PERMISSIONS.settingsManage);
    return await insertExamples(ctx, {
      subject: viewer.subject,
      name: viewer.name,
      roleSlug: viewer.role.slug,
    });
  },
});

/** Explicit local/operator tooling only; absent from the public Convex API. */
export const loadExamplesInternal = internalMutation({
  args: {},
  returns: exampleResult,
  handler: async (ctx): Promise<ExampleResult> =>
    await insertExamples(ctx, {
      subject: "internal:ad-examples",
      name: "Chargement interne des exemples",
      roleSlug: "interne",
    }),
});
