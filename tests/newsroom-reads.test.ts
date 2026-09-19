import assert from "node:assert/strict";
import { test } from "node:test";
import type { Doc } from "../convex/_generated/dataModel";
import { dashboard, list, navCounts } from "../convex/newsroom";
import { list as taxonomyList } from "../convex/taxonomy";
import {
  createFakeDb,
  handlerOf,
  signedIn,
  type FakeDb,
} from "./support/fake-convex";
import {
  random,
  seedArchive,
  seedReferenceTables,
} from "./support/journal-data";

/*
 * The back office, checked against what it computed by reading every
 * article (convex/newsroom.ts and convex/taxonomy.ts at 882d2c3): the same
 * figures and rows, for reads that no longer follow the archive.
 */

type Article = Doc<"articles">;

async function newsroom(count: number, seed: number) {
  const fake = createFakeDb();
  await seedReferenceTables(fake);
  await seedArchive(fake, { seed, count, unpublished: 0.35 });
  const next = random(seed + 100);
  const articles = fake.all("articles") as unknown as Article[];
  const pick = <T>(values: readonly T[]) =>
    values[Math.floor(next() * values.length)];

  const organizations: string[] = [];
  for (let index = 0; index < 12; index += 1) {
    organizations.push(
      await fake.db.insert("organizations", {
        name: `Entreprise ${index}`,
        slug: `entreprise-${index}`,
        sector: "Banque",
        contactName: "Contact",
        contactEmail: `contact${index}@example.test`,
        approved: next() < 0.6,
        createdAt: index,
      })
    );
  }
  for (let index = 0; index < 40; index += 1) {
    await fake.db.insert("submissions", {
      organizationId: pick(organizations),
      title: `Dépôt ${index}`,
      dek: "",
      body: [],
      requestedCategorySlug: "espace-pro",
      kind: "communique",
      status: pick([
        "draft",
        "submitted",
        "in_review",
        "published",
        "rejected",
      ] as const),
      mediaKeys: [],
      reviewNotes: [],
      createdAt: index,
      updatedAt: index,
    });
  }
  const run = await fake.db.insert("agentRuns", {
    agentKey: "seo",
    status: "succeeded",
    mode: "simulated",
    model: "test",
    targetType: "article",
    targetId: "-",
    targetLabel: "-",
    inputDigest: "",
    summary: "",
    inputTokens: 0,
    outputTokens: 0,
    costMicros: 0,
    period: "2026-09",
    triggeredBy: "test",
    createdAt: 0,
  });
  for (let index = 0; index < 150; index += 1) {
    await fake.db.insert("agentSuggestions", {
      runId: run,
      agentKey: "seo",
      targetType: "article",
      targetId: pick(articles)._id,
      field: "title",
      label: "Titre",
      rationale: "",
      proposed: `Proposition ${index}`,
      fingerprint: String(index),
      status: pick(["pending", "accepted", "rejected"] as const),
      createdAt: index,
    });
  }
  fake.resetReads();
  return fake;
}

const run = async <Result>(fn: unknown, fake: FakeDb, args = {}) =>
  handlerOf<typeof args, Result>(fn)(await signedIn(fake), args);

/* --------------------------------------------- reference (882d2c3) */

function referencePending(fake: FakeDb) {
  const pending = new Map<string, number>();
  for (const row of fake.all("agentSuggestions")) {
    if (row.status !== "pending") continue;
    pending.set(
      row.targetId as string,
      (pending.get(row.targetId as string) ?? 0) + 1
    );
  }
  return pending;
}

function referenceRows(fake: FakeDb, rows: Article[]) {
  const categories = new Map(
    fake.all("categories").map((row) => [row.slug as string, row])
  );
  const authors = new Map(
    fake.all("authors").map((row) => [row.slug as string, row])
  );
  const pending = referencePending(fake);
  return rows.map((row) => ({
    _id: row._id,
    title: row.title,
    slug: row.slug,
    dek: row.dek,
    status: row.status,
    categorySlug: row.categorySlug,
    categoryName:
      (categories.get(row.categorySlug)?.name as string) ?? row.categorySlug,
    subCategorySlug: row.subCategorySlug,
    authorSlug: row.authorSlug,
    authorName: (authors.get(row.authorSlug)?.name as string) ?? row.authorSlug,
    origin: row.origin,
    feature: row.feature,
    heroMediaKey: row.heroMediaKey,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    readingMinutes: row.readingMinutes,
    pendingSuggestions: pending.get(row._id) ?? 0,
  }));
}

const articlesOf = (fake: FakeDb) =>
  fake.all("articles") as unknown as Article[];

/* ---------------------------------------------------------------- tests */

test("navCounts : mêmes badges, sans lire un seul article", async () => {
  const fake = await newsroom(500, 1);
  const articles = articlesOf(fake);
  const submissions = fake.all("submissions");
  const expected = {
    inReview: articles.filter(
      (row) => row.status === "in_review" || row.status === "submitted"
    ).length,
    submissionsWaiting: submissions.filter(
      (row) => row.status === "submitted" || row.status === "in_review"
    ).length,
    pendingSuggestions: fake
      .all("agentSuggestions")
      .filter((row) => row.status === "pending").length,
    organizationsWaiting: fake
      .all("organizations")
      .filter((row) => !row.approved).length,
  };
  fake.resetReads();
  assert.deepEqual(await run(navCounts, fake), expected);
  assert.equal(fake.reads.tables.articles ?? 0, 0);
  assert.ok(fake.reads.bytes < 60_000, `${fake.reads.bytes} octets`);
});

