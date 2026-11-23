import { v, type Infer } from "convex/values";
import { blockValidator, seoValidator } from "./content";
import { readingMinutes, searchText } from "./text";

export const translationSourceFields = {
  title: v.string(),
  dek: v.string(),
  body: v.array(blockValidator),
  keyPoints: v.array(v.string()),
  tags: v.array(v.string()),
  seo: seoValidator,
};

const mediaText = v.object({ alt: v.string(), caption: v.string() });

export const englishArticleValidator = v.object({
  ...translationSourceFields,
  media: v.record(v.string(), mediaText),
  readingMinutes: v.number(),
  authorRole: v.string(),
  authorBio: v.string(),
});

export type EnglishArticle = Infer<typeof englishArticleValidator>;
type Source = Pick<EnglishArticle, keyof typeof translationSourceFields>;
type MediaText = EnglishArticle["media"];
type AuthorText = Pick<EnglishArticle, "authorRole" | "authorBio">;

export function translationSource(row: Source): Source {
  const { title, dek, body, keyPoints, tags, seo } = row;
  return { title, dek, body, keyPoints, tags, seo };
}

/** Convex and the editor may serialise the same object keys in different orders. */
export function translationSourceKey(row: Source) {
  return JSON.stringify(translationSource(row), (_key, value: unknown) => {
    if (value === null || typeof value !== "object" || Array.isArray(value))
      return value;
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, (value as Record<string, unknown>)[key]])
    );
  });
}

/** Apply translations to text fields only. Media keys, links and block structure stay intact. */
function mapText(
  article: Source,
  media: MediaText,
  author: AuthorText,
  text: (value: string) => string
) {
  const optional = (value?: string) =>
    value === undefined ? undefined : text(value);

  return {
    authorRole: text(author.authorRole),
    authorBio: text(author.authorBio),
    title: text(article.title),
    dek: text(article.dek),
    keyPoints: article.keyPoints.map(text),
    tags: article.tags.map(text),
    seo: {
      title: optional(article.seo.title),
      description: text(article.seo.description),
      keywords: article.seo.keywords.map(text),
    },
    body: article.body.map((block) => {
      switch (block.type) {
        case "paragraph":
        case "heading":
          return { ...block, text: text(block.text) };
        case "quote":
          return {
            ...block,
            text: text(block.text),
            attribution: optional(block.attribution),
          };
        case "list":
          return { ...block, items: block.items.map(text) };
        case "stat":
          return {
            ...block,
            value: text(block.value),
            label: text(block.label),
            source: optional(block.source),
          };
        case "image":
          return { ...block, caption: optional(block.caption) };
        case "video":
          return {
            ...block,
            title: text(block.title),
            durationLabel: optional(block.durationLabel),
          };
      }
    }),
    media: Object.fromEntries(
      Object.entries(media).map(([key, { alt, caption }]) => [
        key,
        { alt: text(alt), caption: text(caption) },
      ])
    ),
  };
}

export function translationStrings(
  article: Source,
  media: MediaText,
  author: AuthorText
) {
  const values = new Set<string>();
  mapText(article, media, author, (value) => {
    if (value.trim()) values.add(value);
    return value;
  });
  return [...values];
}

export function assembleEnglish(
  article: Source,
  media: MediaText,
  author: AuthorText,
  translations: ReadonlyMap<string, string>
): EnglishArticle {
  const mapped = mapText(article, media, author, (value) => {
    if (!value.trim()) return value;
    const translated = translations.get(value)?.trim();
    if (!translated) throw new Error("Incomplete English translation");
    const links = (text: string) =>
      [...text.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map((match) => match[1]);
    if (JSON.stringify(links(value)) !== JSON.stringify(links(translated))) {
      throw new Error("Translation changed an article link");
    }
    return translated;
  });
  return {
    ...mapped,
    readingMinutes: readingMinutes(mapped.title, mapped.dek, mapped.body),
  };
}

export const englishSearchText = (article: EnglishArticle) =>
  searchText(article.title, article.dek, article.tags, article.body);
