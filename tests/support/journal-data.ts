import type { Doc } from "../../convex/_generated/dataModel";
import { insertArticle } from "../../convex/model/articleWrites";
import type { FakeDb } from "./fake-convex";

/**
 * A deterministic archive shaped like the production one (19/09/2026): most
 * pieces in one section, a few sub-sections, a handful of featured stories,
 * tags mostly absent, bodies of about 6 Ko — and some drafts, ties on the
 * publication date and unused sections, which the reads must get right.
 */

/** Mulberry32: the same archive for the same seed. */
export function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SECTIONS = [
  { slug: "editorial", weight: 60, subs: [] as string[] },
  { slug: "business-lifestyle", weight: 8, subs: ["big-deal", "leader"] },
  { slug: "dossier-special", weight: 6, subs: [] },
  { slug: "succes-story", weight: 5, subs: ["femme-dirigeante"] },
  { slug: "espace-pro", weight: 4, subs: ["opportunites", "formation"] },
  { slug: "tribune", weight: 2, subs: [] },
  { slug: "interview", weight: 1, subs: [] },
  // Declared, active, never used: it must not appear on the home page.
  { slug: "vide", weight: 0, subs: [] },
];

const AUTHORS = ["boma-infos", "redaction-eco", "invite"];
/**
 * Sixty tags, a few pieces each — production has 123, mostly unique, and
 * named like these: proper nouns no body text repeats.
 */
const TAGS = [
  "BCEG",
  "Pétrole",
  "Banque centrale",
  "Mines",
  "Gabon Oil",
  "BAD",
  ...Array.from({ length: 54 }, (_, index) => `Filière${index + 10}z`),
];
const STATUSES: Doc<"articles">["status"][] = [
  "draft",
  "in_review",
  "submitted",
  "scheduled",
  "rejected",
];

export async function seedReferenceTables(fake: FakeDb) {
  let order = 0;
  for (const section of SECTIONS) {
    await fake.db.insert("categories", {
      name: `Rubrique ${section.slug}`,
      slug: section.slug,
      accent: "navy-900",
      order: (order += 1),
      description: `Description ${section.slug}`,
      isActive: true,
    });
    for (const sub of section.subs) {
      await fake.db.insert("categories", {
        name: `Sous-rubrique ${sub}`,
        slug: sub,
        parentSlug: section.slug,
        accent: "gold-800",
        order: (order += 1),
        description: "",
        isActive: true,
      });
    }
  }
  // An inactive section never shows on the home page either.
  await fake.db.insert("categories", {
    name: "Archivée",
    slug: "archivee",
    accent: "navy-900",
    order: 99,
    description: "",
    isActive: false,
  });
  for (const slug of AUTHORS) {
    await fake.db.insert("authors", {
      name: `Signature ${slug}`,
      slug,
      role: "Journaliste",
      bio: "",
      links: [],
    });
  }
}

export type ArchiveOptions = {
  seed: number;
  count: number;
  /** Share of articles carrying tags (production: about 12 %). */
  tagged?: number;
  /** Share of articles that are not published. */
  unpublished?: number;
};

export async function seedArchive(fake: FakeDb, options: ArchiveOptions) {
  const next = random(options.seed);
  const pick = <T>(values: readonly T[]) =>
    values[Math.floor(next() * values.length)];
  const totalWeight = SECTIONS.reduce((sum, row) => sum + row.weight, 0);
  const sectionOf = () => {
    let roll = next() * totalWeight;
    for (const section of SECTIONS) {
      roll -= section.weight;
      if (roll < 0) return section;
    }
    return SECTIONS[0];
  };

  const base = Date.UTC(2026, 8, 19);
  let previous = base;
  for (let index = 0; index < options.count; index += 1) {
    const section = sectionOf();
    const sub =
      section.subs.length > 0 && next() < 0.4 ? pick(section.subs) : undefined;
    const tags =
      next() < (options.tagged ?? 0.12)
        ? [...new Set([pick(TAGS), ...(next() < 0.3 ? [pick(TAGS)] : [])])]
        : [];
    const roll = next();
    const feature =
      roll < 0.004
        ? "lead"
        : roll < 0.02
          ? "top"
          : roll < 0.026
            ? "dossier"
            : "none";
    const status =
      next() < (options.unpublished ?? 0.05) ? pick(STATUSES) : "published";
    // Every tenth piece shares its publication time with the previous one.
    const publishedAt =
      index % 10 === 9 ? previous : base - Math.floor(next() * 4e10);
    previous = publishedAt;
    const text = `Paragraphe ${index} `.repeat(300);
    const slug = `article-${options.seed}-${index}`;
    await insertArticle({ db: fake.db } as never, {
      title: `Titre ${index}`,
      slug,
      dek: `Chapô ${index}`,
      body: [{ type: "paragraph", text }],
      status,
      categorySlug: section.slug,
      subCategorySlug: sub,
      authorSlug: pick(AUTHORS),
      heroMediaKey: `media-${index}`,
      galleryMediaKeys: [],
      keyPoints: [],
      seo: { description: "", keywords: [] },
      origin: next() < 0.05 ? "partenaire" : "redaction",
      feature,
      readingMinutes: 3,
      tags,
      createdAt: publishedAt,
      publishedAt,
      updatedAt: publishedAt + Math.floor(next() * 1e9),
      views: Math.floor(next() * 50),
      searchText: `Titre ${index} Chapô ${index} ${tags.join(" ")} ${text}`,
    });
    fake.tick(Math.floor(next() * 5));
  }
}