test("navCounts : une file de plus de 99 s'arrête à 100 (le badge dit 99+)", async () => {
  const fake = await newsroom(50, 2);
  for (let index = 0; index < 180; index += 1) {
    await fake.db.insert("organizations", {
      name: `Attente ${index}`,
      slug: `attente-${index}`,
      sector: "Banque",
      contactName: "Contact",
      contactEmail: "attente@example.test",
      approved: false,
      createdAt: index,
    });
  }
  fake.resetReads();
  const counts = await run<{ organizationsWaiting: number }>(navCounts, fake);
  assert.equal(counts.organizationsWaiting, 100);
  assert.ok((fake.reads.tables.organizations ?? 0) <= 100);
});

test("tableau de bord : compteurs, relecture, derniers modifiés comme avant", async () => {
  const fake = await newsroom(600, 3);
  const articles = articlesOf(fake);
  const byRecency = [...articles].sort((a, b) => b.updatedAt - a.updatedAt);
  const actual = await run<{
    counts: Record<string, number>;
    submissionsWaiting: number;
    organizationsWaiting: number;
    tasks: {
      pendingSuggestions: number;
      hasLead: boolean;
      awaitingReview: unknown[];
    };
    recent: unknown[];
  }>(dashboard, fake);

  assert.deepEqual(actual.counts, {
    draft: articles.filter((row) => row.status === "draft").length,
    inReview: articles.filter(
      (row) => row.status === "in_review" || row.status === "submitted"
    ).length,
    scheduled: articles.filter((row) => row.status === "scheduled").length,
    published: articles.filter((row) => row.status === "published").length,
  });
  assert.equal(
    actual.submissionsWaiting,
    fake
      .all("submissions")
      .filter((row) => row.status === "submitted" || row.status === "in_review")
      .length
  );
  assert.equal(
    actual.organizationsWaiting,
    fake.all("organizations").filter((row) => !row.approved).length
  );
  assert.equal(
    actual.tasks.pendingSuggestions,
    fake.all("agentSuggestions").filter((row) => row.status === "pending")
      .length
  );
  assert.equal(
    actual.tasks.hasLead,
    articles.some((row) => row.status === "published" && row.feature === "lead")
  );
  assert.deepEqual(
    actual.tasks.awaitingReview,
    referenceRows(
      fake,
      byRecency
        .filter(
          (row) => row.status === "in_review" || row.status === "submitted"
        )
        .slice(0, 5)
    )
  );
  assert.deepEqual(actual.recent, referenceRows(fake, byRecency.slice(0, 8)));
});

test("tableau de bord : les lectures ne suivent pas l'archive", async () => {
  const small = await newsroom(300, 4);
  await run(dashboard, small);
  const large = await newsroom(2400, 4);
  await run(dashboard, large);
  assert.ok(
    (large.reads.tables.articles ?? 0) <= 30,
    `${large.reads.tables.articles} articles lus`
  );
  assert.ok(
    large.reads.bytes < small.reads.bytes * 1.5,
    `${large.reads.bytes} contre ${small.reads.bytes}`
  );
});

test("liste : mêmes lignes que le filtrage de toute la table", async () => {
  const fake = await newsroom(700, 5);
  const articles = articlesOf(fake);
  const cases = [
    {},
    { status: "draft" },
    { status: "published" },
    { categorySlug: "tribune" },
    { categorySlug: "editorial", status: "published" },
    { authorSlug: "invite" },
    { origin: "partenaire" },
    { origin: "partenaire", categorySlug: "editorial" },
    { status: "inconnu" },
  ];
  for (const filters of cases) {
    const expected = referenceRows(
      fake,
      articles
        .filter(
          (row) =>
            (!("status" in filters) || row.status === filters.status) &&
            (!("categorySlug" in filters) ||
              row.categorySlug === filters.categorySlug) &&
            (!("authorSlug" in filters) ||
              row.authorSlug === filters.authorSlug) &&
            (!("origin" in filters) || row.origin === filters.origin)
        )
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 200)
    );
    fake.resetReads();
    const actual = await run(list, fake, filters);
    assert.deepEqual(actual, expected, JSON.stringify(filters));
    // The narrowest index: never more articles than the list shows, plus
    // those the other filters drop within it.
    assert.ok(
      (fake.reads.tables.articles ?? 0) <= Math.max(expected.length, 1) * 8,
      `${JSON.stringify(filters)} : ${fake.reads.tables.articles} articles lus`
    );
  }
});

test("liste : une recherche passe par l'index plein texte, bornée", async () => {
  const fake = await newsroom(700, 6);
  const target = articlesOf(fake)[42];
  fake.resetReads();
  const rows = await run<{ slug: string }[]>(list, fake, {
    term: target.title.toLowerCase(),
  });
  assert.ok(rows.some((row) => row.slug === target.slug));
  assert.ok((fake.reads.tables.articles ?? 0) <= 50);
});

test("rubriques du back-office : articles de tout statut par rubrique", async () => {
  const fake = await newsroom(500, 7);
  const counts = new Map<string, number>();
  for (const row of articlesOf(fake)) {
    counts.set(row.categorySlug, (counts.get(row.categorySlug) ?? 0) + 1);
    if (row.subCategorySlug) {
      counts.set(
        row.subCategorySlug,
        (counts.get(row.subCategorySlug) ?? 0) + 1
      );
    }
  }
  fake.resetReads();
  const rows = await run<{ slug: string; articleCount: number }[]>(
    taxonomyList,
    fake
  );
  for (const row of rows) {
    assert.equal(row.articleCount, counts.get(row.slug) ?? 0, row.slug);
  }
  assert.equal(fake.reads.tables.articles ?? 0, 0);
});
