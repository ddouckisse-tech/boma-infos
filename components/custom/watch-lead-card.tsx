"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import {
  ArrowRight,
  Check,
  ExternalLink,
  FlaskConical,
  Radar,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { parseLead, type WatchReliability } from "@/convex/model/watch";
import { cn } from "@/lib/utils";
import { formatDateTime, humanError } from "@/lib/private";

export type WatchLeadRow = {
  _id: Id<"agentSuggestions">;
  mode: string;
  /** « Veille — Politique », as the run was labelled. */
  domain: string;
  field: string;
  label: string;
  rationale: string;
  proposed: string;
  status: string;
  decidedBy?: string;
  decidedAt?: number;
  createdAt: number;
  draftId?: Id<"articles">;
};

const RELIABILITY_TONE: Record<WatchReliability, string> = {
  recoupee: "border-success-token/40 bg-success-token/10 text-success-token",
  "source-unique":
    "border-warning-token/40 bg-warning-token/10 text-warning-token",
  "non-verifiee": "border-border bg-surface-muted text-muted-foreground",
};

const RELIABILITY_TEXT: Record<WatchReliability, string> = {
  recoupee: "Recoupée",
  "source-unique": "Source unique",
  "non-verifiee": "Sources non vérifiées",
};

const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/**
 * One lead of the watch agent — agent 8, CDC §4.6.
 *
 * A lead is shown with what a journalist needs to judge it in ten seconds:
 * the facts, why now, how far the sources were checked, and the pages
 * themselves, one click away. **An agent proposes, a human disposes**:
 * « Retenir » opens a draft that starts with this note and its sources —
 * nothing is published, nothing is even written. « Écarter » makes sure the
 * same lead never comes back — which is why the confirmation offers
 * « Annuler » for a few seconds: one tap must not lose a story for good.
 *
 * The same card carries the two notes of the offline watch (a section that
 * has published nothing lately, the searches to run by hand): they describe
 * no event, and the card says they were computed, not found.
 */
export function WatchLeadCard({ lead }: { lead: WatchLeadRow }) {
  const decide = useMutation(api.agents.decide);
  const reopen = useMutation(api.agents.reopen);
  const [busy, setBusy] = useState(false);

  const isLead = lead.field === "veille.piste";
  const parsed = isLead ? parseLead(lead.label, lead.proposed) : null;
  const decided = lead.status !== "pending";

  // The card has left the board by the time « Annuler » is pressed: the
  // mutation is called from the toast, not from this component's state.
  const undo = async () => {
    try {
      const result = await reopen({ id: lead._id });
      if (result.reopened) toast.success(result.message);
      else toast.error(result.message);
    } catch (error) {
      toast.error(humanError(error));
    }
  };

  const settle = async (accept: boolean) => {
    setBusy(true);
    try {
      const result = await decide({ id: lead._id, accept });
      if (accept) toast.success(result.message);
      else {
        toast(result.message, {
          duration: 10_000,
          action: { label: "Annuler", onClick: () => void undo() },
        });
      }
    } catch (error) {
      toast.error(humanError(error));
    }
    setBusy(false);
  };

  return (
    <article
      className={cn(
        "flex flex-col rounded-md border bg-card p-4",
        lead.status === "accepted" ? "border-success-token/40" : "border-border"
      )}
    >
      <header className="flex flex-wrap items-start gap-2">
        <Radar
          aria-hidden="true"
          className="mt-1 size-4 shrink-0 text-gold-600 dark:text-gold-400"
        />
        {/* `basis-48` : sur une carte étroite, l'étiquette « Hors ligne »
            passe à la ligne au lieu d'écraser le titre en colonne. */}
        <div className="min-w-0 shrink grow basis-48">
          <h4 className="font-display type-h3 text-balance">{lead.label}</h4>
          <p className="mt-1 type-small text-muted-foreground">
            {lead.domain} · {formatDateTime(lead.createdAt)}
          </p>
        </div>
        {lead.mode === "simulated" && (
          <span className="inline-flex items-center gap-1 rounded-xs border border-warning-token/40 bg-warning-token/10 px-1.5 py-0.5 type-small font-semibold text-warning-token">
            <FlaskConical aria-hidden="true" className="size-3" />
            Hors ligne
          </span>
        )}
      </header>

      {parsed ? (
        <>
          <p className="mt-3 type-body">{parsed.summary}</p>
          {parsed.why && (
            <p className="mt-2 type-small text-muted-foreground">
              <span className="font-semibold text-foreground">
                Pourquoi maintenant&nbsp;:{" "}
              </span>
              {parsed.why}
            </p>
          )}
          <p className="mt-3 flex flex-wrap items-center gap-2 type-small">
            <span
              className={cn(
                "inline-flex rounded-xs border px-1.5 py-0.5 font-semibold",
                RELIABILITY_TONE[parsed.reliability]
              )}
            >
              {RELIABILITY_TEXT[parsed.reliability]}
            </span>
            {parsed.rubrique && (
              <span className="text-muted-foreground">
                Rubrique suggérée&nbsp;: {parsed.rubrique}
              </span>
            )}
          </p>
          {parsed.sources.length > 0 && (
            <ul className="mt-3 grid gap-1 border-t border-border pt-3">
              {parsed.sources.map((source) => (
                <li key={source.url} className="min-w-0">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 max-w-full items-center gap-2 type-small text-accent underline-offset-4 hover:underline"
                  >
                    <ExternalLink
                      aria-hidden="true"
                      className="size-4 shrink-0"
                    />
                    <span className="min-w-0 truncate">
                      {source.title}
                      <span className="text-muted-foreground">
                        {" "}
                        — {hostOf(source.url)}
                        {source.date ? ` · ${source.date}` : ""}
                      </span>
                    </span>
                    <span className="sr-only">(nouvelle fenêtre)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <p className="mt-3 type-body break-words whitespace-pre-wrap">
            {lead.proposed}
          </p>
          {lead.rationale && (
            <p className="mt-2 type-small text-muted-foreground">
              {lead.rationale}
            </p>
          )}
        </>
      )}

      <div className="mt-auto pt-4">
        {decided ? (
          <p className="type-small font-medium">
            {lead.status !== "accepted"
              ? "Écartée"
              : isLead
                ? "Retenue"
                : "Classée"}
            {lead.decidedBy ? ` par ${lead.decidedBy}` : ""}
            {lead.decidedAt ? ` · ${formatDateTime(lead.decidedAt)}` : ""}
            {lead.draftId && (
              <>
                {" · "}
                <Link
                  href={`/redaction/articles/${lead.draftId}`}
                  className="inline-flex min-h-11 items-center gap-1 font-semibold text-accent underline-offset-4 hover:underline"
                >
                  Ouvrir le brouillon
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </>
            )}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => settle(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90 disabled:opacity-50"
            >
              <Check aria-hidden="true" className="size-4" />
              {isLead ? "Retenir et ouvrir un brouillon" : "Classer la note"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => settle(false)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 type-small font-semibold transition-colors touch-target hover:bg-surface-muted disabled:opacity-50"
            >
              <X aria-hidden="true" className="size-4" />
              Écarter
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
