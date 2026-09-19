"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  ImageOff,
  Megaphone,
  Pause,
  Pencil,
  Play,
  Plus,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { ActionButton } from "@/components/custom/action-button";
import { SelectField, TextField } from "@/components/custom/form-field";
import {
  MediaPicker,
  useMediaByKey,
  type PickedMedia,
} from "@/components/custom/media-picker";
import { OfficeHeader, OfficeSection } from "@/components/custom/office-header";
import type { AdFormat, AdPlacement } from "@/lib/ads/types";
import { mediaUrl } from "@/lib/media-core";
import { formatDateTime, humanError } from "@/lib/private";
import { cn } from "@/lib/utils";

type Campaign = FunctionReturnType<typeof api.advertising.list>[number];

const PLACEMENTS: readonly { value: AdPlacement; label: string }[] = [
  { value: "home-primary", label: "Accueil · entre les grands blocs" },
  { value: "home-secondary", label: "Accueil · après les derniers articles" },
  {
    value: "article",
    label: "Article · colonne complémentaire ou sous le texte",
  },
  { value: "listing", label: "Listes d’articles · entre les résultats" },
];

const FORMAT_OPTIONS = [
  { value: "banner", label: "Rectangle horizontal" },
  { value: "square", label: "Carré" },
] as const;

function campaignStatus(campaign: Campaign, now: number) {
  if (!campaign.enabled)
    return { label: "En pause", tone: "text-muted-foreground" };
  if (campaign.endsAt !== undefined && campaign.endsAt <= now) {
    return { label: "Terminée", tone: "text-muted-foreground" };
  }
  if (campaign.startsAt !== undefined && campaign.startsAt > now) {
    return { label: "Planifiée", tone: "text-accent" };
  }
  return { label: "En cours", tone: "text-success-token" };
}

/** Keep local wall time and milliseconds; unchanged fields retain their exact timestamp. */
function localDateInput(value: number | undefined): string {
  if (value === undefined) return "";
  const date = new Date(value);
  return new Date(value - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, -1);
}

function dateFromInput(value: string, original: number | undefined) {
  if (value === localDateInput(original)) return original;
  return value === "" ? undefined : new Date(value).getTime();
}

function previewSource(media: PickedMedia, stored?: string | null): string {
  // Uploaded picture: its 640 px file once looked up, the thumbnail meanwhile.
  if (media.thumbUrl) return stored ?? media.thumbUrl;
  const variants = media.variants.filter(
    (variant) => variant.format === "webp"
  );
  const variant = variants.find((item) => item.w >= 640) ?? variants.at(-1);
  return mediaUrl(media.key, variant?.w ?? 320, "webp");
}

function CampaignPreview({
  media,
  format,
  compact = false,
}: {
  media?: PickedMedia;
  format: AdFormat;
  compact?: boolean;
}) {
  // A picture is looked up with its thumbnail only; the full-width preview
  // asks for the larger file of its one picture, a list row keeps the
  // thumbnail.
  const stored = useQuery(
    api.library.previewUrl,
    media?.thumbUrl && !compact ? { key: media.key } : "skip"
  );
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-background",
        compact ? "w-32 shrink-0" : "w-full max-w-xl"
      )}
    >
      <p className="border-b border-border px-3 py-1.5 type-small text-muted-foreground">
        Publicité
      </p>
      <div
        className={cn(
          "flex items-center justify-center bg-surface-muted",
          format === "square" ? "aspect-square" : "aspect-[3/1]"
        )}
      >
        {media ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewSource(media, stored)}
            alt={media.alt}
            width={media.width}
            height={media.height}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <ImageOff
            aria-label="Aucune affiche sélectionnée"
            className="size-6 text-muted-foreground"
          />
        )}
      </div>
    </div>
  );
}

/** A campaign row's preview: its poster looked up by key, not in the whole library. */
function CampaignRowPreview({
  mediaKey,
  format,
}: {
  mediaKey: string;
  format: AdFormat;
}) {
  const media = useMediaByKey(mediaKey);
  return <CampaignPreview media={media ?? undefined} format={format} compact />;
}

