import { PREFERENCES_SCRIPT } from "@/lib/preferences";

/**
 * Blocking inline script injected in <head>.
 *
 * It runs before the first paint, so the stored theme (and the data saver
 * flag) are already on <html> when the browser paints: no flash.
 * It is the only inline script the project owns (see `lib/security-headers.ts`).
 */
export function PreferencesScript() {
  return (
    <script
      // Le contenu est une constante du dépôt, jamais une entrée utilisateur.
      dangerouslySetInnerHTML={{ __html: PREFERENCES_SCRIPT }}
    />
  );
}
