import {
  ARTICLES_1,
  ARTICLES_2,
  ARTICLES_3,
  ARTICLES_4,
  AUTHORS,
} from "@/convex/seed";

const articleSlugs = new Set(
  [...ARTICLES_1, ...ARTICLES_2, ...ARTICLES_3, ...ARTICLES_4].map(
    ({ slug }) => slug
  )
);
const authorSlugs = new Set(AUTHORS.map(({ slug }) => slug));

export const isDemoArticle = (slug: string) => articleSlugs.has(slug);
export const isDemoAuthor = (slug: string) => authorSlugs.has(slug);
