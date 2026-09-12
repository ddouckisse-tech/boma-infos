import {
  AD_DISMISS_MS,
  AD_MAX_ROTATIONS,
  AD_PLACEMENTS,
  AD_ROTATION_MS,
  type AdCreative,
  type AdPlacement,
} from "@/lib/ads/types";

export type AdDismissals = {
  placements: Partial<Record<AdPlacement, number>>;
  campaigns: Record<string, number>;
};

export const emptyDismissals = (): AdDismissals => ({
  placements: {},
  campaigns: {},
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Storage is untrusted; only positive, finite expiry timestamps survive. */
export function parseDismissals(raw: string | null): AdDismissals {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!isRecord(value) || value.version !== 1) return emptyDismissals();
    const timestamps = (input: unknown, placements = false) =>
      Object.fromEntries(
        Object.entries(isRecord(input) ? input : {}).filter(
          ([key, expiry]) =>
            (!placements || AD_PLACEMENTS.includes(key as AdPlacement)) &&
            key.length > 0 &&
            key.length <= 200 &&
            typeof expiry === "number" &&
            Number.isFinite(expiry) &&
            expiry > 0
        )
      ) as Record<string, number>;
    return {
      placements: timestamps(value.placements, true),
      campaigns: timestamps(value.campaigns),
    };
  } catch {
    return emptyDismissals();
  }
}

export const serializeDismissals = (value: AdDismissals): string =>
  JSON.stringify({ version: 1, ...value });

/** Call at navigation boundaries, never on a timer on the reading page. */
export function activeDismissals(
  value: AdDismissals,
  navigationAt: number
): AdDismissals {
  const active = (entries: Record<string, number>) =>
    Object.fromEntries(
      Object.entries(entries).filter(([, expiry]) => expiry > navigationAt)
    );
  return {
    placements: active(value.placements),
    campaigns: active(value.campaigns),
  };
}

export function mergeDismissals(
  first: AdDismissals,
  second: AdDismissals
): AdDismissals {
  const merge = (a: Record<string, number>, b: Record<string, number>) =>
    Object.fromEntries(
      [...new Set([...Object.keys(a), ...Object.keys(b)])].map((key) => [
        key,
        Math.max(
          Object.hasOwn(a, key) ? a[key] : 0,
          Object.hasOwn(b, key) ? b[key] : 0
        ),
      ])
    );
  return {
    placements: merge(first.placements, second.placements),
    campaigns: merge(first.campaigns, second.campaigns),
  };
}

export function dismissAd(
  previous: AdDismissals,
  placement: AdPlacement,
  campaignId: string,
  now: number
): AdDismissals {
  return mergeDismissals(previous, {
    placements: { [placement]: now + AD_DISMISS_MS },
    campaigns: { [campaignId]: now + AD_DISMISS_MS },
  });
}

/** Relative editorial destinations or HTTPS only; reject ambiguous URL forms. */
export function isSafeAdHref(href: string): boolean {
  if (!href || href !== href.trim() || /[\u0000-\u0020\\]/.test(href))
    return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** Keep a single format throughout the slot's lifetime to reserve its height. */
export function candidatesForSlot(
  creatives: readonly AdCreative[],
  placement: AdPlacement,
  at?: number
): AdCreative[] {
  const safe = creatives.filter(
    (creative) =>
      creative.placements.includes(placement) &&
      creative.id.length > 0 &&
      creative.id.length <= 200 &&
      isSafeAdHref(creative.href) &&
      creative.media.webp.length > 0 &&
      (at === undefined || isCreativeActive(creative, at)) &&
      (creative.format === "banner" ||
        (placement === "article" && creative.format === "square"))
  );
  const format = safe[0]?.format;
  const seen = new Set<string>();
  return safe
    .filter((creative) => {
      if (creative.format !== format || seen.has(creative.id)) return false;
      seen.add(creative.id);
      return true;
    })
    .slice(0, 6);
}

/** Start is inclusive; end is exclusive, including stale server-cache data. */
export function isCreativeActive(creative: AdCreative, at: number): boolean {
  return (
    (creative.startsAt === undefined ||
      (Number.isFinite(creative.startsAt) && creative.startsAt <= at)) &&
    (creative.endsAt === undefined ||
      (Number.isFinite(creative.endsAt) && creative.endsAt > at))
  );
}

export const isCampaignDismissed = (value: AdDismissals, id: string): boolean =>
  Object.hasOwn(value.campaigns, id);

export const isPlacementDismissed = (
  value: AdDismissals,
  placement: AdPlacement
): boolean => Object.hasOwn(value.placements, placement);

export type RotationState = {
  index: number;
  rotations: number;
  elapsedMs: number;
};

/** A long suspended interval never catches up through several advertisements. */
export function advanceRotation(
  state: RotationState,
  visibleMs: number,
  candidateCount: number
): RotationState {
  if (candidateCount < 2 || state.rotations >= AD_MAX_ROTATIONS) return state;
  const elapsedMs = state.elapsedMs + Math.max(0, visibleMs);
  if (elapsedMs < AD_ROTATION_MS) return { ...state, elapsedMs };
  return {
    index: (state.index + 1) % candidateCount,
    rotations: state.rotations + 1,
    elapsedMs: 0,
  };
}
