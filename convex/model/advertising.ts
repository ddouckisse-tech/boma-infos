import { v } from "convex/values";
import {
  AD_DEVICES,
  AD_PLACEMENTS,
  type AdCreative,
  type AdFormat,
  type AdPlacement,
} from "../../lib/ads/types";
import type { MediaAsset, MediaVariant } from "../../lib/media-core";

export const adKind = v.union(v.literal("paid"), v.literal("house"));
export const adFormat = v.union(v.literal("square"), v.literal("banner"));
export const adDevice = v.union(
  v.literal("all"),
  v.literal("desktop"),
  v.literal("mobile")
);
export const adPlacement = v.union(
  v.literal("home-primary"),
  v.literal("home-secondary"),
  v.literal("article"),
  v.literal("listing"),
  v.literal("article-inline"),
  v.literal("popup"),
  v.literal("floating")
);

export const campaignFields = {
  title: v.string(),
  advertiser: v.string(),
  kind: adKind,
  format: adFormat,
  href: v.string(),
  mediaKey: v.string(),
  placements: v.array(adPlacement),
  device: v.optional(adDevice),
  startsAt: v.optional(v.number()),
  endsAt: v.optional(v.number()),
  enabled: v.boolean(),
  priority: v.number(),
};

export type CampaignInput = Omit<
  AdCreative,
  "id" | "media" | "presentation" | "demo"
> & {
  mediaKey: string;
  enabled: boolean;
};

export const AD_FEED_LIMIT = 24;
export const AD_IMAGE_BUDGET = { square: 32 * 1024, banner: 55 * 1024 };
export const AD_ARTICLE_IMAGE_BUDGET = 16 * 1024;
const MIN_WIDTH = { square: 320, banner: 640 };
const MAX_WIDTH = { square: 640, banner: 1280 };
const KEY = /^[a-z0-9][a-z0-9-]{2,79}$/;
const UNSAFE_TEXT = /[<>\u0000-\u001f\u007f]/;

function cleanText(value: string, label: string, max: number): string {
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > max || UNSAFE_TEXT.test(cleaned)) {
    throw new Error(
      `${label} : texte obligatoire, sans HTML, limité à ${max} caractères.`
    );
  }
  return cleaned;
}

