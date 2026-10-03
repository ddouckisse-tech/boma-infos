import assert from "node:assert/strict";
import * as migration from "../convex/wordpressImport";
import { mediaDerivedFields } from "../convex/model/media";
import { documents as publicDocuments } from "../convex/journal";
import { ARTICLES_1, DOCUMENTS } from "../convex/seed";
import { createFakeDb, type FakeDoc } from "../tests/support/fake-convex";

/** Run with `bun scripts/wordpress-import.test.ts`. No deployment or storage is contacted.
 * The handlers run on the database every test simulates; Convex owns transaction rollback and validator execution.
 */
type Row = Record<string, unknown>;
type Rows = Record<string, Row[]>;

/**
 * A context on the simulated database (`tests/support/fake-convex.ts`): the
 * indexes of `convex/schema.ts`, ids of the form `table:n`, documents read
 * as copies, and every table a write reaches — `articleCounts`,
 * `mediaUsages` — without this file having to list it.
 */
function context(initial: Rows = {}) {
  const fake = createFakeDb();
  for (const [table, rows] of Object.entries(initial)) fake.seed(table, rows);
  return {
    db: fake.db,
    storage: fake.storage,
    /** The files storage holds, by id: `ctx.files.set(id, metadata)`. */
    files: fake.files,
    /** Every row of a table, as it stands: `ctx.data.articles`. */
    data: new Proxy({} as Record<string, FakeDoc[]>, {
      get: (_target, table) =>
        typeof table === "string" ? fake.all(table) : undefined,
    }),
    /** Table and id of each write the handlers made, oldest first. */
    get writes(): [string, string][] {
      return fake.writes.map(({ table, id }) => [table, id]);
    },
  };
}
type MockCtx = ReturnType<typeof context>;
type UpsertResult = { inserted: number; updated: number };
type Results = {
  upsertTaxonomy: { categories: UpsertResult; authors: UpsertResult };
  upsertArticles: UpsertResult;
  upsertMedia: UpsertResult;
  upsertDocuments: UpsertResult;
  uploadUrls: string[];
  retireDemo: {
    drafted: string[];
    alreadyDraft: string[];
    skipped: string[];
    hiddenDocuments: string[];
  };
  inventory: {
    counts: Record<string, number>;
    categories: Row[];
    authors: Row[];
    articles: Row[];
    media: Row[];
    documents: Row[];
  };
};
/** The installed Convex runtime exposes these testing hooks but strips them from public .d.ts. */
type TestEndpoint<Result> = {
  isInternal: boolean;
  exportArgs(): string;
  exportReturns(): string;
  _handler(ctx: MockCtx, args: Row): Promise<Result>;
};
const endpoints = migration as unknown as {
  [Name in keyof typeof migration]: TestEndpoint<Results[Name]>;
};
function call<Name extends keyof typeof migration>(
  name: Name,
  ctx: MockCtx,
  args: Row = {}
): Promise<Results[Name]> {
  // Invalid argument fixtures deliberately reach handlers; IDs use mock strings.
  return endpoints[name]._handler(ctx, args);
}
let passed = 0;
async function check(name: string, fn: () => Promise<void>) {
  await fn();
  passed++;
  console.log(`ok ${passed}: ${name}`);
}
const category = {
  name: "Business",
  slug: "business",
  accent: "navy-900",
  order: 1,
  description: "",
  isActive: true,
};
const author = {
  name: "Auteur",
  slug: "auteur",
  role: "Rédaction",
  bio: "",
  links: [],
};
const media = {
  key: "wp-image-1",
  alt: "Image",
  caption: "",
  credit: "",
  license: "Droits réservés",
  source: "https://source.test/a.jpg",
  width: 800,
  height: 600,
  color: "#ffffff",
  variants: [],
  wordpressId: 1,
};
const article = {
  title: "Article réel",
  slug: "article-reel",
  dek: "",
  body: [],
  status: "published",
  categorySlug: "business",
  authorSlug: "auteur",
  galleryMediaKeys: [],
  keyPoints: [],
  seo: { description: "", keywords: [] },
  origin: "redaction",
  feature: "none",
  readingMinutes: 1,
  tags: [],
  createdAt: 100,
  publishedAt: 200,
  updatedAt: 300,
  views: 10,
  searchText: "Article réel",
  wordpressId: 42,
  sourceUrl: "https://source.test/article-reel/",
  sourceModifiedAt: 300,
};
const populated = (more: Rows = {}) =>
  context({
    categories: [
      category,
      { ...category, slug: "child", parentSlug: "business" },
    ],
    authors: [author],
    media: [media],
    ...more,
  });

