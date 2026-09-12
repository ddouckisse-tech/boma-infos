"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Building2, FilePlus2, Inbox } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { StatsTile } from "@/components/custom/stats-tile";
import { StatusPill } from "@/components/custom/status-pill";
import { formatDateTime, formatNumber } from "@/lib/private";

/**
 * Newsroom dashboard — CDC §4.4: what to publish, what is waiting for
 * review, which company deposits are pending, recent pieces, audience.
 */
export default function NewsroomDashboard() {
  const data = useQuery(api.newsroom.dashboard, {});

  if (data === undefined) {
    return (
      <>
        <h1 className="font-serif type-h1">Tableau de bord</h1>
        <p className="mt-4 type-body text-muted-foreground">Chargement…</p>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif type-h1">Tableau de bord</h1>
        <Link
          href="/redaction/articles"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground touch-target"
        >
          <FilePlus2 aria-hidden="true" className="size-4" />
          Écrire un article
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsTile label="Brouillons" value={data.counts.draft} />
        <StatsTile
          label="En attente de revue"
          value={data.counts.inReview}
          tone={data.counts.inReview > 0 ? "warning" : "default"}
        />
        <StatsTile label="Programmés" value={data.counts.scheduled} />
        <StatsTile
          label="Publiés"
          value={data.counts.published}
          tone="success"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link
          href="/redaction/depots"
          className="rounded-md border border-border bg-card p-4 transition-colors hover:border-foreground/30"
        >
          <p className="flex items-center gap-2 type-small text-muted-foreground">
            <Inbox aria-hidden="true" className="size-4" />
            Dépôts entreprises à traiter
          </p>
          <p className="mt-1 font-serif type-h2 tabular-nums">
            {data.submissionsWaiting}
          </p>
        </Link>
        <Link
          href="/redaction/comptes"
          className="rounded-md border border-border bg-card p-4 transition-colors hover:border-foreground/30"
        >
          <p className="flex items-center gap-2 type-small text-muted-foreground">
            <Building2 aria-hidden="true" className="size-4" />
            Entreprises en attente de validation
          </p>
          <p className="mt-1 font-serif type-h2 tabular-nums">
            {data.organizationsWaiting}
          </p>
        </Link>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="min-w-0">
          <h2 className="font-serif type-h2">Articles récents</h2>
          {data.recent.length === 0 ? (
            <p className="mt-4 type-body text-muted-foreground">
              Aucun article pour l&apos;instant.
            </p>
          ) : (
            <ul className="mt-4 grid gap-2">
              {data.recent.map((row) => (
                <li key={row._id}>
                  <Link
                    href={`/redaction/articles/${row._id}`}
                    className="block rounded-md border border-border bg-card p-3 transition-colors hover:border-foreground/30"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="type-body font-medium">{row.title}</p>
                        <p className="mt-0.5 type-small text-muted-foreground">
                          {row.categoryName} · {row.authorName} · modifié le{" "}
                          {formatDateTime(row.updatedAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {row.pendingSuggestions > 0 && (
                          <span className="rounded-xs border border-border px-1.5 py-0.5 type-small text-muted-foreground">
                            {row.pendingSuggestions} proposition
                            {row.pendingSuggestions > 1 ? "s" : ""}
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
        </section>

        <section className="min-w-0">
          <h2 className="font-serif type-h2">Audience</h2>
          <div className="mt-4 grid gap-3">
            <StatsTile
              label="Vues — 7 derniers jours"
              value={formatNumber(data.audience.views7d)}
            />
            <StatsTile
              label="Vues — 30 derniers jours"
              value={formatNumber(data.audience.views30d)}
            />
          </div>
          <h3 className="mt-6 font-serif type-h3">Les plus lus</h3>
          {data.audience.topArticles.length === 0 ? (
            <p className="mt-2 type-small text-muted-foreground">
              Aucune vue enregistrée. Les compteurs se remplissent à la première
              visite d&apos;un article publié.
            </p>
          ) : (
            <ol className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-1">
              {/* `minmax(0,1fr)` et non `1fr` : une colonne de grille se
                  dimensionne sinon sur son contenu le plus large, et le titre
                  pourtant tronqué débordait la page à 320 px. */}
              {data.audience.topArticles.map((item) => (
                <li
                  key={item.slug}
                  className="flex items-baseline justify-between gap-3 type-small"
                >
                  <span className="min-w-0 truncate">{item.title}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {formatNumber(item.views)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <Link
            href="/redaction/statistiques"
            className="mt-4 inline-flex items-center rounded-md border border-border px-3 type-small font-semibold touch-target hover:bg-surface-muted"
          >
            Toutes les statistiques
          </Link>
        </section>
      </div>
    </>
  );
}
