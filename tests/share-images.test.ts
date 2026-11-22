import assert from "node:assert/strict";
import { test } from "node:test";
import {
  articleImageSources,
  socialImageUrl,
} from "../lib/content/article-images";
import { registerMedia } from "../lib/media";

test("le partage privilégie la couverture téléversée et garde l’image du corps en secours", () => {
  const bytes = 41000;
  const source = "https://storage.example.com/cover.webp";
  registerMedia([
    {
      id: "couverture-test-partage",
      alt: "La couverture téléversée",
      caption: "",
      credit: "",
      license: "",
      source: "",
      color: "#161616",
      width: 1280,
      height: 800,
      avif: [],
      webp: [{ w: 1280, h: 800, bytes }],
      urls: { "webp-1280": source },
    },
  ]);
  const article = {
    heroMediaKey: "couverture-test-partage",
    body: [{ type: "image", mediaKey: "libreville-baie" }] as const,
    galleryMediaKeys: ["libreville-baie"],
  };

  const sources = articleImageSources(article);
  assert.equal(sources.length, 2);
  assert.equal(sources[0].source, source);
  assert.match(sources[1].source, /^\/medias\/libreville-baie-\d+\.webp$/);
  assert.equal(
    articleImageSources({ ...article, heroMediaKey: "manquante" })[0].source,
    sources[1].source
  );
});

test("l’URL d’image reste publique et change après chaque mise à jour", () => {
  const url = new URL(socialImageUrl("actualite-du-gabon", 123));
  assert.equal(url.pathname, "/article/actualite-du-gabon/opengraph-image");
  assert.equal(url.searchParams.get("v"), "123");
  assert.notEqual(url.href, socialImageUrl("actualite-du-gabon", 456));
});
