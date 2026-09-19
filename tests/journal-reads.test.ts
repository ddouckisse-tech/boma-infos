import assert from "node:assert/strict";
import { test } from "node:test";
import type { Doc } from "../convex/_generated/dataModel";
import {
  authorBySlug,
  authors,
  bySection,
  homepage,
  publishedSlugPage,
  related,
  sectionCounts,
} from "../convex/journal";
import { insertArticle } from "../convex/model/articleWrites";
import { createFakeDb, handlerOf, type FakeDb } from "./support/fake-convex";
import { seedArchive, seedReferenceTables } from "./support/journal-data";

/*
 * The journal's public reads, checked against the algorithms they replace
 * (convex/journal.ts at 882d2c3, which read every published article): same
 * answers, for a fraction of the reads — and a fraction that does not grow
 * with the archive.
 */

type Article = Doc<"articles">;

async function archive(count: number, seed = 7, tagged = 0.12) {
  const fake = createFakeDb();
  await seedReferenceTables(fake);
  await seedArchive(fake, { seed, count, tagged });
  fake.resetReads();
  return fake;
}

/* --------------------------------------------- reference (882d2c3) */

function lookupOf(fake: FakeDb) {
  return {
    categories: new Map(
      fake.all("categories").map((row) => [row.slug as string, row])
    ),
    authors: new Map(
      fake.all("authors").map((row) => [row.slug as string, row])
    ),
  };
}

function toSummary(article: Article, lookup: ReturnType<typeof lookupOf>) {
  const category = lookup.categories.get(article.categorySlug);
  const sub = article.subCategorySlug
    ? lookup.categories.get(article.subCategorySlug)
    : undefined;
  const author = lookup.authors.get(article.authorSlug);
  return {
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    categorySlug: article.categorySlug,
    categoryName: (category?.name as string) ?? article.categorySlug,
    categoryAccent: (category?.accent as string) ?? "navy-900",
    subCategorySlug: article.subCategorySlug,
    subCategoryName: sub?.name as string | undefined,
    authorSlug: article.authorSlug,
    authorName: (author?.name as string) ?? "La rédaction",
    heroMediaKey: article.heroMediaKey,
    publishedAt: article.publishedAt,
    readingMinutes: article.readingMinutes,
    origin: article.origin,
    feature: article.feature,
  };
}

/** `by_status_date`, published, newest first — what every old query started from. */
function publishedNewestFirst(fake: FakeDb): Article[] {
  return (fake.all("articles") as unknown as Article[])
    .filter((row) => row.status === "published")
    .sort(
      (a, b) =>
        b.publishedAt - a.publishedAt || b._creationTime - a._creationTime
    );
}

function referenceHomepage(fake: FakeDb) {
  const lookup = lookupOf(fake);
  const summaries = publishedNewestFirst(fake).map((row) =>
    toSummary(row, lookup)
  );
  const lead = summaries.find((item) => item.feature === "lead") ?? null;
  const dossier = summaries.find((item) => item.feature === "dossier") ?? null;
  const top = summaries
    .filter((item) => item.feature === "top" && item.slug !== lead?.slug)
    .slice(0, 4);
  const taken = new Set(
    [lead?.slug, dossier?.slug, ...top.map((item) => item.slug)].filter(
      Boolean
    ) as string[]
  );
  const sections = [...lookup.categories.values()]
    .filter((row) => !row.parentSlug && row.isActive)
    .sort((a, b) => (a.order as number) - (b.order as number));
  const bySection = sections
    .filter((section) => section.slug !== "espace-pro")
    .map((section) => ({
      slug: section.slug as string,
      name: section.name as string,
      accent: section.accent as string,
      description: section.description as string,
      articles: summaries
        .filter((item) => item.categorySlug === section.slug)
        .slice(0, 3),
    }))
    .filter((section) => section.articles.length > 0);
  return {
    lead,
    top,
    dossier,
    latest: summaries.filter((item) => !taken.has(item.slug)).slice(0, 6),
    bySection,
    espacePro: summaries
      .filter((item) => item.categorySlug === "espace-pro")
      .slice(0, 4),
  };
}

