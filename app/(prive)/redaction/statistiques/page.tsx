"use client";

import { useQuery } from "convex/react";
import { ChartNoAxesColumn, Clock, Eye, Share2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
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
      <div>
        <h1 className="flex items-center gap-2 font-serif type-h1">
          <ChartNoAxesColumn
            aria-hidden="true"
            className="size-4 text-accent"
          />
          Statistiques d&apos;audience
        </h1>
        <p className="mt-3 max-w-3xl type-body text-muted-foreground">
          La mesure est faite sur nos propres serveurs, sans traqueur tiers,
          sans cookie et sans identifiant&nbsp;: le comptage a lieu au passage
          de la requête, et la durée de lecture provient d&apos;une balise de
          quelques centaines d&apos;octets posée sur la page d&apos;article.
          Aucune ligne enregistrée ne décrit un lecteur. L&apos;ancien site
          chargeait MonsterInsights et Google Analytics&nbsp;; celui-ci ne
          charge aucun script tiers de mesure.
        </p>
      </div>

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

          <section aria-labelledby="courbe-vues">
            <h2
              id="courbe-vues"
              className="flex items-center gap-2 font-serif type-h3"
            >
              <Eye
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
              Vues des trente derniers jours
            </h2>
            {overview.byDay.length === 0 ? (
              <p className="mt-2 type-body text-muted-foreground">
                Aucune vue enregistrée pour l&apos;instant.
              </p>
            ) : (
              <DailyViewsChart byDay={overview.byDay} />
            )}
          </section>

          <section aria-labelledby="par-rubrique">
            <h2 id="par-rubrique" className="font-serif type-h3">
              Par rubrique
            </h2>
            <SectionBreakdown bySection={overview.bySection} />
          </section>

          <section aria-labelledby="par-article">
            <h2 id="par-article" className="font-serif type-h3">
              Par article
            </h2>
            <div className="mt-3 overflow-x-auto">
              <ArticleTable articles={overview.articles} />
            </div>
          </section>
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

  return (
    <div className="mt-3">
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
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse type-small">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="border-b border-border py-1 text-left"
                >
                  Jour
                </th>
                <th
                  scope="col"
                  className="border-b border-border py-1 text-right"
                >
                  Vues
                </th>
              </tr>
            </thead>
            <tbody>
              {byDay.map((point) => (
                <tr key={point.day}>
                  <td className="border-b border-border py-1">
                    {formatDate(new Date(point.day).getTime())}
                  </td>
                  <td className="border-b border-border py-1 text-right tabular-nums">
                    {formatNumber(point.views)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function SectionBreakdown({ bySection }: { bySection: SectionRow[] }) {
  if (bySection.length === 0) {
    return (
      <p className="mt-2 type-body text-muted-foreground">
        Aucune vue par rubrique pour l&apos;instant.
      </p>
    );
  }
  const max = Math.max(1, ...bySection.map((section) => section.views));
  return (
    <ul className="mt-3 flex flex-col gap-3">
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
  return (
    <table className="w-full min-w-[860px] border-collapse type-small">
      <thead>
        <tr className="text-left text-muted-foreground">
          <th scope="col" className="border-b border-border py-2 pr-3">
            Article
          </th>
          <th scope="col" className="border-b border-border py-2 pr-3">
            Rubrique
          </th>
          <th scope="col" className="border-b border-border py-2 pr-3">
            Origine
          </th>
          <th scope="col" className="border-b border-border py-2 pr-3">
            Publié le
          </th>
          <th
            scope="col"
            className="border-b border-border py-2 pr-3 text-right"
          >
            <span className="inline-flex items-center justify-end gap-1">
              <Eye aria-hidden="true" className="size-4" />
              Vues
            </span>
          </th>
          <th
            scope="col"
            className="border-b border-border py-2 pr-3 text-right"
          >
            <span className="inline-flex items-center justify-end gap-1">
              <Clock aria-hidden="true" className="size-4" />
              Lecture moy.
            </span>
          </th>
          <th
            scope="col"
            className="border-b border-border py-2 pr-3 text-right"
          >
            <span className="inline-flex items-center justify-end gap-1">
              <Share2 aria-hidden="true" className="size-4" />
              Partages
            </span>
          </th>
          <th scope="col" className="border-b border-border py-2">
            Par canal
          </th>
        </tr>
      </thead>
      <tbody>
        {articles.map((article) => (
          <tr key={article.slug}>
            <td className="border-b border-border py-2 pr-3">
              <a
                href={`/article/${article.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center font-semibold text-accent underline underline-offset-2 touch-target"
              >
                {article.title}
              </a>
            </td>
            <td className="border-b border-border py-2 pr-3">
              {article.categoryName}
            </td>
            <td className="border-b border-border py-2 pr-3">
              {article.origin === "partenaire"
                ? "Contenu partenaire"
                : "Rédaction"}
            </td>
            <td className="border-b border-border py-2 pr-3 tabular-nums">
              {formatDate(article.publishedAt)}
            </td>
            <td className="border-b border-border py-2 pr-3 text-right tabular-nums">
              {formatNumber(article.views)}
            </td>
            <td className="border-b border-border py-2 pr-3 text-right tabular-nums">
              {formatDuration(article.averageReadingSeconds)}
            </td>
            <td className="border-b border-border py-2 pr-3 text-right tabular-nums">
              {formatNumber(article.shares)}
            </td>
            <td className="border-b border-border py-2">
              {article.sharesByChannel.length > 0
                ? article.sharesByChannel
                    .map((entry) => `${entry.channel} ${entry.count}`)
                    .join(" · ")
                : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
