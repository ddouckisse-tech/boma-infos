import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Monitor,
  RefreshCw,
  Share2,
  Smartphone,
  Tablet,
  WifiOff,
  Zap,
} from "lucide-react";
import { LocalizedText } from "@/components/custom/localized-text";
import { Container } from "@/components/custom/container";
import { PwaInstallAction } from "@/components/custom/pwa-install";
import { Section } from "@/components/custom/section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Installer BOMA Infos",
  description:
    "Ajoutez BOMA Infos à votre écran d’accueil sur Android, iPhone ou iPad. Installation gratuite depuis votre navigateur, avec accès rapide au journal.",
  alternates: { canonical: "/installer" },
  openGraph: {
    type: "website",
    url: "/installer",
    title: "BOMA Infos sur votre écran d’accueil",
    description:
      "Votre journal à portée de main. Découvrez comment l’installer sur votre téléphone depuis Chrome ou Safari.",
  },
};

const BENEFITS = [
  {
    icon: Zap,
    title: {
      fr: "Le journal en un geste",
      en: "One tap to open the newspaper",
    },
    description: {
      fr: "Touchez l’icône BOMA Infos pour retrouver les articles et les rubriques, sans rechercher l’adresse du site.",
      en: "Tap the BOMA Infos icon to open articles and sections directly.",
    },
  },
  {
    icon: WifiOff,
    title: { fr: "Retrouver vos lectures", en: "Read articles offline" },
    description: {
      fr: "Seuls les articles déjà ouverts et conservés sur cet appareil peuvent être relus hors connexion. Une connexion reste nécessaire pour de nouvelles lectures.",
      en: "You can reread articles saved on this device after opening them. You’ll need a connection to open new articles.",
    },
  },
  {
    icon: RefreshCw,
    title: { fr: "Un journal qui reste à jour", en: "Automatic updates" },
    description: {
      fr: "Les améliorations arrivent automatiquement lors de vos prochaines connexions. Vous retrouvez le même journal et ses nouvelles publications.",
      en: "The app updates automatically when you reconnect. Open it as usual to see the latest stories.",
    },
  },
] as const;

function InstallationSteps({ children }: { children: readonly ReactNode[] }) {
  return (
    <ol role="list" className="mt-6 grid gap-5">
      {children.map((step, index) => (
        <li key={index} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-surface type-small font-semibold text-accent"
          >
            {index + 1}
          </span>
          <div className="min-w-0 pt-0.5 type-body">{step}</div>
        </li>
      ))}
    </ol>
  );
}

