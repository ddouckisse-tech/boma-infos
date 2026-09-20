import { AD_PLACEMENTS, type AdPlacement } from "./types";

type Environment = Readonly<Record<string, string | undefined>>;

export type AdSenseCmpConfig = {
  scriptUrl: string;
  allowedOrigins: string[];
  cmpId: number;
};
export type AdSenseConfig = {
  clientId: string;
  slotId: string;
  cmp: AdSenseCmpConfig;
  /** Request nonce, attached by the server renderer; never an environment secret. */
  nonce?: string;
};

const SLOT_VARIABLES: Record<AdPlacement, string> = {
  "home-primary": "ADSENSE_SLOT_HOME_PRIMARY",
  "home-secondary": "ADSENSE_SLOT_HOME_SECONDARY",
  article: "ADSENSE_SLOT_ARTICLE",
  listing: "ADSENSE_SLOT_LISTING",
};
const CLIENT_ID = /^ca-pub-\d{16}$/;
const SLOT_ID = /^\d{10}$/;

/** HTTPS only; reject characters that could escape an HTML/CSP attribute. */
export function safeAdSenseUrl(raw: string): URL | null {
  if (!raw.startsWith("https://") || /[\s<>"'`;\\]/.test(raw)) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" &&
      /^[a-z0-9.-]+$/i.test(url.hostname) &&
      url.hostname.includes(".") &&
      !url.username &&
      !url.password &&
      !url.hash
      ? url
      : null;
  } catch {
    return null;
  }
}

export function isAdSenseNonce(value: string | undefined): value is string {
  return value !== undefined && /^[A-Za-z0-9+/_-]{22,128}={0,2}$/.test(value);
}

/** A partial or invalid setup loads neither a CMP nor Google's advertising code. */
export function getAdSenseRuntimeConfig(env: Environment = process.env) {
  if (
    env.ADS_MODE !== "adsense" ||
    !CLIENT_ID.test(env.ADSENSE_CLIENT_ID ?? "")
  )
    return null;
  const scriptUrl = safeAdSenseUrl(env.ADSENSE_CMP_SCRIPT_URL ?? "");
  const cmpId = Number(env.ADSENSE_CMP_ID);
  if (!scriptUrl || !Number.isSafeInteger(cmpId) || cmpId < 1 || cmpId > 4095)
    return null;
  const sources = (env.ADSENSE_CMP_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((source) => source.trim());
  if (sources.length === 0 || sources.length > 20) return null;
  const origins: string[] = [];
  for (const source of sources) {
    const url = safeAdSenseUrl(source);
    if (!url || (source !== url.origin && source !== `${url.origin}/`))
      return null;
    origins.push(url.origin);
  }
  if (!origins.includes(scriptUrl.origin)) return null;
  const slots: Partial<Record<AdPlacement, string>> = {};
  for (const placement of AD_PLACEMENTS) {
    const value = env[SLOT_VARIABLES[placement]];
    if (value && SLOT_ID.test(value)) slots[placement] = value;
  }
  if (Object.keys(slots).length === 0) return null;
  return {
    clientId: env.ADSENSE_CLIENT_ID!,
    slots,
    cmp: {
      scriptUrl: scriptUrl.href,
      allowedOrigins: [...new Set(origins)],
      cmpId,
    } satisfies AdSenseCmpConfig,
  };
}

export const getAdSenseCmpConfig = (env: Environment = process.env) =>
  getAdSenseRuntimeConfig(env)?.cmp ?? null;

export function getAdSenseConfig(
  placement: AdPlacement,
  env: Environment = process.env
): AdSenseConfig | null {
  const runtime = getAdSenseRuntimeConfig(env);
  const slotId = runtime?.slots[placement];
  return runtime && slotId
    ? { clientId: runtime.clientId, slotId, cmp: runtime.cmp }
    : null;
}

export function isValidAdSenseConfig(config: AdSenseConfig): boolean {
  const validated = getAdSenseConfig("article", {
    ADS_MODE: "adsense",
    ADSENSE_CLIENT_ID: config.clientId,
    ADSENSE_SLOT_ARTICLE: config.slotId,
    ADSENSE_CMP_ID: String(config.cmp.cmpId),
    ADSENSE_CMP_SCRIPT_URL: config.cmp.scriptUrl,
    ADSENSE_CMP_ALLOWED_ORIGINS: config.cmp.allowedOrigins.join(","),
  });
  return validated !== null && isAdSenseNonce(config.nonce);
}

/** Fixed dimensions chosen once before requesting. No resize-triggered refresh. */
export function adSenseSize(
  placement: AdPlacement,
  availableWidth: number,
  desktop: boolean
) {
  if (
    !Number.isFinite(availableWidth) ||
    availableWidth < 250 ||
    (placement === "home-secondary" && !desktop)
  )
    return null;
  if (placement === "article")
    return { width: availableWidth >= 300 ? 300 : 250, height: 250 };
  if (desktop && availableWidth >= 728) return { width: 728, height: 90 };
  return availableWidth >= 320
    ? { width: 320, height: 100 }
    : { width: 250, height: 100 };
}