function referenceRelated(fake: FakeDb, slug: string, limit: number) {
  const lookup = lookupOf(fake);
  const current = (fake.all("articles") as unknown as Article[]).find(
    (row) => row.slug === slug
  );
  if (!current) return [];
  const tags = new Set(current.tags);
  const score = (row: Article) => {
    let value = 0;
    if (
      current.subCategorySlug &&
      row.subCategorySlug === current.subCategorySlug
    ) {
      value += 4;
    }
    if (row.categorySlug === current.categorySlug) value += 2;
    value += row.tags.filter((tag) => tags.has(tag)).length;
    return value;
  };
  return publishedNewestFirst(fake)
    .filter((row) => row.slug !== slug)
    .map((row) => ({ row, value: score(row) }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value || b.row.publishedAt - a.row.publishedAt)
    .slice(0, limit)
    .map((entry) => toSummary(entry.row, lookup));
}

function referenceSection(
  fake: FakeDb,
  args: {
    categorySlug: string;
    subCategorySlug?: string;
    page: number;
    perPage: number;
    order: "recent" | "ancien";
  }
) {
  const lookup = lookupOf(fake);
  const rows = (fake.all("articles") as unknown as Article[])
    .filter(
      (row) =>
        row.status === "published" &&
        (args.subCategorySlug
          ? row.subCategorySlug === args.subCategorySlug
          : row.categorySlug === args.categorySlug)
    )
    .sort(
      (a, b) =>
        a.publishedAt - b.publishedAt || a._creationTime - b._creationTime
    );
  if (args.order === "recent") rows.reverse();
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / args.perPage));
  const safePage = Math.min(Math.max(1, args.page), pageCount);
  const items = rows
    .slice((safePage - 1) * args.perPage, safePage * args.perPage)
    .map((row) => toSummary(row, lookup));
  return { items, total, page: safePage, pageCount };
}

/* ---------------------------------------------------------------- tests */

const run = <Args, Result>(fn: unknown, fake: FakeDb, args: Args) =>
  handlerOf<Args, Result>(fn)({ db: fake.db }, args);

test("accueil : mêmes blocs que la lecture de toute la table", async () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    const fake = await archive(600, seed);
    const expected = referenceHomepage(fake);
    const actual = await run(homepage, fake, {});
    assert.deepEqual(actual, expected, `archive ${seed}`);
  }
});

test("accueil : les lectures ne grandissent pas avec l'archive", async () => {
  const small = await archive(300);
  await run(homepage, small, {});
  const large = await archive(3000);
  await run(homepage, large, {});
  // Sixty-odd articles plus the section tree, whatever the archive.
  assert.ok(small.reads.documents <= 80, `${small.reads.documents} documents`);
  assert.ok(
    large.reads.documents <= small.reads.documents + 5,
    `${large.reads.documents} contre ${small.reads.documents}`
  );
  assert.ok(large.reads.bytes < 600_000, `${large.reads.bytes} octets`);
});

test("articles liés : identiques sans étiquettes partagées, et bornés", async () => {
  const fake = await archive(1200, 11, 0);
  const slugs = publishedNewestFirst(fake).map((row) => row.slug);
  for (const slug of slugs.filter((_, index) => index % 37 === 0)) {
    for (const limit of [2, 5]) {
      fake.resetReads();
      const actual = await run(related, fake, { slug, limit });
      assert.deepEqual(actual, referenceRelated(fake, slug, limit), slug);
      assert.ok(fake.reads.documents <= 2 * (limit + 1) + 20);
    }
  }
});

