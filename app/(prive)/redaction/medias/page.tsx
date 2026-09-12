"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  ImagePlus,
  Images,
  Pencil,
  Save,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import { AgentSuggestionCard } from "@/components/custom/agent-suggestion-card";
import { TextField } from "@/components/custom/form-field";
import { MediaUploader } from "@/components/custom/media-uploader";
import { thumbOf } from "@/components/custom/media-picker";
import { OfficeHeader, OfficeSection } from "@/components/custom/office-header";
import { humanError } from "@/lib/private";
import { cn } from "@/lib/utils";

type Filter = "tous" | "ajoutes" | "sans-alt";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "tous", label: "Toutes" },
  { value: "ajoutes", label: "Ajoutées ici" },
  { value: "sans-alt", label: "Sans texte alternatif" },
];

/**
 * Médiathèque — CDC §4.4, §3.5 (alternative text mandatory), and the
 * client's request of 12/09/2026: pictures are added from the screen.
 *
 * The uploader sits at the top; a picture just added is selected at once so
 * the alternative text is written while the image is still in mind. The
 * demo library (pre-encoded offline) and the uploads share the same grid
 * and the same editing panel; only deletion is reserved to uploads, since
 * the demo files are not in storage.
 */
export default function MediaLibraryPage() {
  return (
    <Suspense
      fallback={
        <p className="type-body text-muted-foreground" role="status">
          Chargement de la médiathèque…
        </p>
      }
    >
      <MediaLibrary />
    </Suspense>
  );
}

