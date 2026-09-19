import assert from "node:assert/strict";
import { test } from "node:test";
import type { Id } from "../convex/_generated/dataModel";
import type { MutationCtx } from "../convex/_generated/server";
import { byKeys, counts, list, reindex, remove } from "../convex/library";
import { editorOptions } from "../convex/newsroom";
import {
  articleMediaKeys,
  foldForSearch,
  MEDIA_INDEX_BUILD,
  mediaDerivedFields,
  MISSING_ALT_CAP,
  searchTermsOf,
  syncArticleMedia,
} from "../convex/model/media";
import { formatCapped } from "../lib/private";
import {
  FakeDb,
  fakeContext,
  handlerOf,
  type FakeDoc,
  type Stats,
} from "./fake-convex";

/*
 * Médiathèque at any size (19/09/2026). The back office fell over in
 * production once the WordPress archive brought 1,297 pictures: every
 * screen read the whole library and the whole `articles` table. These tests
 * run the real handlers on an in-memory database (`fake-convex.ts`) and
 * check that what one screen costs no longer depends on the library.
 */

type Item = {
  key: string;
  alt: string;
  caption: string;
  usedBy: number | null;
};
type Page = { page: Item[]; isDone: boolean; continueCursor: string };

const listPage = handlerOf<Record<string, unknown>, Page>(list);
const countLibrary = handlerOf<
  Record<string, never>,
  { missingAlt: number; indexReady: boolean }
>(counts);
const findByKeys = handlerOf<{ keys: string[] }, { key: string }[]>(byKeys);
const removePicture = handlerOf<{ id: string }, null>(remove);
const runReindex = handlerOf<Record<string, unknown>, null>(reindex);
const loadEditorOptions = handlerOf<Record<string, never>, object>(
  editorOptions
);

const WIDTHS = [240, 320, 640, 960, 1280];

/** A picture as the WordPress import stored it: five renditions in storage. */
function storedPicture(index: number, alt = `Photographie ${index}`) {
  const text = {
    key: `wp-media-${index}`,
    alt,
    caption: index % 3 === 0 ? `Conseil des ministres ${index}` : "",
    credit: "Le Corporate",
  };
  return {
    ...text,
    ...mediaDerivedFields(text),
    license: "Droits réservés",
    source: `https://lecorporate.com/wp-content/uploads/${index}.jpg`,
    width: 1280,
    height: 720,
    color: "#6b7280",
    variants: WIDTHS.map((w) => ({
      format: "webp",
      w,
      h: Math.round((w * 9) / 16),
      bytes: w * 40,
    })),
    storage: WIDTHS.map((w) => ({
      format: "webp",
      w,
      h: Math.round((w * 9) / 16),
      bytes: w * 40,
      storageId: `file-${index}-${w}`,
    })),
    uploadedAt: 1_000_000 + index,
    wordpressId: index,
  };
}

/** A published article showing two pictures: its hero and an inline image. */
function article(index: number, pictures: number) {
  return {
    title: `Article ${index}`,
    slug: `article-${index}`,
    dek: "",
    body: [
      { type: "paragraph", text: "Texte. ".repeat(200) },
      {
        type: "image",
        mediaKey: `wp-media-${(index * 13 + 5) % pictures}`,
        caption: "",
      },
    ],
    status: "published",
    categorySlug: "economie",
    authorSlug: "redaction",
    heroMediaKey: `wp-media-${(index * 7) % pictures}`,
    galleryMediaKeys: [],
    keyPoints: [],
    seo: { description: "", keywords: [] },
    origin: "redaction",
    feature: "none",
    readingMinutes: 1,
    tags: [],
    createdAt: 0,
    publishedAt: index,
    updatedAt: 0,
    views: 0,
    searchText: "",
  };
}

const keysOf = (doc: FakeDoc) =>
  articleMediaKeys(doc as unknown as Parameters<typeof articleMediaKeys>[0]);

/** A library of `pictures` stored pictures, `articles` articles and their usage. */
function library(
  pictures: number,
  { articles = 0, ready = true }: { articles?: number; ready?: boolean } = {}
) {
  const db = new FakeDb();
  db.seed(
    "media",
    Array.from({ length: pictures }, (_, index) =>
      storedPicture(index, index % 20 === 7 ? "" : undefined)
    )
  );
  const ids = db.seed(
    "articles",
    Array.from({ length: articles }, (_, index) => article(index, pictures))
  );
  db.seed(
    "mediaUsages",
    ids.flatMap((articleId) => {
      const doc = db.rows("articles").find((row) => row._id === articleId)!;
      return [...keysOf(doc)].map((mediaKey) => ({ mediaKey, articleId }));
    })
  );
  if (ready) {
    db.seed("indexBuilds", [{ name: MEDIA_INDEX_BUILD, completedAt: 1 }]);
  }
  return db;
}

/** What Convex counts against its 4,096 reads: index ranges, gets, file URLs. */
const reads = (stats: Stats) => stats.ranges + stats.gets + stats.urls;