/** Public installation guide; only the contextual install action needs client code. */
export default function InstallPage() {
  return (
    <div>
      <header className="dark border-b border-border bg-night py-8 text-foreground md:py-14">
        <Container>
          <nav
            aria-label="Breadcrumb / Fil d’Ariane"
            className="mb-8 type-small"
          >
            <Link
              href="/"
              prefetch={false}
              className="inline-flex min-h-11 items-center text-accent underline-offset-4 hover:underline"
            >
              <LocalizedText fr="Accueil" en="Home" />
            </Link>
            <span aria-hidden="true" className="px-2 text-muted-foreground">
              /
            </span>
            <span aria-current="page" className="text-muted-foreground">
              <LocalizedText fr="Installer le journal" en="Install the app" />
            </span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-14">
            <div className="min-w-0">
              <div className="mb-5 flex items-center gap-4">
                {/* The existing app icon is served directly, without a new image variant. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/apple-touch-icon.png?v=boma-1"
                  alt=""
                  width={180}
                  height={180}
                  className="size-20 shrink-0 rounded-2xl border border-border sm:size-24"
                />
                <div>
                  <p className="font-display type-h3">{SITE.name}</p>
                  <p className="mt-1 type-small text-muted-foreground">
                    <LocalizedText
                      fr="Votre journal à portée de main"
                      en="Your newspaper at your fingertips"
                    />
                  </p>
                </div>
              </div>

              <h1 className="max-w-[22ch] font-display type-h1 text-balance">
                <LocalizedText
                  fr="BOMA Infos sur votre écran d’accueil"
                  en="BOMA Infos on your home screen"
                />
              </h1>
              <p className="mt-5 max-w-reading type-body text-muted-foreground">
                <LocalizedText
                  fr="Retrouvez toute l’actualité du Gabon depuis une icône sur votre téléphone. L’installation est gratuite et se fait directement depuis votre navigateur, sans passer par une boutique d’applications."
                  en="Get the latest news from Gabon from an icon on your phone. You can install the app free of charge from your browser without visiting an app store."
                />
              </p>
              <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <PwaInstallAction className="w-full sm:w-auto" />
                <a
                  href="#instructions"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border-strong px-4 type-small font-semibold text-foreground transition-colors touch-target hover:bg-surface-muted"
                >
                  <LocalizedText
                    fr="Voir les étapes"
                    en="See installation steps"
                  />
                  <ArrowRight aria-hidden="true" className="size-4" />
                </a>
              </div>
            </div>

            <aside className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <Smartphone aria-hidden="true" className="size-9 text-accent" />
              <h2 className="mt-4 font-display type-h3">
                <LocalizedText
                  fr="Votre écran, votre journal"
                  en="Your newspaper on your device"
                />
              </h2>
              <ul className="mt-4 grid gap-3 type-small text-muted-foreground">
                {[
                  {
                    fr: "Une icône parmi vos applications",
                    en: "An icon alongside your apps",
                  },
                  {
                    fr: "Le même journal sur Android, iPhone et iPad",
                    en: "The same newspaper on Android, iPhone and iPad",
                  },
                  {
                    fr: "Des mises à jour automatiques",
                    en: "Automatic updates",
                  },
                ].map((benefit) => (
                  <li key={benefit.fr} className="flex items-start gap-2">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-success-token"
                    />
                    <LocalizedText {...benefit} />
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </Container>
      </header>

      <Section aria-label="Installation">
        <div className="grid gap-4 md:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <article
              key={title.fr}
              className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-6"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-lg bg-accent-surface text-accent">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h2 className="mt-4 font-display type-h3">
                <LocalizedText {...title} />
              </h2>
              <p className="mt-2 type-small text-muted-foreground">
                <LocalizedText {...description} />
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="instructions"
        title={
          <LocalizedText
            fr="Installer sur votre téléphone"
            en="Install on your phone"
          />
        }
        description={
          <LocalizedText
            fr="Choisissez les étapes qui correspondent à votre appareil. Les libellés peuvent varier légèrement selon votre navigateur."
            en="Follow the steps for your device. Menu labels may vary slightly depending on your browser."
          />
        }
        tone="muted"
        className="scroll-mt-28"
      >
        <aside
          id="navigateur-integre"
          className="mb-6 flex scroll-mt-24 items-start gap-3 rounded-xl border border-border bg-card p-4 sm:p-5"
        >
          <ExternalLink
            aria-hidden="true"
            className="mt-1 size-5 shrink-0 text-accent"
          />
          <div className="min-w-0">
            <h3 className="font-display type-h3">
              <LocalizedText
                fr="Vous arrivez de WhatsApp ou Facebook ?"
                en="Coming from WhatsApp or Facebook?"
              />
            </h3>
            <p className="mt-2 type-small text-muted-foreground">
              <LocalizedText
                fr="Ouvrez d’abord cette page dans Safari sur iPhone ou iPad, ou dans Chrome sur Android. Depuis le menu de l’application, choisissez l’option qui ouvre la page dans votre navigateur. Vous pourrez ensuite suivre les étapes ci-dessous."
                en="Open this page in Safari on iPhone or iPad, or in Chrome on Android. Use the app’s menu to open the page in your browser. Then follow the steps below."
              />
            </p>
          </div>
        </aside>

        <div className="grid items-start gap-6 md:grid-cols-2">
          <article
            id="android"
            className="min-w-0 scroll-mt-24 rounded-xl border border-border bg-card p-5 sm:p-7"
          >
            <div className="flex items-center gap-3">
              <Smartphone
                aria-hidden="true"
                className="size-7 shrink-0 text-accent"
              />
              <div>
                <h3 className="font-display type-h2">Android</h3>
                <p className="mt-1 type-small text-muted-foreground">
                  <LocalizedText
                    fr="Chrome ou un navigateur compatible"
                    en="Chrome or another compatible browser"
                  />
                </p>
              </div>
            </div>
            <InstallationSteps>
              {[
                <p key="open">
                  <LocalizedText
                    fr="Ouvrez ce site dans Chrome, ou dans un navigateur Android compatible avec l’installation."
                    en="Open this site in Chrome or another Android browser that supports installation."
                  />
                </p>,
                <p key="menu">
                  <LocalizedText
                    fr="Ouvrez le menu du navigateur, puis choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil »."
                    en="Open the browser menu and select “Install app” or “Add to Home screen”."
                  />
                </p>,
                <p key="confirm">
                  <LocalizedText
                    fr="Validez l’installation ou l’ajout. Ouvrez ensuite BOMA Infos depuis l’icône ajoutée à votre téléphone."
                    en="Confirm, then open BOMA Infos using the new icon on your phone."
                  />
                </p>,
              ]}
            </InstallationSteps>
          </article>

          <article
            id="iphone-ipad"
            className="min-w-0 scroll-mt-24 rounded-xl border border-border bg-card p-5 sm:p-7"
          >
            <span id="ios" className="block scroll-mt-24" aria-hidden="true" />
            <div className="flex items-center gap-3">
              <Tablet
                aria-hidden="true"
                className="size-7 shrink-0 text-accent"
              />
              <div>
                <h3 className="font-display type-h2">
                  <LocalizedText fr="iPhone et iPad" en="iPhone and iPad" />
                </h3>
                <p className="mt-1 type-small text-muted-foreground">
                  <LocalizedText fr="Depuis Safari" en="Using Safari" />
                </p>
              </div>
            </div>
            <InstallationSteps>
              {[
                <p key="open">
                  <LocalizedText
                    fr="Ouvrez le journal dans Safari sur votre iPhone ou votre iPad."
                    en="Open the newspaper in Safari on your iPhone or iPad."
                  />
                </p>,
                <p key="share">
                  <LocalizedText
                    fr="Touchez « Partager » dans le navigateur."
                    en="Tap “Share” in the browser."
                  />{" "}
                  <Share2
                    aria-hidden="true"
                    className="inline size-4 align-text-bottom"
                  />
                </p>,
                <p key="home">
                  <LocalizedText
                    fr="Choisissez « Sur l’écran d’accueil ». Si l’option « Ouvrir comme app web » est proposée, activez-la."
                    en="Select “Add to Home Screen”. If “Open as Web App” appears, switch it on."
                  />
                </p>,
                <p key="add">
                  <LocalizedText
                    fr="Touchez « Ajouter », puis ouvrez BOMA Infos depuis la nouvelle icône sur votre écran d’accueil."
                    en="Tap “Add”, then open BOMA Infos using the new icon on your home screen."
                  />
                </p>,
              ]}
            </InstallationSteps>
          </article>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <article className="flex min-w-0 items-start gap-3 rounded-xl border border-border p-5 sm:p-6">
            <Monitor
              aria-hidden="true"
              className="mt-1 size-6 shrink-0 text-accent"
            />
            <div className="min-w-0">
              <h2 className="font-display type-h3">
                <LocalizedText
                  fr="Et sur ordinateur ?"
                  en="Using a computer?"
                />
              </h2>
              <p className="mt-2 type-small text-muted-foreground">
                <LocalizedText
                  fr="Un navigateur compatible peut proposer une icône d’installation dans la barre d’adresse, ou une option dans son menu. Vous pouvez aussi retrouver le journal dans votre onglet habituel."
                  en="A compatible browser may show an install icon in the address bar or an install option in its menu. You can also keep reading in a regular browser tab."
                />
              </p>
            </div>
          </article>
          <article className="min-w-0 rounded-xl border border-border bg-surface-muted p-5 sm:p-6">
            <h2 className="font-display type-h3">
              <LocalizedText
                fr="Une question avant de commencer ?"
                en="Need help getting started?"
              />
            </h2>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 type-small">
              <Link
                href="/hors-ligne"
                prefetch={false}
                className="inline-flex min-h-11 items-center gap-2 text-accent underline underline-offset-4"
              >
                <LocalizedText
                  fr="Comprendre la lecture hors ligne"
                  en="Learn how offline reading works"
                />
              </Link>
              <Link
                href="/contacts"
                prefetch={false}
                className="inline-flex min-h-11 items-center gap-2 text-accent underline underline-offset-4"
              >
                <LocalizedText fr="Demander de l’aide" en="Get help" />
              </Link>
            </div>
          </article>
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
          >
            <LocalizedText fr="Lire le journal" en="Read the newspaper" />
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </Section>
    </div>
  );
}
