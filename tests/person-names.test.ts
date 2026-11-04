import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createPersonNameNormalizer,
  formatPersonIdentity,
  normalizePersonIdentity,
} from "../lib/person-names";
import { run } from "../convex/seeding";
import { ARTICLES_1, ARTICLES_2, ARTICLES_3, ARTICLES_4 } from "../convex/seed";
import { DEMO_PEOPLE, normalizeDemoArticle } from "../convex/seed/people";
import { createFakeDb, handlerOf } from "./support/fake-convex";

test("person names keep compound parts, accents, apostrophes and hyphens", () => {
  assert.deepEqual(normalizePersonIdentity({
    givenNames: "  JEAN-RÉMY   ÉLOÏSE ", familyNames: " ndong   mba ",
  }), { givenNames: "Jean-Rémy Éloïse", familyNames: "NDONG MBA" });
  assert.equal(formatPersonIdentity({
    givenNames: "d’ANGELO", familyNames: "n'guéma-obame",
  }), "D’Angelo N'GUÉMA-OBAME");
});

test("known people are normalized without changing organisations or partial words", () => {
  const normalize = createPersonNameNormalizer([
    { givenNames: "Nadia", familyNames: "Ondo Mba" },
    { givenNames: "Nadia", familyNames: "Ondo" },
  ]);
  const text = "Nadia Ondo Mba cite Ivindo Capital et Nadia Ondo. XNadia OndoX.";
  const expected = "Nadia ONDO MBA cite Ivindo Capital et Nadia ONDO. XNadia OndoX.";
  assert.equal(normalize(text), expected);
  assert.equal(normalize(expected), expected);
});

test("the full demo corpus normalizes people while keeping identifiers and partner labels", () => {
  const articles = [...ARTICLES_1, ...ARTICLES_2, ...ARTICLES_3, ...ARTICLES_4];
  assert.equal(articles.length, 28);
  assert.equal(DEMO_PEOPLE.length, 51);
  for (const original of articles) {
    const normalized = normalizeDemoArticle(original);
    assert.equal(normalized.slug, original.slug);
    assert.equal(normalized.authorSlug, original.authorSlug);
    assert.equal(normalized.heroMediaKey, original.heroMediaKey);
    assert.equal(normalized.origin, original.origin);
    const text = JSON.stringify(normalized);
    for (const [givenNames, familyNames] of DEMO_PEOPLE) {
      assert.ok(!text.includes(`${givenNames} ${familyNames}`), `${original.slug}: ${givenNames} ${familyNames}`);
    }
    assert.deepEqual(normalizeDemoArticle(normalized), normalized);
  }
});

test("the first install writes 28 normalized articles and six authors without resetting", async () => {
  const fake = createFakeDb();
  const seed = handlerOf<{ reset: boolean }, { articles: number; authors: number }>(run);
  const result = await seed({ db: fake.db }, { reset: false });
  assert.equal(result.articles, 28);
  assert.equal(result.authors, 6);
  assert.equal(fake.all("articles").length, 28);
  assert.equal(fake.all("authors")[0].name, "Nadia ONDO MBA");
  const article = fake.all("articles").find(row => row.authorSlug === "nadia-ondo");
  assert.ok(article);
  assert.ok(fake.all("articleCounts").length > 0);
});

test("a nonempty journal refuses demo loading before writing or deleting anything", async () => {
  const fake = createFakeDb();
  fake.seed("categories", [{ slug: "actualites", name: "Actualités", order: 0 }]);
  const before = fake.all("categories");
  const seed = handlerOf<{ reset: boolean }, unknown>(run);
  await assert.rejects(seed({ db: fake.db }, { reset: false }), /journal vide/);
  assert.deepEqual(fake.all("categories"), before);
  assert.equal(fake.all("articles").length, 0);
  assert.equal(fake.all("authors").length, 0);
});
