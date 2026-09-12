import type { Metadata } from "next";
import Link from "next/link";
import { CloudOff, Gauge, RefreshCw } from "lucide-react";
import { Container } from "@/components/custom/container";
import { LocalizedText } from "@/components/custom/localized-text";
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
        eyebrow={<LocalizedText fr="Connexion" en="Connection" />}
        title={<LocalizedText fr="Vous êtes hors ligne" en="You are offline" />}
        description={
          <LocalizedText
            fr="Cette page n'a pas encore été consultée, elle n'est donc pas disponible en mémoire. Les articles que vous avez déjà ouverts, eux, restent lisibles."
            en="This page has not been opened before, so it is not available from your device. Articles you have already opened remain readable."
          />
        }
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
              <h2 className="font-display type-h3">
                <LocalizedText
                  fr="Ce que vous pouvez faire"
                  en="What you can do"
                />
              </h2>
              <ul className="mt-3 space-y-3 type-body">
                <li className="flex gap-3">
                  <RefreshCw
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-muted-foreground"
                  />
                  <span>
                    <LocalizedText
                      fr="Réessayez une fois le réseau revenu — le journal se rechargera de lui-même."
                      en="Try again when the network returns; the journal will reload automatically."
                    />
                  </span>
                </li>
                <li className="flex gap-3">
                  <Gauge
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-muted-foreground"
                  />
                  <span>
                    <LocalizedText
                      fr="Activez l'économie de données en bas de page : sur un réseau faible, les pages se chargent avec des images allégées et aucune vidéo."
                      en="Turn on data saver at the bottom of the page. On a weak network, pages use lighter images and no video."
                    />
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
                  <LocalizedText
                    fr="Réessayer l'accueil"
                    en="Try the home page again"
                  />
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-6 type-small text-muted-foreground">
            <LocalizedText
              fr="Le Corporate garde en mémoire les quarante dernières pages que vous avez ouvertes, pour que les coupures de réseau ne vous privent pas de ce que vous avez déjà téléchargé."
              en="Le Corporate keeps the last forty pages you opened on your device, so network outages do not remove content you have already downloaded."
            />
          </p>
        </Container>
      </Section>
    </>
  );
}
