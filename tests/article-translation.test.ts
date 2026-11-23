import assert from "node:assert/strict";
import { test } from "node:test";
import type { FunctionReturnType } from "convex/server";
import type { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";
import { article, homepage, search } from "../convex/journal";
import { patchArticle } from "../convex/model/articleWrites";
import {
  assembleEnglish,
  translationSource,
  translationStrings,
  type EnglishArticle,
} from "../convex/model/translation";
import { claim, finish } from "../convex/translation";
import { createFakeDb, handlerOf } from "./support/fake-convex";
import { seedArchive, seedReferenceTables } from "./support/journal-data";

const source = {
  title: "Le port ouvre",
  dek: "Trois quais sont prêts.",
  body: [
    { type: "heading", level: 2, text: "Les travaux" },
    { type: "paragraph", text: "Lire [l’annonce](/article/le-port)." },
    { type: "list", ordered: true, items: ["Trois quais"] },
    { type: "quote", text: "Nous sommes prêts.", attribution: "La direction" },
    { type: "image", mediaKey: "port", caption: "Le quai" },
    { type: "stat", value: "3", label: "Quais", source: "Le rapport" },
    {
      type: "video",
      title: "Une visite",
      posterMediaKey: "port",
      src: "/video.mp4",
      durationLabel: "2 minutes",
    },
  ],
  keyPoints: ["Trois quais"],
  tags: ["Maritime"],
  seo: { description: "Les travaux", keywords: ["Quais"] },
} satisfies ReturnType<typeof translationSource>;
const media = { port: { alt: "Le quai", caption: "À Owendo" } };
const author = { authorRole: "Journaliste", authorBio: "" };
const translations = new Map([
  ["Le port ouvre", "The port opens"],
  ["Trois quais sont prêts.", "Three berths are ready."],
  ["Les travaux", "The construction work"],
  [
    "Lire [l’annonce](/article/le-port).",
    "Read [the announcement](/article/le-port).",
  ],
  ["Trois quais", "Three berths"],
  ["Nous sommes prêts.", "We are ready."],
  ["La direction", "The management"],
  ["Le quai", "The quay"],
  ["3", "3"],
  ["Quais", "Berths"],
  ["Le rapport", "The report"],
  ["Une visite", "A tour"],
  ["2 minutes", "2 minutes"],
  ["Maritime", "Shipping"],
  ["À Owendo", "In Owendo"],
  ["Journaliste", "Reporter"],
]);

test("translates all editorial text while preserving block types, links and media", () => {
  assert.deepEqual(
    new Set(translationStrings(source, media, author)),
    new Set(translations.keys())
  );
  const english = assembleEnglish(source, media, author, translations);
  assert.deepEqual(english.body, [
    { type: "heading", level: 2, text: "The construction work" },
    { type: "paragraph", text: "Read [the announcement](/article/le-port)." },
    { type: "list", ordered: true, items: ["Three berths"] },
    { type: "quote", text: "We are ready.", attribution: "The management" },
    { type: "image", mediaKey: "port", caption: "The quay" },
    { type: "stat", value: "3", label: "Berths", source: "The report" },
    {
      type: "video",
      title: "A tour",
      posterMediaKey: "port",
      src: "/video.mp4",
      durationLabel: "2 minutes",
    },
  ]);
  assert.deepEqual(english.media.port, {
    alt: "The quay",
    caption: "In Owendo",
  });
  assert.deepEqual(english.keyPoints, ["Three berths"]);
  assert.deepEqual(english.tags, ["Shipping"]);
  assert.equal(english.authorRole, "Reporter");
});

test("rejects partial translations and changed link destinations", () => {
  assert.throws(
    () => assembleEnglish(source, media, author, new Map()),
    /Incomplete/
  );
  const broken = new Map(translations);
  broken.set(
    "Lire [l’annonce](/article/le-port).",
    "Read [the announcement](/elsewhere)."
  );
  assert.throws(
    () => assembleEnglish(source, media, author, broken),
    /changed an article link/
  );
});

test("publishes and indexes the English edition, and ignores late translations after an edit", async () => {
  const fake = createFakeDb();
  const ctx = { db: fake.db };
  await seedReferenceTables(fake);
  await seedArchive(fake, { seed: 2, count: 1, unpublished: 0 });
  const row = fake.all("articles")[0] as unknown as Doc<"articles">;
  await fake.db.patch(row._id, { ...source, feature: "lead" });
  await fake.db.insert("articles", {
    ...source,
    slug: "private-draft",
    status: "draft",
    categorySlug: row.categorySlug,
    authorSlug: row.authorSlug,
  });

  type Job = { id: string; claimedUntil: number };
  type Result = FunctionReturnType<typeof api.journal.article>;
  const getJobs = handlerOf<Record<string, never>, Job[]>(claim);
  const [job] = await getJobs(ctx, {});
  assert.equal(job.id, row._id);
  assert.deepEqual(await getJobs(ctx, {}), []);
  const english = assembleEnglish(source, media, author, translations);
  const save = handlerOf<
    Job & { english: EnglishArticle; sourceAuthor: typeof author },
    void
  >(finish);
  await save(ctx, { ...job, english, sourceAuthor: author });

  const get = handlerOf<{ slug: string }, Result>(article);
  const published = await get(ctx, { slug: row.slug });
  assert.equal(published?.title, "Le port ouvre");
  assert.equal(published?.english?.title, "The port opens");
  assert.equal(published?.englishSummary?.dek, "Three berths are ready.");
  assert.equal(await get(ctx, { slug: "private-draft" }), null);
  const front = await handlerOf<
    Record<string, never>,
    FunctionReturnType<typeof api.journal.homepage>
  >(homepage)(ctx, {});
  assert.equal(front.lead?.englishSummary?.title, "The port opens");

  const find = handlerOf<
    { term: string; limit: number; locale?: "en" },
    FunctionReturnType<typeof api.journal.search>
  >(search);
  assert.equal(
    (await find(ctx, { term: "shipping", limit: 5, locale: "en" }))[0]?.slug,
    row.slug
  );
  assert.deepEqual(await find(ctx, { term: "shipping", limit: 5 }), []);

  const edited = (await fake.db.get(row._id)) as unknown as Doc<"articles">;
  await patchArticle(ctx as never, edited, {
    seo: { keywords: ["Quais"], description: "Les travaux" },
  });
  assert.equal(
    (await get(ctx, { slug: row.slug }))?.english?.title,
    "The port opens"
  );

  await patchArticle(ctx as never, edited, { title: "Le port rouvre" });
  const [nextJob] = await getJobs(ctx, {});
  assert.equal(nextJob.id, row._id);
  // Simulate an edit while the translator works.
  const translating = (await fake.db.get(
    row._id
  )) as unknown as Doc<"articles">;
  await patchArticle(ctx as never, translating, { title: "Le port attend" });
  await save(ctx, { ...nextJob, english, sourceAuthor: author });
  assert.equal((await get(ctx, { slug: row.slug }))?.english, undefined);
  assert.deepEqual(
    await find(ctx, { term: "shipping", limit: 5, locale: "en" }),
    []
  );
});