test("recherche : casse, accents, ligatures et ponctuation repliés", () => {
  assert.equal(
    foldForSearch("Cœur de l'Économie — Port-Gentil, 2026 !"),
    "coeur de l economie port gentil 2026"
  );
  assert.equal(searchTermsOf("  Ministrés  "), "ministres");
  assert.equal(searchTermsOf("« — »"), "");
  assert.equal(searchTermsOf(undefined), "");
  const many = Array.from({ length: 20 }, (_, index) => `mot${index}`);
  assert.equal(searchTermsOf(many.join(" ")).split(" ").length, 16);
});

test("champs dérivés : clé, texte alternatif, légende et crédit", () => {
  assert.deepEqual(
    mediaDerivedFields({
      key: "wp-media-12",
      alt: "Le port d'Owendo",
      caption: "",
      credit: "AFP",
    }),
    { searchText: "wp media 12 le port d owendo afp", altMissing: false }
  );
  assert.equal(
    mediaDerivedFields({ key: "k-1", alt: "   ", caption: "x", credit: "" })
      .altMissing,
    true
  );
});

test("images d'un article : une, galerie, blocs et vignettes vidéo, sans doublon", () => {
  const keys = articleMediaKeys({
    heroMediaKey: "a",
    galleryMediaKeys: ["b", "a"],
    body: [
      { type: "image", mediaKey: "c" },
      { type: "video", title: "", posterMediaKey: "d", src: "" },
      { type: "image", mediaKey: "" },
      { type: "paragraph", text: "" },
    ],
  });
  assert.deepEqual([...keys].sort(), ["a", "b", "c", "d"]);
});

test("mediaUsages suit l'article : ajout, idempotence, doublon, retrait, suppression", async () => {
  const db = new FakeDb();
  const [articleId] = db.seed("articles", [article(0, 10)]);
  const ctx = { db } as unknown as MutationCtx;
  const id = articleId as Id<"articles">;
  const usage = () =>
    db
      .rows("mediaUsages")
      .map((row) => String(row.mediaKey))
      .sort();

  await syncArticleMedia(ctx, id);
  assert.deepEqual(usage(), ["wp-media-0", "wp-media-5"]);
  await syncArticleMedia(ctx, id);
  assert.deepEqual(usage(), ["wp-media-0", "wp-media-5"]);

  db.seed("mediaUsages", [{ mediaKey: "wp-media-0", articleId }]);
  await db.patch(articleId, { heroMediaKey: "wp-media-9" });
  await syncArticleMedia(ctx, id);
  assert.deepEqual(usage(), ["wp-media-5", "wp-media-9"]);

  await db.delete(articleId);
  await syncArticleMedia(ctx, id, null);
  assert.deepEqual(usage(), []);
});

test("médiathèque : une page coûte autant pour 1 000 que pour 10 000 images", async () => {
  const measure = async (pictures: number) => {
    const db = library(pictures, { articles: 3000 });
    const { ctx } = fakeContext(db);
    db.resetStats();
    const result = await listPage(ctx, {
      paginationOpts: { numItems: 48, cursor: null },
    });
    assert.equal(result.page.length, 48);
    return db.stats;
  };
  const small = await measure(1000);
  const large = await measure(10_000);

  assert.equal(reads(large), reads(small));
  // One page of pictures, then per card: its URL, its usage, its pending
  // proposals, its campaign — plus the viewer and the index flag.
  assert.ok(reads(large) <= 48 * 4 + 5, `${reads(large)} lectures`);
  assert.equal(large.byTable.media, 48);
  assert.equal(large.byTable.articles ?? 0, 0);
  assert.deepEqual(large.unindexed, []);
});

test("filtres, recherche et taille de page calculés sur le serveur", async () => {
  const db = library(2000);
  const demo = {
    key: "administration-gabon",
    alt: "Bâtiment administratif gabonais",
    caption: "Administration territoriale gabonaise.",
    credit: "EVIVI",
  };
  db.seed("media", [
    {
      ...demo,
      ...mediaDerivedFields(demo),
      license: "CC BY-SA 3.0",
      source: "https://commons.wikimedia.org/",
      width: 1280,
      height: 720,
      color: "#f8f8f8",
      variants: [{ format: "webp", w: 320, h: 180, bytes: 9000 }],
    },
  ]);
  const { ctx } = fakeContext(db);
  const page = (args: Record<string, unknown>) =>
    listPage(ctx, { paginationOpts: { numItems: 60, cursor: null }, ...args });

  const all = await page({});
  assert.equal(all.page[0].key, "wp-media-1999", "les derniers ajouts d'abord");

  const missing = await page({ filter: "missingAlt" });
  assert.ok(missing.page.length > 0);
  assert.ok(missing.page.every((item) => item.alt === ""));

  const found = await page({ term: "Ministrés" });
  assert.ok(found.page.length > 0);
  assert.ok(found.page.every((item) => /ministres/i.test(item.caption)));

  assert.deepEqual(
    (await page({ term: "administration" })).page.map((item) => item.key),
    ["administration-gabon"]
  );
  assert.equal(
    (await page({ term: "administration", filter: "uploaded" })).page.length,
    0,
    "« Ajoutées ici » écarte la bibliothèque de démonstration"
  );

  const clamped = await listPage(ctx, {
    paginationOpts: { numItems: 5000, cursor: null },
  });
  assert.equal(clamped.page.length, 60, "jamais plus de 60 images par page");
});

