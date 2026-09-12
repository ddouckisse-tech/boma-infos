"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FlaskConical,
  Mail,
  Play,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { ActionButton } from "@/components/custom/action-button";
import { AgentSuggestionCard } from "@/components/custom/agent-suggestion-card";
import { DataTable, type DataColumn } from "@/components/custom/data-table";
import { SelectField } from "@/components/custom/form-field";
import { OfficeHeader } from "@/components/custom/office-header";
import { StatsTile } from "@/components/custom/stats-tile";
import {
  formatCost,
  formatDateTime,
  formatNumber,
  humanError,
} from "@/lib/private";
import { cn } from "@/lib/utils";

/**
 * Agents éditoriaux — journal des exécutions et garde-fous, CDC §4.6.
 *
 * « Un agent propose, un humain dispose » : rien sur cet écran n'écrit un
 * champ tout seul. L'interrupteur individuel de chaque agent vit dans les
 * réglages (réservés à l'administrateur) ; ici on ne fait que lire l'état,
 * décider des suggestions au cas par cas et déclencher la composition de la
 * newsletter hebdomadaire.
 */

type AgentKey =
  | "relecture"
  | "titraille"
  | "seo"
  | "media"
  | "moderation"
  | "diffusion"
  | "transcription";

type Run = NonNullable<
  ReturnType<typeof useQuery<typeof api.agents.journal>>
>[number];

const RUN_STATUS_LABEL: Record<string, string> = {
  queued: "En attente",
  running: "En cours",
  succeeded: "Abouti",
  failed: "Échec",
  blocked: "Bloqué",
};

const RUN_STATUS_TONE: Record<string, string> = {
  queued: "border-border bg-surface-muted text-muted-foreground",
  running: "border-border bg-surface-muted text-muted-foreground",
  succeeded: "border-success-token/40 bg-success-token/10 text-success-token",
  failed: "border-destructive/40 bg-destructive/10 text-destructive",
  blocked: "border-warning-token/40 bg-warning-token/10 text-warning-token",
};

const EDITION_STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  approved: "Validée",
  sent: "Envoyée",
};

const EDITION_STATUS_TONE: Record<string, string> = {
  draft: "border-border bg-surface-muted text-muted-foreground",
  approved: "border-success-token/40 bg-success-token/10 text-success-token",
  sent: "border-transparent bg-primary text-primary-foreground",
};

/** Petite étiquette colorée — le libellé porte toujours le sens, la teinte n'est qu'un renfort. */
function Badge({
  tone,
  children,
}: {
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-xs border px-2 py-0.5 type-small font-semibold whitespace-nowrap",
        tone
      )}
    >
      {children}
    </span>
  );
}

