import assert from "node:assert/strict";
import { test } from "node:test";
import { article, homepage } from "../convex/journal";
import type { ArticleDetail, ArticleSummary } from "../convex/model/content";
import { run as seedDemo } from "../convex/seeding";
import {
  demoEnglishSearch,
  withDemoArticle,
  withDemoSummary,
} from "../lib/content/demo-edition";
import { createFakeDb, handlerOf } from "./support/fake-convex";

const lead = "ecotourisme-parcs-nationaux-pari-gabonais";

test("the published demo catalogue already contains 28 complete readable English editions", async () => {
  const { db, all } = createFakeDb();
  await handlerOf(seedDemo)({ db }, { reset: false });
  const read = handlerOf<{ slug: string }, ArticleDetail | null>(article);
  const rows = all("articles");
  assert.equal(rows.length, 28);
  for (const { slug } of rows) {
    const fr = await read({ db }, { slug: String(slug) });
    assert.ok(fr);
    assert.equal(fr.english, undefined);
    const en = withDemoArticle(fr)?.english;
    assert.ok(en, String(slug));
    assert.notEqual(en.title, fr.title);
    assert.notEqual(en.dek, fr.dek);
    assert.deepEqual(
      en.body.map(({ type }) => type),
      fr.body.map(({ type }) => type)
    );
    assert.equal(en.keyPoints.length, fr.keyPoints.length);
    assert.equal(withDemoSummary(fr).englishSummary?.title, en.title);
  }
});

test("the headline, opening, ending and search of the ecotourism lead are English", async () => {
  const { db } = createFakeDb();
  await handlerOf(seedDemo)({ db }, { reset: false });
  const front = await handlerOf<
    Record<string, never>,
    { lead: ArticleSummary }
  >(homepage)({ db }, {});
  const headline = withDemoSummary(front.lead);
  assert.equal(headline.slug, lead);
  assert.equal(
    headline.englishSummary?.title,
    "Ecotourism: Gabon’s national park gamble"
  );
  assert.match(headline.englishSummary?.dek ?? "", /Thirteen national parks/);
  const original = await handlerOf<{ slug: string }, ArticleDetail | null>(
    article
  )({ db }, { slug: lead });
  assert.ok(original);
  const english = withDemoArticle(original)?.english;
  assert.ok(english);
  assert.match(
    JSON.stringify(english.body[0]),
    /At Loango, elephants use the beach as a path/
  );
  assert.match(
    JSON.stringify(english.body.at(-1)),
    /\[National parks\]\(\/rubrique\/tourisme\/parcs-nationaux\)/
  );
  assert.ok(demoEnglishSearch("ecotourism national parks").includes(lead));

  // A publishable edit may retain its headline. The old body must not reappear.
  const edited = {
    ...original,
    body: [{ type: "paragraph" as const, text: "Un nouveau contenu." }],
  };
  assert.equal(withDemoArticle(edited)?.english, undefined);
});
