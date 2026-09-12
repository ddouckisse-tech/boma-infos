"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ExternalLink, MessageSquareText } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { StatusPill } from "@/components/custom/status-pill";
import { PartnerTag } from "@/components/custom/partner-tag";
import {
  SubmissionForm,
  type SubmissionDraft,
} from "@/components/custom/submission-form";
import { STATUS_LABEL, formatDateTime, blocksToText } from "@/lib/private";

/**
 * One deposit, seen by the company that filed it — CDC §4.4.
 *
 * Editable while it is a draft or while the newsroom has asked for changes;
 * read-only the rest of the time. Both facts come from the server
 * (`editable` on the payload), not from this page's opinion — and the
 * mutation refuses an edit in any other state regardless.
 */
export default function SubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const submission = useQuery(api.portal.submission, {
    id: id as Id<"submissions">,
  });

  if (submission === undefined) {
    return <p className="type-body text-muted-foreground">Chargement…</p>;
  }

  if (submission === null) {
    return (
      <>
        <h1 className="font-serif type-h1">Dépôt introuvable</h1>
        <p className="mt-3 type-body text-muted-foreground">
          Ce dépôt n&apos;existe pas ou ne vous appartient pas.
        </p>
      </>
    );
  }

  const draft: SubmissionDraft = {
    _id: submission._id,
    title: submission.title,
    dek: submission.dek,
    body: submission.body,
    kind: submission.kind,
    requestedCategorySlug: submission.requestedCategorySlug,
    requestedPublishAt: submission.requestedPublishAt,
    mediaKeys: submission.mediaKeys,
  };

  return (
    <>
      <p className="type-small">
        <Link
          href="/entreprise"
          className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          ← Mes dépôts
        </Link>
      </p>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-serif type-h1">{submission.title}</h1>
        <StatusPill status={submission.status} />
      </div>
      <p className="mt-1 type-small text-muted-foreground">
        {submission.kindLabel} · déposé le {formatDateTime(submission.createdAt)}
        {submission.submittedAt
          ? ` · transmis le ${formatDateTime(submission.submittedAt)}`
          : ""}
      </p>

      {submission.status === "published" && submission.publishedArticleSlug && (
        <div className="mt-6 rounded-md border border-success-token/40 bg-success-token/10 p-4">
          <p className="flex flex-wrap items-center gap-2 type-small">
            <PartnerTag size="small" />
            En ligne depuis le {formatDateTime(submission.updatedAt)}.
            <Link
              href={`/article/${submission.publishedArticleSlug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-accent underline underline-offset-2"
            >
              Voir l&apos;article
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </Link>
          </p>
          <p className="mt-2 type-small text-muted-foreground">
            Les vues, le temps de lecture moyen et les partages apparaissent
            dans{" "}
            <Link
              href="/entreprise/statistiques"
              className="underline underline-offset-2"
            >
              vos statistiques
            </Link>
            .
          </p>
        </div>
      )}

      {submission.status === "rejected" && (
        <div className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 p-4">
          <p className="type-small font-semibold text-destructive">
            Dépôt non retenu
          </p>
          <p className="mt-1 type-small text-foreground">
            {submission.rejectionReason}
          </p>
        </div>
      )}

      {submission.reviewNotes.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 font-serif type-h2">
            <MessageSquareText aria-hidden="true" className="size-5" />
            Suivi
          </h2>
          <ol className="mt-4 grid gap-3">
            {[...submission.reviewNotes].reverse().map((note, index) => (
              <li
                key={`${note.at}-${index}`}
                className="rounded-md border border-border bg-card p-3"
              >
                <p className="type-small font-semibold">
                  {STATUS_LABEL[note.status] ?? note.status} ·{" "}
                  {formatDateTime(note.at)}
                </p>
                <p className="mt-1 type-small text-muted-foreground">
                  {note.comment}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-serif type-h2">
          {submission.editable ? "Modifier le dépôt" : "Contenu déposé"}
        </h2>
        {submission.editable ? (
          <div className="mt-4 rounded-lg border border-border bg-card p-6">
            <SubmissionForm draft={draft} />
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-border bg-card p-6">
            <p className="type-small text-muted-foreground">
              Le dépôt est entre les mains de la rédaction : il n&apos;est plus
              modifiable. Il le redeviendra si des modifications sont demandées.
            </p>
            <h3 className="mt-4 font-serif type-h3">{submission.title}</h3>
            <p className="mt-2 type-body font-medium">{submission.dek}</p>
            <div className="mt-4 max-w-reading type-body whitespace-pre-wrap">
              {blocksToText(submission.body)}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