export default function AgentsPage() {
  const overview = useQuery(api.settings.agents, {});

  const [filter, setFilter] = useState<AgentKey | "">("");
  const runs = useQuery(api.agents.journal, {
    agent: filter || undefined,
    limit: 80,
  });

  const [selectedRunId, setSelectedRunId] = useState<Id<"agentRuns"> | null>(
    null
  );
  const detail = useQuery(
    api.agents.run,
    selectedRunId ? { id: selectedRunId } : "skip"
  );

  const editions = useQuery(api.newsletterDraft.list, {});
  const approveEdition = useMutation(api.newsletterDraft.approve);
  const composeNewsletter = useAction(api.agentRuntime.composeNewsletterNow);

  const [composing, setComposing] = useState(false);
  const [approvingId, setApprovingId] =
    useState<Id<"newsletterEditions"> | null>(null);

  const handleCompose = async () => {
    setComposing(true);
    try {
      await composeNewsletter({});
      toast.success(
        "Composition programmée. Le brouillon apparaît dans quelques secondes."
      );
    } catch (error) {
      toast.error(humanError(error));
    }
    setComposing(false);
  };

  const handleApprove = async (id: Id<"newsletterEditions">) => {
    setApprovingId(id);
    try {
      await approveEdition({ id });
      toast.success("Édition validée.");
    } catch (error) {
      toast.error(humanError(error));
    }
    setApprovingId(null);
  };

  const agentOptions: { value: string; label: string }[] = [
    { value: "", label: "Tous les agents" },
    ...(overview?.agents.map((agent) => ({
      value: agent.key,
      label: `${agent.number}. ${agent.name}`,
    })) ?? []),
  ];

  const totalRuns =
    overview?.agents.reduce((sum, agent) => sum + agent.runs, 0) ?? 0;
  const tileTone: "default" | "warning" | "danger" = !overview
    ? "default"
    : overview.stopped
      ? "danger"
      : overview.alerting
        ? "warning"
        : "default";

  const columns: DataColumn<Run>[] = [
    {
      key: "date",
      header: "Date",
      className: "whitespace-nowrap tabular-nums",
      cell: (run) => formatDateTime(run.createdAt),
    },
    {
      key: "agent",
      header: "Agent",
      cell: (run) => run.agentName,
    },
    {
      key: "target",
      header: "Cible",
      primary: true,
      cell: (run) => (
        <>
          <button
            type="button"
            onClick={() => setSelectedRunId(run._id)}
            className="text-left type-small font-semibold text-accent hover:underline"
          >
            {run.targetLabel}
          </button>
          <p className="type-small text-muted-foreground">{run.targetType}</p>
          {run.summary && (
            <p className="mt-1 type-small text-muted-foreground">
              {run.summary}
            </p>
          )}
          {run.error && (
            <p className="mt-1 type-small text-destructive">{run.error}</p>
          )}
        </>
      ),
    },
    {
      key: "status",
      header: "État",
      cell: (run) => (
        <Badge tone={RUN_STATUS_TONE[run.status] ?? RUN_STATUS_TONE.queued}>
          {RUN_STATUS_LABEL[run.status] ?? run.status}
        </Badge>
      ),
    },
    {
      key: "mode",
      header: "Mode",
      cell: (run) =>
        run.mode === "simulated" ? (
          <Badge tone="border-warning-token/40 bg-warning-token/10 text-warning-token">
            <FlaskConical aria-hidden="true" className="size-4" />
            Simulation
          </Badge>
        ) : (
          <span className="type-small">API Claude</span>
        ),
    },
    {
      key: "trigger",
      header: "Déclencheur",
      cell: (run) => run.triggeredBy,
    },
    {
      key: "tokens",
      header: "Jetons",
      className: "whitespace-nowrap tabular-nums",
      cell: (run) =>
        `${formatNumber(run.inputTokens)} / ${formatNumber(run.outputTokens)}`,
    },
    {
      key: "cost",
      header: "Coût",
      className: "whitespace-nowrap tabular-nums",
      cell: (run) => formatCost(run.costMicros),
    },
  ];

  return (
    <>
      <OfficeHeader
        icon={Sparkles}
        title="Agents éditoriaux"
        description={
          <>
            <strong className="font-semibold">
              « Un agent propose, un humain dispose. »
            </strong>{" "}
            Aucun agent ne publie, ne refuse ni ne modifie un contenu&nbsp;:
            chaque proposition est acceptée ou rejetée à la main, et une
            proposition rejetée n&apos;est jamais re-proposée.
          </>
        }
      />

      {overview === undefined ? (
        <p className="mt-6 type-body text-muted-foreground">
          Chargement des agents…
        </p>
      ) : (
        <>
          {!overview.keyConfigured && (
            <div className="mt-6 flex gap-3 rounded-md border border-warning-token/40 bg-warning-token/10 p-4">
              <FlaskConical
                aria-hidden="true"
                className="size-4 shrink-0 text-warning-token"
              />
              <p className="type-small text-foreground">
                La clé <code className="font-mono">ANTHROPIC_API_KEY</code>{" "}
                n&apos;est pas posée sur le déploiement Convex&nbsp;: les sept
                agents tournent donc en mode simulé (règles typographiques et
                heuristiques maison, jamais présentées comme un modèle). Poser
                la clé (<code className="font-mono">bun run agents:cle</code>)
                suffit à passer sur l&apos;API Claude, sans changement de code.
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatsTile
              label="Dépense du mois"
              value={formatCost(overview.spentMicros)}
              tone={tileTone}
            />
            <StatsTile
              label="Plafond mensuel"
              value={formatCost(overview.capMicros)}
              tone={tileTone}
            />
            <StatsTile
              label="Exécutions du mois"
              value={formatNumber(totalRuns)}
              tone={tileTone}
            />
          </div>

          {overview.stopped && (
            <div className="mt-4 flex gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-4">
              <AlertTriangle
                aria-hidden="true"
                className="size-4 shrink-0 text-destructive"
              />
              <p className="type-small text-destructive">
                Plafond de dépense mensuel atteint&nbsp;: tous les agents sont
                arrêtés jusqu&apos;au mois prochain. Chaque tâche reste faisable
                à la main.
              </p>
            </div>
          )}

          <h2 className="mt-8 font-display type-h2">Les sept agents</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {overview.agents.map((agent) => (
              <article
                key={agent.key}
                className="rounded-md border border-border bg-card p-4"
              >
                <header className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-display type-h3">
                    Agent {agent.number} — {agent.name}
                  </h3>
                  <Badge
                    tone={
                      agent.enabled
                        ? "border-success-token/40 bg-success-token/10 text-success-token"
                        : "border-border bg-surface-muted text-muted-foreground"
                    }
                  >
                    {agent.enabled ? "Actif" : "Désactivé"}
                  </Badge>
                </header>
                <p className="mt-2 type-body text-muted-foreground">
                  {agent.what}
                </p>
                <dl className="mt-3 grid gap-1 type-small text-muted-foreground">
                  <div>
                    <dt className="inline font-medium text-foreground">
                      Déclencheur&nbsp;:{" "}
                    </dt>
                    <dd className="inline">{agent.trigger}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-foreground">
                      Modèle&nbsp;:{" "}
                    </dt>
                    <dd className="inline">{agent.model}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-foreground">
                      Repli manuel&nbsp;:{" "}
                    </dt>
                    <dd className="inline">{agent.fallback}</dd>
                  </div>
                </dl>
                {agent.deferred && (
                  <div className="mt-3">
                    <Badge tone="border-border bg-surface-muted text-muted-foreground">
                      <Clock aria-hidden="true" className="size-4" />
                      Traitement différé (ordonnanceur)
                    </Badge>
                  </div>
                )}
                <p className="mt-3 border-t border-border pt-3 type-small text-muted-foreground tabular-nums">
                  {formatNumber(agent.runs)} exécution
                  {agent.runs > 1 ? "s" : ""} ce mois ·{" "}
                  {formatCost(agent.costMicros)}
                </p>
              </article>
            ))}
          </div>
          <Link
            href="/redaction/reglages"
            className="mt-4 inline-flex items-center type-small font-semibold text-accent underline-offset-2 touch-target hover:underline"
          >
            Activer ou désactiver un agent
          </Link>
          <p className="mt-1 type-small text-muted-foreground">
            L&apos;interrupteur de chaque agent vit dans les réglages, réservés
            à l&apos;administrateur.
          </p>
        </>
      )}

      <h2 className="mt-8 flex items-center gap-2 font-display type-h2">
        <Mail aria-hidden="true" className="size-4" />
        Newsletter hebdomadaire
      </h2>
      <p className="mt-2 max-w-reading type-body text-muted-foreground">
        Aucun envoi n&apos;est automatique et aucun prestataire de courriel
        n&apos;est branché sur ce déploiement&nbsp;: une édition validée reste
        ensuite à expédier à la main.
      </p>
      <ActionButton
        type="button"
        onClick={handleCompose}
        disabled={composing}
        className="mt-4"
      >
        <Play aria-hidden="true" className="size-4" />
        Composer la newsletter de la semaine
      </ActionButton>

      <div className="mt-4 grid gap-3">
        {editions === undefined ? (
          <p className="type-body text-muted-foreground">
            Chargement des éditions…
          </p>
        ) : editions.length === 0 ? (
          <p className="rounded-md border border-border bg-card p-4 type-body text-muted-foreground">
            Aucune édition composée pour l&apos;instant.
          </p>
        ) : (
          editions.map((edition) => (
            <article
              key={edition._id}
              className="rounded-md border border-border bg-card p-4"
            >
              <header className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="type-small text-muted-foreground">
                    Semaine {edition.week}
                  </p>
                  <h3 className="font-display type-h3">{edition.subject}</h3>
                </div>
                <Badge
                  tone={
                    EDITION_STATUS_TONE[edition.status] ??
                    EDITION_STATUS_TONE.draft
                  }
                >
                  {EDITION_STATUS_LABEL[edition.status] ?? edition.status}
                </Badge>
              </header>
              {edition.intro && (
                <p className="mt-2 type-body text-muted-foreground">
                  {edition.intro}
                </p>
              )}
              {edition.items.length > 0 && (
                <ul className="mt-3 grid gap-2">
                  {edition.items.map((item) => (
                    <li
                      key={item.slug}
                      className="rounded-xs border border-border bg-surface-muted px-2 py-1.5"
                    >
                      <p className="type-small font-semibold">{item.title}</p>
                      <p className="type-small text-muted-foreground">
                        {item.teaser}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {edition.status === "draft" && (
                <ActionButton
                  type="button"
                  variant="outline"
                  onClick={() => handleApprove(edition._id)}
                  disabled={approvingId === edition._id}
                  className="mt-3"
                >
                  <CheckCircle2 aria-hidden="true" className="size-4" />
                  Valider cette édition
                </ActionButton>
              )}
            </article>
          ))
        )}
      </div>

      <h2 className="mt-8 font-display type-h2">Journal des exécutions</h2>
      <SelectField
        label="Filtrer par agent"
        value={filter}
        onChange={(event) => setFilter(event.target.value as AgentKey | "")}
        options={agentOptions}
        className="mt-3 max-w-xs"
      />

      {runs === undefined ? (
        <p className="mt-4 type-body text-muted-foreground">
          Chargement du journal…
        </p>
      ) : (
        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={runs}
            rowKey={(run) => run._id}
            caption="Journal des exécutions des agents éditoriaux"
            empty="Aucune exécution pour l'instant."
            minWidth="68rem"
            rowClassName={(run) =>
              run._id === selectedRunId ? "bg-surface-muted" : undefined
            }
          />
        </div>
      )}

      {selectedRunId && (
        <>
          <h2 className="mt-8 font-display type-h2">
            Propositions de cette exécution
          </h2>
          {detail === undefined ? (
            <p className="mt-3 type-body text-muted-foreground">Chargement…</p>
          ) : detail === null ? (
            <p className="mt-3 type-body text-muted-foreground">
              Cette exécution est introuvable.
            </p>
          ) : (
            <>
              <p className="mt-2 max-w-reading type-body text-muted-foreground">
                {detail.run.summary}
              </p>
              {detail.suggestions.length === 0 ? (
                <p className="mt-4 rounded-md border border-border bg-card p-4 type-body text-muted-foreground">
                  Cette exécution n&apos;a produit aucune proposition.
                </p>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {detail.suggestions.map((s) => (
                    <AgentSuggestionCard suggestion={s} key={s._id} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
