/**
 * Password policy — client decision of 12/09/2026, which replaces the twelve
 * characters of CDC §4.3 for the newsroom.
 *
 * Two shapes are accepted, and nothing in between:
 *
 *  - a **six-digit code**, the newsroom's access code. It is typed in six
 *    boxes, handed over as a provisional code by an administrator, and
 *    replaced by the holder from « Mon compte » or the settings;
 *  - a **password of twelve characters or more**, kept for company accounts
 *    (`registerCompany`) and for whoever prefers a long one.
 *
 * Shared by the server (`convex/auth.ts` hook, `accounts.createStaff`) and
 * by the forms (imported as `@/convex/model/password`): one rule, one
 * sentence, so the screen never promises what the server refuses.
 */

export const PIN_LENGTH = 6;

export const isPinCode = (value: string): boolean => /^\d{6}$/.test(value);

export const isAcceptablePassword = (value: string): boolean =>
  isPinCode(value) || value.length >= 12;

export const PASSWORD_RULE_MESSAGE =
  "Le mot de passe doit être un code à six chiffres, ou compter au moins douze caractères.";
