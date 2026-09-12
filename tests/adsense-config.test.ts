import assert from "node:assert/strict";
import { test } from "node:test";
import {
  adSenseSize,
  getAdSenseConfig,
  getAdSenseRuntimeConfig,
  isAdSenseNonce,
} from "../lib/ads/adsense-config";

// Synthetic parser fixtures only; these values are never sent to an ad service.
const env = {
  ADS_MODE: "adsense",
  ADSENSE_CLIENT_ID: "ca-pub-0000000000000000",
  ADSENSE_SLOT_ARTICLE: "0000000000",
  ADSENSE_CMP_ID: "42",
  ADSENSE_CMP_SCRIPT_URL: "https://cmp.example.invalid/script.js?site=fixture",
  ADSENSE_CMP_ALLOWED_ORIGINS:
    "https://cmp.example.invalid,https://cdn.example.invalid",
};

test("AdSense needs a complete explicit configuration and a configured placement", () => {
  assert.equal(getAdSenseRuntimeConfig({}), null);
  assert.equal(getAdSenseConfig("home-primary", env), null);
  assert.equal(
    getAdSenseConfig("article", env)?.clientId,
    env.ADSENSE_CLIENT_ID
  );
  for (const key of Object.keys(env)) {
    assert.equal(getAdSenseRuntimeConfig({ ...env, [key]: "" }), null, key);
  }
});

test("malformed IDs, CMP URLs and CSP source injections fail closed", () => {
  for (const patch of [
    { ADS_MODE: "internal" },
    { ADSENSE_CLIENT_ID: "ca-pub-123" },
    { ADSENSE_SLOT_ARTICLE: "0000000000;script" },
    { ADSENSE_CMP_ID: "-1" },
    { ADSENSE_CMP_ID: "4096" },
    { ADSENSE_CMP_SCRIPT_URL: "javascript:alert(1)" },
    { ADSENSE_CMP_SCRIPT_URL: "http://cmp.example.invalid/code.js" },
    {
      ADSENSE_CMP_SCRIPT_URL:
        "https://user:password@cmp.example.invalid/code.js",
    },
    { ADSENSE_CMP_ALLOWED_ORIGINS: "https://another.example.invalid" },
    {
      ADSENSE_CMP_ALLOWED_ORIGINS: "https://cmp.example.invalid 'unsafe-eval'",
    },
    { ADSENSE_CMP_ALLOWED_ORIGINS: "https://cmp.example.invalid; frame-src *" },
    { ADSENSE_CMP_ALLOWED_ORIGINS: "https://cmp.example.invalid/path" },
    { ADSENSE_CMP_ALLOWED_ORIGINS: "https://*.example.invalid" },
    {
      ADSENSE_CMP_ALLOWED_ORIGINS:
        "https://cmp.example.invalid,https://*.example.invalid",
    },
  ])
    assert.equal(
      getAdSenseRuntimeConfig({ ...env, ...patch }),
      null,
      JSON.stringify(patch)
    );
});

test("nonce validation cannot inject CSP or HTML", () => {
  assert.equal(
    isAdSenseNonce(
      Buffer.from("fixture-nonce-with-at-least-128-bits").toString("base64")
    ),
    true
  );
  for (const value of [
    undefined,
    "",
    "short",
    "'nonce-injected';script-src *",
    "<script>",
  ])
    assert.equal(isAdSenseNonce(value), false);
});

test("placements fit available widths, including a 320 px viewport with gutters", () => {
  assert.deepEqual(adSenseSize("article", 300, true), {
    width: 300,
    height: 250,
  });
  assert.deepEqual(adSenseSize("article", 288, false), {
    width: 250,
    height: 250,
  });
  assert.deepEqual(adSenseSize("home-primary", 920, true), {
    width: 728,
    height: 90,
  });
  assert.deepEqual(adSenseSize("listing", 360, false), {
    width: 320,
    height: 100,
  });
  assert.deepEqual(adSenseSize("listing", 288, false), {
    width: 250,
    height: 100,
  });
  assert.equal(adSenseSize("listing", 249, false), null);
  assert.equal(adSenseSize("home-secondary", 900, false), null);
  assert.equal(adSenseSize("article", Number.NaN, true), null);
});
