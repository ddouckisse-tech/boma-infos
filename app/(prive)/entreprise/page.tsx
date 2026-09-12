"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { FilePlus2, Hourglass, Info } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { StatsTile } from "@/components/custom/stats-tile";
import { StatusPill } from "@/components/custom/status-pill";
import { PartnerTag } from "@/components/custom/partner-tag";
import { formatDateTime } from "@/lib/private";

/**
 * Company portal home — CDC §4.4 point 6.
 *
 * Shows this company's deposits and nothing else. The list comes from
 * `portal.mySubmissions`, which resolves the organisation from the session
 * and never accepts one as an argument.
 */
export default function PortalHome() {
  const organization = useQuery(api.portal.myOrganization, {});
  const submissions = useQuery(api.portal.mySubmissions, {});

  if (organization === undefined) {
    return <p className="type-body text-muted-foreground">Chargement…</p>;
  }

  if (!organization) {
    return (
      <>
        <h1 className="font-display type-h1">Espace entreprise</h1>
        <p className="mt-4 type-body text-muted-foreground">
          Aucune entreprise n&apos;est rattachée à ce compte. Contactez la
          rédaction.
        </p>
      </>
    );
  }

  if (!organization.approved) {
    return (
      <>
        <h1 className="font-display type-h1">{organization.name}</h1>
        <div className="mt-6 rounded-lg border border-l-2 border-border border-l-warning-token bg-card p-6">
          <h2 className="flex items-center gap-2 font-display type-h3">
            <Hourglass
              aria-hidden="true"
              className="size-5 text-warning-token"
            />
            {organization.reviewState === "rejected"
              ? "Demande non retenue"
              : "Compte en attente de validation"}
          </h2>
          {organization.reviewState === "rejected" ? (
            <p className="mt-3 type-body text-muted-foreground">
              La rédaction n&apos;a pas donné suite à votre demande.
              {organization.reviewNote
                ? ` Motif : ${organization.reviewNote}`
                : ""}
            </p>
          ) : (
            <p className="mt-3 type-body text-muted-foreground">
              Un administrateur valide chaque compte à la main — c&apos;est une
              exigence du cahier des charges, pas un délai technique. Vous
              recevrez un message dès l&apos;ouverture ; le dépôt
              d&apos;actualité sera alors possible.
            </p>
          )}
        </div>
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display type-h1">{organization.name}</h1>
          <p className="mt-1 type-small text-muted-foreground">
            {organization.sector}
          </p>
        </div>
        <Link
          href="/entreprise/depot/nouveau"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground touch-target"
        >
          <FilePlus2 aria-hidden="true" className="size-4" />
          Déposer une actualité
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatsTile label="En cours d'examen" value={waiting} />
        <StatsTile
          label="À retravailler"
          value={toRework}
          tone={toRework > 0 ? "warning" : "default"}
        />
        <StatsTile
          label="Publiés"
          value={published}
          tone={published > 0 ? "success" : "default"}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-md border border-border bg-card p-4 type-small text-muted-foreground">
        <Info aria-hidden="true" className="size-4 shrink-0" />
        Tout contenu publié depuis cet espace porte la mention{" "}
        <PartnerTag size="small" />, visible sur l&apos;article et dans les
        listes.
      </div>

      <h2 className="mt-8 font-display type-h2">Mes dépôts</h2>

      {submissions === undefined ? (
        <p className="mt-4 type-body text-muted-foreground">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 rounded-md border border-border bg-card p-6 type-body text-muted-foreground">
          Aucun dépôt pour l&apos;instant. Le premier se crée avec « Déposer une
          actualité ».
        </p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {rows.map((row) => (
            <li key={row._id}>
              <Link
                href={`/entreprise/depot/${row._id}`}
                className="block rounded-md border border-border bg-card p-4 transition-colors hover:border-foreground/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display type-h3">{row.title}</p>
                    <p className="mt-1 type-small text-muted-foreground">
                      {row.kindLabel} · modifié le{" "}
                      {formatDateTime(row.updatedAt)}
                    </p>
                  </div>
                  <StatusPill status={row.status} />
                </div>
                {row.status === "changes_requested" && row.lastComment && (
                  <p className="mt-3 rounded-xs border border-warning-token/40 bg-warning-token/10 px-2 py-1.5 type-small text-foreground">
                    Rédaction&nbsp;: {row.lastComment}
                  </p>
                )}
                {row.status === "rejected" && row.rejectionReason && (
                  <p className="mt-3 rounded-xs border border-destructive/40 bg-destructive/10 px-2 py-1.5 type-small text-destructive">
                    Motif du refus&nbsp;: {row.rejectionReason}
                  </p>
                )}
                {row.status === "published" && row.publishedArticleSlug && (
                  <p className="mt-3 type-small">
                    En ligne&nbsp;:{" "}
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
