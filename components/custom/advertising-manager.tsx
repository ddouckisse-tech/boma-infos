"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import type { FunctionArgs, FunctionReturnType } from "convex/server";
import {
  ImageOff,
  Layers,
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
import { StatsTile } from "@/components/custom/stats-tile";
import type { AdFormat, AdPlacement } from "@/lib/ads/types";
import { mediaUrl } from "@/lib/media-core";
import { formatDateTime, humanError } from "@/lib/private";
import { cn } from "@/lib/utils";

type Campaign = FunctionReturnType<typeof api.advertising.list>[number];
type CampaignDevice = "all" | "desktop" | "mobile";
type StatusFilter = "all" | "active" | "scheduled" | "paused" | "ended";

const PLACEMENTS: readonly {
  value: AdPlacement;
  label: string;
  formats: readonly AdFormat[];
}[] = [
  {
    value: "home-primary",
    label: "Accueil · entre les grands blocs",
    formats: ["banner"],
  },
  {
    value: "home-secondary",
    label: "Accueil · après les derniers articles",
    formats: ["banner"],
  },
  {
    value: "article",
    label: "Article · colonne complémentaire ou sous le texte",
    formats: ["banner", "square"],
  },
  {
    value: "article-inline",
    label: "Article · au fil de la lecture",
    formats: ["banner"],
  },
  {
    value: "listing",
    label: "Listes d’articles · entre les résultats",
    formats: ["banner"],
  },
  {
    value: "popup",
    label: "Fenêtre superposée · après un délai",
    formats: ["square"],
  },
  {
    value: "floating",
    label: "Affiche flottante · bas de l’écran",
    formats: ["square"],
  },
];

const DEVICE_OPTIONS: readonly { value: CampaignDevice; label: string }[] = [
  { value: "all", label: "Ordinateur et mobile" },
  { value: "desktop", label: "Ordinateur uniquement" },
  { value: "mobile", label: "Mobile uniquement" },
];

const STATUS_OPTIONS: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tous les statuts" },
  { value: "active", label: "En cours" },
  { value: "scheduled", label: "Planifiées" },
  { value: "paused", label: "En pause" },
  { value: "ended", label: "Terminées" },
];

const placementLabel = (placement: AdPlacement): string =>
  PLACEMENTS.find((item) => item.value === placement)?.label ?? placement;

const deviceLabel = (device: CampaignDevice | undefined): string =>
  DEVICE_OPTIONS.find((item) => item.value === (device ?? "all"))!.label;

const searchable = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");

function placementAllowsFormat(
  placement: AdPlacement,
  format: AdFormat
): boolean {
  return PLACEMENTS.some(
    (item) => item.value === placement && item.formats.includes(format)
  );
}

const FORMAT_OPTIONS = [
  { value: "banner", label: "Rectangle horizontal" },
  { value: "square", label: "Carré" },
] as const;

function campaignStatus(campaign: Campaign, now: number) {
  if (!campaign.enabled)
    return {
      key: "paused" as const,
      label: "En pause",
      tone: "text-muted-foreground",
    };
  if (campaign.endsAt !== undefined && campaign.endsAt <= now) {
    return {
      key: "ended" as const,
      label: "Terminée",
      tone: "text-muted-foreground",
    };
  }
  if (campaign.startsAt !== undefined && campaign.startsAt > now) {
    return {
      key: "scheduled" as const,
      label: "Planifiée",
      tone: "text-accent",
    };
  }
  return {
    key: "active" as const,
    label: "En cours",
    tone: "text-success-token",
  };
}

