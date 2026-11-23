import { ArticlePage, articleMetadata } from "./article-page";
import { getRecentSlugs } from "@/lib/content/server";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  // The archive renders on first visit with ISR; prebuild the latest edition.
  const slugs = await getRecentSlugs(30);
  return slugs.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/article/[slug]">) {
  return articleMetadata((await params).slug, "fr");
}

export default async function FrenchArticlePage({
  params,
}: PageProps<"/article/[slug]">) {
  return <ArticlePage slug={(await params).slug} locale="fr" />;
}