test("articles liés : une étiquette partagée hors rubrique est trouvée", async () => {
  const fake = await archive(800, 5, 0.3);
  const articles = publishedNewestFirst(fake);
  let checked = 0;
  let elsewhere = 0;
  for (const current of articles.filter((row) => row.tags.length > 0)) {
    // Twelve, the cap: small sections run out and the tags fill the rest.
    const expected = referenceRelated(fake, current.slug, 12);
    const actual = (await run(related, fake, {
      slug: current.slug,
      limit: 12,
    })) as ReturnType<typeof referenceRelated>;
    // The search index surfaces the tagged candidates: the answer matches as
    // long as they fit in its first twelve results, the article aside.
    const shared = articles.filter(
      (row) =>
        row.slug !== current.slug &&
        row.tags.some((tag) => current.tags.includes(tag))
    );
    if (shared.length <= 12) {
      assert.deepEqual(actual, expected, current.slug);
      checked += 1;
      if (expected.some((item) => item.categorySlug !== current.categorySlug)) {
        elsewhere += 1;
      }
    }
  }
  assert.ok(checked > 100, `${checked} articles vérifiés`);
  // Pieces of another section, reached through their tags only.
  assert.ok(elsewhere > 0, `${elsewhere} réponses hors rubrique`);
});

test("articles liés : l'étiquette l'emporte sur la date, même dans une archive ancienne", async () => {
  const fake = createFakeDb();
  await seedReferenceTables(fake);
  const day = 86_400_000;
  const add = (slug: string, fields: Partial<Article>) =>
    insertArticle({ db: fake.db } as never, {
      title: slug,
      slug,
      dek: "",
      body: [],
      status: "published",
      categorySlug: "editorial",
      authorSlug: "le-corporate",
      galleryMediaKeys: [],
      keyPoints: [],
      seo: { description: "", keywords: [] },
      origin: "redaction",
      feature: "none",
      readingMinutes: 1,
      tags: [],
      createdAt: 0,
      publishedAt: 0,
      updatedAt: 0,
      views: 0,
      searchText: `${slug} ${(fields.tags ?? []).join(" ")}`,
      ...fields,
    });
  // The oldest pieces of the archive carry the tags.
  await add("ancien-mines", { tags: ["Mines"], publishedAt: day });
  await add("ancien-bceg", { tags: ["BCEG"], publishedAt: 2 * day });
  for (let index = 0; index < 40; index += 1) {
    await add(`recent-${index}`, { publishedAt: (100 + index) * day });
  }
  await add("courant-editorial", { tags: ["Mines"], publishedAt: 200 * day });
  await add("courant-interview", {
    tags: ["BCEG"],
    categorySlug: "interview",
    publishedAt: 201 * day,
  });

  const slugsOf = (rows: unknown) =>
    (rows as { slug: string }[]).map((row) => row.slug);
  // Same section and a shared tag (3) beat the same section alone (2).
  const editorial = await run(related, fake, {
    slug: "courant-editorial",
    limit: 2,
  });
  assert.deepEqual(
    slugsOf(editorial),
    slugsOf(referenceRelated(fake, "courant-editorial", 2))
  );
  assert.equal(slugsOf(editorial)[0], "ancien-mines");
  // Alone in its section: the only other piece sharing a tag.
  const interview = await run(related, fake, {
    slug: "courant-interview",
    limit: 2,
  });
  assert.deepEqual(slugsOf(interview), ["ancien-bceg"]);
});

test("rubrique : pages, ordre et total comme avant, sans lire toute la rubrique", async () => {
  const fake = await archive(900, 3);
  const cases = [
    { categorySlug: "editorial", page: 1, perPage: 9, order: "recent" },
    { categorySlug: "editorial", page: 4, perPage: 9, order: "recent" },
    { categorySlug: "editorial", page: 2, perPage: 9, order: "ancien" },
    { categorySlug: "editorial", page: 999, perPage: 9, order: "recent" },
    { categorySlug: "editorial", page: 0, perPage: 9, order: "recent" },
    { categorySlug: "tribune", page: 1, perPage: 9, order: "recent" },
    { categorySlug: "vide", page: 1, perPage: 9, order: "recent" },
    {
      categorySlug: "business-lifestyle",
      subCategorySlug: "big-deal",
      page: 1,
      perPage: 9,
      order: "recent",
    },
  ] as const;
  for (const args of cases) {
    fake.resetReads();
    const actual = await run(bySection, fake, args);
    assert.deepEqual(
      actual,
      referenceSection(fake, args),
      JSON.stringify(args)
    );
    if (args.page === 1) {
      // The page, one more to know whether another follows, and the tree.
      assert.ok(
        fake.reads.documents <= args.perPage + 1 + 30,
        `${fake.reads.documents} documents`
      );
    }
  }
});

