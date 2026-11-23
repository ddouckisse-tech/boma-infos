import type { LocaleChoice } from "./preferences";

const ARTICLE_PATH = /^(\/en)?\/article\/[a-z0-9-]{1,501}\/?$/;

export function articlePath(slug: string, locale: LocaleChoice = "fr") {
  return `${locale === "en" ? "/en" : ""}/article/${slug}`;
}

export function articleLocale(path: string): LocaleChoice | null {
  const match = ARTICLE_PATH.exec(path);
  return match ? (match[1] ? "en" : "fr") : null;
}
