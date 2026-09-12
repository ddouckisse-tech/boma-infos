"use client";

import { useRef } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Italic,
  Link2,
  Plus,
  Trash2,
} from "lucide-react";
import type { Block } from "@/convex/model/content";
import { cn } from "@/lib/utils";

/**
 * Rich content editor — CDC §3.4 (`Editor`), §4.4.
 *
 * It edits **blocks**, because that is what the data model is
 * (`convex/model/content.ts`): a typed list, not an HTML string. Two
 * consequences the newsroom cares about. Pasting from Word cannot smuggle
 * in styling, because there is nowhere to put it; and the rendering of a
 * piece is the same in the preview, on the site and in the RSS feed,
 * because all three read the same blocks.
 *
 * Inline markup is the minimal set `components/custom/rich-text.tsx`
 * already parses — `**gras**`, `*italique*`, `[libellé](/lien)` — applied
 * to the selection by the three buttons above each text area. No
 * contenteditable, no WYSIWYG library, nothing that can produce a shape
 * the renderer does not understand.
 */

type BlockKind = Block["type"];

const LABELS: Record<BlockKind, string> = {
  paragraph: "Paragraphe",
  heading: "Intertitre",
  list: "Liste",
  quote: "Citation",
  image: "Image légendée",
  stat: "Chiffre-clé",
  video: "Vidéo",
};

const EMPTY: Record<BlockKind, Block> = {
  paragraph: { type: "paragraph", text: "" },
  heading: { type: "heading", level: 2, text: "" },
  list: { type: "list", ordered: false, items: [""] },
  quote: { type: "quote", text: "" },
  image: { type: "image", mediaKey: "", caption: "" },
  stat: { type: "stat", value: "", label: "" },
  video: { type: "video", title: "", posterMediaKey: "", src: "" },
};

