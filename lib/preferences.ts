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
 * Kept as a single exported constant so that `middleware.ts` can hash exactly
 * the bytes that are served and authorise them in the Content-Security-Policy
 * without resorting to 'unsafe-inline'.
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
}catch(e){}})();`;
