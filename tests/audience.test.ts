import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import type { Doc } from "../convex/_generated/dataModel";
import {
  computeAudience,
  countView,
  displayedViews,
  lastDays,
  viewsOver,
} from "../convex/model/audience";
import { insertArticle } from "../convex/model/articleWrites";
import { refreshAudience } from "../convex/stats";
import { createFakeDb, handlerOf, type FakeDb } from "./support/fake-convex";

/*
 * A public view touches the audience tables only (19/09/2026): the article
 * — and every query that read it — stays as it was. What readers see must
 * not jump on the way.
 */

type Article = Doc<"articles">;
type Stats = Doc<"articleStats">;

const NOW = Date.UTC(2026, 8, 19, 15);
const realNow = Date.now;
beforeEach(() => {
  Date.now = () => NOW;
});
afterEach(() => {
  Date.now = realNow;
});

async function withArticle(
  fields: Partial<Article> = {}
): Promise<{ fake: FakeDb; ctx: never }> {
  const fake = createFakeDb();
  const ctx = { db: fake.db } as never;
  await insertArticle(ctx, {
    title: "Bosch Capital",
    slug: "bosch",
    dek: "",
    body: [{ type: "paragraph", text: "x".repeat(6000) }],
    status: "published",
    categorySlug: "editorial",
    authorSlug: "boma-infos",
    galleryMediaKeys: [],
    keyPoints: [],
    seo: { description: "", keywords: [] },
    origin: "redaction",
    feature: "none",
    readingMinutes: 4,
    tags: [],
    createdAt: 0,
    publishedAt: 0,
    updatedAt: 0,
    views: 0,
    searchText: "",
    ...fields,
  });
  fake.resetReads();
  return { fake, ctx };
}

const statsOf = (fake: FakeDb) =>
  fake.all("articleStats") as unknown as Stats[];
const articleOf = (fake: FakeDb) =>
  (fake.all("articles") as unknown as Article[])[0];

test("vues affichées : l'article, plus ce que la ligne a compté depuis", () => {
  assert.equal(displayedViews({ views: 120 }, null), 120);
  // Written before the change: the article already includes these 20.
  assert.equal(displayedViews({ views: 120 }, { views: 20 }), 120);
  assert.equal(
    displayedViews({ views: 120 }, { views: 23, viewsInArticle: 20 }),
    123
  );
  assert.equal(
    displayedViews({ views: 0 }, { views: 5, viewsInArticle: 0 }),
    5
  );
});

test("première vue : la ligne naît, l'article n'est jamais écrit", async () => {
  const { fake, ctx } = await withArticle();
  assert.equal(await countView(ctx, "bosch"), true);
  assert.deepEqual(fake.writes.map((write) => write.table).sort(), [
    "articleStatDays",
    "articleStats",
  ]);
  const [row] = statsOf(fake);
  assert.equal(row.views, 1);
  assert.equal(row.viewsInArticle, 0);
  assert.equal(row.categorySlug, "editorial");
  assert.equal(displayedViews(articleOf(fake), row), 1);
});

test("vues suivantes : l'article (6 Ko) n'est plus relu", async () => {
  const { fake, ctx } = await withArticle();
  await countView(ctx, "bosch");
  fake.resetReads();
  await countView(ctx, "bosch");
  await countView(ctx, "bosch");
  assert.equal(fake.reads.tables.articles ?? 0, 0);
  assert.ok(fake.reads.bytes < 1000, `${fake.reads.bytes} octets lus`);
  assert.ok(!fake.writes.some((write) => write.table === "articles"));
  const [day] = fake.all("articleStatDays");
  assert.deepEqual([day.day, day.views], ["2026-09-19", 3]);
});

test("slug non publié ou inconnu : rien n'est compté", async () => {
  const { fake, ctx } = await withArticle({ status: "draft" });
  assert.equal(await countView(ctx, "bosch"), false);
  assert.equal(await countView(ctx, "inconnu"), false);
  assert.deepEqual(fake.writes, []);
});

