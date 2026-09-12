"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Inbox, Mail, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SelectField } from "@/components/custom/form-field";
import { StatsTile } from "@/components/custom/stats-tile";
import { StatusPill } from "@/components/custom/status-pill";
import { STATUS_LABEL, formatDateTime, humanError } from "@/lib/private";

const FILTERS = [
  { value: "", label: "Tous les statuts" },
  { value: "submitted", label: STATUS_LABEL.submitted },
  { value: "in_review", label: STATUS_LABEL.in_review },
  { value: "changes_requested", label: STATUS_LABEL.changes_requested },
  { value: "scheduled", label: STATUS_LABEL.scheduled },
  { value: "published", label: STATUS_LABEL.published },
  { value: "rejected", label: STATUS_LABEL.rejected },
  { value: "draft", label: STATUS_LABEL.draft },
];

/**
 * Company deposits queue — CDC §4.4.
 *
 * The outbox sits on the same page on purpose: no mail provider is wired
 * on this deployment, so the messages the workflow owes the companies are
 * visible here rather than pretending to have been sent.
 */
export default function SubmissionsQueuePage() {
  const [status, setStatus] = useState("");
  const rows = useQuery(api.portal.queue, { status: status || undefined });
  const notifications = useQuery(api.notifications.recent, { limit: 20 });
  const markSent = useMutation(api.notifications.markSent);

  const all = rows ?? [];
  const waiting = all.filter(
    (row) => row.status === "submitted" || row.status === "in_review"
  ).length;

  return (
    <>
      <h1 className="font-display type-h1">Dépôts entreprises</h1>
      <p className="mt-2 max-w-reading type-body text-muted-foreground">
        Chaque dépôt soumis déclenche l&apos;agent de modération, qui produit
        une fiche de pré-qualification. Cette fiche conseille&nbsp;; accepter,
        demander des modifications ou refuser reste un acte de la rédaction.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatsTile
          label="À traiter"
          value={waiting}
          tone={waiting > 0 ? "warning" : "default"}
        />
        <StatsTile
          label="Publiés"
          value={all.filter((row) => row.status === "published").length}
        />
        <StatsTile label="Total" value={all.length} />
      </div>

      <div className="mt-6 max-w-xs">
        <SelectField
          label="Filtrer par statut"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          options={FILTERS}
        />
      </div>

      {rows === undefined ? (
        <p className="mt-6 type-body text-muted-foreground">Chargement…</p>
      ) : all.length === 0 ? (
        <p className="mt-6 rounded-md border border-border bg-card p-6 type-body text-muted-foreground">
          Aucun dépôt pour ce filtre.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {all.map((row) => (
            <li key={row._id}>
              <Link
                href={`/redaction/depots/${row._id}`}
                className="block rounded-md border border-border bg-card p-4 transition-colors hover:border-foreground/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display type-h3">{row.title}</p>
                    <p className="mt-1 type-small text-muted-foreground">
                      {row.organizationName} · {row.kindLabel} · modifié le{" "}
                      {formatDateTime(row.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {row.hasModerationCard && (
                      <span className="inline-flex items-center gap-1 rounded-xs border border-border px-1.5 py-0.5 type-small text-muted-foreground">
                        <Sparkles aria-hidden="true" className="size-3" />
                        Fiche agent
                      </span>
                    )}
                    <StatusPill status={row.status} />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 flex items-center gap-2 font-display type-h2">
        <Inbox aria-hidden="true" className="size-5" />
        Corbeille de sortie
      </h2>
      <p className="mt-2 max-w-reading type-small text-muted-foreground">
        Aucun prestataire de courriel ni passerelle WhatsApp n&apos;est branché
        sur ce déploiement. Les messages que le workflow doit aux entreprises
        sont composés et conservés ici — les marquer « transmis » quand ils
        l&apos;ont réellement été.
      </p>

      {notifications === undefined ? (
        <p className="mt-4 type-body text-muted-foreground">Chargement…</p>
      ) : notifications.length === 0 ? (
        <p className="mt-4 type-body text-muted-foreground">
          Aucun message en attente.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {notifications.map((item) => (
            <li
              key={item._id}
              className="rounded-md border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="flex items-center gap-2 type-small font-semibold">
                  {item.channel === "email" ? (
                    <Mail aria-hidden="true" className="size-4" />
                  ) : (
                    <MessageCircle aria-hidden="true" className="size-4" />
                  )}
                  {item.subject}
                </p>
                <span className="type-small text-muted-foreground">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>
              <p className="mt-1 type-small text-muted-foreground">
                {item.channel === "email" ? "Courriel" : "WhatsApp"} → {item.to}
              </p>
              <pre className="mt-2 overflow-x-auto rounded-xs border border-border bg-surface-muted p-2 font-mono type-small whitespace-pre-wrap">
                {item.body}
              </pre>
              {item.status === "pending" ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await markSent({ id: item._id as Id<"notifications"> });
                      toast.success("Message marqué comme transmis.");
                    } catch (error) {
                      toast.error(humanError(error));
                    }
                  }}
                  className="mt-3 inline-flex items-center rounded-md border border-border px-3 type-small font-semibold touch-target hover:bg-surface-muted"
                >
                  Marquer comme transmis
                </button>
              ) : (
                <p className="mt-3 type-small text-success-token">Transmis</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
