"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import {
  ExternalLink,
  FileText,
  Megaphone,
  MessageSquareText,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { OfficeHeader, OfficeSection } from "@/components/custom/office-header";
import { usePreferences } from "@/components/providers/preferences-provider";
import {
  SubmissionForm,
  type SubmissionDraft,
} from "@/components/custom/submission-form";
import { localeDate, localize } from "@/lib/i18n";
import {
  STATUS_LABEL,
  STATUS_TONE,
  blocksToText,
  type WorkflowStatus,
} from "@/lib/private";
import type { LocaleChoice } from "@/lib/preferences";

const STATUS_EN: Record<WorkflowStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  in_review: "In review",
  changes_requested: "Changes requested",
  scheduled: "Scheduled",
  published: "Published",
  rejected: "Rejected",
};
const TONE_CLASS = {
  neutral: "border-border bg-surface-muted text-muted-foreground",
  info: "border-info-token/40 bg-info-token/10 text-info-token",
  warning: "border-warning-token/40 bg-warning-token/10 text-warning-token",
  success: "border-success-token/40 bg-success-token/10 text-success-token",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
} as const;
function PortalStatus({
  status,
  locale,
}: {
  status: string;
  locale: LocaleChoice;
}) {
  const known = (status in STATUS_TONE ? status : "draft") as WorkflowStatus;
  return (
    <span
      className={`inline-flex items-center rounded-xs border px-2 py-0.5 type-small font-semibold whitespace-nowrap ${TONE_CLASS[STATUS_TONE[known]]}`}
    >
      {locale === "en" ? STATUS_EN[known] : STATUS_LABEL[known]}
    </span>
  );
}
function PortalPartnerTag({ locale }: { locale: LocaleChoice }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xs border border-warning-token/40 bg-warning-token/10 px-1.5 py-0.5 type-small font-semibold tracking-wide text-warning-token uppercase">
      <Megaphone aria-hidden="true" className="size-3" />
      {localize(locale, { fr: "Contenu partenaire", en: "Partner content" })}
    </span>
  );
}

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
  const { locale } = usePreferences();
  const submission = useQuery(api.portal.submission, {
    id: id as Id<"submissions">,
  });

  if (submission === undefined) {
    return (
      <p className="type-body text-muted-foreground">
        {localize(locale, { fr: "Chargement…", en: "Loading…" })}
      </p>
    );
  }

  if (submission === null) {
    return (
      <OfficeHeader
        icon={FileText}
        title={localize(locale, {
          fr: "Dépôt introuvable",
          en: "Submission not found",
        })}
        description={localize(locale, {
          fr: "Ce dépôt n'existe pas ou ne vous appartient pas.",
          en: "This submission does not exist or does not belong to you.",
        })}
      />
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
          {localize(locale, { fr: "← Mes dépôts", en: "← My submissions" })}
        </Link>
      </p>

      <OfficeHeader
        icon={FileText}
        title={submission.title}
        description={
          <>
            {locale === "en"
              ? ((
                  {
                    communique: "Press release",
                    nomination: "Appointment",
                    resultats: "Results",
                    evenement: "Event",
                    publi_redactionnel: "Advertorial",
                  } as Record<string, string>
                )[submission.kind] ?? submission.kindLabel)
              : submission.kindLabel}
            {localize(locale, { fr: " · déposé le ", en: " · submitted on " })}
            {localeDate(submission.createdAt, locale, {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {submission.submittedAt
              ? localize(locale, {
                  fr: ` · transmis le ${localeDate(submission.submittedAt, locale, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
                  en: ` · sent on ${localeDate(submission.submittedAt, locale, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
                })
              : ""}
          </>
        }
        actions={<PortalStatus status={submission.status} locale={locale} />}
        className="mt-3"
      />

      <div className="grid gap-8">
        {submission.status === "published" &&
          submission.publishedArticleSlug && (
            <div className="rounded-xl border border-success-token/40 bg-success-token/10 p-4">
              <p className="flex flex-wrap items-center gap-2 type-small">
                <PortalPartnerTag locale={locale} />
                {localize(locale, {
                  fr: "En ligne depuis le ",
                  en: "Online since ",
                })}
                {localeDate(submission.updatedAt, locale, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .
                <Link
                  href={`/article/${submission.publishedArticleSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-accent underline underline-offset-2"
                >
                  {localize(locale, {
                    fr: "Voir l'article",
                    en: "View article",
                  })}
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </Link>
              </p>
              <p className="mt-2 type-small text-muted-foreground">
                {localize(locale, {
                  fr: "Les vues, le temps de lecture moyen et les partages apparaissent dans ",
                  en: "Views, average reading time and shares appear in ",
                })}
                <Link
                  href="/entreprise/statistiques"
                  className="underline underline-offset-2"
                >
                  {localize(locale, {
                    fr: "vos statistiques",
                    en: "your statistics",
                  })}
                </Link>
                .
              </p>
            </div>
          )}

        {submission.status === "rejected" && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
            <p className="type-small font-semibold text-destructive">
              {localize(locale, {
                fr: "Dépôt non retenu",
                en: "Submission rejected",
              })}
            </p>
            <p className="mt-1 type-small text-foreground">
              {submission.rejectionReason}
            </p>
          </div>
        )}

        {submission.reviewNotes.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 font-display type-h2">
              <MessageSquareText aria-hidden="true" className="size-5" />
              {localize(locale, { fr: "Suivi", en: "Review history" })}
            </h2>
            <ol className="mt-4 grid gap-3">
              {[...submission.reviewNotes].reverse().map((note, index) => (
                <li
                  key={`${note.at}-${index}`}
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <p className="type-small font-semibold">
                    {locale === "en"
                      ? (STATUS_EN[note.status as WorkflowStatus] ??
                        note.status)
                      : (STATUS_LABEL[note.status] ?? note.status)}{" "}
                    ·{" "}
                    {localeDate(note.at, locale, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-1 type-small text-muted-foreground">
                    {note.comment}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        <OfficeSection
          icon={FileText}
          title={
            submission.editable
              ? localize(locale, {
                  fr: "Modifier le dépôt",
                  en: "Edit submission",
                })
              : localize(locale, {
                  fr: "Contenu déposé",
                  en: "Submitted content",
                })
          }
          description={
            submission.editable
              ? undefined
              : localize(locale, {
                  fr: "Le dépôt est entre les mains de la rédaction : il n'est plus modifiable. Il le redeviendra si des modifications sont demandées.",
                  en: "The submission is now with the newsroom and can no longer be edited. It will become editable again if changes are requested.",
                })
          }
        >
          {submission.editable ? (
            <SubmissionForm draft={draft} />
          ) : (
            <>
              <h3 className="font-display type-h3">{submission.title}</h3>
              <p className="mt-2 type-body font-medium">{submission.dek}</p>
              <div className="mt-4 max-w-reading type-body whitespace-pre-wrap">
                {blocksToText(submission.body)}
              </div>
            </>
          )}
        </OfficeSection>
      </div>
    </>
  );
}
