import {
  ArticlePage,
  articleMetadata,
} from "@/app/(journal)/article/[slug]/article-page";

import { getRecentSlugs } from "@/lib/content/server";

export const revalidate = 300;

// Prerender the recent English edition. Older stories are cached on demand.
export async function generateStaticParams() {
  const slugs = await getRecentSlugs(12);
  return slugs
    .filter(({ hasEnglish }) => hasEnglish)
    .map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return articleMetadata((await params).slug, "en");
}

export default async function EnglishArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <ArticlePage slug={(await params).slug} locale="en" />;
}
