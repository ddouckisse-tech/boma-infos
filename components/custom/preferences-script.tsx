import Script from "next/script";
import { PREFERENCES_SCRIPT } from "@/lib/preferences";

/**
 * Blocking inline script injected in <head>.
 *
 * It runs before the first paint, so the stored theme (and the data saver
 * flag) are already on <html> when the browser paints: no flash.
 * It is the only inline script the project owns (see `lib/security-headers.ts`).
 *
 * Rendered through `next/script` with `beforeInteractive` rather than a raw
 * `<script>`: a raw tag is a React element, and whenever React has to render
 * the root on the client (a hydration fallback, for instance) it re-creates
 * the tag without executing it — and says so in the console. `next/script`
 * injects it into the document head once, outside the React tree.
 */
export function PreferencesScript() {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- App Router : la doc de Next place `beforeInteractive` dans le root layout, où ce composant est monté ; vérifié dans le HTML servi (script inline dans <head>, avant <body>).
    <Script
      id="lc-preferences"
      strategy="beforeInteractive"
      // Le contenu est une constante du dépôt, jamais une entrée utilisateur.
      dangerouslySetInnerHTML={{ __html: PREFERENCES_SCRIPT }}
    />
  );
}
