import { createHash } from "node:crypto";
import type { ArticleDetail, ArticleSummary } from "@/convex/model/content";
import {
  englishSearchText,
  translationSourceKey,
  type EnglishArticle,
} from "@/convex/model/translation";
import data from "./demo-editions.json";

type Edition = {
  title: string;
  dek: string;
  source: string;
  english: EnglishArticle;
};

type Profile = {
  role: string;
  bio: string;
  english: { role: string; bio: string };
};

const { editions, profiles } = data as unknown as {
  editions: Record<string, Edition>;
  profiles: Record<string, Profile>;
};

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
export function withDemoSummary<T extends ArticleSummary | null>(
  article: T
): T {
  if (!article || article.englishSummary) return article;
  const edition = editionFor(article);
  if (!edition) return article;
  const { title, dek, readingMinutes } = edition.english;
  return { ...article, englishSummary: { title, dek, readingMinutes } };
}

export function demoArticleEnglish(
  article: ArticleDetail
): EnglishArticle | undefined {
  const edition = editionFor(article);
  if (!edition) return undefined;
  const source = createHash("sha256")
    .update(comparable(translationSourceKey(article)))
    .digest("hex");
  return source === edition.source ? edition.english : undefined;
}

export function withDemoArticle(article: ArticleDetail | null) {
  if (!article || article.english) return article;
  const english = demoArticleEnglish(article);
  return english ? { ...withDemoSummary(article), english } : article;
}

export function withDemoProfile<
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
export function demoEnglishSearch(term: string): string[] {
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