/** Click destinations are navigation only: no script, credentials or protocol-relative URL. */
export function isSafeAdHref(href: string): boolean {
  if (
    href.length === 0 ||
    href.length > 2048 ||
    /[\s\\<>\u0000-\u001f\u007f]/.test(href)
  )
    return false;

  if (href.startsWith("/")) {
    // Reject encoded slashes/control characters too: a redirect or intermediary
    // must not turn an apparently local destination into a second origin.
    try {
      const decoded = decodeURIComponent(href);
      return (
        !decoded.includes("//") && !/[\\\u0000-\u001f\u007f]/.test(decoded)
      );
    } catch {
      return false;
    }
  }
  if (!href.startsWith("https://")) return false;
  try {
    const url = new URL(href);
    return (
      url.protocol === "https:" &&
      url.hostname !== "" &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function validateCampaign(input: CampaignInput): CampaignInput {
  const title = cleanText(input.title, "Titre", 120);
  const advertiser = cleanText(input.advertiser, "Annonceur", 100);
  const mediaKey = input.mediaKey.trim();
  const href = input.href.trim();
  if (!KEY.test(mediaKey)) throw new Error("Clé de média invalide.");
  if (!isSafeAdHref(href))
    throw new Error(
      "Lien invalide : utilisez un chemin local ou une URL HTTPS sans identifiants."
    );
  if (!["paid", "house"].includes(input.kind))
    throw new Error("Nature de campagne invalide.");
  if (!["square", "banner"].includes(input.format))
    throw new Error("Format publicitaire invalide.");
  const device = input.device ?? "all";
  if (!AD_DEVICES.includes(device)) throw new Error("Appareil cible invalide.");
  if (typeof input.enabled !== "boolean")
    throw new Error("Activation invalide.");
  if (
    !Number.isInteger(input.priority) ||
    input.priority < 0 ||
    input.priority > 100
  ) {
    throw new Error("La priorité doit être un entier entre 0 et 100.");
  }
  if (
    input.placements.length === 0 ||
    input.placements.length > AD_PLACEMENTS.length ||
    new Set(input.placements).size !== input.placements.length ||
    input.placements.some((placement) => !AD_PLACEMENTS.includes(placement))
  )
    throw new Error("Choisissez entre un et sept emplacements distincts.");
  if (
    input.format === "square" &&
    input.placements.some(
      (placement) => !["article", "popup", "floating"].includes(placement)
    )
  ) {
    throw new Error(
      "Le format carré est réservé à la colonne article, aux pop-up et aux blocs flottants."
    );
  }
  if (
    input.format === "banner" &&
    input.placements.some((placement) =>
      ["popup", "floating"].includes(placement)
    )
  ) {
    throw new Error(
      "Les pop-up et les blocs flottants accueillent un format carré."
    );
  }
  for (const date of [input.startsAt, input.endsAt]) {
    if (
      date !== undefined &&
      (!Number.isSafeInteger(date) || date < 0 || date > 8_640_000_000_000_000)
    ) {
      throw new Error("Date de diffusion invalide.");
    }
  }
  if (
    input.startsAt !== undefined &&
    input.endsAt !== undefined &&
    input.endsAt <= input.startsAt
  ) {
    throw new Error("La fin de diffusion doit suivre la date de début.");
  }
  return {
    ...input,
    title,
    advertiser,
    href,
    mediaKey,
    device,
    placements: [...input.placements],
  };
}

export function isCampaignActive(
  campaign: Pick<CampaignInput, "enabled" | "startsAt" | "endsAt">,
  now: number
): boolean {
  return (
    campaign.enabled &&
    (campaign.startsAt === undefined || campaign.startsAt <= now) &&
    (campaign.endsAt === undefined || campaign.endsAt > now)
  );
}

/** Start is inclusive, end exclusive. Stable order avoids shuffling on every fetch. */
export function selectActiveCampaigns<
  T extends CampaignInput & { _id: string },
>(campaigns: readonly T[], now: number, limit = AD_FEED_LIMIT): T[] {
  return campaigns
    .filter((campaign) => isCampaignActive(campaign, now))
    .sort((a, b) => b.priority - a.priority || a._id.localeCompare(b._id))
    .slice(0, Math.max(0, limit));
}

function validVariant(variant: MediaVariant): boolean {
  return (
    Number.isInteger(variant.w) &&
    variant.w > 0 &&
    Number.isInteger(variant.h) &&
    variant.h > 0 &&
    Number.isInteger(variant.bytes) &&
    variant.bytes > 0
  );
}

/** Only these renditions reach the browser, so no srcset can exceed its budget. */
export function constrainAdMedia(
  asset: MediaAsset,
  format: AdFormat,
  placements: readonly AdPlacement[] = []
): MediaAsset {
  // A shared campaign must fit the tightest page that can display it.
  const maxBytes = placements.some((placement) =>
    ["article", "article-inline", "popup", "floating"].includes(placement)
  )
    ? AD_ARTICLE_IMAGE_BUDGET
    : AD_IMAGE_BUDGET[format];
  const alt = cleanText(asset.alt, "Texte alternatif", 500);
  if (
    !KEY.test(asset.id) ||
    !Number.isInteger(asset.width) ||
    asset.width <= 0 ||
    !Number.isInteger(asset.height) ||
    asset.height <= 0 ||
    !/^#[0-9a-f]{6}$/i.test(asset.color) ||
    asset.avif.some((variant) => !validVariant(variant)) ||
    asset.webp.some((variant) => !validVariant(variant))
  )
    throw new Error("Métadonnées du média publicitaire invalides.");

  const eligible = (variants: readonly MediaVariant[]) =>
    variants
      .filter(
        (variant) => variant.w <= MAX_WIDTH[format] && variant.bytes <= maxBytes
      )
      .sort((a, b) => a.w - b.w);
  const webp = eligible(asset.webp);
  const avif = eligible(asset.avif);
  if (!webp.some((variant) => variant.w >= MIN_WIDTH[format])) {
    throw new Error(
      `Le média nécessite une version WebP d'au moins ${MIN_WIDTH[format]} px et de ${maxBytes / 1024} Kio maximum.`
    );
  }
  const urls = asset.urls
    ? Object.fromEntries(
        [
          ...webp.map((variant) => `webp-${variant.w}`),
          ...avif.map((variant) => `avif-${variant.w}`),
        ].map((key) => [key, asset.urls![key]])
      )
    : undefined;
  if (urls && Object.values(urls).some((url) => !url || !isSafeAdHref(url))) {
    throw new Error("Version du média publicitaire indisponible.");
  }
  return { ...asset, alt, webp, avif, ...(urls ? { urls } : {}) };
}
