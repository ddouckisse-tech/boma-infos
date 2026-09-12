"use client";

import { useState } from "react";
import { Check, ImageOff, Images, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import { MediaUploader } from "@/components/custom/media-uploader";
import { Modal } from "@/components/custom/modal";
import { mediaUrl } from "@/lib/media-core";
import { cn } from "@/lib/utils";

export type PickableMedia = {
  key: string;
  alt: string;
  thumbUrl?: string;
};

/** Small rendition of any picture, uploaded or from the demo library. */
export const thumbOf = (item: PickableMedia): string =>
  item.thumbUrl ?? mediaUrl(item.key, 320, "webp");

/**
 * Picture chooser — replaces the `<select>` of keys the editor used to show.
 *
 * A picture is chosen by looking at it: the control shows the current one
 * (or says there is none) and opens a grid of thumbnails, searchable, with
 * the uploader at hand so a missing picture is added without leaving the
 * article. The value stays the media key, which is what the article stores.
 */
export function MediaPicker({
  label,
  value,
  onChange,
  media,
  allowNone = true,
  onUploaded,
  className,
}: {
  label: string;
  value: string;
  onChange: (key: string) => void;
  media: readonly PickableMedia[];
  allowNone?: boolean;
  /** Lets the parent refresh its list once a picture has been added. */
  onUploaded?: (id: Id<"media">, key: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const current = media.find((item) => item.key === value);
  const needle = term.trim().toLowerCase();
  const shown = media.filter(
    (item) =>
      needle === "" ||
      item.key.includes(needle) ||
      item.alt.toLowerCase().includes(needle)
  );

  const choose = (key: string) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <p className="type-small font-medium">{label}</p>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-2">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbOf(current)}
            alt=""
            width={96}
            height={54}
            className="h-14 w-24 shrink-0 rounded-sm border border-border object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="inline-flex h-14 w-24 shrink-0 items-center justify-center rounded-sm border border-dashed border-border-strong text-muted-foreground"
          >
            <ImageOff className="size-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate type-small font-medium">
            {current ? current.alt || current.key : "Aucune image"}
          </p>
          {current && (
            <p className="truncate font-mono type-small text-muted-foreground">
              {current.key}
            </p>
          )}
        </div>
        <ActionButton
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          <Images aria-hidden="true" className="size-4" />
          {current ? "Changer" : "Choisir"}
        </ActionButton>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label={label}
        variant="panel"
        className="lc-auth"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border py-2 ps-5 pe-3">
          <h2 className="font-display type-h3">{label}</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-muted hover:text-foreground"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="lc-auth-body grid gap-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Rechercher une image…"
              aria-label="Rechercher une image"
              className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 type-body text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            {allowNone && value && (
              <ActionButton
                type="button"
                variant="outline"
                onClick={() => choose("")}
              >
                <ImageOff aria-hidden="true" className="size-4" />
                Aucune image
              </ActionButton>
            )}
          </div>

          {shown.length === 0 ? (
            <p className="type-small text-muted-foreground">
              Aucune image ne correspond.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {shown.map((item) => {
                const selected = item.key === value;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => choose(item.key)}
                      aria-pressed={selected}
                      className={cn(
                        "group relative block w-full overflow-hidden rounded-md border text-start transition-colors",
                        selected
                          ? "border-accent ring-2 ring-accent/40"
                          : "border-border hover:border-foreground/40"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbOf(item)}
                        alt=""
                        width={320}
                        height={180}
                        loading="lazy"
                        className="aspect-video w-full bg-surface-muted object-cover"
                      />
                      <span className="block truncate px-2 py-1.5 type-small">
                        {item.alt || (
                          <span className="text-warning-token">
                            Sans texte alternatif
                          </span>
                        )}
                      </span>
                      {selected && (
                        <span className="absolute top-1.5 right-1.5 inline-flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
                          <Check aria-hidden="true" className="size-4" />
                          <span className="sr-only">Sélectionnée</span>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <details className="rounded-lg border border-border p-3">
            <summary className="cursor-pointer type-small font-semibold">
              Ajouter une image qui n&apos;est pas encore dans la médiathèque
            </summary>
            <MediaUploader
              compact
              className="mt-3"
              onUploaded={(id, key) => {
                onUploaded?.(id, key);
                choose(key);
              }}
            />
          </details>
        </div>
      </Modal>
    </div>
  );
}
