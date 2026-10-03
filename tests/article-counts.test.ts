import assert from "node:assert/strict";
import { test } from "node:test";
import { getFunctionName } from "convex/server";
import type { Doc } from "../convex/_generated/dataModel";
import { rebuild, replaceCounts, tallyPage } from "../convex/articleCounts";
import {
  countCells,
  countDelta,
  tally,
  type CountedArticle,
} from "../convex/model/articleCounts";
import {
  deleteArticle,
  insertArticle,
  patchArticle,
  type ArticleFields,
} from "../convex/model/articleWrites";
import { syncSections } from "../convex/stats";
import { createFakeDb, handlerOf, type FakeDb } from "./support/fake-convex";
import { random } from "./support/journal-data";

/*
 * `articleCounts` must say what a count over `articles` would say, after any
 * sequence of writes — that is what lets navCounts, the dashboard, the
 * section filters and the author list stop reading the table.
 */

type Article = Doc<"articles">;

const draft: CountedArticle = {
  status: "draft",
  categorySlug: "editorial",
  authorSlug: "boma-infos",
  origin: "redaction",
};

test("cellules : chaque article compte partout, publié compte côté journal", () => {
  assert.deepEqual(countCells(draft), [
    { group: "status", key: "draft" },
    { group: "category", key: "editorial" },
    { group: "author", key: "boma-infos" },
    { group: "origin", key: "redaction" },
  ]);
  const published = countCells({
    ...draft,
    status: "published",
    subCategorySlug: "big-deal",
  });
  assert.deepEqual(
    published.filter((cell) => cell.group.startsWith("published_")),
    [
      { group: "published_category", key: "editorial" },
      { group: "published_subcategory", key: "big-deal" },
      { group: "published_author", key: "boma-infos" },
    ]
  );
});

test("écart : rien pour un enregistrement qui ne change ni statut ni rubrique", () => {
  assert.deepEqual(countDelta(draft, { ...draft }), []);
  assert.deepEqual(
    countDelta(draft, { ...draft, status: "published" }).sort((a, b) =>
      `${a.group}${a.key}`.localeCompare(`${b.group}${b.key}`)
    ),
    [
      { group: "published_author", key: "boma-infos", change: 1 },
      { group: "published_category", key: "editorial", change: 1 },
      { group: "status", key: "draft", change: -1 },
      { group: "status", key: "published", change: 1 },
    ]
  );
  assert.deepEqual(
    countDelta(null, draft).map((cell) => cell.change),
    [1, 1, 1, 1]
  );
  assert.deepEqual(
    countDelta(draft, null).map((cell) => cell.change),
    [-1, -1, -1, -1]
  );
});

/* ------------------------------------------------------ writes vs recount */

const STATUSES: Article["status"][] = [
  "draft",
  "submitted",
  "in_review",
  "changes_requested",
  "scheduled",
  "published",
  "rejected",
];
const SECTIONS = ["editorial", "tribune", "espace-pro"];
const SUBS = [undefined, "big-deal", "leader"];
const AUTHORS = ["boma-infos", "invite"];

function fields(slug: string, next: () => number): ArticleFields {
  const pick = <T>(values: readonly T[]) =>
    values[Math.floor(next() * values.length)];
  return {
    title: slug,
    slug,
    dek: "",
    body: [],
    status: pick(STATUSES),
    categorySlug: pick(SECTIONS),
    subCategorySlug: pick(SUBS),
    authorSlug: pick(AUTHORS),
    galleryMediaKeys: [],
    keyPoints: [],
    seo: { description: "", keywords: [] },
    origin: next() < 0.2 ? "partenaire" : "redaction",
    feature: "none",
    readingMinutes: 1,
    tags: [],
    createdAt: 0,
    publishedAt: 0,
    updatedAt: 0,
    views: 0,
    searchText: slug,
  };
}

/** The counts table, as `tally` would write it (zeros and `meta` left out). */
function stored(fake: FakeDb) {
  return new Map(
    fake
      .all("articleCounts")
      .filter((row) => row.group !== "meta" && (row.count as number) !== 0)
      .map((row) => [`${row.group}/${row.key}`, row.count as number])
  );
}

function recounted(fake: FakeDb) {
  return new Map(
    tally(fake.all("articles") as unknown as Article[]).map((cell) => [
      `${cell.group}/${cell.key}`,
      cell.count,
    ])
  );
}

