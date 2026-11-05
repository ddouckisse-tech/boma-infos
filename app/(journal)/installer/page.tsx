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
    title: "Le journal en un geste",
    description:
      "Touchez l’icône BOMA Infos pour retrouver les articles et les rubriques, sans rechercher l’adresse du site.",
  },
  {
    icon: WifiOff,
    title: "Retrouver vos lectures",
    description:
      "Seuls les articles déjà ouverts et conservés sur cet appareil peuvent être relus hors connexion. Une connexion reste nécessaire pour de nouvelles lectures.",
  },
  {
    icon: RefreshCw,
    title: "Un journal qui reste à jour",
    description:
      "Les améliorations arrivent automatiquement lors de vos prochaines connexions. Vous retrouvez le même journal et ses nouvelles publications.",
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
    <div lang="fr">
      <header className="dark border-b border-border bg-night py-8 text-foreground md:py-14">
        <Container>
          <nav aria-label="Fil d’Ariane" className="mb-8 type-small">
            <Link
              href="/"
              prefetch={false}
              className="inline-flex min-h-11 items-center text-accent underline-offset-4 hover:underline"
            >
              Accueil
            </Link>
            <span aria-hidden="true" className="px-2 text-muted-foreground">
              /
            </span>
            <span aria-current="page" className="text-muted-foreground">
              Installer le journal
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
                    Votre journal à portée de main
                  </p>
                </div>
              </div>

              <h1 className="max-w-[22ch] font-display type-h1 text-balance">
                BOMA Infos sur votre écran d’accueil
              </h1>
              <span aria-hidden="true" className="mt-5 boma-rule w-24" />
              <p className="mt-5 max-w-reading type-body text-muted-foreground">
                Retrouvez toute l’actualité du Gabon depuis une icône sur votre
                téléphone. L’installation est gratuite et se fait directement
                depuis votre navigateur, sans passer par une boutique
                d’applications.
              </p>
              <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <PwaInstallAction className="w-full sm:w-auto" />
                <a
                  href="#instructions"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-border-strong px-4 type-small font-semibold text-foreground transition-colors touch-target hover:bg-surface-muted"
                >
                  Voir les étapes
                  <ArrowRight aria-hidden="true" className="size-4" />
                </a>
              </div>
            </div>

            <aside className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <Smartphone aria-hidden="true" className="size-9 text-accent" />
              <h2 className="mt-4 font-display type-h3">
                Votre écran, votre journal
              </h2>
              <ul className="mt-4 grid gap-3 type-small text-muted-foreground">
                {[
                  "Une icône parmi vos applications",
                  "Le même journal sur Android, iPhone et iPad",
                  "Des mises à jour automatiques",
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-success-token"
                    />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </Container>
      </header>

      <Section aria-label="Les avantages de l’installation">
        <div className="grid gap-4 md:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-6"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-lg bg-accent-surface text-accent">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h2 className="mt-4 font-display type-h3">{title}</h2>
              <p className="mt-2 type-small text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="instructions"
        title="Installer sur votre téléphone"
        description="Choisissez les étapes qui correspondent à votre appareil. Les libellés peuvent varier légèrement selon votre navigateur."
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
              Vous arrivez de WhatsApp ou Facebook ?
            </h3>
            <p className="mt-2 type-small text-muted-foreground">
              Ouvrez d’abord cette page dans Safari sur iPhone ou iPad, ou dans
              Chrome sur Android. Depuis le menu de l’application, choisissez
              l’option qui ouvre la page dans votre navigateur. Vous pourrez
              ensuite suivre les étapes ci-dessous.
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
                  Chrome ou un navigateur compatible
                </p>
              </div>
            </div>
            <InstallationSteps>
              {[
                <p key="open">
                  Ouvrez ce site dans <strong>Chrome</strong>, ou dans un
                  navigateur Android compatible avec l’installation.
                </p>,
                <p key="menu">
                  Ouvrez le <strong>menu du navigateur</strong>, puis choisissez{" "}
                  <strong>« Installer l’application »</strong> ou{" "}
                  <strong>« Ajouter à l’écran d’accueil »</strong>.
                </p>,
                <p key="confirm">
                  Validez l’installation ou l’ajout. Ouvrez ensuite BOMA Infos
                  depuis l’icône ajoutée à votre téléphone.
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
                <h3 className="font-display type-h2">iPhone et iPad</h3>
                <p className="mt-1 type-small text-muted-foreground">
                  Depuis Safari
                </p>
              </div>
            </div>
            <InstallationSteps>
              {[
                <p key="open">
                  Ouvrez le journal dans <strong>Safari</strong> sur votre
                  iPhone ou votre iPad.
                </p>,
                <p key="share">
                  Touchez <strong>« Partager »</strong>{" "}
                  <Share2
                    aria-hidden="true"
                    className="inline size-4 align-text-bottom"
                  />{" "}
                  dans le navigateur.
                </p>,
                <p key="home">
                  Choisissez <strong>« Sur l’écran d’accueil »</strong>. Si
                  l’option <strong>« Ouvrir comme app web »</strong> est
                  proposée, activez-la.
                </p>,
                <p key="add">
                  Touchez <strong>« Ajouter »</strong>, puis ouvrez BOMA Infos
                  depuis la nouvelle icône sur votre écran d’accueil.
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
              <h2 className="font-display type-h3">Et sur ordinateur ?</h2>
              <p className="mt-2 type-small text-muted-foreground">
                Un navigateur compatible peut proposer une icône d’installation
                dans la barre d’adresse, ou une option dans son menu. Vous
                pouvez aussi retrouver le journal dans votre onglet habituel.
              </p>
            </div>
          </article>
          <article className="min-w-0 rounded-xl border border-border bg-surface-muted p-5 sm:p-6">
            <h2 className="font-display type-h3">
              Une question avant de commencer ?
            </h2>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 type-small">
              <Link
                href="/hors-ligne"
                prefetch={false}
                className="inline-flex min-h-11 items-center gap-2 text-accent underline underline-offset-4"
              >
                Comprendre la lecture hors ligne
              </Link>
              <Link
                href="/contacts"
                prefetch={false}
                className="inline-flex min-h-11 items-center gap-2 text-accent underline underline-offset-4"
              >
                Demander de l’aide
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
            Lire le journal
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </Section>
    </div>
  );
}
