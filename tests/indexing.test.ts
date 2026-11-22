import assert from "node:assert/strict";
import { test } from "node:test";
import robots from "../app/robots";
import { isDemoArticle, isDemoAuthor } from "../lib/content/demo";
import {
  EDITORIAL_ROBOTS,
  PUBLIC_SITE_URL,
  SEARCH_INDEXABLE,
  siteUrl,
} from "../lib/site";
import nextConfig from "../next.config";

test("l’indexation et les grands aperçus sont liés à l’édition de production", () => {
  assert.equal(EDITORIAL_ROBOTS.index, SEARCH_INDEXABLE);
  assert.equal(EDITORIAL_ROBOTS.googleBot["max-image-preview"], "large");
  if (SEARCH_INDEXABLE) assert.equal(siteUrl(), PUBLIC_SITE_URL);
});

test("les articles et signatures du corpus fictif sont identifiables séparément", () => {
  assert.equal(
    isDemoArticle("ecotourisme-parcs-nationaux-pari-gabonais"),
    true
  );
  assert.equal(isDemoAuthor("nadia-ondo"), true);
  assert.equal(
    isDemoArticle("gabon-production-locale-poulets-chair-reception-poussins"),
    false
  );
});

test("les sitemaps sont annoncés en production et les déploiements de recette portent noindex", async () => {
  const rules = await nextConfig.headers?.();
  const everywhere = rules?.find((rule) => rule.source === "/:path*");
  assert.ok(everywhere, "la règle « toutes les réponses » existe");
  const tag = everywhere.headers.find(
    (header) => header.key === "X-Robots-Tag"
  );
  const file = robots();

  if (SEARCH_INDEXABLE) {
    assert.equal(tag, undefined);
    assert.deepEqual(file.sitemap, [
      `${PUBLIC_SITE_URL}/sitemap.xml`,
      `${PUBLIC_SITE_URL}/news-sitemap.xml`,
    ]);
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