test("compteur « sans texte alternatif » borné, quelle que soit la photothèque", async () => {
  const db = new FakeDb();
  db.seed(
    "media",
    Array.from({ length: 3000 }, (_, index) => storedPicture(index, ""))
  );
  const { ctx } = fakeContext(db);
  db.resetStats();
  const result = await countLibrary(ctx, {});
  assert.equal(result.missingAlt, MISSING_ALT_CAP + 1);
  assert.equal(formatCapped(result.missingAlt, MISSING_ALT_CAP), "999+");
  assert.equal(result.indexReady, false);
  assert.ok(db.stats.byTable.media <= MISSING_ALT_CAP + 1);
});

test("images déjà choisies : retrouvées par clé, sans lire la photothèque", async () => {
  const db = library(5000);
  const { ctx } = fakeContext(db);
  db.resetStats();
  const found = await findByKeys(ctx, {
    keys: ["wp-media-10", "wp-media-10", "inconnue", ""],
  });
  assert.deepEqual(
    found.map((item) => item.key),
    ["wp-media-10"]
  );
  assert.equal(db.stats.byTable.media, 1);
  assert.equal(db.stats.urls, 1);
  await assert.rejects(
    findByKeys(ctx, {
      keys: Array.from({ length: 51 }, (_, index) => `wp-media-${index}`),
    })
  );
});

test("options de l'éditeur : plus aucune image", async () => {
  const db = library(5000);
  const { ctx } = fakeContext(db);
  db.resetStats();
  const options = await loadEditorOptions(ctx, {});
  assert.deepEqual(Object.keys(options).sort(), ["authors", "categories"]);
  assert.equal(db.stats.byTable.media ?? 0, 0);
  assert.equal(db.stats.urls, 0);
});

test("suppression refusée tant qu'un article l'affiche, index prêt ou non", async () => {
  for (const ready of [true, false]) {
    const db = library(100, { articles: 50, ready });
    const { ctx } = fakeContext(db);
    const shown = db.rows("media").find((row) => row.key === "wp-media-0")!;
    db.resetStats();
    await assert.rejects(
      removePicture(ctx, { id: shown._id }),
      /encore utilisée par \d+ articles? : retirez-la d'abord/
    );
    // Prêt : l'index suffit. Sinon : relecture des articles, par prudence.
    assert.equal(db.stats.byTable.articles ?? 0, ready ? 0 : 50);

    const used = new Set(db.rows("mediaUsages").map((row) => row.mediaKey));
    const unused = db.rows("media").find((row) => !used.has(row.key))!;
    await removePicture(ctx, { id: unused._id });
    assert.equal(
      db.rows("media").some((row) => row._id === unused._id),
      false
    );
  }
});

test("reconstruction : champs dérivés, usages, orphelins, puis drapeau", async () => {
  const db = new FakeDb();
  db.seed(
    "media",
    Array.from({ length: 450 }, (_, index) => {
      // Rangs écrits avant le 19/09/2026 : sans champs dérivés.
      const { searchText, altMissing, ...before } = storedPicture(index);
      void searchText;
      void altMissing;
      return before;
    })
  );
  const ids = db.seed(
    "articles",
    Array.from({ length: 230 }, (_, index) => article(index, 450))
  );
  db.seed("mediaUsages", [
    { mediaKey: "wp-media-1", articleId: "articles|999999" },
  ]);
  const { ctx, scheduled } = fakeContext(db);

  const drain = async () => {
    let args: Record<string, unknown> = {};
    let batches = 0;
    for (;;) {
      db.resetStats();
      await runReindex(ctx, args);
      batches += 1;
      assert.ok(db.stats.documents <= 500, `${db.stats.documents} documents`);
      const next = scheduled.shift();
      if (!next) return batches;
      assert.ok(next.delay > 0, "les lots sont espacés");
      args = next.args;
    }
  };

  const batches = await drain();
  assert.ok(batches >= 6, `${batches} lots`);
  assert.ok(
    db
      .rows("media")
      .every(
        (row) =>
          typeof row.searchText === "string" &&
          typeof row.altMissing === "boolean"
      )
  );
  const expected = ids.reduce(
    (total, id) =>
      total + keysOf(db.rows("articles").find((row) => row._id === id)!).size,
    0
  );
  const usages = db.rows("mediaUsages");
  assert.equal(usages.length, expected);
  assert.ok(usages.every((row) => ids.includes(String(row.articleId))));
  assert.equal(db.rows("indexBuilds").length, 1);

  // Deuxième passe : rien à réécrire, et toujours un seul drapeau.
  const snapshot = JSON.stringify(db.rows("mediaUsages"));
  await drain();
  assert.equal(JSON.stringify(db.rows("mediaUsages")), snapshot);
  assert.equal(db.rows("indexBuilds").length, 1);
});