await check(
  "All seven endpoints are internal, with concrete args and returns",
  async () => {
    assert.equal(Object.keys(migration).length, 7);
    for (const fn of Object.values(endpoints)) {
      assert.equal(fn.isInternal, true);
      assert.ok(fn.exportArgs());
      assert.ok(fn.exportReturns());
      assert.ok(!fn.exportArgs().includes('"type":"any"'));
    }
    assert.ok(endpoints.upsertArticles.exportArgs().includes("redaction"));
  }
);
await check(
  "Taxonomy merges by slug, keeps unrelated rows and accepts parents later in the batch",
  async () => {
    const ctx = context({
      categories: [{ ...category, slug: "preserved" }],
      authors: [{ ...author, slug: "preserved-author" }],
    });
    const args = {
      categories: [
        { ...category, slug: "child", parentSlug: "business" },
        category,
      ],
      authors: [author],
    };
    assert.deepEqual(await call("upsertTaxonomy", ctx, args), {
      categories: { inserted: 2, updated: 0 },
      authors: { inserted: 1, updated: 0 },
    });
    assert.deepEqual(await call("upsertTaxonomy", ctx, args), {
      categories: { inserted: 0, updated: 2 },
      authors: { inserted: 0, updated: 1 },
    });
    assert.equal(ctx.data.categories.length, 3);
    assert.equal(ctx.data.authors.length, 2);
  }
);
await check(
  "Taxonomy rejects excessive, duplicate, missing-parent, cyclic and deep categories",
  async () => {
    for (const categories of [
      Array(101).fill(category),
      [category, category],
      [{ ...category, parentSlug: "missing" }],
      [{ ...category, parentSlug: "business" }],
      [
        category,
        { ...category, slug: "child", parentSlug: "business" },
        { ...category, slug: "grandchild", parentSlug: "child" },
      ],
    ]) {
      const ctx = context();
      await assert.rejects(
        call("upsertTaxonomy", ctx, { categories, authors: [] })
      );
      assert.equal(ctx.writes.length, 0);
    }
  }
);
await check(
  "Taxonomy refuses reparenting that would invalidate an existing article",
  async () => {
    const ctx = populated({
      articles: [{ ...article, subCategorySlug: "child" }],
    });
    await assert.rejects(
      call("upsertTaxonomy", ctx, {
        categories: [{ ...category, slug: "child" }],
        authors: [],
      }),
      /sous-rubrique incohérente/
    );
    assert.equal(ctx.writes.length, 0);
  }
);
await check("Author portrait must exist", async () => {
  const ctx = context();
  await assert.rejects(
    call("upsertTaxonomy", ctx, {
      categories: [],
      authors: [{ ...author, portraitMediaKey: "missing" }],
    }),
    /Média référencé inconnu/
  );
});
await check("Upload URL count has an integer range of 1–20", async () => {
  assert.equal((await call("uploadUrls", context(), { count: 20 })).length, 20);
  for (const count of [0, -1, 1.1, 21, NaN])
    await assert.rejects(call("uploadUrls", context(), { count }));
});
await check(
  "Media verifies original and rendition storage metadata and upserts idempotently",
  async () => {
    const ctx = context();
    ctx.files.set("original", { size: 1024, contentType: "image/jpeg" });
    ctx.files.set("small", { size: 256, contentType: "image/webp" });
    const item = {
      ...media,
      originalStorageId: "original",
      originalBytes: 1024,
      originalMimeType: "image/jpeg",
      storage: [
        { format: "webp", w: 320, h: 240, bytes: 256, storageId: "small" },
      ],
    };
    assert.deepEqual(await call("upsertMedia", ctx, { items: [item] }), {
      inserted: 1,
      updated: 0,
    });
    assert.deepEqual(await call("upsertMedia", ctx, { items: [item] }), {
      inserted: 0,
      updated: 1,
    });
    assert.equal(ctx.data.media.length, 1);
    // Recherche et filtre « Sans texte alternatif » de la médiathèque.
    const derived = mediaDerivedFields(item);
    assert.equal(ctx.data.media[0].searchText, derived.searchText);
    assert.equal(ctx.data.media[0].altMissing, derived.altMissing);
    for (const bad of [
      { ...item, originalBytes: 99 },
      { ...item, originalMimeType: "image/png" },
      { ...item, originalStorageId: "missing" },
      { ...item, originalMimeType: undefined },
    ]) {
      await assert.rejects(call("upsertMedia", ctx, { items: [bad] }));
    }
  }
);
await check(
  "Media refuses non-WordPress key collision and same WordPress ID under another key",
  async () => {
    const ctx = populated({ media: [{ ...media, wordpressId: undefined }] });
    await assert.rejects(
      call("upsertMedia", ctx, { items: [media] }),
      /Collision/
    );
    await assert.rejects(
      call("upsertMedia", populated(), {
        items: [{ ...media, key: "different-key" }],
      }),
      /déjà importé/
    );
  }
);
await check(
  "Articles insert, update idempotently, preserve max views and clear absent optional presentation fields",
  async () => {
    const ctx = populated();
    assert.deepEqual(
      await call("upsertArticles", ctx, {
        items: [
          { ...article, heroMediaKey: media.key, subCategorySlug: "child" },
        ],
      }),
      { inserted: 1, updated: 0 }
    );
    // La médiathèque sait quel article affiche l'image (`mediaUsages`).
    assert.deepEqual(
      ctx.data.mediaUsages.map((row) => [row.mediaKey, row.articleId]),
      [[media.key, ctx.data.articles[0]._id]]
    );
    assert.deepEqual(
      await call("upsertArticles", ctx, { items: [{ ...article, views: 2 }] }),
      { inserted: 0, updated: 1 }
    );
    assert.equal(ctx.data.articles[0].views, 10);
    assert.equal(ctx.data.articles[0].heroMediaKey, undefined);
    assert.equal(ctx.data.articles[0].subCategorySlug, undefined);
    assert.equal(ctx.data.articles.length, 1);
    assert.equal(ctx.data.mediaUsages.length, 0);
  }
);
await check(
  "Articles refuse non-WordPress slug collision, different source identity and rekeying",
  async () => {
    for (const stored of [
      { ...article, wordpressId: undefined },
      { ...article, wordpressId: 99 },
      { ...article, slug: "another-slug" },
    ]) {
      const ctx = populated({ articles: [stored] });
      await assert.rejects(call("upsertArticles", ctx, { items: [article] }));
      assert.equal(ctx.writes.length, 0);
    }
  }
);
await check(
  "Article references cover categories, subcategories, author, hero, gallery, inline image, video poster and author portrait",
  async () => {
    for (const overrides of [
      { categorySlug: "missing" },
      { categorySlug: "child" },
      { subCategorySlug: "missing" },
      { authorSlug: "missing" },
      { heroMediaKey: "missing" },
      { galleryMediaKeys: ["missing"] },
      { body: [{ type: "image", mediaKey: "missing" }] },
      {
        body: [
          {
            type: "video",
            title: "Video",
            posterMediaKey: "missing",
            src: "https://video.test/",
          },
        ],
      },
    ]) {
      const ctx = populated();
      await assert.rejects(
        call("upsertArticles", ctx, { items: [{ ...article, ...overrides }] })
      );
      assert.equal(ctx.writes.length, 0);
    }
    await assert.rejects(
      call(
        "upsertArticles",
        populated({ authors: [{ ...author, portraitMediaKey: "missing" }] }),
        { items: [article] }
      )
    );
  }
);
await check("Article and media batch limits reject before writes", async () => {
  for (const [name, item] of [
    ["upsertArticles", article],
    ["upsertMedia", media],
  ] as const) {
    const ctx = populated();
    await assert.rejects(call(name, ctx, { items: Array(21).fill(item) }));
    assert.equal(ctx.writes.length, 0);
  }
});
await check(
  "Inventory is compact, counts all editorial rows and omits article bodies",
  async () => {
    const result = await call(
      "inventory",
      populated({
        articles: [
          article,
          {
            ...article,
            slug: "draft",
            status: "draft",
            wordpressId: undefined,
          },
        ],
      })
    );
    assert.equal(result.counts.articles, 2);
    assert.equal(result.counts.wordpressArticles, 1);
    assert.equal(result.counts.publishedArticles, 1);
    assert.ok(!("body" in result.articles[0]));
    assert.ok(!("_id" in result.categories[0]));
    assert.equal(result.authors[0].slug, "auteur");
  }
);
await check(
  "RetireDemo drafts only the exact seed slug/title without WordPress provenance, and is resumable",
  async () => {
    const seeds = ARTICLES_1.slice(0, 4);
    const ctx = populated({
      articles: [
        {
          ...article,
          slug: seeds[0].slug,
          title: seeds[0].title,
          wordpressId: undefined,
        },
        {
          ...article,
          slug: seeds[1].slug,
          title: "Edited title",
          wordpressId: undefined,
        },
        { ...article, slug: seeds[2].slug, title: seeds[2].title },
        {
          ...article,
          slug: "not-seed",
          title: seeds[3].title,
          wordpressId: undefined,
        },
      ],
    });
    const result = await call("retireDemo", ctx);
    assert.deepEqual(result.drafted, [seeds[0].slug]);
    assert.deepEqual(
      ctx.data.articles.map((row) => row.status),
      ["draft", "published", "published", "published"]
    );
    const repeat = await call("retireDemo", ctx);
    assert.deepEqual(repeat.drafted, []);
    assert.deepEqual(repeat.alreadyDraft, [seeds[0].slug]);
    // Nothing but the articles and the counts `patchArticle` moves with them.
    assert.ok(
      ctx.writes.every(
        ([table]) => table === "articles" || table === "articleCounts"
      )
    );
    assert.equal(ctx.data.articles.length, 4);
  }
);

