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
import { DEMO_ADS, DEMO_POSTERS } from "../lib/ads/demo";
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
const mediaAssetShape = v.object({
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
  media: mediaAssetShape,
  mobileMedia: v.optional(mediaAssetShape),
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
        mobileMediaKey: row.mobileMediaKey,
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
    if (input.mobileMediaKey)
      await campaignMedia(
        ctx,
        input.mobileMediaKey,
        input.format,
        input.placements
      );
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
      const campaign = validateCampaign(row);
      await campaignMedia(
        ctx,
        campaign.mediaKey,
        campaign.format,
        campaign.placements
      );
      if (campaign.mobileMediaKey)
        await campaignMedia(
          ctx,
          campaign.mobileMediaKey,
          campaign.format,
          campaign.placements
        );
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
        // An obsolete optional mobile reference must not hide a valid main image.
        const campaign = validateCampaign({
          ...row,
          mobileMediaKey: undefined,
        });
        const media = await campaignMedia(
          ctx,
          campaign.mediaKey,
          campaign.format,
          campaign.placements
        );
        let mobileMedia: MediaAsset | undefined;
        const mobileMediaKey = row.mobileMediaKey?.trim();
        if (mobileMediaKey) {
          try {
            mobileMedia = await campaignMedia(
              ctx,
              mobileMediaKey,
              campaign.format,
              campaign.placements
            );
          } catch {
            // Keep this campaign usable with its main poster until the admin repairs it.
          }
        }
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
          ...(mobileMedia ? { mobileMedia } : {}),
        });
      } catch {
        // A deleted file, incomplete alt or outdated data never breaks reading.
        // Re-enabling/saving the campaign surfaces the validation in the editor.
      }
    }
    return creatives.map(({ mobileMedia, ...creative }) => ({
      ...creative,
      media: {
        ...creative.media,
        avif: [...creative.media.avif],
        webp: [...creative.media.webp],
      },
      ...(mobileMedia
        ? {
            mobileMedia: {
              ...mobileMedia,
              avif: [...mobileMedia.avif],
              webp: [...mobileMedia.webp],
            },
          }
        : {}),
    }));
  },
});

const exampleResult = v.object({
  created: v.number(),
  existing: v.number(),
  total: v.number(),
});

type ExampleResult = { created: number; existing: number; total: number };

/** The same insert-only media path is used by loading and responsive upgrades. */
async function ensureDemoMedia(
  ctx: MutationCtx,
  key: string
): Promise<boolean> {
  const asset = AD_DEMO_MEDIA[key];
  if (!asset) throw new Error(`Affiche de démonstration manquante : ${key}.`);
  const existing = await ctx.db
    .query("media")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  if (existing) return false;
  const text = {
    key,
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
      ...asset.avif.map((variant) => ({ format: "avif" as const, ...variant })),
      ...asset.webp.map((variant) => ({ format: "webp" as const, ...variant })),
    ],
  });
  return true;
}

