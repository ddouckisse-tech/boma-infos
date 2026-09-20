"use client";

import { useState } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Check, ImageOff, Images, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import { MediaUploader } from "@/components/custom/media-uploader";
import { Modal } from "@/components/custom/modal";
import { mediaUrl } from "@/lib/media-core";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { cn } from "@/lib/utils";

export type PickableMedia = {
  key: string;
  alt: string;
  thumbUrl?: string;
};

/** A picture as `library.byKeys` and `library.pick` describe it. */
export type PickedMedia = FunctionReturnType<typeof api.library.byKeys>[number];

/** Small rendition of any picture, uploaded or from the demo library. */
export const thumbOf = (item: PickableMedia): string =>
  item.thumbUrl ?? mediaUrl(item.key, 320, "webp");

/** Thumbnails per page of the chooser: two, three or four columns. */
const PICKER_PAGE = 24;

/**
 * The picture behind a key, looked up on its own (`library.byKeys`, index
 * `by_key`) rather than found in a list of the whole library: `undefined`
 * while loading, `null` when there is no key or no such picture.
 */
export function useMediaByKey(key: string): PickedMedia | null | undefined {
  const found = useQuery(api.library.byKeys, key ? { keys: [key] } : "skip");
  if (!key) return null;
  if (found === undefined) return undefined;
  return found[0] ?? null;
}

/**
 * Picture chooser — replaces the `<select>` of keys the editor used to show.
 *
 * A picture is chosen by looking at it: the control shows the current one
 * (or says there is none) and opens a grid of thumbnails, searchable, with
 * the uploader at hand so a missing picture is added without leaving the
 * article. The value stays the media key, which is what the article stores.
 *
 * Since 19/09/2026 the chooser asks the server for what it shows — one page
 * of thumbnails at a time, searched there — and looks the current picture
 * up by its key. It used to receive the whole library from the editor,
 * which stopped working once the WordPress archive filled it.
 */
export function MediaPicker({
  label,
  value,
  onChange,
  allowNone = true,
  onUploaded,
  className,
}: {
  label: string;
  value: string;
  onChange: (key: string) => void;
  allowNone?: boolean;
  /** Called once a picture has been added from the chooser. */
  onUploaded?: (id: Id<"media">, key: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const current = useMediaByKey(value);

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
            style={{ backgroundColor: current.color }}
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
            {value === ""
              ? "Aucune image"
              : current
                ? current.alt || current.key
                : current === undefined
                  ? "Chargement…"
                  : "Image introuvable dans la médiathèque"}
          </p>
          {value !== "" && (
            <p className="truncate font-mono type-small text-muted-foreground">
              {value}
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
          {value ? "Changer" : "Choisir"}
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
        {/* Monté à l'ouverture seulement : fermé, le sélecteur n'interroge rien. */}
        {open && (
          <PickerBody
            value={value}
            allowNone={allowNone}
            onChoose={choose}
            onUploaded={onUploaded}
          />
        )}
      </Modal>
    </div>
  );
}

function PickerBody({
  value,
  allowNone,
  onChoose,
  onUploaded,
}: {
  value: string;
  allowNone: boolean;
  onChoose: (key: string) => void;
  onUploaded?: (id: Id<"media">, key: string) => void;
}) {
  const [term, setTerm] = useState("");
  const search = useDebouncedValue(term.trim());
  const { results, status, loadMore } = usePaginatedQuery(
    api.library.pick,
    { term: search || undefined },
    { initialNumItems: PICKER_PAGE }
  );

  return (
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
            onClick={() => onChoose("")}
          >
            <ImageOff aria-hidden="true" className="size-4" />
            Aucune image
          </ActionButton>
        )}
      </div>

      {status === "LoadingFirstPage" ? (
        <p className="type-small text-muted-foreground" role="status">
          Chargement des images…
        </p>
      ) : results.length === 0 ? (
        <p className="type-small text-muted-foreground">
          {search
            ? `Aucune image ne correspond à « ${search} ».`
            : "La médiathèque est vide."}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {results.map((item) => {
            const selected = item.key === value;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onChoose(item.key)}
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
                    style={{ backgroundColor: item.color }}
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

      {(status === "CanLoadMore" || status === "LoadingMore") && (
        <ActionButton
          type="button"
          variant="outline"
          className="justify-self-center"
          disabled={status === "LoadingMore"}
          onClick={() => loadMore(PICKER_PAGE)}
        >
          {status === "LoadingMore" ? "Chargement…" : "Afficher plus d'images"}
        </ActionButton>
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
            onChoose(key);
          }}
        />
      </details>
    </div>
  );
}
