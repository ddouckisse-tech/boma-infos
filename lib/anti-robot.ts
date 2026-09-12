/**
 * Anti-robot protection for the public forms, without a CAPTCHA.
 *
 * CDC §5.3 asks for anti-robot protection on public forms; the audit found
 * the legacy one dormant. Two cheap, accessible checks instead of a puzzle
 * that penalises real readers: a honeypot field hidden from humans and from
 * assistive technology, and a minimum time on the form. Neither costs a
 * request to a third party, and neither blocks anyone using a screen reader.
 *
 * **This module has no dependency on purpose.** The client forms need the
 * field names, and they used to get them from `lib/schemas.ts` — which pulls
 * Zod into the browser bundle for 87 Ko gzipped, half the JavaScript budget
 * of §5.4, to read two string constants. Validation stays server-side, where
 * Zod belongs.
 */

export const antiRobot = {
  /** Must stay empty. Named plausibly so a bot fills it in. */
  honeypotField: "site_web",
  /** Rendered value: the moment the form was served. */
  timestampField: "ouvert_a",
  /** A human does not submit a contact form in under two seconds. */
  minimumSeconds: 2,
} as const;

export const isRobot = (
  honeypot: FormDataEntryValue | null,
  timestamp: FormDataEntryValue | null
): boolean => {
  if (typeof honeypot === "string" && honeypot.trim() !== "") return true;
  const opened = Number(timestamp);
  if (!Number.isFinite(opened)) return true;
  return (Date.now() - opened) / 1000 < antiRobot.minimumSeconds;
};
