import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { test } from "node:test";

test("offline cache excludes nonce and no-store documents, including old cached copies", () => {
  const context = { self: { addEventListener: () => undefined } };
  runInNewContext(
    readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"),
    context
  );
  const canCache = runInNewContext("canCacheDocument", context) as (
    response: Response
  ) => boolean;
  assert.equal(
    canCache(
      new Response("<p>Editorial page</p>", {
        headers: { "Cache-Control": "public, max-age=60" },
      })
    ),
    true
  );
  assert.equal(
    canCache(
      new Response("<p>Private page</p>", {
        headers: { "Cache-Control": "private, no-store" },
      })
    ),
    false
  );
  assert.equal(
    canCache(
      new Response("<p>AdSense page</p>", {
        headers: {
          "Content-Security-Policy":
            "script-src 'nonce-fixture' 'strict-dynamic'",
        },
      })
    ),
    false
  );
  assert.equal(canCache(new Response("Failure", { status: 503 })), false);
});
