import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PWA_DISMISS_KEY,
  PWA_DISMISS_MS,
  detectPwaPlatform,
  isEmbeddedBrowser,
  isInstallInvitationPage,
  parseInstallDismissal,
  shouldOfferInstall,
} from "@/lib/pwa-policy";

const NOW = 1_800_000_000_000;
const iphone =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";
const ipadDesktop =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15";
const androidChrome =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36";

describe("PWA instruction platform", () => {
  it("recognizes iPhone, iPad and iPod without relying on Safari's version", () => {
    for (const userAgent of [
      iphone,
      "Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
      iphone.replace("Version/18.0", "CriOS/130.0.0.0"),
    ]) {
      assert.equal(detectPwaPlatform({ userAgent }), "ios", userAgent);
    }
  });

  it("distinguishes a touch iPadOS desktop identity from a real Mac", () => {
    assert.equal(
      detectPwaPlatform({
        userAgent: ipadDesktop,
        platform: "MacIntel",
        maxTouchPoints: 5,
      }),
      "ios"
    );
    assert.equal(
      detectPwaPlatform({
        userAgent: "Mozilla/5.0",
        platform: "MacIntel",
        maxTouchPoints: 2,
      }),
      "ios"
    );
    for (const maxTouchPoints of [0, 1, NaN, Infinity]) {
      assert.equal(
        detectPwaPlatform({
          userAgent: ipadDesktop,
          platform: "MacIntel",
          maxTouchPoints,
        }),
        "desktop"
      );
    }
  });

  it("recognizes Android phones and tablets while retaining desktop and unknown identities", () => {
    assert.equal(
      detectPwaPlatform({
        userAgent: androidChrome,
        platform: "Linux armv8l",
        maxTouchPoints: 5,
      }),
      "android"
    );
    assert.equal(
      detectPwaPlatform({ userAgent: androidChrome.replace(" Mobile", "") }),
      "android"
    );
    for (const userAgent of [
      ipadDesktop,
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) Firefox/130.0",
      "Mozilla/5.0 (X11; CrOS x86_64 16000.0) Chrome/130.0 Safari/537.36",
    ]) {
      assert.equal(detectPwaPlatform({ userAgent }), "desktop", userAgent);
    }
    for (const userAgent of [
      "",
      "UnknownDevice/1.0",
      "Mozilla/5.0 (Linux; Mobile) OtherBrowser/1.0",
    ]) {
      assert.equal(detectPwaPlatform({ userAgent }), "other", userAgent);
    }
  });
});

describe("embedded browser instructions", () => {
  it("detects explicit Facebook, Instagram and Android WebView markers", () => {
    for (const userAgent of [
      `${iphone} [FBAN/FBIOS;FBAV/490.0.0.0]`,
      `${androidChrome} [FB_IAB/FB4A;FBAV/490.0.0.0;]`,
      `${iphone} Instagram 350.0.0.0`,
      androidChrome
        .replace("Pixel 8", "Pixel 8; wv")
        .replace("Chrome/", "Version/4.0 Chrome/"),
      `${androidChrome} MicroMessenger/8.0`,
    ])
      assert.equal(isEmbeddedBrowser(userAgent), true, userAgent);
  });

  it("does not classify normal Chrome Android, Safari or Firefox as a WebView", () => {
    for (const userAgent of [
      androidChrome,
      iphone,
      ipadDesktop,
      "Mozilla/5.0 (Android 14; Mobile) Gecko/130.0 Firefox/130.0",
      `${androidChrome} SamsungBrowser/27.0`,
      "",
    ]) {
      assert.equal(isEmbeddedBrowser(userAgent), false, userAgent);
    }
  });
});

