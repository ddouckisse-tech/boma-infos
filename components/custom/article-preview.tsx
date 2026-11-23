"use client";

import { useQueries, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Block } from "@/convex/model/content";
import { ArticleBody } from "@/components/custom/article-body";
import { CloseButton } from "@/components/custom/close-button";
import { KeyPoints } from "@/components/custom/key-points";
import type { PickedMedia } from "@/components/custom/media-picker";
import { Modal } from "@/components/custom/modal";
import { PartnerTag } from "@/components/custom/partner-tag";
import { ResponsiveImage } from "@/components/custom/responsive-image";
import { getMediaAsset, type MediaAsset } from "@/lib/media";

export function ArticlePreview({
  open,
  onClose,
  article,
}: {
  open: boolean;
  onClose: () => void;
  article: PreviewArticle;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      label="Aperçu avant publication"
      variant="panel"
      className="lc-article-preview"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2 sm:px-6">
        <h2 className="type-body font-semibold">Aperçu avant publication</h2>
        <CloseButton onClick={onClose} />
      </header>
      {open && <PreviewContent article={article} />}
    </Modal>
  );
}

type PreviewArticle = {
  title: string;
  dek: string;
  body: readonly Block[];
  keyPoints: readonly string[];
  heroMediaKey: string;
  category?: string;
  author?: string;
  isPartner: boolean;
};

function PreviewContent({ article }: { article: PreviewArticle }) {
  const keys = new Set([article.heroMediaKey]);
  for (const block of article.body) {
    if (block.type === "image") keys.add(block.mediaKey);
    if (block.type === "video") keys.add(block.posterMediaKey);
  }
  const storedKeys = [...keys].filter((key) => key && !getMediaAsset(key));
  const requests: Record<
    string,
    { query: typeof api.library.byKeys; args: { keys: string[] } }
  > = {};
  for (let i = 0; i < storedKeys.length; i += 50) {
    requests[i] = {
      query: api.library.byKeys,
      args: { keys: storedKeys.slice(i, i + 50) },
    };
  }
  const results = useQueries(requests);
  const coverUrl = useQuery(
    api.library.previewUrl,
    storedKeys.includes(article.heroMediaKey)
      ? { key: article.heroMediaKey }
      : "skip"
  );
  const assets = new Map<string, MediaAsset>();
  for (const result of Object.values(results)) {
    if (!Array.isArray(result)) continue;
    for (const item of result as PickedMedia[]) {
      const url =
        (item.key === article.heroMediaKey && coverUrl) || item.thumbUrl;
      if (!url) continue;
      const variant = (url === coverUrl
        ? (item.variants.find((rendition) => rendition.w >= 640) ??
          item.variants.at(-1))
        : item.variants[0]) ?? { w: item.width, h: item.height, bytes: 0 };
      assets.set(item.key, {
        id: item.key,
        alt: item.alt,
        caption: "",
        credit: "",
        license: "",
        source: "",
        color: item.color,
        width: item.width,
        height: item.height,
        avif: [],
        webp: [variant],
        urls: { [`webp-${variant.w}`]: url },
      });
    }
  }
  const mediaFor = (key: string) => assets.get(key) ?? getMediaAsset(key);
  const cover = mediaFor(article.heroMediaKey);

  return (
    <div className="min-h-0 overflow-y-auto overscroll-contain">
      <article className="journal-main news-article">
        <div className="px-4 py-6 sm:px-8">
          <div className="news-article__intro">
            {(article.category || article.isPartner) && (
              <div className="mb-2 flex flex-wrap items-center gap-2 type-small font-semibold text-accent">
                {article.category}
                {article.isPartner && <PartnerTag size="small" />}
              </div>
            )}
            <h3 className="news-article__title font-display text-balance">
              {article.title || "Sans titre"}
            </h3>
            {article.dek && (
              <p className="news-article__dek text-muted-foreground">
                {article.dek}
              </p>
            )}
            {article.author && (
              <p className="mt-4 border-t border-border pt-3 type-small text-muted-foreground">
                Par {article.author}
              </p>
            )}
          </div>
          {cover && (
            <ResponsiveImage
              media={cover}
              sizes="(min-width: 768px) 760px, 100vw"
              wrapperClassName="news-article__photo mt-5"
            />
          )}
        </div>
        <div className="news-article__reading mx-auto px-4 pb-6 sm:px-8 sm:pb-8">
          {article.keyPoints.length > 0 && (
            <KeyPoints points={article.keyPoints} className="mb-6" />
          )}
          <ArticleBody blocks={article.body} mediaFor={mediaFor} />
        </div>
      </article>
    </div>
  );
}
