import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { CATEGORIES } from "../convex/seed/catalog.ts";
import {
  categoryDescription,
  categoryLabel,
  navigationLabel,
} from "../lib/i18n.ts";
import { PREFERENCES_SCRIPT } from "../lib/preferences.ts";

function runBoot(locale, browserLanguage = "fr-FR", entry) {
  const dataset = {};
  const state = { dark: false };
  const root = {
    dataset,
    lang: "fr-FR",
    style: {},
    classList: {
      toggle(_name, enabled) {
        state.dark = enabled;
      },
    },
  };
  const documentStub = { documentElement: root, cookie: "" };
  const localStorageStub = {
    setItem() {},
    getItem(key) {
      if (key === "bomainfos.locale") return locale;
      if (key === "bomainfos.theme") return "light";
      return null;
    },
  };
  let redirect;
  const windowStub = {
    matchMedia: () => ({ matches: false }),
    location: entry && {
      search: "",
      hash: "",
      ...entry,
      replace(path) {
        redirect = path;
      },
    },
  };
  const execute = new Function(
    "document",
    "localStorage",
    "window",
    "navigator",
    PREFERENCES_SCRIPT
  );
  execute(documentStub, localStorageStub, windowStub, {
    language: browserLanguage,
  });
  return {
    locale: dataset.locale,
    lang: root.lang,
    theme: dataset.theme,
    dark: state.dark,
    ...(redirect && { redirect }),
  };
}

describe("interface locale", () => {
  test("restores English before the first paint", () => {
    expect(runBoot("en")).toEqual({
      locale: "en",
      lang: "en",
      theme: "light",
      dark: false,
    });
  });

  test("an English article URL or search link selects English before paint", () => {
    expect(
      runBoot("fr", "fr-FR", { pathname: "/en/article/archives" }).lang
    ).toBe("en");
    expect(
      runBoot("fr", "fr-FR", {
        pathname: "/recherche",
        search: "?lang=en&q=ports",
      }).lang
    ).toBe("en");
  });

  test("existing English preferences carry direct article links to their English edition", () => {
    expect(
      runBoot("en", "fr-FR", {
        pathname: "/article/archives",
        hash: "#sommaire",
      }).redirect
    ).toBe("/en/article/archives#sommaire");
    expect(
      runBoot("en", "fr-FR", {
        pathname: "/article/archives",
        search: "?original=1",
      }).redirect
    ).toBeUndefined();
  });

  test("uses the browser language only until the reader makes a choice", () => {
    expect(runBoot(null, "en-GB").locale).toBe("en");
    expect(runBoot(null, "fr-FR").locale).toBe("fr");
    expect(runBoot("invalid", "fr-FR").lang).toBe("fr-FR");
  });

  test("translates editorial navigation without changing its URLs", () => {
    expect(categoryLabel("en", "espace-pro", "Espace pro")).toBe(
      "Professional resources"
    );
    expect(categoryLabel("fr", "espace-pro", "Espace pro")).toBe("Espace pro");
    expect(categoryLabel("en", "mines-energie", "Mines & énergie")).toBe(
      "Mining & energy"
    );
    expect(categoryLabel("en", "societe", "Société")).toBe("Society");
    expect(
      categoryDescription("en", "editorial", "Description française")
    ).toBe("The newsroom's position on the country's news.");
    expect(
      categoryDescription("en", "parcs-nationaux", "Description française")
    ).toBe(
      "Thirteen parks, from the coast to the plateaux: access, seasons, visiting rules."
    );
    expect(navigationLabel("en", "/a-propos", "À propos")).toBe("About");
  });

  test("keeps the stored label for a section it does not translate", () => {
    expect(categoryLabel("en", "rubrique-inconnue", "Rubrique")).toBe(
      "Rubrique"
    );
    expect(
      categoryDescription("en", "rubrique-inconnue", "Description française")
    ).toBe("Description française");
  });

  test("translates every section and sub-section of the catalogue", () => {
    const missing = "\u0000";
    const untranslated = CATEGORIES.map((category) => category.slug).filter(
      (slug) =>
        categoryLabel("en", slug, missing) === missing ||
        categoryDescription("en", slug, missing) === missing
    );
    expect(untranslated).toEqual([]);
  });
});

describe("masthead controls", () => {
  test("keeps the hamburger last and removes theme controls from drawers", () => {
    const header = readFileSync("components/custom/header.tsx", "utf8");
    const mobile = readFileSync("components/custom/mobile-nav.tsx", "utf8");
    const privateShell = readFileSync(
      "components/custom/private-shell.tsx",
      "utf8"
    );
    expect(header.indexOf("<ThemeToggle compact")).toBeLessThan(
      header.indexOf("<LocaleToggle")
    );
    expect(header.indexOf("<LocaleToggle")).toBeLessThan(
      header.indexOf("<MobileNav")
    );
    expect(mobile).not.toContain("ThemeToggle");
    expect(privateShell).not.toContain("<ThemeToggle labelled");
  });
});