test("passage à la nouvelle logique : le compte affiché ne saute pas", async () => {
  // Before 19/09/2026 a view went both into the article and into its row.
  const { fake, ctx } = await withArticle({ views: 20 });
  await fake.db.insert("articleStats", {
    slug: "bosch",
    views: 20,
    readingSeconds: 0,
    readingSamples: 0,
    shares: 0,
    sharesByChannel: [],
    updatedAt: 0,
  });
  assert.equal(displayedViews(articleOf(fake), statsOf(fake)[0]), 20);

  await countView(ctx, "bosch");
  await countView(ctx, "bosch");
  const [row] = statsOf(fake);
  assert.equal(row.viewsInArticle, 20);
  assert.equal(articleOf(fake).views, 20);
  assert.equal(displayedViews(articleOf(fake), row), 22);
});

/* ------------------------------------------------------------ snapshot */

async function seedDays(fake: FakeDb, perDay: Record<string, number[]>) {
  for (const [day, views] of Object.entries(perDay)) {
    for (const [index, count] of views.entries()) {
      await fake.db.insert("articleStatDays", {
        slug: `a-${index}`,
        day,
        views: count,
      });
    }
  }
}

test("fenêtre : trente jours UTC, aujourd'hui compris, le plus ancien d'abord", () => {
  const days = lastDays(NOW, 30);
  assert.equal(days.length, 30);
  assert.equal(days[29], "2026-09-19");
  assert.equal(days[0], "2026-08-21");
  assert.equal(
    viewsOver(
      [
        { day: "2026-09-12", views: 100 },
        { day: "2026-09-13", views: 5 },
        { day: "2026-09-19", views: 2 },
      ],
      NOW,
      7
    ),
    7
  );
});

test("instantané : totaux du jour, et seuls les jours non clos sont relus", async () => {
  const { fake, ctx } = await withArticle();
  await seedDays(fake, {
    "2026-08-01": [9], // hors fenêtre
    "2026-09-01": [4, 6],
    "2026-09-18": [1, 2, 3],
    "2026-09-19": [5],
  });
  await fake.db.insert("articleStats", {
    slug: "bosch",
    views: 40,
    readingSeconds: 0,
    readingSamples: 0,
    shares: 0,
    sharesByChannel: [],
    updatedAt: 0,
  });

  const first = await computeAudience(ctx, NOW, null);
  assert.deepEqual(first.days, [
    { day: "2026-09-01", views: 10 },
    { day: "2026-09-18", views: 6 },
    { day: "2026-09-19", views: 5 },
  ]);
  assert.deepEqual(first.topArticles, [
    { slug: "bosch", title: "Bosch Capital", views: 40 },
  ]);

  // Previous snapshot at 15:00 today: yesterday settled at 00:10, only
  // today's bucket is read again.
  fake.resetReads();
  const again = await computeAudience(ctx, NOW + 60_000, {
    ...first,
    updatedAt: NOW,
  });
  assert.deepEqual(again.days, first.days);
  assert.equal(fake.reads.tables.articleStatDays, 1);

  // Previous snapshot at 00:05: a late view of yesterday may still land, so
  // yesterday's three buckets are read again too — never September's.
  fake.resetReads();
  const early = await computeAudience(ctx, NOW, {
    ...first,
    updatedAt: Date.UTC(2026, 8, 19, 0, 5),
  });
  assert.deepEqual(early.days, first.days);
  assert.equal(fake.reads.tables.articleStatDays, 4);
});

test("tâche planifiée : n'écrit l'instantané que s'il change (ou toutes les heures)", async () => {
  const { fake, ctx } = await withArticle();
  const refresh = handlerOf<Record<string, never>, boolean>(refreshAudience);
  assert.equal(await refresh(ctx, {}), true);
  assert.equal(await refresh(ctx, {}), false);
  await countView(ctx, "bosch");
  assert.equal(await refresh(ctx, {}), true);
  const [snapshot] = fake.all("audienceSnapshots");
  assert.deepEqual(snapshot.days, [{ day: "2026-09-19", views: 1 }]);
  Date.now = () => NOW + 3_600_000;
  assert.equal(await refresh(ctx, {}), true);
});
