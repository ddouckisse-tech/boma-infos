import { createHash } from "node:crypto";
import type { ArticleDetail, ArticleSummary } from "@/convex/model/content";
import {
  englishSearchText,
  translationSourceKey,
  type EnglishArticle,
} from "@/convex/model/translation";
import demoData from "./demo-editions.json";
import publishedData from "./published-editions.json";

type Edition = {
  title: string;
  dek: string;
  source: string;
  alternateSources?: string[];
  english: EnglishArticle;
};

type Profile = {
  role: string;
  bio: string;
  english: { role: string; bio: string };
};

const demo = demoData as unknown as {
  editions: Record<string, Edition>;
  profiles: Record<string, Profile>;
};
const published = publishedData as unknown as Record<string, Edition>;
const editions = { ...demo.editions, ...published };
const { profiles } = demo;

export function hasBundledEditorialEdition(slug: string) {
  return Object.hasOwn(published, slug);
}

const comparable = (text: string) =>
  text.replace(/[\u00a0\u202f]/g, " ").toLowerCase();

function editionFor(article: Pick<ArticleSummary, "slug" | "title" | "dek">) {
  if (!Object.hasOwn(editions, article.slug)) return undefined;
  const entry = editions[article.slug];
  if (
    comparable(entry.title) !== comparable(article.title) ||
    comparable(entry.dek) !== comparable(article.dek)
  )
    return undefined;
  return entry;
}

/** Only attach translations to the published source they were written for. */
export function withArticleSummaryEdition<T extends ArticleSummary | null>(
  article: T
): T {
  if (!article || article.englishSummary) return article;
  const edition = editionFor(article);
  if (!edition) return article;
  const { title, dek, readingMinutes } = edition.english;
  return { ...article, englishSummary: { title, dek, readingMinutes } };
}

export function bundledArticleEnglish(
  article: ArticleDetail
): EnglishArticle | undefined {
  const edition = editionFor(article);
  if (!edition) return undefined;
  const source = createHash("sha256")
    .update(comparable(translationSourceKey(article)))
    .digest("hex");
  if (source === edition.source || edition.alternateSources?.includes(source)) {
    return edition.english;
  }
  return undefined;
}

export function withArticleEdition(article: ArticleDetail | null) {
  if (!article || article.english) return article;
  const english = bundledArticleEnglish(article);
  return english ? { ...withArticleSummaryEdition(article), english } : article;
}

export function withAuthorEdition<
  T extends {
    slug: string;
    role: string;
    bio: string;
    englishProfile?: Profile["english"];
  },
>(author: T): T {
  if (author.englishProfile || !Object.hasOwn(profiles, author.slug))
    return author;
  const profile = profiles[author.slug];
  return comparable(profile.role) === comparable(author.role) &&
    comparable(profile.bio) === comparable(author.bio)
    ? { ...author, englishProfile: profile.english }
    : author;
}

const words = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu) ?? [];

const indexedEditions = Object.entries(editions).map(([slug, { english }]) => ({
  slug,
  headline: new Set(words(`${english.title} ${english.dek}`)),
  body: new Set(words(englishSearchText(english))),
}));

/** The caller still checks publication status and the current source in Convex. */
export function bundledEnglishSearch(term: string): string[] {
  const query = [...new Set(words(term))];
  if (query.length === 0) return [];
  return indexedEditions
    .filter(({ body }) => query.every((word) => body.has(word)))
    .map(({ slug, headline }) => ({
      slug,
      rank: query.filter((word) => headline.has(word)).length,
    }))
    .sort((a, b) => b.rank - a.rank)
    .map(({ slug }) => slug);
}
