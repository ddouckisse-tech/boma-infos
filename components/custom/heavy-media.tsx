"use client";

import { useState } from "react";
import { Play, WifiOff } from "lucide-react";
import { ResponsiveImage } from "@/components/custom/responsive-image";
import { usePreferences } from "@/components/providers/preferences-provider";
import { SIZES, type MediaAsset } from "@/lib/media-core";

/**
 * Video, and anything else expensive enough to be worth an explicit consent.
 *
 * Nothing is preloaded: `preload="none"` and no `<video>` element at all
 * until the reader asks for one. In data-saver mode even the poster frame is
 * dropped, and the block becomes a plain button stating what it will cost
 * (CDC §2.2 — « médias non essentiels remplacés par un espace réservé
 * cliquable »).
 *
 * Client component by necessity: it reads the reader's preference and owns
 * one piece of state. It is the only interactive element of an article body.
 */
export function HeavyMedia({
  title,
  poster: posterAsset,
  src,
  durationLabel,
}: {
  title: string;
  /**
   * The poster, resolved by the server parent (`ArticleBody`). Resolving it
   * here would drag the whole manifest into the article's JavaScript, and
   * an uploaded picture is only known to the server-side registry anyway
   * (`lib/media.ts`); the prop keeps the client render identical to the
   * server one.
   */
  poster?: MediaAsset;
  src: string;
  durationLabel?: string;
}) {
  const { dataSaver } = usePreferences();
  const [playing, setPlaying] = useState(false);
  const poster = posterAsset;

  if (playing) {
    return (
      <figure className="not-prose">
        {/* La piste de sous-titres viendra de la rédaction au lot 3 ; la
            vidéo n'est jamais lue automatiquement. */}
        <video
          src={src}
          controls
          autoPlay
          preload="none"
          className="block w-full rounded-md bg-neutral-900"
          aria-label={title}
        />
        <figcaption className="mt-2 type-small text-muted-foreground">
          {title}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="not-prose">
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="group/video relative block w-full overflow-hidden rounded-md border border-border text-left"
      >
        {!dataSaver && poster ? (
          <ResponsiveImage
            media={poster}
            alt=""
            sizes={SIZES.inline}
            maxWidth={768}
            wrapperClassName="aspect-[16/9]"
          />
        ) : (
          <span className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 bg-surface-muted px-4 text-center">
            <WifiOff
              aria-hidden="true"
              className="size-6 text-muted-foreground"
            />
            <span className="type-small text-muted-foreground">
              Vidéo non chargée — économie de données active
            </span>
          </span>
        )}

        <span className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-background/95 px-4 py-3">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Play aria-hidden="true" className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate type-small font-semibold text-foreground">
              {title}
            </span>
            <span className="block type-small text-muted-foreground">
              Lire la vidéo
              {durationLabel ? ` — ${durationLabel}` : ""}
              {dataSaver ? " · téléchargement à la demande" : ""}
            </span>
          </span>
        </span>
      </button>
      <figcaption className="mt-2 type-small text-muted-foreground">
        La vidéo n&apos;est téléchargée qu&apos;après un clic : aucune donnée
        n&apos;est consommée tant que vous ne la demandez pas.
      </figcaption>
    </figure>
  );
}
