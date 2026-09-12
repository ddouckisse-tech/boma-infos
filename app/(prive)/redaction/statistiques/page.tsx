"use client";

import { useQuery } from "convex/react";
import { ChartNoAxesColumn, Clock, Eye, Share2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { DataTable, type DataColumn } from "@/components/custom/data-table";
import { OfficeHeader, OfficeSection } from "@/components/custom/office-header";
import { StatsTile } from "@/components/custom/stats-tile";
import { formatDate, formatDuration, formatNumber } from "@/lib/private";

type DayPoint = { day: string; views: number };
type SectionRow = { name: string; views: number };
type ArticleRow = {
  slug: string;
  title: string;
  categoryName: string;
  origin: string;
  publishedAt: number;
  views: number;
  averageReadingSeconds: number;
  shares: number;
  sharesByChannel: { channel: string; count: number }[];
};

/**
 * Statistiques d'audience — CDC §4.4 point 6, §5.4 (sans traqueur tiers).
 *
 * Les chiffres viennent d'un compteur posé côté serveur (`convex/stats.ts`,
 * `proxy.ts`) et d'une balise de quelques centaines d'octets sur la page
 * d'article — jamais d'un script tiers, jamais d'un cookie, jamais d'un
 * identifiant. Aucune ligne enregistrée ne décrit un lecteur : ce sont des
 * compteurs, pas un journal de visites.
 */
export default function AudienceStatsPage() {
  const overview = useQuery(api.stats.overview, {});

  return (
    <div className="flex flex-col gap-8 pb-12">
      <OfficeHeader
        icon={ChartNoAxesColumn}
        title="Statistiques"
        description={
          <>
            La mesure est faite sur nos propres serveurs, sans traqueur tiers,
            sans cookie et sans identifiant&nbsp;: le comptage a lieu au passage
            de la requête, et la durée de lecture provient d&apos;une balise de
            quelques centaines d&apos;octets posée sur la page d&apos;article.
            Aucune ligne enregistrée ne décrit un lecteur. L&apos;ancien site
            chargeait MonsterInsights et Google Analytics&nbsp;; celui-ci ne
            charge aucun script tiers de mesure.
          </>
        }
      />

      {overview === undefined ? (
        <p className="type-body text-muted-foreground" role="status">
          Chargement des statistiques…
        </p>
      ) : overview.articles.length === 0 ? (
        <p className="type-body text-muted-foreground">
          Aucune donnée d&apos;audience pour l&apos;instant. Les compteurs se
          remplissent à la première visite d&apos;un article publié.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatsTile
              label="Vues totales"
              value={formatNumber(overview.totalViews)}
            />
            <StatsTile
              label="Partages"
              value={formatNumber(overview.totalShares)}
            />
            <StatsTile
              label="Temps de lecture moyen"
              value={formatDuration(overview.averageReadingSeconds)}
            />
            <StatsTile
              label="Articles mesurés"
              value={formatNumber(overview.articles.length)}
            />
          </div>

          <OfficeSection
            id="courbe-vues"
            icon={Eye}
            title="Vues des trente derniers jours"
          >
            {overview.byDay.length === 0 ? (
              <p className="type-body text-muted-foreground">
                Aucune vue enregistrée pour l&apos;instant.
              </p>
            ) : (
              <DailyViewsChart byDay={overview.byDay} />
            )}
          </OfficeSection>

          <OfficeSection id="par-rubrique" title="Par rubrique">
            <SectionBreakdown bySection={overview.bySection} />
          </OfficeSection>

          <OfficeSection id="par-article" title="Par article">
            <ArticleTable articles={overview.articles} />
          </OfficeSection>
        </>
      )}
    </div>
  );
}

/**
 * Trente points au plus : x réparti linéairement sur 0→600, y proportionnel
 * aux vues du jour le plus consulté de la période (§ courbe, pas de
 * librairie de graphiques).
 */
function DailyViewsChart({ byDay }: { byDay: DayPoint[] }) {
  const max = Math.max(1, ...byDay.map((point) => point.views));
  const points = byDay
    .map((point, index) => {
      const x = byDay.length > 1 ? (index / (byDay.length - 1)) * 600 : 300;
      const y = 150 - (point.views / max) * 140;
      return `${x},${y}`;
    })
    .join(" ");
  const dayColumns: DataColumn<DayPoint>[] = [
    {
      key: "day",
      header: "Jour",
      primary: true,
      cell: (point) => formatDate(new Date(point.day).getTime()),
    },
    {
      key: "views",
      header: "Vues",
      align: "end",
      className: "tabular-nums",
      cell: (point) => formatNumber(point.views),
    },
  ];

  return (
    <>
      <svg
        viewBox="0 0 600 160"
        role="img"
        aria-label="Vues par jour sur les trente derniers jours"
        className="h-40 w-full"
      >
        <line
          x1={0}
          y1={150}
          x2={600}
          y2={150}
          stroke="var(--border)"
          strokeWidth={1}
        />
        <polyline
          fill="none"
          stroke="var(--color-brand-magenta)"
          strokeWidth={2}
          points={points}
        />
      </svg>
      <div className="mt-2 flex items-center justify-between type-small text-muted-foreground">
        <span>{formatDate(new Date(byDay[0].day).getTime())}</span>
        <span>
          {formatDate(new Date(byDay[byDay.length - 1].day).getTime())}
        </span>
      </div>
      <details className="mt-3">
        <summary className="inline-flex items-center type-small font-semibold text-accent underline underline-offset-2 touch-target">
          Voir les données du graphique
        </summary>
        <div className="mt-2">
          <DataTable
            columns={dayColumns}
            rows={byDay}
            rowKey={(point) => point.day}
            caption="Vues par jour sur les trente derniers jours"
          />
        </div>
      </details>
    </>
  );
}

function SectionBreakdown({ bySection }: { bySection: SectionRow[] }) {
  if (bySection.length === 0) {
    return (
      <p className="type-body text-muted-foreground">
        Aucune vue par rubrique pour l&apos;instant.
      </p>
    );
  }
  const max = Math.max(1, ...bySection.map((section) => section.views));
  return (
    <ul className="flex flex-col gap-3">
      {bySection.map((section) => (
        <li key={section.name}>
          <div className="flex items-center justify-between type-small">
            <span className="font-medium text-foreground">{section.name}</span>
            <span className="text-muted-foreground tabular-nums">
              {formatNumber(section.views)}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-xs bg-surface-muted">
            <div
              className="h-2 rounded-xs bg-brand-magenta"
              style={{ width: `${Math.round((section.views / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ArticleTable({ articles }: { articles: ArticleRow[] }) {
  const columns: DataColumn<ArticleRow>[] = [
    {
      key: "title",
      header: "Article",
      primary: true,
      cell: (article) => (
        <a
          href={`/article/${article.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center font-semibold text-accent underline underline-offset-2 touch-target"
        >
          {article.title}
        </a>
      ),
    },
    {
      key: "category",
      header: "Rubrique",
      cell: (article) => article.categoryName,
    },
    {
      key: "origin",
      header: "Origine",
      cell: (article) =>
        article.origin === "partenaire" ? "Contenu partenaire" : "Rédaction",
    },
    {
      key: "publishedAt",
      header: "Publié le",
      className: "tabular-nums",
      cell: (article) => formatDate(article.publishedAt),
    },
    {
      key: "views",
      header: (
        <span className="inline-flex items-center justify-end gap-1">
          <Eye aria-hidden="true" className="size-4" />
          Vues
        </span>
      ),
      align: "end",
      className: "tabular-nums",
      cell: (article) => formatNumber(article.views),
    },
    {
      key: "reading",
      header: (
        <span className="inline-flex items-center justify-end gap-1">
          <Clock aria-hidden="true" className="size-4" />
          Lecture moy.
        </span>
      ),
      align: "end",
      className: "tabular-nums",
      cell: (article) => formatDuration(article.averageReadingSeconds),
    },
    {
      key: "shares",
      header: (
        <span className="inline-flex items-center justify-end gap-1">
          <Share2 aria-hidden="true" className="size-4" />
          Partages
        </span>
      ),
      align: "end",
      className: "tabular-nums",
      cell: (article) => formatNumber(article.shares),
    },
    {
      key: "channels",
      header: "Par canal",
      cell: (article) =>
        article.sharesByChannel.length > 0
          ? article.sharesByChannel
              .map((entry) => `${entry.channel} ${entry.count}`)
              .join(" · ")
          : "—",
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={articles}
      rowKey={(article) => article.slug}
      caption="Articles mesurés, du plus consulté au moins consulté"
      minWidth="54rem"
    />
  );
}
