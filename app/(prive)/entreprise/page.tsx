"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Building2, FilePlus2, Hourglass, Info, Megaphone } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { OfficeHeader, OfficeSection } from "@/components/custom/office-header";
import { StatsTile } from "@/components/custom/stats-tile";
import { usePreferences } from "@/components/providers/preferences-provider";
import { localeDate, localize } from "@/lib/i18n";
import { STATUS_TONE, type WorkflowStatus } from "@/lib/private";
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

const STATUS_FR: Record<WorkflowStatus, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  in_review: "En revue",
  changes_requested: "Modifications demandées",
  scheduled: "Programmé",
  published: "Publié",
  rejected: "Refusé",
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
      {locale === "en" ? STATUS_EN[known] : STATUS_FR[known]}
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
 * Company portal home — CDC §4.4 point 6.
 *
 * Shows this company's deposits and nothing else. The list comes from
 * `portal.mySubmissions`, which resolves the organisation from the session
 * and never accepts one as an argument.
 */
export default function PortalHome() {
  const { locale } = usePreferences();
  const organization = useQuery(api.portal.myOrganization, {});
  const submissions = useQuery(api.portal.mySubmissions, {});

  if (organization === undefined) {
    return (
      <p className="type-body text-muted-foreground">
        {localize(locale, { fr: "Chargement…", en: "Loading…" })}
      </p>
    );
  }

  if (!organization) {
    return (
      <OfficeHeader
        icon={Building2}
        title={localize(locale, {
          fr: "Espace entreprise",
          en: "Company space",
        })}
        description={localize(locale, {
          fr: "Aucune entreprise n'est rattachée à ce compte. Contactez la rédaction.",
          en: "No company is linked to this account. Contact the newsroom.",
        })}
      />
    );
  }

  if (!organization.approved) {
    return (
      <>
        <OfficeHeader icon={Building2} title={organization.name} />
        <OfficeSection
          icon={Hourglass}
          tone="warning"
          title={
            organization.reviewState === "rejected"
              ? localize(locale, {
                  fr: "Demande non retenue",
                  en: "Request declined",
                })
              : localize(locale, {
                  fr: "Compte en attente de validation",
                  en: "Account awaiting approval",
                })
          }
          description={
            organization.reviewState === "rejected" ? (
              <>
                {localize(locale, {
                  fr: "La rédaction n’a pas donné suite à votre demande.",
                  en: "The newsroom did not approve your request.",
                })}
                {organization.reviewNote
                  ? localize(locale, {
                      fr: ` Motif : ${organization.reviewNote}`,
                      en: ` Reason: ${organization.reviewNote}`,
                    })
                  : ""}
              </>
            ) : (
              localize(locale, {
                fr: "Un administrateur valide chaque compte à la main. Vous recevrez un message dès l'ouverture ; le dépôt d'actualité sera alors possible.",
                en: "An administrator reviews every account manually. You will receive a message once it is opened, and you will then be able to submit news.",
              })
            )
          }
        />
      </>
    );
  }

  const rows = submissions ?? [];
  const waiting = rows.filter(
    (row) => row.status === "submitted" || row.status === "in_review"
  ).length;
  const published = rows.filter((row) => row.status === "published").length;
  const toRework = rows.filter(
    (row) => row.status === "changes_requested"
  ).length;

  return (
    <>
      <OfficeHeader
        icon={Building2}
        title={organization.name}
        description={organization.sector}
        actions={
          <Link
            href="/entreprise/depot/nouveau"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground touch-target"
          >
            <FilePlus2 aria-hidden="true" className="size-4" />
            {localize(locale, {
              fr: "Déposer une actualité",
              en: "Submit news",
            })}
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsTile
          label={localize(locale, {
            fr: "En cours d'examen",
            en: "Under review",
          })}
          value={waiting}
        />
        <StatsTile
          label={localize(locale, {
            fr: "À retravailler",
            en: "Needs changes",
          })}
          value={toRework}
          tone={toRework > 0 ? "warning" : "default"}
        />
        <StatsTile
          label={localize(locale, { fr: "Publiés", en: "Published" })}
          value={published}
          tone={published > 0 ? "success" : "default"}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4 type-small text-muted-foreground">
        <Info aria-hidden="true" className="size-4 shrink-0" />
        {localize(locale, {
          fr: "Tout contenu publié depuis cet espace porte la mention ",
          en: "All content published from this space carries the ",
        })}
        <PortalPartnerTag locale={locale} />
        {localize(locale, {
          fr: ", visible sur l’article et dans les listes.",
          en: " label, visible on the article and in lists.",
        })}
      </div>

      <h2 className="mt-8 font-display type-h2">
        {localize(locale, { fr: "Mes dépôts", en: "My submissions" })}
      </h2>

      {submissions === undefined ? (
        <p className="mt-4 type-body text-muted-foreground">
          {localize(locale, { fr: "Chargement…", en: "Loading…" })}
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-4 rounded-xl border border-border bg-card p-6 type-body text-muted-foreground">
          {localize(locale, {
            fr: "Aucun dépôt pour l’instant. Le premier se crée avec « Déposer une actualité ».",
            en: "No submissions yet. Create your first one with ‘Submit news’.",
          })}
        </p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {rows.map((row) => (
            <li key={row._id}>
              <Link
                href={`/entreprise/depot/${row._id}`}
                className="block rounded-xl border border-border bg-card p-4 transition-colors touch-target hover:border-foreground/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display type-h3">{row.title}</p>
                    <p className="mt-1 type-small text-muted-foreground">
                      {locale === "en"
                        ? ((
                            {
                              communique: "Press release",
                              nomination: "Appointment",
                              resultats: "Results",
                              evenement: "Event",
                              publi_redactionnel: "Advertorial",
                            } as Record<string, string>
                          )[row.kind] ?? row.kindLabel)
                        : row.kindLabel}
                      {localize(locale, {
                        fr: " · modifié le ",
                        en: " · updated ",
                      })}
                      {localeDate(row.updatedAt, locale, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <PortalStatus status={row.status} locale={locale} />
                </div>
                {row.status === "changes_requested" && row.lastComment && (
                  <p className="mt-3 rounded-xs border border-warning-token/40 bg-warning-token/10 px-2 py-1.5 type-small text-foreground">
                    {localize(locale, { fr: "Rédaction : ", en: "Newsroom: " })}
                    {row.lastComment}
                  </p>
                )}
                {row.status === "rejected" && row.rejectionReason && (
                  <p className="mt-3 rounded-xs border border-destructive/40 bg-destructive/10 px-2 py-1.5 type-small text-destructive">
                    {localize(locale, {
                      fr: "Motif du refus : ",
                      en: "Reason for rejection: ",
                    })}
                    {row.rejectionReason}
                  </p>
                )}
                {row.status === "published" && row.publishedArticleSlug && (
                  <p className="mt-3 type-small">
                    {localize(locale, { fr: "En ligne : ", en: "Online: " })}
                    <span className="font-mono">
                      /article/{row.publishedArticleSlug}
                    </span>
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
