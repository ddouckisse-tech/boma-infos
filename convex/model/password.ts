/**
 * Password policy — six digits followed by one letter for the newsroom.
 *
 * Two shapes are accepted, and nothing in between:
 *
 *  - a **six-digit code followed by one ASCII letter**, the newsroom's
 *    access code. It is handed over as a provisional code by an administrator, and
 *    replaced by the holder from « Mon compte » or the settings;
 *  - a **password of twelve characters or more**, kept for company accounts
 *    (`registerCompany`) and for whoever prefers a long one.
 *
 * Shared by the server (`convex/auth.ts` hook, `accounts.createStaff`) and
 * by the forms (imported as `@/convex/model/password`): one rule, one
 * sentence, so the screen never promises what the server refuses.
 */

export const PIN_LENGTH = 6;

/** Legacy codes remain readable when signing in; new passwords use isAccessCode. */
export const isPinCode = (value: string): boolean => /^\d{6}$/.test(value);

export const ACCESS_CODE_DIGITS = 6;
export const ACCESS_CODE_LENGTH = 7;

export const isAccessCode = (value: string): boolean =>
  value.length === ACCESS_CODE_LENGTH && /^\d{6}[A-Za-z]$/.test(value);

export const isAcceptablePassword = (value: string): boolean =>
  isAccessCode(value) || value.length >= 12;

export const PASSWORD_RULE_MESSAGE =
  "Le mot de passe doit être un code de six chiffres suivis d’une lettre (A à Z, majuscule ou minuscule), ou compter au moins douze caractères.";
