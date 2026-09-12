"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Plus, Power, Save, Settings, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import { SelectField, TextField } from "@/components/custom/form-field";
import { StatsTile } from "@/components/custom/stats-tile";
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
  | "transcription";

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

  return (
    <>
      <h1 className="flex items-center gap-2 font-serif type-h1">
        <Settings aria-hidden="true" className="size-6" />
        Réglages
      </h1>
      <p className="mt-2 max-w-reading type-body text-muted-foreground">
        Identité du site, réseaux sociaux, newsletter, agents éditoriaux et
        redirections héritées de l&apos;ancien site.
      </p>

      {settings === undefined || form === null ? (
        <p className="mt-6 type-body text-muted-foreground">
          Chargement des réglages…
        </p>
      ) : (
        <div className="mt-6 grid gap-8">
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-serif type-h2">Identité du site</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-serif type-h2">Réseaux</h2>
            {form.social.length === 0 ? (
              <p className="mt-4 type-small text-muted-foreground">
                Aucun réseau enregistré.
              </p>
            ) : (
              <div className="mt-4 grid gap-4">
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
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-serif type-h2">Newsletter</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 font-serif type-h2">
              <Sparkles aria-hidden="true" className="size-5" />
              Agents
            </h2>

            {agentsData === undefined ? (
              <p className="mt-4 type-body text-muted-foreground">
                Chargement des agents…
              </p>
            ) : (
              <div className="mt-4 grid gap-5">
                {!agentsData.keyConfigured && (
                  <div className="rounded-md border border-warning-token/40 bg-warning-token/10 p-4">
                    <p className="type-small text-foreground">
                      La clé{" "}
                      <code className="font-mono">ANTHROPIC_API_KEY</code>{" "}
                      n&apos;est pas renseignée sur le déploiement Convex : les
                      sept agents tournent donc en <strong>mode simulé</strong>{" "}
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

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[54rem] border-collapse text-left">
                    <caption className="sr-only">
                      Liste des sept agents éditoriaux et leur état
                    </caption>
                    <thead>
                      <tr className="border-b border-border">
                        <th
                          scope="col"
                          className="py-2 pr-4 type-small font-semibold"
                        >
                          Nº
                        </th>
                        <th
                          scope="col"
                          className="py-2 pr-4 type-small font-semibold"
                        >
                          Agent
                        </th>
                        <th
                          scope="col"
                          className="py-2 pr-4 type-small font-semibold"
                        >
                          Déclencheur
                        </th>
                        <th
                          scope="col"
                          className="py-2 pr-4 type-small font-semibold"
                        >
                          Modèle
                        </th>
                        <th
                          scope="col"
                          className="py-2 pr-4 type-small font-semibold"
                        >
                          Exécutions
                        </th>
                        <th
                          scope="col"
                          className="py-2 pr-4 type-small font-semibold"
                        >
                          Coût
                        </th>
                        <th
                          scope="col"
                          className="py-2 type-small font-semibold"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Power aria-hidden="true" className="size-4" />
                            Actif
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentsData.agents.map((agent) => (
                        <tr
                          key={agent.key}
                          className="border-b border-border align-top"
                        >
                          <td className="py-3 pr-4 type-small text-muted-foreground tabular-nums">
                            {agent.number}
                          </td>
                          <td className="max-w-xs py-3 pr-4">
                            <p className="type-small font-semibold">
                              {agent.name}
                            </p>
                            <p className="mt-0.5 type-small text-muted-foreground">
                              {agent.what}
                            </p>
                            {!agent.enabled && (
                              <p className="mt-1 type-small text-muted-foreground">
                                Repli manuel : {agent.fallback}
                              </p>
                            )}
                          </td>
                          <td className="py-3 pr-4 type-small text-muted-foreground">
                            {agent.trigger}
                          </td>
                          <td className="py-3 pr-4 type-small">
                            {agent.model}
                          </td>
                          <td className="py-3 pr-4 type-small tabular-nums">
                            {formatNumber(agent.runs)}
                          </td>
                          <td className="py-3 pr-4 type-small tabular-nums">
                            {formatCost(agent.costMicros)}
                          </td>
                          <td className="py-3">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={agent.enabled}
                              aria-label={`Agent ${agent.name}`}
                              disabled={togglingKey === agent.key}
                              onClick={() =>
                                void handleToggleAgent(
                                  agent.key as AgentKey,
                                  agent.name,
                                  !agent.enabled
                                )
                              }
                              className={cn(
                                "relative inline-flex h-11 w-20 shrink-0 items-center rounded-full border p-1 transition-colors touch-target disabled:cursor-not-allowed disabled:opacity-60",
                                agent.enabled
                                  ? "justify-end border-primary bg-primary"
                                  : "justify-start border-border bg-surface-muted"
                              )}
                            >
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "block size-8 rounded-full transition-colors",
                                  agent.enabled
                                    ? "bg-primary-foreground"
                                    : "bg-foreground"
                                )}
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-serif type-h2">Redirections</h2>
            <p className="mt-2 type-small text-muted-foreground">
              Ces redirections complètent le plan statique de{" "}
              <code className="font-mono">lib/legacy-redirects.ts</code>, mais
              ne sont pas encore appliquées par{" "}
              <code className="font-mono">next.config.ts</code> : elles sont
              enregistrées ici en vue de la reprise du fonds WordPress.
            </p>

            {redirects === undefined ? (
              <p className="mt-4 type-body text-muted-foreground">
                Chargement des redirections…
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[38rem] border-collapse text-left">
                  <caption className="sr-only">
                    Redirections enregistrées
                  </caption>
                  <thead>
                    <tr className="border-b border-border">
                      <th
                        scope="col"
                        className="py-2 pr-4 type-small font-semibold"
                      >
                        Depuis
                      </th>
                      <th
                        scope="col"
                        className="py-2 pr-4 type-small font-semibold"
                      >
                        Vers
                      </th>
                      <th
                        scope="col"
                        className="py-2 pr-4 type-small font-semibold"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="py-2 pr-4 type-small font-semibold"
                      >
                        Créée le
                      </th>
                      <th scope="col" className="py-2 type-small font-semibold">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {redirects.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-3 type-small text-muted-foreground"
                        >
                          Aucune redirection enregistrée.
                        </td>
                      </tr>
                    ) : (
                      redirects.map((redirect) => (
                        <tr
                          key={redirect._id}
                          className="border-b border-border"
                        >
                          <td className="py-3 pr-4 font-mono type-small">
                            {redirect.from}
                          </td>
                          <td className="py-3 pr-4 font-mono type-small">
                            {redirect.to}
                          </td>
                          <td className="py-3 pr-4 type-small">
                            {redirect.permanent ? "301" : "302"}
                          </td>
                          <td className="py-3 pr-4 type-small text-muted-foreground">
                            {formatDateTime(redirect.createdAt)}
                          </td>
                          <td className="py-3">
                            <ActionButton
                              type="button"
                              variant="destructive"
                              disabled={removingRedirectId === redirect._id}
                              onClick={() =>
                                void handleRemoveRedirect(redirect._id)
                              }
                              aria-label={`Supprimer la redirection ${redirect.from}`}
                            >
                              <Trash2 aria-hidden="true" className="size-4" />
                              Supprimer
                            </ActionButton>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
          </section>
        </div>
      )}

      <div className="sticky bottom-0 z-10 mt-6 flex flex-col gap-3 border-t border-border bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
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
