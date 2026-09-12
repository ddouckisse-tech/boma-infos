"use client";

import { useQuery } from "convex/react";
import { ChartNoAxesColumn, Clock, Eye, Megaphone, Share2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { DataTable, type DataColumn } from "@/components/custom/data-table";
import { OfficeHeader, OfficeSection } from "@/components/custom/office-header";
import { StatsTile } from "@/components/custom/stats-tile";
import { formatDateTime, formatDuration, formatNumber } from "@/lib/private";

/**
 * Statistiques de diffusion — espace entreprise, CDC §4.4 point 6.
 *
 * `stats.forOrganization` ne prend aucun argument : le périmètre (quelles
 * publications compter) est résolu côté serveur à partir de la session, et
 * non d'un identifiant que cet écran fournirait. C'est le cloisonnement
 * lui-même, pas une simple précaution d'affichage — appeler l'API
 * directement avec un autre identifiant ne changerait rien.
 */

const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  email: "Courriel",
  lien: "Lien",
  autre: "Autre",
};

/** CDC §4.4 : mention obligatoire, visible et non désactivable. */
function PartnerBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-xs border border-warning-token/40 bg-warning-token/10 px-1.5 py-0.5 type-small font-semibold text-warning-token">
      <Megaphone aria-hidden="true" className="size-4" />
      Contenu partenaire
    </span>
  );
}

type ArticleRow = {
  slug: string;
  title: string;
  categoryName: string;
  publishedAt: number;
  views: number;
  averageReadingSeconds: number;
  shares: number;
  sharesByChannel: { channel: string; count: number }[];
};

export default function OrganizationStatisticsPage() {
  const data = useQuery(api.stats.forOrganization, {});

  return (
    <div className="flex flex-col gap-8">
      <OfficeHeader
        icon={ChartNoAxesColumn}
        title="Statistiques de diffusion"
        description={
          <>
            Ces chiffres ne concernent que les publications de votre entreprise.
            Le périmètre est calculé côté serveur à partir de votre
            session&nbsp;: aucune donnée d&apos;une autre entreprise n&apos;est
            lue, même en appelant l&apos;API directement. Mesure sans traqueur
            tiers ni cookie.
          </>
        }
      />

      {data === undefined ? (
        <p className="type-body text-muted-foreground">
          Chargement des statistiques…
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatsTile label="Vues" value={formatNumber(data.totalViews)} />
            <StatsTile
              label="Partages"
              value={formatNumber(data.totalShares)}
            />
            <StatsTile
              label="Temps de lecture moyen"
              value={formatDuration(data.averageReadingSeconds)}
            />
          </div>

          <OfficeSection title="Publications">
            <ArticleTable articles={data.articles} />
          </OfficeSection>
        </>
      )}
    </div>
  );
}

function ArticleTable({ articles }: { articles: ArticleRow[] }) {
  const columns: DataColumn<ArticleRow>[] = [
    {
      key: "title",
      header: "Titre",
      primary: true,
      cell: (article) => (
        <>
          <a
            href={`/article/${article.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center type-small font-semibold text-accent underline-offset-2 touch-target hover:underline"
          >
            {article.title}
          </a>
          <div className="mt-1.5">
            <PartnerBadge />
          </div>
        </>
      ),
    },
    {
      key: "category",
      header: "Rubrique",
      cell: (article) => article.categoryName,
    },
    {
      key: "publishedAt",
      header: "Publié le",
      className: "whitespace-nowrap tabular-nums",
      cell: (article) => formatDateTime(article.publishedAt),
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
      className: "whitespace-nowrap tabular-nums",
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
      header: "Détail par canal",
      cell: (article) =>
        article.sharesByChannel.length === 0 ? (
          "—"
        ) : (
          <ul className="grid gap-0.5">
            {article.sharesByChannel.map((entry) => (
              <li key={entry.channel} className="tabular-nums">
                {CHANNEL_LABEL[entry.channel] ?? entry.channel}
                &nbsp;: {formatNumber(entry.count)}
              </li>
            ))}
          </ul>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={articles}
      rowKey={(article) => article.slug}
      caption="Statistiques de diffusion de vos publications"
      empty="Aucune publication pour l'instant. Les statistiques apparaissent dès qu'un de vos dépôts est publié."
      minWidth="54rem"
    />
  );
}
