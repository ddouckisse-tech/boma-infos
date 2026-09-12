"use client";

import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { Images, Save, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import { TextField } from "@/components/custom/form-field";
import { AgentSuggestionCard } from "@/components/custom/agent-suggestion-card";
import { mediaUrl } from "@/lib/media";
import { humanError } from "@/lib/private";
import { cn } from "@/lib/utils";

/**
 * Médiathèque — CDC §4.4 « Médiathèque », §3.5 (texte alternatif obligatoire).
 *
 * Cette page ne redimensionne aucune image : les fichiers AVIF/WebP à quatre
 * largeurs sont déjà produits hors ligne par `scripts/fetch-media.ts`, ce qui
 * rend le budget de performance calculable à la compilation. Elle gère la
 * partie éditoriale — texte alternatif, légende, crédit — et l'agent Média ne
 * fait que proposer un texte : rien n'est écrit tant qu'une personne n'a pas
 * accepté la suggestion.
 */
export default function MediaLibraryPage() {
  const [term, setTerm] = useState("");
  const [selectedId, setSelectedId] = useState<Id<"media"> | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [credit, setCredit] = useState("");
  const [saving, setSaving] = useState(false);
  const [launching, setLaunching] = useState(false);

  const media = useQuery(api.library.list, { term: term.trim() || undefined });
  const updateMedia = useMutation(api.library.update);
  const runOnMedia = useAction(api.agentRuntime.runOnMedia);
  const agentData = useQuery(
    api.agents.forTarget,
    selectedId
      ? { targetType: "media" as const, targetId: String(selectedId) }
      : "skip"
  );

  const selected = media?.find((item) => item._id === selectedId) ?? null;

  const handleSelect = (item: NonNullable<typeof media>[number]) => {
    setSelectedId(item._id);
    setAlt(item.alt);
    setCaption(item.caption);
    setCredit(item.credit);
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await updateMedia({ id: selectedId, alt, caption, credit });
      toast.success("Média enregistré.");
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

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <h1 className="flex items-center gap-2 font-serif type-h1">
          <Images aria-hidden="true" className="size-4 text-accent" />
          Médiathèque
        </h1>
        <p className="mt-3 max-w-3xl type-body text-muted-foreground">
          Les photographies sont pré-encodées hors ligne en AVIF et WebP à
          quatre largeurs par{" "}
          <code className="font-mono">scripts/fetch-media.ts</code> — c&apos;est
          ce qui rend le budget de performance calculable à la compilation.
          Cette page gère la partie éditoriale de chaque image&nbsp;: texte
          alternatif, légende et crédit. Le texte alternatif est obligatoire.
        </p>
      </div>

      <div className="flex items-end gap-3">
        <Search
          aria-hidden="true"
          className="mb-3 size-4 shrink-0 text-muted-foreground"
        />
        <TextField
          label="Rechercher"
          type="search"
          placeholder="Clé, texte alternatif, légende…"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          className="max-w-sm flex-1"
        />
      </div>

      {media === undefined ? (
        <p className="type-body text-muted-foreground" role="status">
          Chargement de la médiathèque…
        </p>
      ) : media.length === 0 ? (
        <p className="type-body text-muted-foreground">
          {term.trim() !== ""
            ? `Aucun média ne correspond à « ${term.trim()} ».`
            : "La médiathèque est vide."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <div
              key={item._id}
              className={cn(
                "flex flex-col gap-2 rounded-md border border-border p-3",
                selectedId === item._id ? "bg-surface-muted" : "bg-card"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(item.key, 320, "webp")}
                alt={item.alt}
                width={320}
                height={180}
                loading="lazy"
                className="w-full rounded-sm border border-border"
                style={{ backgroundColor: item.color }}
              />
              <p className="font-mono type-small break-all">{item.key}</p>
              <p className="type-small text-muted-foreground tabular-nums">
                {item.width} × {item.height} px · {item.usedBy} article
                {item.usedBy > 1 ? "s" : ""}
              </p>
              {item.pendingSuggestions > 0 && (
                <span className="inline-flex w-fit items-center gap-1 rounded-xs border border-warning-token/40 bg-warning-token/10 px-1.5 py-0.5 type-small font-semibold text-warning-token">
                  <Sparkles aria-hidden="true" className="size-4" />
                  {item.pendingSuggestions} proposition(s) d&apos;agent
                </span>
              )}
              <ActionButton
                type="button"
                variant="outline"
                onClick={() => handleSelect(item)}
                className="mt-auto"
              >
                Modifier
              </ActionButton>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-md border border-border bg-card p-4">
        <h2 className="font-serif type-h3">Édition du média</h2>
        {!selected ? (
          <p className="mt-2 type-body text-muted-foreground">
            Sélectionnez un média dans la grille ci-dessus pour modifier son
            texte alternatif, sa légende et son crédit.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <p className="font-mono type-small text-muted-foreground">
              {selected.key}
            </p>
            <TextField
              label="Texte alternatif"
              required
              hint="Décrit ce que montre l'image, sans « photo de ». Obligatoire (CDC §3.5)."
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
            <div className="flex flex-wrap gap-3">
              <ActionButton
                type="button"
                disabled={saving}
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
                Proposer un texte alternatif (agent Média)
              </ActionButton>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-serif type-h3">
          Propositions de l&apos;agent Média
        </h2>
        {!selected ? (
          <p className="mt-2 type-body text-muted-foreground">
            Sélectionnez un média pour voir ses propositions.
          </p>
        ) : agentData === undefined ? (
          <p className="mt-2 type-body text-muted-foreground" role="status">
            Chargement des propositions…
          </p>
        ) : agentData.suggestions.length === 0 ? (
          <p className="mt-2 type-body text-muted-foreground">
            Aucune proposition en attente pour ce média.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {agentData.suggestions.map((s) => (
              <AgentSuggestionCard suggestion={s} key={s._id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