export function Editor({
  blocks,
  onChange,
  media,
}: {
  blocks: readonly Block[];
  onChange: (blocks: Block[]) => void;
  media: readonly { key: string; alt: string }[];
}) {
  const refs = useRef(new Map<number, HTMLTextAreaElement | null>());

  const replace = (index: number, block: Block) => {
    const next = [...blocks];
    next[index] = block;
    onChange(next);
  };

  const remove = (index: number) => {
    const next = blocks.filter((_, position) => position !== index);
    onChange(next.length > 0 ? next : [{ type: "paragraph", text: "" }]);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const insert = (index: number, kind: BlockKind) => {
    const next = [...blocks];
    next.splice(index + 1, 0, structuredClone(EMPTY[kind]));
    onChange(next);
  };

  /** Wraps the current selection of a text area in inline markup. */
  const wrap = (index: number, before: string, after: string) => {
    const area = refs.current.get(index);
    const block = blocks[index];
    if (!area || !block) return;
    const text =
      block.type === "paragraph" ||
      block.type === "heading" ||
      block.type === "quote"
        ? block.text
        : "";
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selected = text.slice(start, end) || "texte";
    const updated = `${text.slice(0, start)}${before}${selected}${after}${text.slice(end)}`;
    if (
      block.type === "paragraph" ||
      block.type === "heading" ||
      block.type === "quote"
    ) {
      replace(index, { ...block, text: updated });
    }
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    });
  };

  return (
    <div className="grid gap-3">
      {blocks.map((block, index) => (
        <div
          key={index}
          className="rounded-md border border-border bg-background p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="type-small font-semibold text-muted-foreground">
              {LABELS[block.type]}
            </span>
            <div className="ms-auto flex flex-wrap items-center gap-1">
              {(block.type === "paragraph" ||
                block.type === "heading" ||
                block.type === "quote") && (
                <>
                  <ToolButton
                    label="Gras"
                    onClick={() => wrap(index, "**", "**")}
                  >
                    <Bold aria-hidden="true" className="size-4" />
                  </ToolButton>
                  <ToolButton
                    label="Italique"
                    onClick={() => wrap(index, "*", "*")}
                  >
                    <Italic aria-hidden="true" className="size-4" />
                  </ToolButton>
                  <ToolButton
                    label="Lien"
                    onClick={() => wrap(index, "[", "](/)")}
                  >
                    <Link2 aria-hidden="true" className="size-4" />
                  </ToolButton>
                </>
              )}
              <ToolButton
                label={`Monter le bloc ${index + 1}`}
                onClick={() => move(index, -1)}
                disabled={index === 0}
              >
                <ArrowUp aria-hidden="true" className="size-4" />
              </ToolButton>
              <ToolButton
                label={`Descendre le bloc ${index + 1}`}
                onClick={() => move(index, 1)}
                disabled={index === blocks.length - 1}
              >
                <ArrowDown aria-hidden="true" className="size-4" />
              </ToolButton>
              <ToolButton
                label={`Supprimer le bloc ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </ToolButton>
            </div>
          </div>

          <div className="mt-2 grid gap-2">
            {block.type === "heading" && (
              <select
                aria-label="Niveau de l'intertitre"
                value={String(block.level)}
                onChange={(event) =>
                  replace(index, {
                    ...block,
                    level: Number(event.target.value) === 3 ? 3 : 2,
                  })
                }
                className="h-11 w-40 rounded-lg border border-input bg-transparent px-2.5 type-small"
              >
                <option value="2">Intertitre (h2)</option>
                <option value="3">Sous-section (h3)</option>
              </select>
            )}

            {(block.type === "paragraph" ||
              block.type === "heading" ||
              block.type === "quote") && (
              <textarea
                ref={(node) => {
                  refs.current.set(index, node);
                }}
                aria-label={`${LABELS[block.type]} ${index + 1}`}
                value={block.text}
                onChange={(event) =>
                  replace(index, { ...block, text: event.target.value })
                }
                rows={block.type === "paragraph" ? 4 : 2}
                className="w-full rounded-lg border border-input bg-transparent p-2.5 type-body outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            )}

            {block.type === "quote" && (
              <input
                aria-label="Attribution de la citation"
                placeholder="Attribution"
                value={block.attribution ?? ""}
                onChange={(event) =>
                  replace(index, {
                    ...block,
                    attribution: event.target.value || undefined,
                  })
                }
                className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 type-small"
              />
            )}

            {block.type === "list" && (
              <>
                <label className="flex items-center gap-2 type-small touch-target">
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={block.ordered}
                    onChange={(event) =>
                      replace(index, {
                        ...block,
                        ordered: event.target.checked,
                      })
                    }
                  />
                  Liste numérotée
                </label>
                <textarea
                  aria-label={`Éléments de la liste ${index + 1}, un par ligne`}
                  value={block.items.join("\n")}
                  onChange={(event) =>
                    replace(index, {
                      ...block,
                      items: event.target.value.split("\n"),
                    })
                  }
                  rows={Math.max(3, block.items.length)}
                  className="w-full rounded-lg border border-input bg-transparent p-2.5 type-body"
                />
                <p className="type-small text-muted-foreground">
                  Un élément par ligne.
                </p>
              </>
            )}

            {block.type === "image" && (
              <>
                <select
                  aria-label="Photographie"
                  value={block.mediaKey}
                  onChange={(event) =>
                    replace(index, { ...block, mediaKey: event.target.value })
                  }
                  className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 type-small"
                >
                  <option value="">— choisir une photographie</option>
                  {media.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.key} — {item.alt.slice(0, 60)}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Légende de l'image"
                  placeholder="Légende"
                  value={block.caption ?? ""}
                  onChange={(event) =>
                    replace(index, {
                      ...block,
                      caption: event.target.value || undefined,
                    })
                  }
                  className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 type-small"
                />
              </>
            )}

            {block.type === "stat" && (
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  aria-label="Valeur du chiffre-clé"
                  placeholder="1 240 milliards FCFA"
                  value={block.value}
                  onChange={(event) =>
                    replace(index, { ...block, value: event.target.value })
                  }
                  className="h-11 rounded-lg border border-input bg-transparent px-2.5 type-small"
                />
                <input
                  aria-label="Libellé du chiffre-clé"
                  placeholder="Encours de crédit"
                  value={block.label}
                  onChange={(event) =>
                    replace(index, { ...block, label: event.target.value })
                  }
                  className="h-11 rounded-lg border border-input bg-transparent px-2.5 type-small"
                />
                <input
                  aria-label="Source du chiffre-clé"
                  placeholder="Source"
                  value={block.source ?? ""}
                  onChange={(event) =>
                    replace(index, {
                      ...block,
                      source: event.target.value || undefined,
                    })
                  }
                  className="h-11 rounded-lg border border-input bg-transparent px-2.5 type-small"
                />
              </div>
            )}

            {block.type === "video" && (
              <div className="grid gap-2">
                <input
                  aria-label="Titre de la vidéo"
                  placeholder="Titre"
                  value={block.title}
                  onChange={(event) =>
                    replace(index, { ...block, title: event.target.value })
                  }
                  className="h-11 rounded-lg border border-input bg-transparent px-2.5 type-small"
                />
                <input
                  aria-label="Adresse de la vidéo"
                  placeholder="/videos/…"
                  value={block.src}
                  onChange={(event) =>
                    replace(index, { ...block, src: event.target.value })
                  }
                  className="h-11 rounded-lg border border-input bg-transparent px-2.5 type-small"
                />
                <select
                  aria-label="Vignette de la vidéo"
                  value={block.posterMediaKey}
                  onChange={(event) =>
                    replace(index, {
                      ...block,
                      posterMediaKey: event.target.value,
                    })
                  }
                  className="h-11 rounded-lg border border-input bg-transparent px-2.5 type-small"
                >
                  <option value="">— vignette</option>
                  {media.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.key}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-border pt-2">
            <span className="type-small text-muted-foreground">
              Insérer après&nbsp;:
            </span>
            {(Object.keys(LABELS) as BlockKind[]).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => insert(index, kind)}
                className="inline-flex items-center gap-1 rounded-xs border border-border px-2 py-1 type-small hover:bg-surface-muted"
              >
                <Plus aria-hidden="true" className="size-3" />
                {LABELS[kind]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-md border border-border",
        disabled ? "opacity-40" : "hover:bg-surface-muted"
      )}
    >
      {children}
    </button>
  );
}