function MediaLibrary() {
  const params = useSearchParams();
  const wantsUpload = params.get("ajouter") === "1";
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<Filter>(
    params.get("filtre") === "sans-alt" ? "sans-alt" : "tous"
  );
  const [selectedId, setSelectedId] = useState<Id<"media"> | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [credit, setCredit] = useState("");
  const [saving, setSaving] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [removing, setRemoving] = useState(false);

  const media = useQuery(api.library.list, { term: term.trim() || undefined });
  const updateMedia = useMutation(api.library.update);
  const removeMedia = useMutation(api.library.remove);
  const runOnMedia = useAction(api.agentRuntime.runOnMedia);
  const agentData = useQuery(
    api.agents.forTarget,
    selectedId
      ? { targetType: "media" as const, targetId: String(selectedId) }
      : "skip"
  );

  const selected = media?.find((item) => item._id === selectedId) ?? null;
  const shown = (media ?? []).filter((item) =>
    filter === "tous"
      ? true
      : filter === "sans-alt"
        ? item.alt.trim() === ""
        : item.uploadedAt !== undefined
  );
  const missingAlt = (media ?? []).filter(
    (item) => item.alt.trim() === ""
  ).length;

  const select = (item: NonNullable<typeof media>[number]) => {
    setSelectedId(item._id);
    setAlt(item.alt);
    setCaption(item.caption);
    setCredit(item.credit);
    // Sous `xl`, le panneau d'édition est sous la grille : on y descend.
    requestAnimationFrame(() => {
      document
        .getElementById("edition")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleUploaded = (id: Id<"media">) => {
    setSelectedId(id);
    setAlt("");
    setCaption("");
    setCredit("");
    setFilter("tous");
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await updateMedia({ id: selectedId, alt, caption, credit });
      toast.success("Image enregistrée.");
    } catch (error) {
      toast.error(humanError(error));
    }
    setSaving(false);
  };

  const handleRunAgent = async () => {
    if (!selectedId) return;
    setLaunching(true);
    try {
      await runOnMedia({ mediaId: selectedId });
      toast.success(
        "L'agent Média a été lancé. Sa proposition apparaît ci-dessous."
      );
    } catch (error) {
      toast.error(humanError(error));
    }
    setLaunching(false);
  };

  const handleRemove = async () => {
    if (!selected) return;
    if (
      !window.confirm(
        `Supprimer définitivement « ${selected.alt || selected.key} » ?`
      )
    ) {
      return;
    }
    setRemoving(true);
    try {
      await removeMedia({ id: selected._id });
      setSelectedId(null);
      toast.success("Image supprimée.");
    } catch (error) {
      toast.error(humanError(error));
    }
    setRemoving(false);
  };

  return (
    <>
      <OfficeHeader
        icon={Images}
        title="Médiathèque"
        description="Ajoutez des images, puis donnez à chacune un texte alternatif, une légende et un crédit. Le texte alternatif est obligatoire avant de placer l'image dans un article."
        actions={
          <a
            href="#ajouter"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground touch-target"
          >
            <ImagePlus aria-hidden="true" className="size-4" />
            Ajouter des images
          </a>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
        <div className="grid min-w-0 gap-6">
          <OfficeSection
            id="ajouter"
            icon={ImagePlus}
            title="Ajouter des images"
            description="Depuis votre téléphone ou votre ordinateur. Chaque image est redimensionnée et allégée avant l'envoi."
          >
            <MediaUploader onUploaded={handleUploaded} autoOpen={wantsUpload} />
          </OfficeSection>

          <section aria-labelledby="bibliotheque">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 id="bibliotheque" className="font-display type-h2">
                Bibliothèque
                {media && (
                  <span className="ms-2 type-small font-normal text-muted-foreground">
                    {shown.length} image{shown.length > 1 ? "s" : ""}
                  </span>
                )}
              </h2>
              <TextField
                label="Rechercher"
                type="search"
                placeholder="Clé, texte alternatif, légende…"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                className="sm:w-72"
              />
            </div>
            <div
              role="tablist"
              aria-label="Filtrer la bibliothèque"
              className="mt-3 flex flex-wrap gap-2"
            >
              {FILTERS.map((option) => {
                const count =
                  option.value === "sans-alt" ? missingAlt : undefined;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={filter === option.value}
                    onClick={() => setFilter(option.value)}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 type-small font-semibold transition-colors",
                      filter === option.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-surface-muted"
                    )}
                  >
                    {option.label}
                    {count !== undefined && count > 0 && (
                      <span className="rounded-full bg-warning-token/20 px-1.5 text-[11px] text-warning-token tabular-nums">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {media === undefined ? (
              <p className="mt-4 type-body text-muted-foreground" role="status">
                Chargement de la médiathèque…
              </p>
            ) : shown.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-border-strong p-6 text-center type-small text-muted-foreground">
                {term.trim() !== ""
                  ? `Aucune image ne correspond à « ${term.trim()} ».`
                  : filter === "sans-alt"
                    ? "Toutes les images ont un texte alternatif."
                    : filter === "ajoutes"
                      ? "Aucune image ajoutée depuis l'écran pour l'instant."
                      : "La médiathèque est vide."}
              </p>
            ) : (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4">
                {shown.map((item) => {
                  const active = selectedId === item._id;
                  const noAlt = item.alt.trim() === "";
                  return (
                    <li key={item._id}>
                      <button
                        type="button"
                        onClick={() => select(item)}
                        aria-pressed={active}
                        aria-label={`Modifier ${item.alt || item.key}`}
                        className={cn(
                          "flex w-full flex-col overflow-hidden rounded-xl border bg-card text-start transition-colors",
                          active
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
                          className="aspect-video w-full object-cover"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="grid gap-1 p-2.5">
                          <span className="truncate type-small font-medium">
                            {noAlt ? (
                              <span className="inline-flex items-center gap-1 text-warning-token">
                                <TriangleAlert
                                  aria-hidden="true"
                                  className="size-3.5"
                                />
                                Texte alternatif manquant
                              </span>
                            ) : (
                              item.alt
                            )}
                          </span>
                          <span className="truncate font-mono text-[11px] text-muted-foreground">
                            {item.key}
                          </span>
                          <span className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground tabular-nums">
                            {item.width} × {item.height}
                            <span>
                              · {item.usedBy} article
                              {item.usedBy > 1 ? "s" : ""}
                            </span>
                            {item.pendingSuggestions > 0 && (
                              <span className="inline-flex items-center gap-1 text-accent">
                                <Sparkles
                                  aria-hidden="true"
                                  className="size-3"
                                />
                                {item.pendingSuggestions}
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="grid min-w-0 gap-6 xl:sticky xl:top-24">
          <OfficeSection
            id="edition"
            icon={Pencil}
            title={selected ? "Modifier l'image" : "Édition"}
            description={
              selected
                ? undefined
                : "Choisissez une image dans la bibliothèque pour renseigner son texte alternatif, sa légende et son crédit."
            }
          >
            {selected && (
              <div className="grid gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbOf(selected)}
                  alt={selected.alt}
                  width={320}
                  height={180}
                  className="w-full rounded-md border border-border object-cover"
                  style={{ backgroundColor: selected.color }}
                />
                <p className="font-mono type-small break-all text-muted-foreground">
                  {selected.key}
                </p>
                <TextField
                  label="Texte alternatif"
                  required
                  hint="Décrit ce que montre l'image, sans « photo de ». Obligatoire."
                  value={alt}
                  onChange={(event) => setAlt(event.target.value)}
                />
                <TextField
                  label="Légende"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                />
                <TextField
                  label="Crédit"
                  value={credit}
                  onChange={(event) => setCredit(event.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    type="button"
                    disabled={saving || alt.trim() === ""}
                    onClick={() => void handleSave()}
                  >
                    <Save aria-hidden="true" className="size-4" />
                    Enregistrer
                  </ActionButton>
                  <ActionButton
                    type="button"
                    variant="outline"
                    disabled={launching}
                    onClick={() => void handleRunAgent()}
                  >
                    <Sparkles aria-hidden="true" className="size-4" />
                    Proposer un texte
                  </ActionButton>
                </div>
                {selected.uploadedAt !== undefined && (
                  <div className="border-t border-border pt-4">
                    <ActionButton
                      type="button"
                      variant="destructive"
                      disabled={removing || selected.usedBy > 0}
                      onClick={() => void handleRemove()}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      Supprimer l&apos;image
                    </ActionButton>
                    {selected.usedBy > 0 && (
                      <p className="mt-2 type-small text-muted-foreground">
                        Encore utilisée par {selected.usedBy} article
                        {selected.usedBy > 1 ? "s" : ""} : retirez-la
                        d&apos;abord.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </OfficeSection>

          {selected && (
            <section aria-labelledby="propositions">
              <h2 id="propositions" className="font-display type-h3">
                Propositions de l&apos;agent Média
              </h2>
              {agentData === undefined ? (
                <p
                  className="mt-2 type-small text-muted-foreground"
                  role="status"
                >
                  Chargement des propositions…
                </p>
              ) : agentData.suggestions.length === 0 ? (
                <p className="mt-2 type-small text-muted-foreground">
                  Aucune proposition en attente pour cette image.
                </p>
              ) : (
                <div className="mt-3 flex flex-col gap-3">
                  {agentData.suggestions.map((s) => (
                    <AgentSuggestionCard suggestion={s} key={s._id} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </>
  );
}
