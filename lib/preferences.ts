/**
 * Reader preferences persisted in `localStorage`.
 *
 * Two of them exist in milestone 1:
 *  - the colour theme (light / dark / follow the system), see CDC §3.1;
 *  - the data saver mode, which milestone 2 consumes to downgrade images and
 *    stop preloading video (CDC §2.2 — data is expensive in Gabon).
 *
 * Both are applied by a blocking inline script in <head> so the first paint is
 * already correct: no flash of the wrong theme.
 */

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "lecorporate.theme";
export const DATA_SAVER_STORAGE_KEY = "lecorporate.data-saver";

/**
 * Le mode économie est aussi écrit dans un cookie : c'est `proxy.ts` qui le
 * lit, pour réécrire les requêtes d'images vers la variante 480 px
 * (CDC §2.2). Le script bloquant ci-dessous le remet à chaque visite, de
 * sorte qu'un cookie expiré ou effacé se répare tout seul.
 */
export const DATA_SAVER_COOKIE = "lc-eco";

export const dataSaverCookie = (enabled: boolean): string =>
  `${DATA_SAVER_COOKIE}=${enabled ? "1" : "0"}; Path=/; Max-Age=${
    enabled ? 31_536_000 : 0
  }; SameSite=Lax`;

export const THEME_CHOICES: readonly ThemeChoice[] = [
  "light",
  "dark",
  "system",
];

export const THEME_LABELS: Record<ThemeChoice, string> = {
  light: "Clair",
  dark: "Sombre",
  system: "Système",
};

export const isThemeChoice = (value: unknown): value is ThemeChoice =>
  value === "light" || value === "dark" || value === "system";

/**
 * Source of the blocking inline script.
 *
 * Kept as a single exported constant: it is the only inline script this
 * project owns, which keeps the Content-Security-Policy surface auditable
 * (see `lib/security-headers.ts`).
 */
export const PREFERENCES_SCRIPT = `(function(){try{
var d=document.documentElement;
var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})||"system";
if(t!=="light"&&t!=="dark"&&t!=="system"){t="system";}
var r=t==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;
d.classList.toggle("dark",r==="dark");
d.dataset.themeChoice=t;
d.dataset.theme=r;
d.style.colorScheme=r;
var s=localStorage.getItem(${JSON.stringify(DATA_SAVER_STORAGE_KEY)})==="1";
d.dataset.dataSaver=s?"on":"off";
document.cookie=${JSON.stringify(DATA_SAVER_COOKIE)}+"="+(s?"1":"0")+"; Path=/; Max-Age="+(s?31536000:0)+"; SameSite=Lax";
}catch(e){}})();`;
