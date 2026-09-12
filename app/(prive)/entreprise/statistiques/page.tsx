"use client";

import { useQuery } from "convex/react";
import { Clock, Eye, Megaphone, Share2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
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

export default function OrganizationStatisticsPage() {
  const data = useQuery(api.stats.forOrganization, {});

  return (
    <>
      <h1 className="font-serif type-h1">Statistiques de diffusion</h1>
      <p className="mt-4 max-w-reading type-body text-muted-foreground">
        Ces chiffres ne concernent que les publications de votre entreprise.
        Le périmètre est calculé côté serveur à partir de votre
        session&nbsp;: aucune donnée d&apos;une autre entreprise n&apos;est
        lue, même en appelant l&apos;API directement. Mesure sans traqueur
        tiers ni cookie.
      </p>

      {data === undefined ? (
        <p className="mt-6 type-body text-muted-foreground">
          Chargement des statistiques…
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="relative">
              <Eye
                aria-hidden="true"
                className="absolute top-4 right-4 size-4 text-muted-foreground"
              />
              <StatsTile label="Vues" value={formatNumber(data.totalViews)} />
            </div>
            <div className="relative">
              <Share2
                aria-hidden="true"
                className="absolute top-4 right-4 size-4 text-muted-foreground"
              />
              <StatsTile
                label="Partages"
                value={formatNumber(data.totalShares)}
              />
            </div>
            <div className="relative">
              <Clock
                aria-hidden="true"
                className="absolute top-4 right-4 size-4 text-muted-foreground"
              />
              <StatsTile
                label="Temps de lecture moyen"
                value={formatDuration(data.averageReadingSeconds)}
              />
            </div>
          </div>

          <h2 className="mt-8 font-serif type-h2">Publications</h2>
          {data.articles.length === 0 ? (
            <p className="mt-4 rounded-md border border-border bg-card p-6 type-body text-muted-foreground">
              Aucune publication pour l&apos;instant. Les statistiques
              apparaissent dès qu&apos;un de vos dépôts est publié.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[56rem] border-collapse text-left">
                <caption className="sr-only">
                  Statistiques de diffusion de vos publications
                </caption>
                <thead>
                  <tr className="border-b border-border">
                    <th
                      scope="col"
                      className="py-2 pr-4 type-small font-semibold"
                    >
                      Titre
                    </th>
                    <th
                      scope="col"
                      className="py-2 pr-4 type-small font-semibold"
                    >
                      Rubrique
                    </th>
                    <th
                      scope="col"
                      className="py-2 pr-4 type-small font-semibold"
                    >
                      Publié le
                    </th>
                    <th
                      scope="col"
                      className="py-2 pr-4 type-small font-semibold"
                    >
                      Vues
                    </th>
                    <th
                      scope="col"
                      className="py-2 pr-4 type-small font-semibold"
                    >
                      Lecture moyenne
                    </th>
                    <th
                      scope="col"
                      className="py-2 pr-4 type-small font-semibold"
                    >
                      Partages
                    </th>
                    <th scope="col" className="py-2 type-small font-semibold">
                      Détail par canal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.articles.map((article) => (
                    <tr key={article.slug} className="border-b border-border">
                      <td className="py-3 pr-4 align-top">
                        <a
                          href={`/article/${article.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="type-small font-semibold text-accent underline-offset-2 hover:underline"
                        >
                          {article.title}
                        </a>
                        <div className="mt-1.5">
                          <PartnerBadge />
                        </div>
                      </td>
                      <td className="py-3 pr-4 align-top type-small text-muted-foreground">
                        {article.categoryName}
                      </td>
                      <td className="py-3 pr-4 align-top type-small whitespace-nowrap">
                        {formatDateTime(article.publishedAt)}
                      </td>
                      <td className="py-3 pr-4 align-top type-small tabular-nums">
                        {formatNumber(article.views)}
                      </td>
                      <td className="py-3 pr-4 align-top type-small tabular-nums whitespace-nowrap">
                        {formatDuration(article.averageReadingSeconds)}
                      </td>
                      <td className="py-3 pr-4 align-top type-small tabular-nums">
                        {formatNumber(article.shares)}
                      </td>
                      <td className="py-3 align-top type-small text-muted-foreground">
                        {article.sharesByChannel.length === 0 ? (
                          "—"
                        ) : (
                          <ul className="grid gap-0.5">
                            {article.sharesByChannel.map((entry) => (
                              <li
                                key={entry.channel}
                                className="tabular-nums"
                              >
                                {CHANNEL_LABEL[entry.channel] ?? entry.channel}
                                &nbsp;: {formatNumber(entry.count)}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