export function AdvertisingManager() {
  const campaigns = useQuery(api.advertising.list, {});
  const setEnabled = useMutation(api.advertising.setEnabled);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [editorVersion, setEditorVersion] = useState(0);
  const [busyId, setBusyId] = useState<Campaign["_id"] | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const openEditor = (campaign: Campaign | null, focus = true) => {
    setEditing(campaign);
    setEditorVersion((version) => version + 1);
    if (focus) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLInputElement>("#campagne input")?.focus();
      });
    }
  };

  const toggle = async (campaign: Campaign) => {
    setBusyId(campaign._id);
    try {
      await setEnabled({ id: campaign._id, enabled: !campaign.enabled });
      toast.success(
        campaign.enabled
          ? "Campagne mise en pause."
          : "Campagne activée selon son calendrier."
      );
    } catch (error) {
      toast.error(humanError(error));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <OfficeHeader
        icon={Megaphone}
        title="Publicités"
        description="Gérez les affiches et leur calendrier de diffusion sur le journal. Cet écran est réservé aux administrateurs."
        actions={
          <ActionButton type="button" onClick={() => openEditor(null)}>
            <Plus aria-hidden="true" className="size-4" />
            Nouvelle campagne
          </ActionButton>
        }
      />
      <p className="mb-6 max-w-reading type-small text-muted-foreground">
        Chaque encart porte la mention « Publicité ». Le site limite les
        emplacements, gère une rotation lente et respecte les fermetures des
        lecteurs. Une campagne active reste soumise à son calendrier et aux
        places disponibles.
      </p>
      <OfficeSection
        title="Campagnes"
        icon={Megaphone}
        description="Le statut suit l’activation et les dates, dans l’heure locale de votre navigateur."
      >
        {campaigns === undefined ? (
          <p className="type-body text-muted-foreground" role="status">
            Chargement des campagnes…
          </p>
        ) : campaigns.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border-strong p-6 type-small text-muted-foreground">
            Aucune campagne enregistrée. Ajoutez une affiche pour préparer une
            diffusion.
          </p>
        ) : (
          <ul className="grid gap-4">
            {campaigns.map((campaign) => {
              const status = campaignStatus(campaign, now);
              return (
                <li
                  key={campaign._id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-start"
                >
                  <CampaignRowPreview
                    mediaKey={campaign.mediaKey}
                    format={campaign.format}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="type-body font-semibold">
                        {campaign.title}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full border border-current px-2 py-0.5 type-small",
                          status.tone
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 type-small text-muted-foreground">
                      {campaign.advertiser} ·{" "}
                      {campaign.kind === "house"
                        ? "Autopromotion"
                        : "Campagne payante"}{" "}
                      · {campaign.format === "square" ? "Carré" : "Rectangle"} ·
                      Priorité {campaign.priority}
                    </p>
                    <p className="mt-2 type-small text-muted-foreground">
                      {campaign.placements
                        .map(
                          (placement) =>
                            PLACEMENTS.find((item) => item.value === placement)
                              ?.label
                        )
                        .join(" ; ")}
                    </p>
                    <p className="mt-1 type-small text-muted-foreground">
                      {campaign.startsAt === undefined
                        ? "Sans date de début"
                        : `Du ${formatDateTime(campaign.startsAt)}`}{" "}
                      ·{" "}
                      {campaign.endsAt === undefined
                        ? "Sans date de fin"
                        : `Jusqu’au ${formatDateTime(campaign.endsAt)}`}
                    </p>
                    <p className="mt-1 type-small break-all text-muted-foreground">
                      Lien : {campaign.href}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <ActionButton
                        type="button"
                        variant="outline"
                        onClick={() => openEditor(campaign)}
                        disabled={
                          busyId !== null || editing?._id === campaign._id
                        }
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                        {editing?._id === campaign._id
                          ? "Modification en cours"
                          : "Modifier"}
                      </ActionButton>
                      <ActionButton
                        type="button"
                        variant="outline"
                        onClick={() => toggle(campaign)}
                        disabled={
                          busyId !== null || editing?._id === campaign._id
                        }
                        title={
                          editing?._id === campaign._id
                            ? "Modifiez l’activation dans le formulaire ouvert."
                            : undefined
                        }
                      >
                        {campaign.enabled ? (
                          <Pause aria-hidden="true" className="size-4" />
                        ) : (
                          <Play aria-hidden="true" className="size-4" />
                        )}
                        {busyId === campaign._id
                          ? "Enregistrement…"
                          : campaign.enabled
                            ? "Mettre en pause"
                            : "Activer"}
                      </ActionButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </OfficeSection>
      <OfficeSection
        id="campagne"
        title={editing ? "Modifier la campagne" : "Nouvelle campagne"}
        icon={editing ? Pencil : Plus}
        className="mt-6"
      >
        <CampaignForm
          key={editorVersion}
          campaign={editing}
          onSaved={() => openEditor(null, false)}
          onCancel={() => openEditor(null)}
        />
      </OfficeSection>
    </>
  );
}

function CampaignForm({
  campaign,
  onSaved,
  onCancel,
}: {
  campaign: Campaign | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const save = useMutation(api.advertising.save);
  const [title, setTitle] = useState(campaign?.title ?? "");
  const [advertiser, setAdvertiser] = useState(campaign?.advertiser ?? "");
  const [kind, setKind] = useState<"paid" | "house">(campaign?.kind ?? "house");
  const [format, setFormat] = useState<AdFormat>(campaign?.format ?? "banner");
  const [href, setHref] = useState(campaign?.href ?? "");
  const [mediaKey, setMediaKey] = useState(campaign?.mediaKey ?? "");
  const [placements, setPlacements] = useState<AdPlacement[]>(
    campaign?.placements ?? []
  );
  const [startsAt, setStartsAt] = useState(localDateInput(campaign?.startsAt));
  const [endsAt, setEndsAt] = useState(localDateInput(campaign?.endsAt));
  const [priority, setPriority] = useState(String(campaign?.priority ?? 50));
  const [enabled, setEnabled] = useState(campaign?.enabled ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // `undefined` pendant la recherche, `null` si la clé n'existe plus.
  const lookup = useMediaByKey(mediaKey);
  const selectedMedia = lookup ?? undefined;
  const availablePlacements = PLACEMENTS.filter(
    (item) => format === "banner" || item.value === "article"
  );
  const missingAlt =
    selectedMedia !== undefined && selectedMedia.alt.trim() === "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const start = dateFromInput(startsAt, campaign?.startsAt);
    const end = dateFromInput(endsAt, campaign?.endsAt);
    const weight = Number(priority);
    if (
      (start !== undefined && !Number.isFinite(start)) ||
      (end !== undefined && !Number.isFinite(end))
    ) {
      setError("Vérifiez les dates de diffusion.");
      return;
    }
    if (start !== undefined && end !== undefined && end <= start) {
      setError("La date de fin doit être postérieure à la date de début.");
      return;
    }
    if (!Number.isInteger(weight) || weight < 0 || weight > 100) {
      setError("La priorité doit être un entier de 0 à 100.");
      return;
    }
    if (!selectedMedia || missingAlt || placements.length === 0) {
      setError(
        "Choisissez une affiche avec un texte alternatif et au moins un emplacement."
      );
      return;
    }
    setSaving(true);
    try {
      await save({
        id: campaign?._id,
        title: title.trim(),
        advertiser: advertiser.trim(),
        kind,
        format,
        href: href.trim(),
        mediaKey,
        placements,
        startsAt: start,
        endsAt: end,
        enabled,
        priority: weight,
      });
      toast.success(campaign ? "Campagne enregistrée." : "Campagne créée.");
      onSaved();
    } catch (cause) {
      setError(humanError(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-busy={saving}>
      <fieldset disabled={saving} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <legend className="sr-only">Informations de la campagne</legend>
        <TextField
          label="Nom de la campagne"
          required
          maxLength={120}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <TextField
          label="Annonceur"
          required
          maxLength={100}
          value={advertiser}
          onChange={(event) => setAdvertiser(event.target.value)}
          hint="Pour une autopromotion, indiquez Le Corporate."
        />
        <SelectField
          label="Type de campagne"
          value={kind}
          onChange={(event) => setKind(event.target.value as "paid" | "house")}
          options={[
            { value: "house", label: "Autopromotion" },
            { value: "paid", label: "Campagne payante" },
          ]}
        />
        <SelectField
          label="Format"
          value={format}
          onChange={(event) => {
            const next = event.target.value as AdFormat;
            setFormat(next);
            if (next === "square")
              setPlacements((current) =>
                current.filter((placement) => placement === "article")
              );
          }}
          options={FORMAT_OPTIONS}
          hint="Le carré est réservé aux pages de lecture. Les autres emplacements accueillent un rectangle horizontal."
        />
        <TextField
          label="Lien de destination"
          required
          maxLength={2048}
          className="sm:col-span-2"
          value={href}
          onChange={(event) => setHref(event.target.value)}
          hint="Adresse https:// complète ou chemin du journal commençant par / (par exemple /newsletter)."
        />
        <div className="grid gap-3 sm:col-span-2">
          <MediaPicker
            label="Affiche publicitaire"
            value={mediaKey}
            onChange={setMediaKey}
            allowNone={false}
          />
          {missingAlt && (
            <p role="status" className="type-small text-warning-token">
              Cette image n’a pas de texte alternatif.{" "}
              <Link
                href="/redaction/medias?filtre=sans-alt"
                target="_blank"
                rel="noopener"
                className="underline underline-offset-4"
              >
                Compléter sa description dans la médiathèque (nouvel onglet)
              </Link>{" "}
              avant d’enregistrer la campagne. Le formulaire se mettra à jour
              automatiquement.
            </p>
          )}
          {mediaKey && lookup === null && (
            <p role="status" className="type-small text-warning-token">
              L’affiche sélectionnée n’est pas encore disponible dans la
              médiathèque.
            </p>
          )}
          <CampaignPreview media={selectedMedia} format={format} />
          <p className="type-small text-muted-foreground">
            L’image reste entièrement visible, sans recadrage. Choisissez une
            création adaptée au format.
          </p>
        </div>
        <fieldset className="min-w-0 rounded-lg border border-border p-3 sm:col-span-2">
          <legend className="px-1 type-small font-medium">
            Emplacements de diffusion · au moins un
          </legend>
          <div className="grid gap-1 sm:grid-cols-2">
            {availablePlacements.map((item) => (
              <label
                key={item.value}
                className="flex items-center gap-2 type-small touch-target"
              >
                <input
                  type="checkbox"
                  className="size-4 shrink-0"
                  checked={placements.includes(item.value)}
                  onChange={(event) =>
                    setPlacements((current) =>
                      event.target.checked
                        ? [...current, item.value]
                        : current.filter(
                            (placement) => placement !== item.value
                          )
                    )
                  }
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
        <TextField
          label="Début de diffusion"
          type="datetime-local"
          step="0.001"
          value={startsAt}
          onChange={(event) => setStartsAt(event.target.value)}
          hint="Facultatif. Heure locale de votre navigateur."
        />
        <TextField
          label="Fin de diffusion"
          type="datetime-local"
          step="0.001"
          value={endsAt}
          onChange={(event) => setEndsAt(event.target.value)}
          hint="Facultatif. Après cette date, l’affiche ne sera plus diffusée."
        />
        <TextField
          label="Priorité"
          required
          type="number"
          min={0}
          max={100}
          step={1}
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          hint="De 0 à 100. Les priorités les plus élevées sont favorisées parmi les campagnes admissibles."
        />
        <SelectField
          label="Activation"
          value={enabled ? "true" : "false"}
          onChange={(event) => setEnabled(event.target.value === "true")}
          options={[
            { value: "false", label: "En pause" },
            { value: "true", label: "Active selon son calendrier" },
          ]}
          hint="La pause conserve l’affiche et tous les réglages pour une reprise ultérieure."
        />
        {error && (
          <p role="alert" className="type-small text-destructive sm:col-span-2">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <ActionButton
            type="submit"
            disabled={
              saving ||
              !title.trim() ||
              !advertiser.trim() ||
              !href.trim() ||
              !selectedMedia ||
              missingAlt ||
              placements.length === 0
            }
          >
            <Save aria-hidden="true" className="size-4" />
            {saving ? "Enregistrement…" : "Enregistrer la campagne"}
          </ActionButton>
          {campaign && (
            <ActionButton
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              Annuler la modification
            </ActionButton>
          )}
        </div>
      </fieldset>
    </form>
  );
}
