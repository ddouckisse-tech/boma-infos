import assert from "node:assert/strict";
import { test } from "node:test";
import robots from "../app/robots";
import { DEMO_CONTENT_NOTICE, SEARCH_INDEXABLE } from "../lib/site";
import nextConfig from "../next.config";

/**
 * The demonstration corpus is fiction. As long as it is online, nothing the
 * site serves may be indexed — pages, feeds, sitemaps, documents alike.
 */

test("l'indexation suit l'avis de démonstration, sans réglage séparé", () => {
  assert.equal(SEARCH_INDEXABLE, DEMO_CONTENT_NOTICE === null);
});

test("en démonstration, toutes les réponses portent noindex et aucun plan de site n'est annoncé", async () => {
  const rules = await nextConfig.headers?.();
  const everywhere = rules?.find((rule) => rule.source === "/:path*");
  assert.ok(everywhere, "la règle « toutes les réponses » existe");
  const tag = everywhere.headers.find(
    (header) => header.key === "X-Robots-Tag"
  );
  const file = robots();

  if (SEARCH_INDEXABLE) {
    assert.equal(tag, undefined);
    assert.ok(file.sitemap, "site ouvert : les plans de site sont annoncés");
    return;
  }
  assert.deepEqual(tag, { key: "X-Robots-Tag", value: "noindex, nofollow" });
  assert.equal(file.sitemap, undefined);
  assert.equal(file.host, undefined);
  // L'exploration reste ouverte : un robot doit lire la page pour y voir
  // la consigne.
  assert.deepEqual(file.rules, [
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/recherche", "/design-system", "/newsletter/"],
    },
  ]);
  // Les en-têtes de sécurité restent en place à côté.
  assert.ok(
    everywhere.headers.some(
      (header) => header.key === "Content-Security-Policy"
    )
  );
});
