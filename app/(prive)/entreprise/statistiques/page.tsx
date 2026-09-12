"use client";

import { useQuery } from "convex/react";
import { ChartNoAxesColumn, Clock, Eye, Megaphone, Share2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { DataTable, type DataColumn } from "@/components/custom/data-table";
import { OfficeHeader, OfficeSection } from "@/components/custom/office-header";
import { StatsTile } from "@/components/custom/stats-tile";
import { usePreferences } from "@/components/providers/preferences-provider";
import { interfaceLocale, localeDate, localize } from "@/lib/i18n";
import type { LocaleChoice } from "@/lib/preferences";

/**
 * Statistiques de diffusion — espace entreprise, CDC §4.4 point 6.
 *
 * `stats.forOrganization` ne prend aucun argument : le périmètre (quelles
 * publications compter) est résolu côté serveur à partir de la session, et
 * non d'un identifiant que cet écran fournirait. C'est le cloisonnement
 * lui-même, pas une simple précaution d'affichage — appeler l'API
 * directement avec un autre identifiant ne changerait rien.
 */

const CHANNEL_LABEL_FR: Record<string, string> = {
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  email: "Courriel",
  lien: "Lien",
  autre: "Autre",
};

const CHANNEL_LABEL_EN: Record<string, string> = {
  whatsapp: "WhatsApp",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  email: "Email",
  lien: "Link",
  autre: "Other",
};

const formatNumber = (value: number, locale: LocaleChoice) =>
  value.toLocaleString(interfaceLocale(locale));

const formatDuration = (seconds: number, locale: LocaleChoice) => {
  if (seconds <= 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (locale === "en")
    return minutes > 0 ? `${minutes} min ${rest} sec` : `${rest} sec`;
  return minutes > 0 ? `${minutes} min ${rest} s` : `${rest} s`;
};

/** CDC §4.4 : mention obligatoire, visible et non désactivable. */
function PartnerBadge() {
  const { locale } = usePreferences();
  return (
    <span className="inline-flex items-center gap-1 rounded-xs border border-warning-token/40 bg-warning-token/10 px-1.5 py-0.5 type-small font-semibold text-warning-token">
      <Megaphone aria-hidden="true" className="size-4" />
      {localize(locale, { fr: "Contenu partenaire", en: "Partner content" })}
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
  const { locale } = usePreferences();
  const data = useQuery(api.stats.forOrganization, {});

  return (
    <div className="flex flex-col gap-8">
      <OfficeHeader
        icon={ChartNoAxesColumn}
        title={localize(locale, {
          fr: "Statistiques de diffusion",
          en: "Publication statistics",
        })}
        description={
          <>
            {localize(locale, {
              fr: "Ces chiffres ne concernent que les publications de votre entreprise. Le périmètre est calculé côté serveur à partir de votre session : aucune donnée d’une autre entreprise n’est lue, même en appelant l’API directement. Mesure sans traqueur tiers ni cookie.",
              en: "These figures only cover your company’s publications. The scope is calculated on the server from your session: no data from another company is read, even when calling the API directly. Measurement uses no third-party tracker or cookie.",
            })}
          </>
        }
      />

      {data === undefined ? (
        <p className="type-body text-muted-foreground">
          {localize(locale, {
            fr: "Chargement des statistiques…",
            en: "Loading statistics…",
          })}
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatsTile
              label={localize(locale, { fr: "Vues", en: "Views" })}
              value={formatNumber(data.totalViews, locale)}
            />
            <StatsTile
              label={localize(locale, { fr: "Partages", en: "Shares" })}
              value={formatNumber(data.totalShares, locale)}
            />
            <StatsTile
              label={localize(locale, {
                fr: "Temps de lecture moyen",
                en: "Average reading time",
              })}
              value={formatDuration(data.averageReadingSeconds, locale)}
            />
          </div>

          <OfficeSection
            title={localize(locale, { fr: "Publications", en: "Publications" })}
          >
            <ArticleTable articles={data.articles} />
          </OfficeSection>
        </>
      )}
    </div>
  );
}

function ArticleTable({ articles }: { articles: ArticleRow[] }) {
  const { locale } = usePreferences();
  const columns: DataColumn<ArticleRow>[] = [
    {
      key: "title",
      header: localize(locale, { fr: "Titre", en: "Title" }),
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
      header: localize(locale, { fr: "Rubrique", en: "Section" }),
      cell: (article) => article.categoryName,
    },
    {
      key: "publishedAt",
      header: localize(locale, { fr: "Publié le", en: "Published" }),
      className: "whitespace-nowrap tabular-nums",
      cell: (article) =>
        localeDate(article.publishedAt, locale, {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      key: "views",
      header: (
        <span className="inline-flex items-center justify-end gap-1">
          <Eye aria-hidden="true" className="size-4" />
          {localize(locale, { fr: "Vues", en: "Views" })}
        </span>
      ),
      align: "end",
      className: "tabular-nums",
      cell: (article) => formatNumber(article.views, locale),
    },
    {
      key: "reading",
      header: (
        <span className="inline-flex items-center justify-end gap-1">
          <Clock aria-hidden="true" className="size-4" />
          {localize(locale, { fr: "Lecture moy.", en: "Avg. read" })}
        </span>
      ),
      align: "end",
      className: "whitespace-nowrap tabular-nums",
      cell: (article) => formatDuration(article.averageReadingSeconds, locale),
    },
    {
      key: "shares",
      header: (
        <span className="inline-flex items-center justify-end gap-1">
          <Share2 aria-hidden="true" className="size-4" />
          {localize(locale, { fr: "Partages", en: "Shares" })}
        </span>
      ),
      align: "end",
      className: "tabular-nums",
      cell: (article) => formatNumber(article.shares, locale),
    },
    {
      key: "channels",
      header: localize(locale, { fr: "Détail par canal", en: "By channel" }),
      cell: (article) =>
        article.sharesByChannel.length === 0 ? (
          "—"
        ) : (
          <ul className="grid gap-0.5">
            {article.sharesByChannel.map((entry) => (
              <li key={entry.channel} className="tabular-nums">
                {(locale === "en" ? CHANNEL_LABEL_EN : CHANNEL_LABEL_FR)[
                  entry.channel
                ] ?? entry.channel}
                &nbsp;: {formatNumber(entry.count, locale)}
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
      caption={localize(locale, {
        fr: "Statistiques de diffusion de vos publications",
        en: "Publication statistics for your content",
      })}
      empty={localize(locale, {
        fr: "Aucune publication pour l'instant. Les statistiques apparaissent dès qu'un de vos dépôts est publié.",
        en: "No publications yet. Statistics will appear as soon as one of your submissions is published.",
      })}
      minWidth="54rem"
    />
  );
}
