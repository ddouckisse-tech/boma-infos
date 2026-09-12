import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
  categoryDescription,
  categoryLabel,
  navigationLabel,
} from "../lib/i18n.ts";
import { PREFERENCES_SCRIPT } from "../lib/preferences.ts";

function runBoot(locale, browserLanguage = "fr-FR") {
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
    getItem(key) {
      if (key === "lecorporate.locale") return locale;
      if (key === "lecorporate.theme") return "light";
      return null;
    },
  };
  const windowStub = { matchMedia: () => ({ matches: false }) };
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
    expect(
      categoryDescription("en", "editorial", "Description française")
    ).toBe("The editorial team's view of economic news.");
    expect(navigationLabel("en", "/a-propos", "À propos")).toBe("About");
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
