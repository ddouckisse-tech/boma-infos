export type PwaPlatform = "ios" | "android" | "desktop" | "other";

export const PWA_DISMISS_MS = 14 * 24 * 60 * 60 * 1_000;
export const PWA_DISMISS_KEY = "boma-pwa-install-dismissal-v1";

/** Platform hints determine instructions only; they never imply installation support. */
export function detectPwaPlatform({
  userAgent,
  platform = "",
  maxTouchPoints = 0,
}: {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
}): PwaPlatform {
  if (
    /\b(iPhone|iPad|iPod)\b/i.test(userAgent) ||
    /^(iPhone|iPad|iPod)$/i.test(platform)
  ) {
    return "ios";
  }
  if (/\bAndroid\b/i.test(userAgent)) return "android";
  // iPadOS can request the desktop Safari user agent and expose MacIntel.
  if (
    (/\bMacintosh\b/i.test(userAgent) || /^Mac/i.test(platform)) &&
    Number.isFinite(maxTouchPoints) &&
    maxTouchPoints > 1
  ) {
    return "ios";
  }
  if (
    !/\b(Mobile|Mobi|Tablet|Kindle|Silk)\b/i.test(userAgent) &&
    (/\b(Windows NT|Macintosh|Mac OS X|X11|Linux|CrOS)\b/i.test(userAgent) ||
      /^(Win|Mac|Linux)/i.test(platform))
  ) {
    return "desktop";
  }
  return "other";
}

/** Explicit host-app markers avoid mistaking normal Android Chrome for a WebView. */
export function isEmbeddedBrowser(userAgent: string): boolean {
  return (
    /\b(FBAN|FBAV|FB_IAB|Instagram|MicroMessenger|Snapchat|TikTok|BytedanceWebview)\b|\bLine\//i.test(
      userAgent
    ) ||
    (/\bAndroid\b/i.test(userAgent) &&
      /(?:^|[;\s])wv(?:[;)\s]|$)/i.test(userAgent))
  );
}

/** Stored JSON is untrusted: only a bounded, future 14-day timestamp survives. */
export function parseInstallDismissal(raw: string | null, now: number): number {
  if (!Number.isFinite(now)) return 0;
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value) ||
      !("version" in value) ||
      value.version !== 1 ||
      !("until" in value) ||
      typeof value.until !== "number" ||
      !Number.isSafeInteger(value.until) ||
      value.until <= now ||
      value.until - now > PWA_DISMISS_MS
    )
      return 0;
    return value.until;
  } catch {
    return 0;
  }
}

/** Invitations are limited to reading pages, outside account and form journeys. */
export function isInstallInvitationPage(pathname: string): boolean {
  return (
    pathname === "/" ||
    /^\/article\/[^/?#]+\/?$/.test(pathname) ||
    /^\/rubrique\/[^/?#]+(?:\/[^/?#]+)*\/?$/.test(pathname)
  );
}

export function shouldOfferInstall({
  platform,
  standalone,
  dismissedUntil,
  now,
  secure,
}: {
  platform: PwaPlatform;
  standalone: boolean;
  dismissedUntil: number;
  now: number;
  secure: boolean;
}): boolean {
  return (
    (platform === "ios" || platform === "android") &&
    secure &&
    !standalone &&
    Number.isFinite(now) &&
    Number.isFinite(dismissedUntil) &&
    dismissedUntil <= now
  );
}
