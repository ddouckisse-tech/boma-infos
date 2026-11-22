import type { Block } from "@/convex/model/content";
import { fallbackVariant, getMediaAsset, variantUrl } from "@/lib/media";
import { absoluteUrl } from "@/lib/site";

type ArticleImages = {
  heroMediaKey?: string;
  body: readonly Block[];
  galleryMediaKeys: readonly string[];
};

export function articleImageSources(article: ArticleImages) {
  const keys = new Set([article.heroMediaKey]);
  for (const block of article.body) {
    if (block.type === "image") keys.add(block.mediaKey);
    if (block.type === "video") keys.add(block.posterMediaKey);
  }
  article.galleryMediaKeys.forEach((key) => keys.add(key));

  return [...keys].flatMap((key) => {
    const media = getMediaAsset(key);
    if (!media || media.webp.length === 0) return [];
    const variant = fallbackVariant(media, 1280);
    const source = variantUrl(media, variant.w, "webp");
    return [{ media, source, variant }];
  });
}

export const socialImageSize = { width: 1200, height: 630 } as const;

export const socialImageUrl = (slug: string, version: number) =>
  absoluteUrl(
    `/article/${encodeURIComponent(slug)}/opengraph-image?v=${version}`
  );