test("écritures au hasard : les compteurs égalent un recomptage complet", async () => {
  for (const seed of [1, 2, 3]) {
    const fake = createFakeDb();
    const ctx = { db: fake.db } as never;
    const next = random(seed);
    for (let step = 0; step < 400; step += 1) {
      const articles = fake.all("articles") as unknown as Article[];
      const roll = next();
      if (articles.length < 5 || roll < 0.35) {
        await insertArticle(ctx, fields(`a-${seed}-${step}`, next));
      } else if (roll < 0.9) {
        const row = articles[Math.floor(next() * articles.length)];
        const other = fields(row.slug, next);
        // A patch that moves one field, several, or none at all (autosave).
        const patch: Partial<ArticleFields> = {};
        if (next() < 0.5) patch.status = other.status;
        if (next() < 0.3) patch.categorySlug = other.categorySlug;
        if (next() < 0.3) patch.subCategorySlug = other.subCategorySlug;
        if (next() < 0.2) patch.authorSlug = other.authorSlug;
        if (next() < 0.1) patch.origin = other.origin;
        if (next() < 0.5) patch.title = `${row.title}!`;
        await patchArticle(ctx, row, patch);
      } else {
        const row = articles[Math.floor(next() * articles.length)];
        await deleteArticle(ctx, row);
      }
    }
    assert.deepEqual(stored(fake), recounted(fake), `graine ${seed}`);
  }
});

test("enregistrement automatique : aucune écriture de compteur", async () => {
  const fake = createFakeDb();
  const ctx = { db: fake.db } as never;
  const next = random(9);
  await insertArticle(ctx, fields("piece", next));
  const [row] = fake.all("articles") as unknown as Article[];
  fake.resetReads();
  await patchArticle(ctx, row, {
    title: "Nouveau titre",
    body: [{ type: "paragraph", text: "…" }],
    updatedAt: 5,
  });
  assert.deepEqual(
    fake.writes.map((write) => write.table),
    ["articles"]
  );
});

test("changement de rubrique : la ligne d'audience suit, sous l'ancien et le nouveau slug", async () => {
  const fake = createFakeDb();
  const ctx = { db: fake.db } as never;
  await insertArticle(ctx, {
    ...fields("ancien", random(3)),
    categorySlug: "editorial",
  });
  for (const slug of ["ancien", "nouveau"]) {
    await fake.db.insert("articleStats", {
      slug,
      views: 3,
      categorySlug: "editorial",
      readingSeconds: 0,
      readingSamples: 0,
      shares: 0,
      sharesByChannel: [],
      updatedAt: 0,
    });
  }
  const [row] = fake.all("articles") as unknown as Article[];
  await patchArticle(ctx, row, { categorySlug: "tribune", slug: "nouveau" });
  assert.deepEqual(
    fake.all("articleStats").map((stat) => [stat.slug, stat.categorySlug]),
    [
      ["ancien", "tribune"],
      ["nouveau", "tribune"],
    ]
  );
});

/* --------------------------------------------------------------- rebuild */

test("recomptage : pages de 200, totaux justes, sections d'audience rattrapées", async () => {
  const fake = createFakeDb();
  const next = random(4);
  // Written straight into the table: counts the wrappers never saw.
  for (let index = 0; index < 450; index += 1) {
    await fake.db.insert("articles", fields(`b-${index}`, next));
  }
  await fake.db.insert("articleStats", {
    slug: "b-7",
    views: 12,
    readingSeconds: 0,
    readingSamples: 0,
    shares: 0,
    sharesByChannel: [],
    updatedAt: 0,
  });
  // A stale cell that the recount must bring back to zero.
  await fake.db.insert("articleCounts", {
    group: "status",
    key: "archived",
    count: 4,
  });

  const handlers: Record<
    string,
    (ctx: unknown, args: never) => Promise<unknown>
  > = {
    "articleCounts:tallyPage": handlerOf(tallyPage),
    "articleCounts:replaceCounts": handlerOf(replaceCounts),
    "stats:syncSections": handlerOf(syncSections),
  };
  const call = async (reference: unknown, args: unknown) => {
    fake.resetReads();
    const result = await handlers[getFunctionName(reference as never)](
      { db: fake.db },
      args as never
    );
    // No single call of the recount reads more than a page and its lookups.
    assert.ok(fake.reads.documents <= 400, `${fake.reads.documents} lectures`);
    return result;
  };
  const result = await handlerOf<Record<string, never>, { articles: number }>(
    rebuild
  )({ runQuery: call, runMutation: call }, {});

  assert.equal(result.articles, 450);
  assert.deepEqual(stored(fake), recounted(fake));
  const stale = fake.all("articleCounts").find((row) => row.key === "archived");
  assert.equal(stale?.count, 0);
  assert.ok(fake.all("articleCounts").some((row) => row.group === "meta"));
  const [stat] = fake.all("articleStats");
  const article = (fake.all("articles") as unknown as Article[]).find(
    (row) => row.slug === "b-7"
  );
  assert.equal(stat.categorySlug, article?.categorySlug);
});