describe("persistent installation dismissal", () => {
  it("uses a versioned key and an exact fourteen-day inclusive storage limit", () => {
    assert.equal(PWA_DISMISS_KEY, "boma-pwa-install-dismissal-v1");
    assert.equal(PWA_DISMISS_MS, 1_209_600_000);
    const until = NOW + PWA_DISMISS_MS;
    const raw = JSON.stringify({ version: 1, until });
    assert.equal(parseInstallDismissal(raw, NOW), until);
    assert.equal(parseInstallDismissal(raw, until - 1), until);
    assert.equal(parseInstallDismissal(raw, until), 0);
    assert.equal(parseInstallDismissal(raw, until + 1), 0);
  });

  it("ignores malformed, expired, unsafe, nonnumeric and excessively future stored timestamps", () => {
    const inputs = [
      null,
      "",
      "{",
      "null",
      "[]",
      "true",
      "42",
      '{"version":2,"until":1800000000001}',
      '{"until":1800000000001}',
      '{"version":1}',
      '{"version":1,"until":"1800000000001"}',
      '{"version":1,"until":1e400}',
      JSON.stringify({ version: 1, until: NOW - 1 }),
      JSON.stringify({ version: 1, until: -1 }),
      JSON.stringify({ version: 1, until: NOW + 0.5 }),
      JSON.stringify({ version: 1, until: Number.MAX_SAFE_INTEGER + 1 }),
      JSON.stringify({ version: 1, until: NOW + PWA_DISMISS_MS + 1 }),
    ];
    for (const raw of inputs)
      assert.equal(parseInstallDismissal(raw, NOW), 0, raw ?? "null");
    const valid = JSON.stringify({ version: 1, until: NOW + 1 });
    assert.equal(parseInstallDismissal(valid, NaN), 0);
    assert.equal(parseInstallDismissal(valid, Infinity), 0);
  });
});

describe("reading invitation boundaries", () => {
  it("offers an invitation only on the home, an article or a category path", () => {
    for (const pathname of [
      "/",
      "/article/un-sujet",
      "/article/un-sujet/",
      "/rubrique/economie",
      "/rubrique/economie/entreprises",
      "/rubrique/economie/entreprises/",
    ]) {
      assert.equal(isInstallInvitationPage(pathname), true, pathname);
    }
    for (const pathname of [
      "/installer",
      "/redaction",
      "/redaction/publicites",
      "/admin",
      "/connexion",
      "/inscription",
      "/contacts",
      "/newsletter",
      "/recherche",
      "/recherche?q=installation",
      "/publicite",
      "/article/",
      "/rubrique/",
      "/article/un-sujet/modifier",
      "/rubrique//economie",
      "/article/un-sujet?q=test",
    ]) {
      assert.equal(isInstallInvitationPage(pathname), false, pathname);
    }
  });

  const invitation = {
    platform: "android" as const,
    standalone: false,
    dismissedUntil: 0,
    now: NOW,
    secure: true,
  };

  it("offers secure mobile browsers an invitation but never an installed standalone app", () => {
    assert.equal(shouldOfferInstall(invitation), true);
    assert.equal(shouldOfferInstall({ ...invitation, platform: "ios" }), true);
    assert.equal(
      shouldOfferInstall({ ...invitation, platform: "desktop" }),
      false
    );
    assert.equal(
      shouldOfferInstall({ ...invitation, platform: "other" }),
      false
    );
    assert.equal(shouldOfferInstall({ ...invitation, secure: false }), false);
    assert.equal(
      shouldOfferInstall({ ...invitation, standalone: true }),
      false
    );
    assert.equal(
      shouldOfferInstall({ ...invitation, platform: "ios", standalone: true }),
      false
    );
  });

  it("respects a persisted refusal through its final millisecond and allows again at expiry", () => {
    const until = NOW + PWA_DISMISS_MS;
    const dismissedUntil = parseInstallDismissal(
      JSON.stringify({ version: 1, until }),
      NOW
    );
    assert.equal(shouldOfferInstall({ ...invitation, dismissedUntil }), false);
    assert.equal(
      shouldOfferInstall({ ...invitation, dismissedUntil, now: until - 1 }),
      false
    );
    assert.equal(
      shouldOfferInstall({ ...invitation, dismissedUntil, now: until }),
      true
    );
    assert.equal(
      shouldOfferInstall({ ...invitation, dismissedUntil: NaN }),
      false
    );
    assert.equal(shouldOfferInstall({ ...invitation, now: Infinity }), false);
  });
});