const document = {
  slug: "wp-journal-1",
  title: "BOMA Infos — Numéro 1",
  description: "Magazine original",
  kind: "Magazine",
  fileUrl: "https://source.test/original.pdf",
  fileFormat: "PDF",
  fileBytes: 2048,
  publisher: "BOMA Infos",
  publishedAt: 300,
  wordpressId: 75,
  sourceUrl: "https://source.test/original.pdf",
  originalStorageId: "pdf-original",
  isActive: true,
};
function withPdf(more: Rows = {}): MockCtx {
  const ctx = populated(more);
  ctx.files.set("pdf-original", { size: 2048, contentType: "application/pdf" });
  return ctx;
}
await check(
  "PDF documents upsert idempotently and resolve the download from the verified storage file",
  async () => {
    const ctx = withPdf();
    assert.deepEqual(
      await call("upsertDocuments", ctx, { items: [document] }),
      { inserted: 1, updated: 0 }
    );
    assert.deepEqual(
      await call("upsertDocuments", ctx, { items: [document] }),
      { inserted: 0, updated: 1 }
    );
    assert.equal(ctx.data.documents.length, 1);
    assert.equal(
      ctx.data.documents[0].fileUrl,
      "https://files.test/pdf-original"
    );
    assert.equal(ctx.data.documents[0].originalStorageId, "pdf-original");
    assert.equal(ctx.data.documents[0].isActive, true);
  }
);
await check(
  "PDF document provenance, duplicates, collisions and batch limit are enforced",
  async () => {
    for (const items of [
      Array(21).fill(document),
      [document, document],
      [{ ...document, wordpressId: 0 }],
    ]) {
      const ctx = withPdf();
      await assert.rejects(call("upsertDocuments", ctx, { items }));
      assert.equal(ctx.writes.length, 0);
    }
    for (const stored of [
      { ...document, wordpressId: undefined },
      { ...document, wordpressId: 99 },
      { ...document, slug: "another-slug" },
    ]) {
      const ctx = withPdf({ documents: [stored] });
      await assert.rejects(call("upsertDocuments", ctx, { items: [document] }));
      assert.equal(ctx.writes.length, 0);
    }
  }
);
await check(
  "PDF document storage must exist with matching application/pdf MIME and byte size",
  async () => {
    for (const metadata of [
      undefined,
      { size: 2048, contentType: "application/zip" },
      { size: 2048, contentType: "text/plain" },
      { size: 17, contentType: "application/pdf" },
    ]) {
      const ctx = withPdf();
      ctx.files.delete("pdf-original");
      if (metadata) ctx.files.set("pdf-original", metadata);
      await assert.rejects(call("upsertDocuments", ctx, { items: [document] }));
      assert.equal(ctx.writes.length, 0);
    }
    const args = JSON.parse(endpoints.upsertDocuments.exportArgs());
    assert.deepEqual(
      args.value.items.fieldType.value.value.fileFormat.fieldType,
      {
        type: "literal",
        value: "PDF",
      }
    );
  }
);
await check(
  "RetireDemo hides exactly the six unchanged local PDF documents and preserves edited or imported documents",
  async () => {
    const seedDocuments = DOCUMENTS.map((seed) => ({
      ...document,
      ...seed,
      wordpressId: undefined,
    }));
    const ctx = withPdf({ documents: seedDocuments });
    const result = await call("retireDemo", ctx);
    assert.deepEqual(
      result.hiddenDocuments,
      DOCUMENTS.map((seed) => seed.slug)
    );
    assert.equal(ctx.data.documents.length, 6);
    assert.ok(ctx.data.documents.every((row) => row.isActive === false));
    assert.deepEqual((await call("retireDemo", ctx)).hiddenDocuments, []);
    const protectedCtx = withPdf({
      documents: [
        { ...seedDocuments[0], title: "Edited document title" },
        { ...seedDocuments[1], wordpressId: 123 },
        { ...seedDocuments[2], slug: "unrelated-document" },
      ],
    });
    assert.deepEqual(
      (await call("retireDemo", protectedCtx)).hiddenDocuments,
      []
    );
    assert.equal(protectedCtx.writes.length, 0);
  }
);
await check(
  "Public documents hide inactive rows while retaining legacy rows and active PDFs",
  async () => {
    // The public list reads `by_date` backwards: the newest first.
    const ctx = withPdf({
      documents: [
        document,
        { ...document, slug: "hidden", publishedAt: 200, isActive: false },
        { ...document, slug: "legacy", publishedAt: 100, isActive: undefined },
      ],
    });
    const result = await (
      publicDocuments as unknown as TestEndpoint<Row[]>
    )._handler(ctx, {});
    assert.deepEqual(
      result.map((row) => row.slug),
      ["wp-journal-1", "legacy"]
    );
    assert.ok(result.every((row) => !("originalStorageId" in row)));
  }
);
await check(
  "Inventory counts documents and exposes provenance for resume without content",
  async () => {
    const ctx = withPdf({
      documents: [
        document,
        { ...document, slug: "seed", wordpressId: undefined, isActive: false },
      ],
    });
    const result = await call("inventory", ctx);
    assert.equal(result.counts.documents, 2);
    assert.equal(result.counts.wordpressDocuments, 1);
    assert.deepEqual(result.documents[0], {
      slug: document.slug,
      wordpressId: 75,
      originalStorageId: "pdf-original",
      isActive: true,
    });
  }
);
await check(
  "Rerunning a PDF import preserves an intentionally hidden document when isActive is omitted",
  async () => {
    const ctx = withPdf({ documents: [{ ...document, isActive: false }] });
    await call("upsertDocuments", ctx, {
      items: [{ ...document, isActive: undefined }],
    });
    assert.equal(ctx.data.documents[0].isActive, false);
  }
);
console.log(`${passed} checks passed.`);
