"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { Building2, FlaskConical, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AgentSuggestionCard } from "@/components/custom/agent-suggestion-card";
import { ReviewPanel } from "@/components/custom/review-panel";
import { StatusPill } from "@/components/custom/status-pill";
import { STATUS_LABEL, blocksToText, formatDateTime } from "@/lib/private";

/**
 * Review of one deposit — CDC §4.4 steps 3 and 4.
 *
 * Left: the text as the company filed it. Right: the moderation agent's
 * pre-qualification card and the three decisions. The card is laid out as
 * advice — a score, things to check, possible duplicates — and the page
 * says in as many words that the decision is not the agent's.
 */
export default function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const submissionId = id as Id<"submissions">;
  const submission = useQuery(api.portal.submission, { id: submissionId });
  const options = useQuery(api.newsroom.editorOptions, {});
  const agent = useQuery(api.agents.forTarget, {
    targetType: "submission",
    targetId: id,
  });

  if (submission === undefined) {
    return <p className="type-body text-muted-foreground">Chargement…</p>;
  }
  if (submission === null) {
    return (
      <>
        <h1 className="font-display type-h1">Dépôt introuvable</h1>
      </>
    );
  }

  const categories = (options?.categories ?? [])
    .filter((row) => !row.parentSlug)
    .map((row) => ({ value: row.slug, label: row.name }));
  const authors = (options?.authors ?? []).map((row) => ({
    value: row.slug,
    label: row.name,
  }));
  const media = (options?.media ?? []).map((row) => ({
    value: row.key,
    label: `${row.key} — ${row.alt.slice(0, 48)}`,
  }));

  const moderationRun = agent?.runs.find(
    (run) => run.agentKey === "moderation"
  );
  const moderation = (agent?.suggestions ?? []).filter(
    (item) => item.agentKey === "moderation"
  );

  return (
    <>
      <p className="type-small">
        <Link
          href="/redaction/depots"
          className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          ← Dépôts entreprises
        </Link>
      </p>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display type-h1">{submission.title}</h1>
        <StatusPill status={submission.status} />
      </div>
      <p className="mt-1 flex flex-wrap items-center gap-2 type-small text-muted-foreground">
        <Building2 aria-hidden="true" className="size-4" />
        {submission.organizationName} · {submission.organizationSector} ·{" "}
        {submission.organizationContact}
      </p>
      <p className="mt-1 type-small text-muted-foreground">
        Type déclaré&nbsp;: {submission.kindLabel} · rubrique souhaitée&nbsp;:{" "}
        {submission.requestedCategorySlug}
        {submission.requestedPublishAt
          ? ` · diffusion souhaitée le ${formatDateTime(submission.requestedPublishAt)}`
          : ""}
      </p>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-w-0">
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display type-h2">Texte déposé</h2>
            <p className="mt-3 type-body font-medium">{submission.dek}</p>
            <div className="mt-4 max-w-reading type-body whitespace-pre-wrap">
              {blocksToText(submission.body)}
            </div>
          </section>

          {submission.reviewNotes.length > 0 && (
            <section className="mt-6">
              <h2 className="font-display type-h2">Historique de revue</h2>
              <ol className="mt-4 grid gap-3">
                {[...submission.reviewNotes].reverse().map((note, index) => (
                  <li
                    key={`${note.at}-${index}`}
                    className="rounded-md border border-border bg-card p-3"
                  >
                    <p className="type-small font-semibold">
                      {STATUS_LABEL[note.status] ?? note.status} ·{" "}
                      {note.authorSlug} · {formatDateTime(note.at)}
                    </p>
                    <p className="mt-1 type-small text-muted-foreground">
                      {note.comment}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <div className="min-w-0">
          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="flex flex-wrap items-center gap-2 font-display type-h2">
              <Sparkles
                aria-hidden="true"
                className="size-5 text-brand-magenta"
              />
              Fiche de pré-qualification
              {moderationRun?.mode === "simulated" && (
                <span className="inline-flex items-center gap-1 rounded-xs border border-warning-token/40 bg-warning-token/10 px-1.5 py-0.5 type-small font-semibold text-warning-token">
                  <FlaskConical aria-hidden="true" className="size-3" />
                  Simulation
                </span>
              )}
            </h2>
            <p className="mt-2 type-small text-muted-foreground">
              Produite par l&apos;agent de modération (agent 5). Elle conseille,
              elle ne décide pas&nbsp;: aucune de ces lignes ne change le statut
              du dépôt.
            </p>

            {moderationRun ? (
              <>
                <p className="mt-3 rounded-xs border border-border bg-surface-muted px-2 py-1.5 type-small">
                  {moderationRun.summary}
                </p>
                {moderationRun.error && (
                  <p className="mt-2 type-small text-destructive">
                    {moderationRun.error}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 type-small text-muted-foreground">
                Aucune fiche pour ce dépôt — l&apos;agent est peut-être
                désactivé, ou le plafond mensuel atteint. La revue se fait sans,
                comme avant.
              </p>
            )}

            <div className="mt-4 grid gap-3">
              {moderation.map((item) => (
                <AgentSuggestionCard key={item._id} suggestion={item} />
              ))}
            </div>
          </section>

          <div className="mt-6">
            <h2 className="font-display type-h2">Décision</h2>
            <div className="mt-4">
              <ReviewPanel
                submissionId={submissionId}
                status={submission.status}
                suggestedCategorySlug={submission.requestedCategorySlug}
                categories={categories}
                authors={authors}
                media={media}
                requestedPublishAt={submission.requestedPublishAt}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
