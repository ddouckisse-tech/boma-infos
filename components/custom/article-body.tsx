import { LocalizedText } from "@/components/custom/localized-text";
import { HeavyMedia } from "@/components/custom/heavy-media";
import { ResponsiveImage } from "@/components/custom/responsive-image";
import { RichText } from "@/components/custom/rich-text";
import { getMediaAsset, SIZES, type MediaAsset } from "@/lib/media";
import { slugifyHeading } from "@/lib/headings";
import type { Block } from "@/convex/model/content";

/**
 * Renders the article body.
 *
 * Typography is the product (CDC §3.2): the reading column is capped at the
 * 65–75 character measure, the leading is 1,7, the body is 17 px on mobile
 * and 19 px above, and nothing is ever justified. Headings keep a continuous
 * hierarchy under the page's single `<h1>` and carry an `id` so the table of
 * contents can link to them.
 */

function PullQuote({
  text,
  attribution,
}: {
  text: string;
  attribution?: string;
}) {
  // L'emphase de la citation se balise comme
  // dans un paragraphe : `*les mots à retenir*`. Sa fonte n'est jamais
  // préchargée : seule une citation qui s'en sert la fait télécharger, et
  // `data-face` le signale au contrôle de budget (CDC §5.4), qui la compte.
  const emphasised = /\*[^*]+\*/.test(text);
  return (
    <figure
      data-face={emphasised ? "emphase" : undefined}
      className="boma-quote my-8 border-s-2 border-border-strong ps-5 text-foreground sm:ps-6"
    >
      <blockquote className="font-display type-h2 leading-snug text-balance">
        <RichText text={text} />
      </blockquote>
      {attribution && (
        <figcaption className="mt-4 type-small text-muted-foreground">
          — {attribution}
        </figcaption>
      )}
    </figure>
  );
}

function StatBlock({
  value,
  label,
  source,
}: {
  value: string;
  label: string;
  source?: string;
}) {
  return (
    <div className="my-8 border-s-2 border-border-strong ps-5 sm:ps-6">
      <p
        data-numeric
        className="font-display type-display leading-none text-foreground"
      >
        {value}
      </p>
      <p className="mt-2 type-body text-foreground">{label}</p>
      {source && (
        <p className="mt-1 type-small text-muted-foreground">
          <LocalizedText fr="Source : " en="Source: " />
          {source}
        </p>
      )}
    </div>
  );
}

function Figure({ media, caption }: { media?: MediaAsset; caption?: string }) {
  if (!media) return null;
  const legend = caption ?? media.caption;

  return (
    <figure className="my-8">
      <ResponsiveImage
        media={media}
        sizes={SIZES.inline}
        maxWidth={768}
        wrapperClassName="aspect-video"
      />
      {(legend || media.credit) && (
        <figcaption className="mt-2 type-small text-muted-foreground">
          {legend}
          {media.credit && (
            <>
              {legend ? " " : ""}
              <span className="text-muted-foreground">
                ({media.credit}
                {media.license ? `, ${media.license}` : ""})
              </span>
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}

export function ArticleBody({
  blocks,
  sourceBlocks = blocks,
  mediaFor = getMediaAsset,
}: {
  blocks: readonly Block[];
  sourceBlocks?: readonly Block[];
  mediaFor?: (key: string) => MediaAsset | undefined;
}) {
  return (
    <div className="article-body type-body text-foreground">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        switch (block.type) {
          case "paragraph":
            return (
              <p key={key}>
                <RichText text={block.text} />
              </p>
            );

          case "heading": {
            const source = sourceBlocks[index];
            const id = slugifyHeading(
              source?.type === "heading" ? source.text : block.text
            );
            return block.level === 2 ? (
              <h2 key={key} id={id} className="font-display type-h2">
                {block.text}
              </h2>
            ) : (
              <h3 key={key} id={id} className="font-display type-h3">
                {block.text}
              </h3>
            );
          }

          case "list":
            return block.ordered ? (
              <ol key={key} className="list-decimal space-y-2 ps-6">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="ps-1">
                    <RichText text={item} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={key} className="list-disc space-y-2 ps-6">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="ps-1">
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            );

          case "quote":
            return (
              <PullQuote
                key={key}
                text={block.text}
                attribution={block.attribution}
              />
            );

          case "stat":
            return (
              <StatBlock
                key={key}
                value={block.value}
                label={block.label}
                source={block.source}
              />
            );

          case "image":
            return (
              <Figure
                key={key}
                media={mediaFor(block.mediaKey)}
                caption={block.caption}
              />
            );

          case "video":
            return (
              <div key={key} className="my-8">
                <HeavyMedia
                  title={block.title}
                  poster={mediaFor(block.posterMediaKey)}
                  src={block.src}
                  durationLabel={block.durationLabel}
                />
              </div>
            );
        }
      })}
    </div>
  );
}
