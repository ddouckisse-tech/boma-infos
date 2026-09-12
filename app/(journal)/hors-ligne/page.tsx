import type { Metadata } from "next";
import Link from "next/link";
import { CloudOff, Gauge, RefreshCw } from "lucide-react";
import { Container } from "@/components/custom/container";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";

export const metadata: Metadata = {
  title: "Hors ligne",
  description: "Vous êtes hors connexion.",
  robots: { index: false, follow: false },
};

/**
 * Offline page, precached by the service worker (CDC §2.2).
 *
 * Served instead of the browser's network error whenever a page the reader
 * has never opened is requested without a connection. It is deliberately
 * plain: no picture, no font beyond the two already cached, nothing that
 * would need the network it is apologising for the absence of.
 *
 * No client JavaScript either — the "réessayer" control is a link back to
 * the same page, which the browser retries over the network.
 */
export default function OfflinePage() {
  return (
    <>
      <PageHeader
        eyebrow="Connexion"
        title="Vous êtes hors ligne"
        description="Cette page n'a pas encore été consultée, elle n'est donc pas disponible en mémoire. Les articles que vous avez déjà ouverts, eux, restent lisibles."
        width="reading"
      />

      <Section width="reading">
        <Container width="reading" className="px-0">
          <div className="flex gap-3 rounded-md border border-border bg-card p-6">
            <CloudOff
              aria-hidden="true"
              className="mt-1 size-5 shrink-0 text-muted-foreground"
            />
            <div className="min-w-0">
              <h2 className="font-serif type-h3">Ce que vous pouvez faire</h2>
              <ul className="mt-3 space-y-3 type-body">
                <li className="flex gap-3">
                  <RefreshCw
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-muted-foreground"
                  />
                  <span>
                    Réessayer une fois le réseau revenu — le journal se
                    rechargera de lui-même.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Gauge
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-muted-foreground"
                  />
                  <span>
                    Activer l&apos;<strong>économie de données</strong> en bas
                    de page&nbsp;: sur un réseau faible, les pages se chargent
                    avec des images allégées et aucune vidéo.
                  </span>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  prefetch={false}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
                >
                  <RefreshCw aria-hidden="true" className="size-4" />
                  Réessayer l&apos;accueil
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-6 type-small text-muted-foreground">
            Le Corporate garde en mémoire les quarante dernières pages que vous
            avez ouvertes, pour que les coupures de réseau ne vous privent pas
            de ce que vous avez déjà téléchargé.
          </p>
        </Container>
      </Section>
    </>
  );
}
