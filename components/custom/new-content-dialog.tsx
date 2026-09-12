"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { LucideIcon } from "lucide-react";
import { FileText, Images, PenLine, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { ActionButton } from "@/components/custom/action-button";
import { SelectField, TextField } from "@/components/custom/form-field";
import { Modal } from "@/components/custom/modal";
import { humanError } from "@/lib/private";
import { cn } from "@/lib/utils";

export type NewContentKind = "article" | "editorial" | "images";

const KINDS: {
  kind: NewContentKind;
  label: string;
  icon: LucideIcon;
  hint: string;
}[] = [
  {
    kind: "article",
    label: "Article",
    icon: FileText,
    hint: "Un papier dans une rubrique du journal.",
  },
  {
    kind: "editorial",
    label: "Éditorial",
    icon: PenLine,
    hint: "Le point de vue de la rédaction, rubrique Éditorial.",
  },
  {
    kind: "images",
    label: "Images",
    icon: Images,
    hint: "Ajouter des photographies à la médiathèque.",
  },
];

/**
 * "Nouveau contenu" — the one door for the three things the newsroom posts
 * (12/09/2026): an article, an editorial, pictures.
 *
 * Opened from the navigation card, the phone drawer and the dashboard. An
 * article or an editorial is created at once as a draft — a working title,
 * a section, a signature — and the editor opens on it; there is no form to
 * fill before writing. An editorial is an article whose section is fixed to
 * « Éditorial ». Pictures go to the médiathèque with the uploader open.
 */
export function NewContentDialog({
  open,
  onClose,
  kind: requestedKind = "article",
  defaultAuthorSlug,
}: {
  open: boolean;
  onClose: () => void;
  kind?: NewContentKind;
  defaultAuthorSlug?: string;
}) {
  const router = useRouter();
  const options = useQuery(api.newsroom.editorOptions, open ? {} : "skip");
  const create = useMutation(api.newsroom.create);

  const [chosen, setChosen] = useState<NewContentKind | null>(null);
  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [authorSlug, setAuthorSlug] = useState("");
  const [busy, setBusy] = useState(false);
  // Réinitialisation au rendu quand la boîte s'ouvre ou se ferme : pas
  // d'effet, pas de clignotement, et la boîte repart toujours propre.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    setChosen(null);
    setTitle("");
    setCategorySlug("");
    setAuthorSlug("");
  }
  const kind = chosen ?? requestedKind;

  const parents = (options?.categories ?? []).filter((row) => !row.parentSlug);
  const writable = parents.filter((row) => row.allowed);
  const editorial = parents.find(
    (row) => row.slug === "editorial" || /^éditorial$/i.test(row.name)
  );
  const authors = options?.authors ?? [];
  const author =
    authorSlug ||
    (authors.some((row) => row.slug === defaultAuthorSlug)
      ? (defaultAuthorSlug ?? "")
      : (authors[0]?.slug ?? ""));
  const category =
    kind === "editorial"
      ? (editorial?.slug ?? "")
      : categorySlug || (writable[0]?.slug ?? "");
  const editorialBlocked =
    kind === "editorial" && (!editorial || !editorial.allowed);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!category || !author) {
      toast.error("Créez d'abord une rubrique et une signature.");
      return;
    }
    setBusy(true);
    try {
      const id = await create({
        title:
          title.trim() ||
          (kind === "editorial" ? "Éditorial" : "Nouvel article"),
        categorySlug: category,
        authorSlug: author,
      });
      toast.success(
        kind === "editorial"
          ? "Éditorial créé : à vous d'écrire."
          : "Article créé : à vous d'écrire."
      );
      onClose();
      router.push(`/redaction/articles/${id}`);
    } catch (error) {
      toast.error(humanError(error));
    }
    setBusy(false);
  };

  const goToLibrary = () => {
    onClose();
    router.push("/redaction/medias?ajouter=1");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      label="Nouveau contenu"
      variant="panel"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border py-2 ps-5 pe-3">
        <h2 className="font-display type-h3">Nouveau contenu</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>

      <div className="grid gap-5 p-5">
        <div
          role="tablist"
          aria-label="Type de contenu"
          className="grid grid-cols-3 gap-2"
        >
          {KINDS.map((option) => {
            const Icon = option.icon;
            const selected = option.kind === kind;
            return (
              <button
                key={option.kind}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setChosen(option.kind)}
                className={cn(
                  "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 type-small font-semibold transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-surface-muted"
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
                {option.label}
              </button>
            );
          })}
        </div>
        <p className="type-small text-muted-foreground">
          {KINDS.find((option) => option.kind === kind)?.hint}
        </p>

        {kind === "images" ? (
          <ActionButton type="button" onClick={goToLibrary} className="w-full">
            <Images aria-hidden="true" className="size-4" />
            Ouvrir la médiathèque et ajouter des images
          </ActionButton>
        ) : options === undefined ? (
          <p className="type-small text-muted-foreground" role="status">
            Chargement…
          </p>
        ) : editorialBlocked ? (
          <p
            role="status"
            className="rounded-md border border-warning-token/40 bg-warning-token/10 px-3 py-2 type-small"
          >
            La rubrique « Éditorial » n&apos;est pas dans votre périmètre : un
            administrateur peut l&apos;y ajouter depuis « Comptes ».
          </p>
        ) : (
          <form onSubmit={submit} className="grid gap-4">
            <TextField
              label="Titre de travail"
              hint="Modifiable ensuite ; il sert à retrouver le brouillon."
              placeholder={
                kind === "editorial"
                  ? "Éditorial de la semaine"
                  : "Nouvel article"
              }
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            {kind === "article" && (
              <SelectField
                label="Rubrique"
                value={category}
                onChange={(event) => setCategorySlug(event.target.value)}
                options={writable.map((row) => ({
                  value: row.slug,
                  label: row.name,
                }))}
              />
            )}
            {authors.length > 1 && (
              <SelectField
                label="Signature"
                value={author}
                onChange={(event) => setAuthorSlug(event.target.value)}
                options={authors.map((row) => ({
                  value: row.slug,
                  label: row.name,
                }))}
              />
            )}
            <ActionButton type="submit" disabled={busy} className="w-full">
              {kind === "editorial" ? (
                <PenLine aria-hidden="true" className="size-4" />
              ) : (
                <FileText aria-hidden="true" className="size-4" />
              )}
              {busy
                ? "Création…"
                : kind === "editorial"
                  ? "Créer l'éditorial et l'ouvrir"
                  : "Créer l'article et l'ouvrir"}
            </ActionButton>
          </form>
        )}
      </div>
    </Modal>
  );
}
