"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRightLeft,
  ChevronDown,
  KeyRound,
  Mail,
  Newspaper,
  Plus,
  Save,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import { DataTable, type DataColumn } from "@/components/custom/data-table";
import { SelectField, TextField } from "@/components/custom/form-field";
import { OfficeHeader, OfficeSection } from "@/components/custom/office-header";
import { PasswordChangeForm } from "@/components/custom/password-change-form";
import { StatsTile } from "@/components/custom/stats-tile";
import { TwoFactorPanel } from "@/components/custom/two-factor-panel";
import {
  formatCost,
  formatDateTime,
  formatNumber,
  humanError,
} from "@/lib/private";
import { cn } from "@/lib/utils";

type AgentKey =
  | "relecture"
  | "titraille"
  | "seo"
  | "media"
  | "moderation"
  | "diffusion"
  | "transcription"
  | "veille";

type SocialLink = { label: string; url: string };

type SettingsForm = {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  social: SocialLink[];
  newsletterSenderName: string;
  newsletterDay: string;
  capDollars: string;
  alertPercent: string;
};

const NEWSLETTER_DAYS = [
  { value: "0", label: "Dimanche" },
  { value: "1", label: "Lundi" },
  { value: "2", label: "Mardi" },
  { value: "3", label: "Mercredi" },
  { value: "4", label: "Jeudi" },
  { value: "5", label: "Vendredi" },
  { value: "6", label: "Samedi" },
] as const;

type AgentRow = NonNullable<
  ReturnType<typeof useQuery<typeof api.settings.agents>>
>["agents"][number];

type RedirectRow = NonNullable<
  ReturnType<typeof useQuery<typeof api.settings.redirects>>
>[number];

/**
 * Réglages — CDC §4.4.
 *
 * Identité du site, réseaux, newsletter, agents éditoriaux et redirections
 * héritées du site WordPress. Un seul bouton envoie l'identité, les réseaux,
 * la newsletter et les deux curseurs budgétaires des agents ; l'interrupteur
 * de chaque agent et les redirections agissent tout de suite, sans attendre
 * ce bouton — ce sont des mutations à part entière côté serveur, qui
 * revérifient chacune le même permis (`settings:manage`) que le layout a
 * déjà filtré côté client.
 */