test("rubrique : le total vient des compteurs quand la liste continue", async () => {
  const fake = await archive(900, 3);
  const editorial = referenceSection(fake, {
    categorySlug: "editorial",
    page: 1,
    perPage: 9,
    order: "recent",
  });
  assert.ok(editorial.total > 100);
  const actual = (await run(bySection, fake, {
    categorySlug: "editorial",
    page: 1,
    perPage: 9,
    order: "recent",
  })) as typeof editorial;
  assert.equal(actual.total, editorial.total);
  assert.equal(actual.pageCount, editorial.pageCount);
});

test("compteurs publics : rubriques et auteurs comme le parcours complet", async () => {
  const fake = await archive(700, 9);
  const published = publishedNewestFirst(fake);

  const perSection = new Map<string, number>();
  for (const row of published) {
    perSection.set(
      row.categorySlug,
      (perSection.get(row.categorySlug) ?? 0) + 1
    );
    if (row.subCategorySlug) {
      perSection.set(
        row.subCategorySlug,
        (perSection.get(row.subCategorySlug) ?? 0) + 1
      );
    }
  }
  const counts = (await run(sectionCounts, fake, {})) as {
    slug: string;
    count: number;
  }[];
  assert.deepEqual(
    new Map(counts.map((row) => [row.slug, row.count])),
    perSection
  );

  const list = (await run(authors, fake, {})) as {
    slug: string;
    articleCount: number;
  }[];
  for (const author of list) {
    assert.equal(
      author.articleCount,
      published.filter((row) => row.authorSlug === author.slug).length,
      author.slug
    );
  }
  // Counts read the counters, never an article.
  fake.resetReads();
  await run(sectionCounts, fake, {});
  await run(authors, fake, {});
  assert.ok(fake.reads.documents < 40, `${fake.reads.documents} documents`);
});

test("page auteur : les 24 derniers et le total", async () => {
  const fake = await archive(700, 9);
  const signed = publishedNewestFirst(fake).filter(
    (row) => row.authorSlug === "le-corporate"
  );
  const result = (await run(authorBySlug, fake, { slug: "le-corporate" })) as {
    articles: { slug: string }[];
    total: number;
  };
  assert.equal(result.total, signed.length);
  assert.deepEqual(
    result.articles.map((row) => row.slug),
    signed.slice(0, 24).map((row) => row.slug)
  );
});

test("slugs publiés : les pages couvrent tout l'ordre de la table", async () => {
  const fake = await archive(450, 4);
  const expected = publishedNewestFirst(fake).map((row) => row.slug);
  const seen: string[] = [];
  let cursor: string | null = null;
  for (;;) {
    fake.resetReads();
    const result = (await run(publishedSlugPage, fake, {
      cursor,
      numItems: 100,
    })) as {
      page: { slug: string }[];
      continueCursor: string;
      isDone: boolean;
    };
    assert.ok(fake.reads.documents <= 100);
    seen.push(...result.page.map((row) => row.slug));
    if (result.isDone) break;
    cursor = result.continueCursor;
  }
  assert.deepEqual(seen, expected);
});

test("tailles demandées par l'appelant : plafonnées", async () => {
  const fake = await archive(400, 2);
  fake.resetReads();
  await run(related, fake, {
    slug: publishedNewestFirst(fake)[0].slug,
    limit: 1_000_000,
  });
  assert.ok(fake.reads.documents < 80, `${fake.reads.documents} documents`);
  fake.resetReads();
  await run(publishedSlugPage, fake, { cursor: null, numItems: 1_000_000 });
  assert.ok(fake.reads.documents <= 200);
});
