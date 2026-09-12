import assert from "node:assert/strict";
import { test } from "node:test";
import { contentSecurityPolicy } from "../lib/security-headers";

test("strict CSP is conditional on complete configuration and a safe per-request nonce", () => {
  const fixture = {
    ADS_MODE: "adsense",
    ADSENSE_CLIENT_ID: "ca-pub-0000000000000000",
    ADSENSE_SLOT_ARTICLE: "0000000000",
    ADSENSE_CMP_ID: "42",
    ADSENSE_CMP_SCRIPT_URL: "https://cmp.example.invalid/code.js",
    ADSENSE_CMP_ALLOWED_ORIGINS: "https://cmp.example.invalid",
  };
  const previous = Object.fromEntries(
    Object.keys(fixture).map((key) => [key, process.env[key]])
  );
  try {
    Object.assign(process.env, fixture);
    const baseline = contentSecurityPolicy();
    assert.match(baseline, /frame-src 'none'/);
    assert.doesNotMatch(baseline, /strict-dynamic/);
    const nonce = Buffer.from("a-per-request-test-nonce-with-entropy").toString(
      "base64"
    );
    const active = contentSecurityPolicy(nonce);
    assert.ok(active.includes(`'nonce-${nonce}' 'strict-dynamic'`));
    assert.match(active, /frame-src https:/);
    assert.match(active, /script-src-attr 'none'/);
    assert.equal(contentSecurityPolicy("malformed';script-src *"), baseline);
    process.env.ADSENSE_CMP_ID = "";
    assert.equal(contentSecurityPolicy(nonce), baseline);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