/** Keep local wall time and milliseconds; unchanged fields retain their exact timestamp. */
export function localDateInput(value: number | undefined): string {
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

type CampaignFormValues = {
  title: string;
  advertiser: string;
  kind: "paid" | "house";
  format: AdFormat;
  device?: CampaignDevice;
  href: string;
  mediaKey: string;
  placements: AdPlacement[];
  startsAt: string;
  endsAt: string;
  priority: string;
  enabled: boolean;
};

/** The exact payload sent by the editor; unchanged dates keep their original instant. */
export function buildCampaignSubmission(
  values: CampaignFormValues,
  campaign: {
    _id: Campaign["_id"];
    startsAt?: number;
    endsAt?: number;
  } | null
): FunctionArgs<typeof api.advertising.save> {
  const start = dateFromInput(values.startsAt, campaign?.startsAt);
  const end = dateFromInput(values.endsAt, campaign?.endsAt);
  const weight = Number(values.priority);
  if (
    (start !== undefined && !Number.isFinite(start)) ||
    (end !== undefined && !Number.isFinite(end))
  )
    throw new Error("Vérifiez les dates de diffusion.");
  if (start !== undefined && end !== undefined && end <= start) {
    throw new Error("La date de fin doit être postérieure à la date de début.");
  }
  if (
    values.priority.trim() === "" ||
    !Number.isInteger(weight) ||
    weight < 0 ||
    weight > 100
  ) {
    throw new Error("La priorité doit être un entier de 0 à 100.");
  }
  if (values.placements.length === 0) {
    throw new Error("Choisissez au moins un emplacement de diffusion.");
  }
  if (
    values.placements.some(
      (placement) => !placementAllowsFormat(placement, values.format)
    )
  ) {
    throw new Error(
      "Un emplacement sélectionné n’accepte pas ce format. Vérifiez les emplacements de diffusion."
    );
  }
  return {
    id: campaign?._id,
    title: values.title.trim(),
    advertiser: values.advertiser.trim(),
    kind: values.kind,
    format: values.format,
    device: values.device ?? "all",
    href: values.href.trim(),
    mediaKey: values.mediaKey,
    placements: [...values.placements],
    startsAt: start,
    endsAt: end,
    enabled: values.enabled,
    priority: weight,
  };
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
  const loadExamples = useMutation(api.advertising.loadExamples);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [editorVersion, setEditorVersion] = useState(0);
  const [editorSaving, setEditorSaving] = useState(false);
  const [busyId, setBusyId] = useState<Campaign["_id"] | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [loadingExamples, setLoadingExamples] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deviceFilter, setDeviceFilter] = useState<CampaignDevice | "any">(
    "any"
  );

  const counts = { active: 0, scheduled: 0, paused: 0, ended: 0 };
  for (const campaign of campaigns ?? [])
    counts[campaignStatus(campaign, now).key] += 1;
  const searchTerm = searchable(search.trim());
  const visibleCampaigns = (campaigns ?? []).filter((campaign) => {
    if (
      statusFilter !== "all" &&
      campaignStatus(campaign, now).key !== statusFilter
    )
      return false;
    if (deviceFilter !== "any" && (campaign.device ?? "all") !== deviceFilter)
      return false;
    const text = [
      campaign.title,
      campaign.advertiser,
      deviceLabel(campaign.device),
      ...campaign.placements.map(placementLabel),
      campaign.demoKey ? "exemple démonstration" : "",
    ].join(" ");
    return searchTerm === "" || searchable(text).includes(searchTerm);
  });
  const hasFilters =
    search.trim() !== "" || statusFilter !== "all" || deviceFilter !== "any";

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

  const handleLoadExamples = async () => {
    setLoadingExamples(true);
    try {
      const result = await loadExamples({});
      toast.success(
        result.created === 0
          ? `Les ${result.total} exemples sont déjà disponibles.`
          : `${result.created} exemple${result.created > 1 ? "s" : ""} ajouté${result.created > 1 ? "s" : ""} ; ${result.existing} déjà présent${result.existing > 1 ? "s" : ""}.`
      );
    } catch (error) {
      toast.error(humanError(error));
    } finally {
      setLoadingExamples(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDeviceFilter("any");
  };

  return (
    <>
      <OfficeHeader
        icon={Megaphone}
        title="Publicités"
        description="Gérez les affiches et leur calendrier de diffusion sur le journal. Cet écran est réservé aux administrateurs."
        actions={
          <>
            <ActionButton
              type="button"
              variant="outline"
              disabled={
                loadingExamples || editorSaving || campaigns === undefined
              }
              onClick={() => void handleLoadExamples()}
            >
              <Layers aria-hidden="true" className="size-4" />
              {loadingExamples
                ? "Chargement des exemples…"
                : "Charger les 5 exemples"}
            </ActionButton>
            <ActionButton
              type="button"
              disabled={editorSaving}
              onClick={() => openEditor(null)}
            >
              <Plus aria-hidden="true" className="size-4" />
              Nouvelle campagne
            </ActionButton>
          </>
        }
      />
      <div className="mb-6 grid gap-3 rounded-lg border border-border bg-surface-muted p-4 type-small text-muted-foreground sm:grid-cols-2">
        <p>
          Chaque affiche porte la mention « Publicité ». Après sa fermeture, la
          campagne et son emplacement restent masqués pendant 24 heures pour ce
          lecteur.
        </p>
        <p>
          La fenêtre superposée apparaît après un délai. Sur mobile, l’affiche
          flottante s’affiche en bas de l’écran. Ces affiches automatiques
          apparaissent au plus une fois par jour pour le lecteur. La mise à jour
          des pages publiques peut prendre environ cinq minutes.
        </p>
      </div>
      <p className="mb-6 type-small text-muted-foreground">
        Les cinq exemples sont fictifs et identifiés dans la liste. Les charger à
        nouveau ne duplique pas les campagnes déjà présentes.
      </p>
      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatsTile
          label="Campagnes"
          value={campaigns?.length ?? "—"}
          hint="Tous les formats"
        />
        <StatsTile
          label="En cours"
          value={campaigns === undefined ? "—" : counts.active}
          tone={counts.active > 0 ? "success" : "default"}
          hint="Actives selon le calendrier"
        />
        <StatsTile
          label="Planifiées"
          value={campaigns === undefined ? "—" : counts.scheduled}
          hint="Diffusion à venir"
        />
        <StatsTile
          label="En pause"
          value={campaigns === undefined ? "—" : counts.paused}
          hint="Réglages conservés"
        />
      </div>
      <OfficeSection
        title="Campagnes"
        icon={Megaphone}
        description="Le statut suit l’activation et les dates, dans l’heure locale de votre navigateur."
      >
        {campaigns !== undefined && campaigns.length > 0 && (
          <div className="mb-5 grid gap-3">
            <div className="grid gap-3 md:grid-cols-3">
              <TextField
                label="Rechercher une campagne"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nom, annonceur ou emplacement…"
              />
              <SelectField
                label="Statut"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                options={STATUS_OPTIONS}
              />
              <SelectField
                label="Écran visé"
                value={deviceFilter}
                onChange={(event) =>
                  setDeviceFilter(event.target.value as CampaignDevice | "any")
                }
                options={[
                  { value: "any", label: "Tous les ciblages" },
                  ...DEVICE_OPTIONS,
                ]}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p role="status" className="type-small text-muted-foreground">
                {visibleCampaigns.length} campagne
                {visibleCampaigns.length > 1 ? "s" : ""} affichée
                {visibleCampaigns.length > 1 ? "s" : ""} sur {campaigns.length}
              </p>
              {hasFilters && (
                <ActionButton
                  type="button"
                  variant="ghost"
                  onClick={resetFilters}
                >
                  Réinitialiser les filtres
                </ActionButton>
              )}
            </div>
          </div>
        )}
        {campaigns === undefined ? (
          <p className="type-body text-muted-foreground" role="status">
            Chargement des campagnes…
          </p>
        ) : campaigns.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border-strong p-6 type-small text-muted-foreground">
            Aucune campagne enregistrée. Ajoutez une affiche pour préparer une
            diffusion.
          </p>
        ) : visibleCampaigns.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border-strong p-6 type-small text-muted-foreground">
            Aucune campagne ne correspond à ces filtres.
          </p>
        ) : (
          <ul className="grid gap-4">
            {visibleCampaigns.map((campaign) => {
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
                      {campaign.demoKey && (
                        <span className="rounded-full bg-accent-surface px-2 py-0.5 type-small text-accent">
                          Exemple
                        </span>
                      )}
                    </div>
                    <p className="mt-1 type-small text-muted-foreground">
                      {campaign.advertiser} ·{" "}
                      {campaign.kind === "house"
                        ? "Autopromotion"
                        : "Campagne payante"}{" "}
                      · {campaign.format === "square" ? "Carré" : "Rectangle"} ·
                      Priorité {campaign.priority}
                    </p>
                    <p className="mt-1 type-small font-medium">
                      {deviceLabel(campaign.device)}
                    </p>
                    <p className="mt-2 type-small text-muted-foreground">
                      {campaign.placements.map(placementLabel).join(" ; ")}
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
                          editorSaving ||
                          busyId !== null ||
                          editing?._id === campaign._id
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
                          editorSaving ||
                          busyId !== null ||
                          editing?._id === campaign._id
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
          onSavingChange={setEditorSaving}
        />
      </OfficeSection>
    </>
  );
}

function CampaignForm({
  campaign,
  onSaved,
  onCancel,
  onSavingChange,
}: {
  campaign: Campaign | null;
  onSaved: () => void;
  onCancel: () => void;
  onSavingChange: (saving: boolean) => void;
}) {
  const save = useMutation(api.advertising.save);
  const [title, setTitle] = useState(campaign?.title ?? "");
  const [advertiser, setAdvertiser] = useState(campaign?.advertiser ?? "");
  const [kind, setKind] = useState<"paid" | "house">(campaign?.kind ?? "house");
  const [format, setFormat] = useState<AdFormat>(campaign?.format ?? "banner");
  const [device, setDevice] = useState<CampaignDevice>(
    campaign?.device ?? "all"
  );
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
  const availablePlacements = PLACEMENTS.filter((item) =>
    item.formats.includes(format)
  );
  const missingAlt =
    selectedMedia !== undefined && selectedMedia.alt.trim() === "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!selectedMedia || missingAlt || placements.length === 0) {
      setError(
        "Choisissez une affiche avec un texte alternatif et au moins un emplacement."
      );
      return;
    }
    let payload: FunctionArgs<typeof api.advertising.save>;
    try {
      payload = buildCampaignSubmission(
        {
          title,
          advertiser,
          kind,
          format,
          device,
          href,
          mediaKey,
          placements,
          startsAt,
          endsAt,
          priority,
          enabled,
        },
        campaign
      );
    } catch (cause) {
      setError(humanError(cause));
      return;
    }
    setSaving(true);
    onSavingChange(true);
    try {
      await save(payload);
      toast.success(campaign ? "Campagne enregistrée." : "Campagne créée.");
      onSaved();
    } catch (cause) {
      setError(humanError(cause));
    } finally {
      setSaving(false);
      onSavingChange(false);
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
          hint="Pour une autopromotion, indiquez BOMA Infos."
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
            setPlacements((current) =>
              current.filter((placement) =>
                placementAllowsFormat(placement, next)
              )
            );
          }}
          options={FORMAT_OPTIONS}
          hint="Le carré convient à la colonne article, à la fenêtre superposée et à l’affiche flottante. Les autres emplacements accueillent un rectangle horizontal."
        />
        <SelectField
          label="Écrans de diffusion"
          value={device}
          onChange={(event) => setDevice(event.target.value as CampaignDevice)}
          options={DEVICE_OPTIONS}
          hint="Choisissez le même visuel pour tous les écrans, ou préparez une campagne dédiée à l’ordinateur ou au mobile."
        />
        {campaign?.demoKey && (
          <p className="self-center rounded-md bg-accent-surface p-3 type-small text-accent">
            Cette campagne reste identifiée comme un exemple après modification.
          </p>
        )}
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
