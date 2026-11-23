/**
 * French formatting helpers.
 *
 * The time zone is pinned to Libreville (UTC+1, no daylight saving): a date
 * formatted on a build server in another zone must read the same as it does
 * for the reader it was written for, and a server/client mismatch would
 * produce a hydration error on every article page.
 */

const TIME_ZONE = "Africa/Libreville";
const LOCALE = "fr-FR";

const longDate = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const shortDate = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const dateTime = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

/** « 12 septembre 2026 » */
export const formatDate = (value: number): string => longDate.format(value);

/** « 12/09/2026 » — used where space is tight. */
export const formatDateShort = (value: number): string =>
  shortDate.format(value);

export const formatDateTime = (value: number): string => dateTime.format(value);

/** ISO 8601, for <time dateTime> and structured data. */
export const isoDate = (value: number): string => new Date(value).toISOString();

/** « 4 min de lecture » */
export const formatReadingTime = (minutes: number): string =>
  `${minutes} min de lecture`;

const numbers = new Intl.NumberFormat(LOCALE);

export const formatNumber = (value: number): string => numbers.format(value);

/** « 1 240 vues » — with the French non-breaking space before the unit. */
export const formatViews = (value: number): string =>
  `${numbers.format(value)} ${value > 1 ? "vues" : "vue"}`;

/** « 1,6 Mo » — the reader is told what a download will cost before clicking. */
export function formatBytes(bytes: number, locale: "fr" | "en" = "fr"): string {
  if (bytes < 1024) return `${bytes} ${locale === "en" ? "B" : "octets"}`;
  const kb = bytes / 1024;
  const megabytes = kb >= 1024;
  const raw = megabytes ? (kb / 1024).toFixed(1) : kb.toFixed(kb < 10 ? 1 : 0);
  if (locale === "en") return `${raw} ${megabytes ? "MB" : "KB"}`;
  return `${raw.replace(".", ",")} ${megabytes ? "Mo" : "Ko"}`;
}

/** « il y a 3 jours » — coarse on purpose, so it never needs a live clock. */
export function formatRelative(value: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - value) / 1000));
  if (seconds < 60) return "à l'instant";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60)
    return `il y a ${minutes} ${minutes > 1 ? "minutes" : "minute"}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} ${hours > 1 ? "heures" : "heure"}`;
  const days = Math.round(hours / 24);
  if (days < 7) return `il y a ${days} ${days > 1 ? "jours" : "jour"}`;
  if (days < 31) {
    const weeks = Math.round(days / 7);
    return `il y a ${weeks} ${weeks > 1 ? "semaines" : "semaine"}`;
  }
  return formatDate(value);
}