/** Insert-only: neither an edited campaign nor a library row is ever replaced. */
async function insertExamples(
  ctx: MutationCtx,
  actor: { subject: string; name: string; roleSlug: string }
): Promise<ExampleResult> {
  let created = 0;
  let mediaCreated = 0;
  const now = Date.now();
  for (const ad of DEMO_ADS) {
    if (await ensureDemoMedia(ctx, ad.mediaKey)) mediaCreated += 1;
    if (ad.mobileMediaKey && (await ensureDemoMedia(ctx, ad.mobileMediaKey)))
      mediaCreated += 1;
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
      mobileMediaKey: ad.mobileMediaKey,
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
    if (campaign.mobileMediaKey)
      await campaignMedia(
        ctx,
        campaign.mobileMediaKey,
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

/** Explicit operator transition: retain all rows, pause only known retired demos. */
export const useFiveExamples = internalMutation({
  args: {},
  returns: v.object({ active: v.number(), paused: v.number() }),
  handler: async (ctx): Promise<{ active: number; paused: number }> => {
    const actor = {
      subject: "internal:use-five-ad-examples",
      name: "Sélection des cinq exemples publicitaires",
      roleSlug: "interne",
    };
    await insertExamples(ctx, actor);
    let active = 0;
    let paused = 0;
    let changed = 0;
    const now = Date.now();
    for (const poster of DEMO_POSTERS) {
      const row = await ctx.db
        .query("adCampaigns")
        .withIndex("by_demo_key", (q) => q.eq("demoKey", poster.slug))
        .unique();
      if (!row) continue;
      const selected = DEMO_ADS.find((ad) => ad.slug === poster.slug);
      if (selected) {
        active += 1;
        const campaign = validateCampaign({
          ...row,
          placements: [...selected.placements],
          device: selected.device,
          enabled: true,
        });
        await campaignMedia(
          ctx,
          campaign.mediaKey,
          campaign.format,
          campaign.placements
        );
        if (
          row.enabled &&
          row.device === selected.device &&
          JSON.stringify(row.placements) === JSON.stringify(selected.placements)
        )
          continue;
        const patch = {
          enabled: true,
          placements: [...selected.placements],
          device: selected.device,
          updatedAt: now,
          updatedBy: actor.name,
        };
        await ctx.db.patch(row._id, patch);
        await scheduleBoundary(ctx, { ...row, ...patch });
      } else {
        paused += 1;
        if (!row.enabled) continue;
        await ctx.db.patch(row._id, {
          enabled: false,
          updatedAt: now,
          updatedBy: actor.name,
        });
      }
      changed += 1;
    }
    if (changed > 0) {
      await ctx.db.insert("auditLog", {
        at: now,
        actorSubject: actor.subject,
        actorName: actor.name,
        actorRole: actor.roleSlug,
        action: "settings.update",
        targetType: "adCampaigns",
        targetId: "demo-examples",
        summary: `Sélection de démonstration : ${active} campagne(s) activée(s), ${paused} mise(s) en pause, aucune suppression.`,
      });
    }
    return { active, paused };
  },
});

/** Enrich existing selected examples only; do not reconfigure or enable a campaign. */
export const upgradeResponsiveExamples = internalMutation({
  args: {},
  returns: v.object({
    updated: v.number(),
    existing: v.number(),
    skipped: v.number(),
  }),
  handler: async (
    ctx
  ): Promise<{ updated: number; existing: number; skipped: number }> => {
    const now = Date.now();
    const actor = "Ajout des affiches mobiles de démonstration";
    let updated = 0;
    let existing = 0;
    let skipped = 0;
    let mediaCreated = 0;
    for (const ad of DEMO_ADS) {
      if (!ad.mobileMediaKey) {
        skipped += 1;
        continue;
      }
      if (await ensureDemoMedia(ctx, ad.mobileMediaKey)) mediaCreated += 1;
      const row = await ctx.db
        .query("adCampaigns")
        .withIndex("by_demo_key", (q) => q.eq("demoKey", ad.slug))
        .unique();
      if (!row || row.mediaKey !== ad.mediaKey) {
        skipped += 1;
        continue;
      }
      if (row.mobileMediaKey !== undefined) {
        existing += 1;
        continue;
      }
      await campaignMedia(ctx, ad.mobileMediaKey, row.format, row.placements);
      const patch = {
        mobileMediaKey: ad.mobileMediaKey,
        updatedAt: now,
        updatedBy: actor,
      };
      await ctx.db.patch(row._id, patch);
      await scheduleBoundary(ctx, { ...row, ...patch });
      updated += 1;
    }
    if (updated > 0 || mediaCreated > 0) {
      await ctx.db.insert("auditLog", {
        at: now,
        actorSubject: "internal:responsive-ad-examples",
        actorName: actor,
        actorRole: "interne",
        action: "settings.update",
        targetType: "adCampaigns",
        targetId: "responsive-demo-examples",
        summary: `Affiches mobiles : ${updated} campagne(s) enrichie(s), ${mediaCreated} média(s) ajouté(s), sans changement de diffusion.`,
      });
    }
    return { updated, existing, skipped };
  },
});
