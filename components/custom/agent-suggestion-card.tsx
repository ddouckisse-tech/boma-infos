"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Check, FlaskConical, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { formatDateTime, humanError } from "@/lib/private";

export type Suggestion = {
  _id: Id<"agentSuggestions">;
  agentName: string;
  mode: string;
  field: string;
  label: string;
  rationale: string;
  current?: string;
  proposed: string;
  status: string;
  decidedBy?: string;
  decidedAt?: number;
  createdAt: number;
  applies: boolean;
};

/**
 * One agent proposal — CDC §3.4 (`AgentSuggestionCard`), §4.6.
 *
 * The rule of the whole milestone is enforced by this component's shape:
 * **an agent proposes, a human disposes.** Nothing is applied until
 * somebody presses "Accepter", and pressing "Rejeter" does more than
 * dismiss the card — the server records the fingerprint of the refused
 * value so a later run never puts it back.
 *
 * When the run came from the offline stand-in (no API key), the card says
 * so in as many words. A suggestion is never allowed to look more
 * authoritative than it is.
 */
export function AgentSuggestionCard({
  suggestion,
  onDecided,
}: {
  suggestion: Suggestion;
  onDecided?: () => void;
}) {
  const decide = useMutation(api.agents.decide);
  const [busy, setBusy] = useState(false);

  const settle = async (accept: boolean) => {
    setBusy(true);
    try {
      const result = await decide({ id: suggestion._id, accept });
      toast.success(result.message);
      onDecided?.();
    } catch (error) {
      toast.error(humanError(error));
    }
    setBusy(false);
  };

  const decided = suggestion.status !== "pending";

  return (
    <article
      className={cn(
        "rounded-md border bg-card p-4",
        suggestion.status === "accepted"
          ? "border-success-token/40"
          : suggestion.status === "rejected"
            ? "border-border opacity-70"
            : "border-border"
      )}
    >
      <header className="flex flex-wrap items-start gap-2">
        <Sparkles
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-brand-magenta"
        />
        <div className="min-w-0 flex-1">
          <h3 className="type-small font-semibold">{suggestion.label}</h3>
          <p className="type-small text-muted-foreground">
            Agent {suggestion.agentName} · {formatDateTime(suggestion.createdAt)}
          </p>
        </div>
        {suggestion.mode === "simulated" && (
          <span className="inline-flex items-center gap-1 rounded-xs border border-warning-token/40 bg-warning-token/10 px-1.5 py-0.5 type-small font-semibold text-warning-token">
            <FlaskConical aria-hidden="true" className="size-3" />
            Simulation
          </span>
        )}
      </header>

      {suggestion.current && suggestion.current !== suggestion.proposed && (
        <p className="mt-3 rounded-xs border border-border bg-surface-muted px-2 py-1.5 font-mono type-small break-words text-muted-foreground">
          <span className="sr-only">Valeur actuelle&nbsp;: </span>
          {suggestion.current.slice(0, 400)}
        </p>
      )}

      <p className="mt-2 rounded-xs border border-border bg-background px-2 py-1.5 font-mono type-small whitespace-pre-wrap break-words">
        <span className="sr-only">Proposition&nbsp;: </span>
        {suggestion.proposed.slice(0, 1200)}
      </p>

      {suggestion.rationale && (
        <p className="mt-2 type-small text-muted-foreground">
          {suggestion.rationale}
        </p>
      )}

      {!suggestion.applies && !decided && (
        <p className="mt-2 type-small text-muted-foreground">
          Élément consultatif&nbsp;: l&apos;accepter le consigne au journal,
          aucun champ n&apos;est réécrit.
        </p>
      )}

      {decided ? (
        <p className="mt-3 type-small font-medium">
          {suggestion.status === "accepted" ? "Acceptée" : "Rejetée"}
          {suggestion.decidedBy ? ` par ${suggestion.decidedBy}` : ""}
          {suggestion.decidedAt
            ? ` · ${formatDateTime(suggestion.decidedAt)}`
            : ""}
          {suggestion.status === "rejected" && " — ne sera pas re-proposée."}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => settle(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 type-small font-semibold text-primary-foreground touch-target disabled:opacity-50"
          >
            <Check aria-hidden="true" className="size-4" />
            Accepter
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => settle(false)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 type-small font-semibold touch-target hover:bg-surface-muted disabled:opacity-50"
          >
            <X aria-hidden="true" className="size-4" />
            Rejeter
          </button>
        </div>
      )}
    </article>
  );
}