export default function ReglagesPage() {
  const settings = useQuery(api.settings.read, {});
  const agentsData = useQuery(api.settings.agents, {});
  const redirects = useQuery(api.settings.redirects, {});
  const viewer = useQuery(api.accounts.me, {});

  const saveSettings = useMutation(api.settings.save);
  const toggleAgent = useMutation(api.settings.setAgentEnabled);
  const addRedirect = useMutation(api.settings.addRedirect);
  const removeRedirect = useMutation(api.settings.removeRedirect);

  const [form, setForm] = useState<SettingsForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingKey, setTogglingKey] = useState<AgentKey | null>(null);

  const [redirectFrom, setRedirectFrom] = useState("");
  const [redirectTo, setRedirectTo] = useState("");
  const [redirectPermanent, setRedirectPermanent] = useState(true);
  const [addingRedirect, setAddingRedirect] = useState(false);
  const [removingRedirectId, setRemovingRedirectId] =
    useState<Id<"redirects"> | null>(null);

  // Initialisation au rendu, pas dans un effet : React relance le rendu
  // immédiatement, sans passe de commit intermédiaire ni clignotement.
  // Le garde-fou `form === null` fait que la réactivité Convex — un autre
  // administrateur qui enregistre pendant la frappe — n'écrase pas la
  // saisie en cours.
  if (settings && form === null) {
    setForm({
      siteName: settings.siteName,
      tagline: settings.tagline,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      social: settings.social,
      newsletterSenderName: settings.newsletterSenderName,
      newsletterDay: String(settings.newsletterDay),
      capDollars: String(settings.agentsMonthlyCapMicros / 1_000_000),
      alertPercent: String(settings.agentsAlertRatio * 100),
    });
  }

  const updateField = <K extends keyof SettingsForm>(
    key: K,
    value: SettingsForm[K]
  ) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateSocial = (index: number, patch: Partial<SocialLink>) => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            social: prev.social.map((item, i) =>
              i === index ? { ...item, ...patch } : item
            ),
          }
        : prev
    );
  };

  const addSocial = () => {
    setForm((prev) =>
      prev
        ? { ...prev, social: [...prev.social, { label: "", url: "" }] }
        : prev
    );
  };

  const removeSocial = (index: number) => {
    setForm((prev) =>
      prev
        ? { ...prev, social: prev.social.filter((_, i) => i !== index) }
        : prev
    );
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await saveSettings({
        siteName: form.siteName,
        tagline: form.tagline,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        social: form.social,
        newsletterSenderName: form.newsletterSenderName,
        newsletterDay: Number(form.newsletterDay),
        agentsMonthlyCapMicros: Math.round(Number(form.capDollars) * 1_000_000),
        agentsAlertRatio: Number(form.alertPercent) / 100,
      });
      toast.success("Réglages enregistrés.");
    } catch (error) {
      toast.error(humanError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAgent = async (
    key: AgentKey,
    name: string,
    nextEnabled: boolean
  ) => {
    setTogglingKey(key);
    try {
      await toggleAgent({ key, enabled: nextEnabled });
      toast.success(`${name} ${nextEnabled ? "activé" : "désactivé"}.`);
    } catch (error) {
      toast.error(humanError(error));
    } finally {
      setTogglingKey(null);
    }
  };

  const handleAddRedirect = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddingRedirect(true);
    try {
      await addRedirect({
        from: redirectFrom,
        to: redirectTo,
        permanent: redirectPermanent,
      });
      setRedirectFrom("");
      setRedirectTo("");
      setRedirectPermanent(true);
      toast.success("Redirection ajoutée.");
    } catch (error) {
      toast.error(humanError(error));
    } finally {
      setAddingRedirect(false);
    }
  };

  const handleRemoveRedirect = async (id: Id<"redirects">) => {
    setRemovingRedirectId(id);
    try {
      await removeRedirect({ id });
      toast.success("Redirection supprimée.");
    } catch (error) {
      toast.error(humanError(error));
    } finally {
      setRemovingRedirectId(null);
    }
  };

  const spendTone = agentsData
    ? agentsData.stopped
      ? ("danger" as const)
      : agentsData.alerting
        ? ("warning" as const)
        : ("default" as const)
    : ("default" as const);

  const agentColumns: DataColumn<AgentRow>[] = [
    {
      key: "number",
      header: "Nº",
      className: "tabular-nums",
      cell: (row) => (
        <span className="text-muted-foreground">{row.number}</span>
      ),
    },
    {
      key: "agent",
      header: "Agent",
      primary: true,
      className: "max-w-xs",
      cell: (row) => (
        <>
          <p className="type-small font-semibold">{row.name}</p>
          <p className="mt-0.5 type-small text-muted-foreground">{row.what}</p>
          {!row.enabled && (
            <p className="mt-1 type-small text-muted-foreground">
              Repli manuel : {row.fallback}
            </p>
          )}
        </>
      ),
    },
    {
      key: "trigger",
      header: "Déclencheur",
      cell: (row) => (
        <span className="text-muted-foreground">{row.trigger}</span>
      ),
    },
    { key: "model", header: "Modèle", cell: (row) => row.model },
    {
      key: "runs",
      header: "Exécutions",
      className: "tabular-nums",
      cell: (row) => formatNumber(row.runs),
    },
    {
      key: "cost",
      header: "Coût",
      className: "tabular-nums",
      cell: (row) => formatCost(row.costMicros),
    },
  ];

  const redirectColumns: DataColumn<RedirectRow>[] = [
    {
      key: "from",
      header: "Depuis",
      primary: true,
      cell: (row) => <span className="font-mono">{row.from}</span>,
    },
    {
      key: "to",
      header: "Vers",
      cell: (row) => <span className="font-mono">{row.to}</span>,
    },
    {
      key: "type",
      header: "Type",
      cell: (row) => (row.permanent ? "301" : "302"),
    },
    {
      key: "createdAt",
      header: "Créée le",
      className: "whitespace-nowrap",
      cell: (row) => (
        <span className="text-muted-foreground">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <>
      <OfficeHeader
        icon={Settings}
        title="Réglages"
        description="Votre code d'accès, puis l'identité du site, les réseaux, la newsletter, les agents éditoriaux et les redirections héritées de l'ancien site."
      />

      {/* La sécurité de l'accès d'abord — c'est ici que le client attend le
          « changement du mot de passe » : mot de passe actuel, puis nouveau code
          à six chiffres suivis d’une lettre à confirmer. La vérification par application est repliée dessous. */}
      <OfficeSection
        id="mot-de-passe"
        icon={KeyRound}
        tone={viewer?.passwordChangeRequired ? "warning" : "default"}
        title="Changement du code d'accès"
        description={
          viewer?.passwordChangeRequired
            ? "Le code qui vous a été remis est provisoire : choisissez six chiffres suivis d’une lettre, puis confirmez ce nouveau code."
            : "Six chiffres suivis d’une lettre, connus de vous seul. La casse compte. Le changement déconnecte vos autres appareils."
        }
        className="mb-8"
      >
        <div className="max-w-md">
          <PasswordChangeForm mode="pin" />
        </div>
        <details className="group mt-5 rounded-lg border border-border">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 type-small font-semibold [&::-webkit-details-marker]:hidden">
            <ShieldCheck
              aria-hidden="true"
              className={
                "size-4 " +
                (viewer?.twoFactorEnabled
                  ? "text-success-token"
                  : "text-muted-foreground")
              }
            />
            Vérification par application
            <span className="font-normal text-muted-foreground">
              {viewer?.twoFactorEnabled ? "· active" : "· facultatif"}
            </span>
            <ChevronDown
              aria-hidden="true"
              className="ms-auto size-4 shrink-0 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="border-t border-border p-4">
            <TwoFactorPanel enabled={viewer?.twoFactorEnabled ?? false} />
          </div>
        </details>
      </OfficeSection>

      {settings === undefined || form === null ? (
        <p className="mt-6 type-body text-muted-foreground">
          Chargement des réglages…
        </p>
      ) : (
        <div className="mt-6 grid gap-8">
          <OfficeSection icon={Newspaper} title="Identité du site">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Nom du site"
                value={form.siteName}
                onChange={(event) =>
                  updateField("siteName", event.target.value)
                }
                required
              />
              <TextField
                label="Accroche"
                value={form.tagline}
                onChange={(event) => updateField("tagline", event.target.value)}
                required
              />
              <TextField
                label="Courriel de contact"
                type="email"
                value={form.contactEmail}
                onChange={(event) =>
                  updateField("contactEmail", event.target.value)
                }
                required
              />
              <TextField
                label="Téléphone"
                type="tel"
                value={form.contactPhone}
                onChange={(event) =>
                  updateField("contactPhone", event.target.value)
                }
                required
              />
            </div>
          </OfficeSection>

          <OfficeSection icon={Share2} title="Réseaux">
            {form.social.length === 0 ? (
              <p className="type-small text-muted-foreground">
                Aucun réseau enregistré.
              </p>
            ) : (
              <div className="grid gap-4">
                {form.social.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end"
                  >
                    <TextField
                      label={`Libellé du réseau ${index + 1}`}
                      value={item.label}
                      onChange={(event) =>
                        updateSocial(index, { label: event.target.value })
                      }
                    />
                    <TextField
                      label={`Adresse du réseau ${index + 1}`}
                      value={item.url}
                      onChange={(event) =>
                        updateSocial(index, { url: event.target.value })
                      }
                    />
                    <ActionButton
                      type="button"
                      variant="destructive"
                      onClick={() => removeSocial(index)}
                      aria-label={
                        item.label
                          ? `Retirer ${item.label}`
                          : `Retirer le réseau ${index + 1}`
                      }
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      Retirer
                    </ActionButton>
                  </div>
                ))}
              </div>
            )}
            <ActionButton
              type="button"
              variant="outline"
              onClick={addSocial}
              className="mt-4"
            >
              <Plus aria-hidden="true" className="size-4" />
              Ajouter un réseau
            </ActionButton>
          </OfficeSection>

          <OfficeSection icon={Mail} title="Newsletter">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Nom de l'expéditeur"
                value={form.newsletterSenderName}
                onChange={(event) =>
                  updateField("newsletterSenderName", event.target.value)
                }
                required
              />
              <SelectField
                label="Jour d'envoi"
                value={form.newsletterDay}
                onChange={(event) =>
                  updateField("newsletterDay", event.target.value)
                }
                options={NEWSLETTER_DAYS}
              />
            </div>
          </OfficeSection>

          <OfficeSection icon={Sparkles} title="Agents">
            {agentsData === undefined ? (
              <p className="type-body text-muted-foreground">
                Chargement des agents…
              </p>
            ) : (
              <div className="grid gap-5">
                {!agentsData.keyConfigured && (
                  <div className="rounded-md border border-warning-token/40 bg-warning-token/10 p-4">
                    <p className="type-small text-foreground">
                      La clé{" "}
                      <code className="font-mono">ANTHROPIC_API_KEY</code>{" "}
                      n&apos;est pas renseignée sur le déploiement Convex : les
                      agents tournent donc en <strong>mode simulé</strong>{" "}
                      (propositions produites par des règles maison, clairement
                      étiquetées comme telles). Il suffit de poser la clé (
                      <code className="font-mono">bun run agents:cle</code>)
                      pour passer sur l&apos;API Claude — sans changement de
                      code.
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  <StatsTile
                    label="Dépense du mois"
                    value={formatCost(agentsData.spentMicros)}
                    tone={spendTone}
                  />
                  <StatsTile
                    label="Plafond mensuel"
                    value={formatCost(agentsData.capMicros)}
                    tone={spendTone}
                  />
                  <StatsTile
                    label="Période"
                    value={agentsData.period}
                    tone={spendTone}
                  />
                </div>

                {agentsData.stopped ? (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4">
                    <p className="type-small font-semibold text-destructive">
                      Plafond atteint : tous les agents sont arrêtés
                      jusqu&apos;au mois prochain. Chaque tâche reste faisable à
                      la main.
                    </p>
                  </div>
                ) : agentsData.alerting ? (
                  <div className="rounded-md border border-warning-token/40 bg-warning-token/10 p-4">
                    <p className="type-small font-semibold text-warning-token">
                      Le budget mensuel des agents approche du plafond ;
                      au-delà, ils s&apos;arrêteront automatiquement
                      jusqu&apos;au mois prochain.
                    </p>
                  </div>
                ) : null}

                <DataTable
                  columns={agentColumns}
                  rows={agentsData.agents}
                  rowKey={(row) => row.key}
                  caption="Liste des agents éditoriaux et leur état"
                  minWidth="54rem"
                  actions={(row) => (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={row.enabled}
                      aria-label={`Agent ${row.name}`}
                      disabled={togglingKey === row.key}
                      onClick={() =>
                        void handleToggleAgent(
                          row.key as AgentKey,
                          row.name,
                          !row.enabled
                        )
                      }
                      className={cn(
                        "relative inline-flex h-11 w-20 shrink-0 items-center rounded-full border p-1 transition-colors touch-target disabled:cursor-not-allowed disabled:opacity-60",
                        row.enabled
                          ? "justify-end border-primary bg-primary"
                          : "justify-start border-border bg-surface-muted"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "block size-8 rounded-full transition-colors",
                          row.enabled
                            ? "bg-primary-foreground"
                            : "bg-foreground"
                        )}
                      />
                    </button>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Plafond mensuel des agents (dollars)"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={form.capDollars}
                    onChange={(event) =>
                      updateField("capDollars", event.target.value)
                    }
                  />
                  <TextField
                    label="Seuil d'alerte (% du plafond)"
                    type="number"
                    inputMode="numeric"
                    min={10}
                    max={100}
                    step="1"
                    value={form.alertPercent}
                    onChange={(event) =>
                      updateField("alertPercent", event.target.value)
                    }
                  />
                </div>
              </div>
            )}
          </OfficeSection>

          <OfficeSection
            icon={ArrowRightLeft}
            title="Redirections"
            description={
              <>
                Ces redirections complètent le plan statique de{" "}
                <code className="font-mono">lib/legacy-redirects.ts</code>, mais
                ne sont pas encore appliquées par{" "}
                <code className="font-mono">next.config.ts</code> : elles sont
                enregistrées ici en vue d&apos;une éventuelle reprise
                d&apos;archives.
              </>
            }
          >
            {redirects === undefined ? (
              <p className="type-body text-muted-foreground">
                Chargement des redirections…
              </p>
            ) : (
              <DataTable
                columns={redirectColumns}
                rows={redirects}
                rowKey={(row) => row._id}
                caption="Redirections enregistrées"
                empty="Aucune redirection enregistrée."
                minWidth="38rem"
                actions={(row) => (
                  <ActionButton
                    type="button"
                    variant="destructive"
                    disabled={removingRedirectId === row._id}
                    onClick={() => void handleRemoveRedirect(row._id)}
                    aria-label={`Supprimer la redirection ${row.from}`}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    Supprimer
                  </ActionButton>
                )}
              />
            )}

            <form
              onSubmit={handleAddRedirect}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <TextField
                label="Chemin source"
                placeholder="/ancienne-page"
                value={redirectFrom}
                onChange={(event) => setRedirectFrom(event.target.value)}
                required
              />
              <TextField
                label="Chemin cible"
                placeholder="/nouvelle-page"
                value={redirectTo}
                onChange={(event) => setRedirectTo(event.target.value)}
                required
              />
              <label className="flex items-center gap-2 type-small font-medium touch-target">
                <input
                  type="checkbox"
                  checked={redirectPermanent}
                  onChange={(event) =>
                    setRedirectPermanent(event.target.checked)
                  }
                  className="size-4"
                />
                Redirection permanente (301)
              </label>
              <ActionButton
                type="submit"
                disabled={addingRedirect}
                className="justify-self-start"
              >
                <Plus aria-hidden="true" className="size-4" />
                Ajouter la redirection
              </ActionButton>
            </form>
          </OfficeSection>
        </div>
      )}

      {/* Barre d'enregistrement collante, au-dessus de la barre d'onglets du
          téléphone (3,5 rem) et au ras du bas dès `lg`. */}
      <div className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-10 mt-6 flex flex-col gap-3 rounded-t-xl border border-border bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:bottom-0">
        <p className="type-small text-muted-foreground">
          {settings && settings.updatedAt > 0
            ? `Dernière modification par ${
                settings.updatedBy ?? "un administrateur"
              } le ${formatDateTime(settings.updatedAt)}.`
            : null}
        </p>
        <ActionButton
          type="button"
          onClick={handleSave}
          disabled={!form || saving}
        >
          <Save aria-hidden="true" className="size-4" />
          {saving ? "Enregistrement…" : "Enregistrer les réglages"}
        </ActionButton>
      </div>
    </>
  );
}
