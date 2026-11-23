import { AD_PREFERENCES_SCRIPT } from "@/lib/ads/browser";

/**
 * Reader preferences persisted in `localStorage`.
 *
 * Three preferences are shared by the public journal and the private areas:
 *  - the colour theme (light / dark / follow the system), see CDC §3.1;
 *  - the data saver mode, which milestone 2 consumes to downgrade images and
 *    stop preloading video (CDC §2.2 — data is expensive in Gabon).
 *
 *  - the interface language (French / English).
 *
 * They are applied by a blocking inline script in <head> so the first paint is
 * already correct: no flash of the wrong theme.
 */

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type LocaleChoice = "fr" | "en";

export const THEME_STORAGE_KEY = "bomainfos.theme";
export const DATA_SAVER_STORAGE_KEY = "bomainfos.data-saver";
export const LOCALE_STORAGE_KEY = "bomainfos.locale";
export const LOCALE_COOKIE = "bomainfos-locale";

export const localeCookie = (locale: LocaleChoice): string =>
  `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;

/**
 * Le mode économie est aussi écrit dans un cookie : c'est `proxy.ts` qui le
 * lit, pour réécrire les requêtes d'images vers la variante 480 px
 * (CDC §2.2). Le script bloquant ci-dessous le remet à chaque visite, de
 * sorte qu'un cookie expiré ou effacé se répare tout seul.
 */
export const DATA_SAVER_COOKIE = "bomainfos-eco";

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

export const isLocaleChoice = (value: unknown): value is LocaleChoice =>
  value === "fr" || value === "en";

/**
 * Source of the blocking inline script.
 *
 * Kept as a single exported constant: it is the only inline script this
 * project owns, which keeps the Content-Security-Policy surface auditable
 * (see `lib/security-headers.ts`).
 */
export const PREFERENCES_SCRIPT =
  `(function(){try{
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
var l=localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)});
if(l!=="fr"&&l!=="en"){l=navigator.language&&navigator.language.toLowerCase().startsWith("en")?"en":"fr";}
var p=window.location&&window.location.pathname;
if(/^\\/en\\/article\\/[^/]+\\/?$/.test(p||"")){l="en";}
if(p==="/recherche"){var q=new URLSearchParams(window.location.search).get("lang");if(q==="en"||q==="fr"){l=q;}}
if(p==="/recherche"||(p&&p.indexOf("/en/article/")===0)){localStorage.setItem(${JSON.stringify(LOCALE_STORAGE_KEY)},l);}
document.cookie=${JSON.stringify(LOCALE_COOKIE)}+"="+l+"; Path=/; Max-Age=31536000; SameSite=Lax";
d.dataset.locale=l;
d.lang=l==="en"?"en":"fr-FR";
if(l==="en"&&/^\\/article\\/[a-z0-9-]+\\/?$/.test(p||"")&&!new URLSearchParams(window.location.search).has("original")){
  window.location.replace("/en"+p+window.location.search+window.location.hash);
}
}catch(e){}})();` + AD_PREFERENCES_SCRIPT;
