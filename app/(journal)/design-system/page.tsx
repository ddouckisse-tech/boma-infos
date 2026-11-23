import type { Metadata } from "next";
import Link from "next/link";
import { BrandWordmark } from "@/components/custom/brand-wordmark";
import { Container } from "@/components/custom/container";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { ComponentStates } from "./_components/component-states";
import {
  BRAND_SWATCHES,
  BREAKPOINTS,
  FLAG_RAMP,
  FUNCTIONAL_SWATCHES,
  FUNCTIONAL_SWATCHES_DARK,
  GOLD_RAMP,
  NAVY_RAMP,
  NEUTRAL_RAMP,
  RADII,
  SEMANTIC_TOKENS,
  SPACING_SCALE,
  TYPE_SCALE,
  type Swatch,
} from "@/lib/design-tokens";

export const metadata: Metadata = {
  title: "Design system",
  description:
    "Palette, typographie, espacements et composants de base de BOMA Infos, en thème clair et sombre.",
  robots: { index: false, follow: false },
};

/**
 * Contrastes mesurés (formule WCAG 2.x) sur les valeurs servies par
 * `app/globals.css`. Recalculés à chaque évolution de la palette.
 */
const CONTRAST_CHECKS = [
  {
    pair: "#0D152A sur #FFFFFF",
    ratio: "18,14:1",
    verdict: "AAA — corps de texte, thème clair",
    ok: true,
  },
  {
    pair: "#0D152A sur #F3F6FB",
    ratio: "16,74:1",
    verdict: "AAA — corps de texte sur surface douce",
    ok: true,
  },
  {
    pair: "#ECF0F9 sur #050D2B",
    ratio: "16,74:1",
    verdict: "AAA — corps de texte sur fond nuit, thème sombre",
    ok: true,
  },
  {
    pair: "#ECF0F9 sur #101C41",
    ratio: "14,55:1",
    verdict: "AAA — corps de texte sur surcouche sombre",
    ok: true,
  },
  {
    pair: "#4B556C sur #FFFFFF",
    ratio: "7,46:1",
    verdict: "AAA — texte atténué, thème clair",
    ok: true,
  },
  {
    pair: "#ACB7D2 sur #050D2B",
    ratio: "9,52:1",
    verdict: "AAA — texte atténué, thème sombre",
    ok: true,
  },
  {
    pair: "#0B1848 sur #FFFFFF",
    ratio: "16,96:1",
    verdict: "AAA — marine de marque, thème clair",
    ok: true,
  },
  {
    pair: "#0B1848 sur #050D2B",
    ratio: "1,13:1",
    verdict:
      "échec — le marine ne porte pas de texte en thème sombre : on y utilise navy-300 (10,51:1)",
    ok: false,
  },
  {
    pair: "#0D54C6 sur #FFFFFF",
    ratio: "6,77:1",
    verdict: "AA — accent bleu textuel, thème clair",
    ok: true,
  },
  {
    pair: "#0D54C6 sur #F3F6FB",
    ratio: "6,25:1",
    verdict: "AA — accent bleu textuel sur surface douce",
    ok: true,
  },
  {
    pair: "#F7C755 sur #FFFFFF",
    ratio: "1,58:1",
    verdict: "échec — jamais de texte or sur blanc",
    ok: false,
  },
  {
    pair: "#030921 sur #F7C755",
    ratio: "12,45:1",
    verdict: "AAA — texte marine sur aplat or",
    ok: true,
  },
  {
    pair: "#F7C755 sur #050D2B",
    ratio: "12,06:1",
    verdict:
      "AAA — or sur fond nuit : accent et action primaire du thème sombre",
    ok: true,
  },
  {
    pair: "#7D869C sur #FFFFFF",
    ratio: "3,64:1",
    verdict: "AA non textuel — bordure de contrôle",
    ok: true,
  },
  {
    pair: "#657498 sur #050D2B",
    ratio: "4,10:1",
    verdict: "AA non textuel — bordure de contrôle sombre",
    ok: true,
  },
  {
    pair: "#1765E6 sur #FFFFFF",
    ratio: "5,20:1",
    verdict: "AA — anneau de focus, thème clair",
    ok: true,
  },
] as const;

const SUMMARY = [
  { href: "#couleurs", label: "Couleurs" },
  { href: "#signature", label: "Signature de la charte" },
  { href: "#typographie", label: "Typographie" },
  { href: "#lecture", label: "Colonne de lecture" },
  { href: "#espacements", label: "Espacements et formes" },
  { href: "#accessibilite", label: "Accessibilité" },
  { href: "#composants", label: "Composants" },
  { href: "#mise-en-page", label: "Mise en page" },
] as const;

/**
 * Les titres de l'échelle sont composés en Source Serif 4 ; le corps et les
 * légendes déclarent déjà Inter dans leur propre classe.
 */
const sampleClass = (className: string) =>
  className.includes("font-") ? className : `font-display ${className}`;

function SwatchTile({ swatch }: { swatch: Swatch }) {
  return (
    <li className="min-w-0 overflow-hidden rounded-md border border-border bg-card">
      <div
        className="h-14 w-full"
        style={{ backgroundColor: swatch.value }}
        aria-hidden="true"
      />
      <div className="p-3">
        <p className="type-small font-semibold text-foreground">
          {swatch.label}
        </p>
        <p className="font-mono type-small text-muted-foreground" data-numeric>
          {swatch.value}
        </p>
        {swatch.note && (
          <p className="mt-1 type-small text-muted-foreground">{swatch.note}</p>
        )}
      </div>
    </li>
  );
}

function Ramp({ title, swatches }: { title: string; swatches: Swatch[] }) {
  return (
    <div className="mt-8">
      <h3 className="font-display type-h3 text-foreground">{title}</h3>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {swatches.map((swatch) => (
          <SwatchTile key={swatch.token} swatch={swatch} />
        ))}
      </ul>
    </div>
  );
}

/** Renders its children forced into the dark theme, whatever the page theme. */
function DarkPreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark rounded-md border border-border bg-background p-4 text-foreground">
      {children}
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <>
      <PageHeader
        eyebrow="Référence interne"
        title="Design system"
        description="La palette, la typographie, les espacements et tous les composants de base, en thème clair et en thème sombre. Cette page est l'instrument de vérification du socle : elle n'est pas indexée."
        actions={
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-border px-4 type-small font-semibold transition-colors touch-target hover:bg-surface-muted"
          >
            Retour à l&apos;accueil
          </Link>
        }
      />

      <Section spacing="compact" aria-label="Sommaire">
        <nav aria-label="Sommaire de la page">
          <ul className="flex flex-wrap gap-2">
            {SUMMARY.map((entry) => (
              <li key={entry.href}>
                <a
                  href={entry.href}
                  className="inline-flex items-center rounded-md border border-border px-3 type-small transition-colors touch-target hover:bg-surface-muted"
                >
                  {entry.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="couleurs"
        tone="muted"
        title="Couleurs"
        description="Les surfaces neutres servent de fond au journal. Les couleurs de marque, leurs nuances et les couleurs fonctionnelles sont présentées ci-dessous."
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BRAND_SWATCHES.map((swatch) => (
            <SwatchTile key={swatch.token} swatch={swatch} />
          ))}
        </ul>

        <Ramp
          title="Neutres — très légèrement teintés marine"
          swatches={NEUTRAL_RAMP}
        />
        <Ramp
          title="Échelle marine — navy-900 est le marine de marque, navy-950 le fond de la charte"
          swatches={NAVY_RAMP}
        />
        <Ramp
          title="Échelle or — gold-400 pour l'emphase et les aplats, gold-800 pour le texte sur blanc"
          swatches={GOLD_RAMP}
        />
        <Ramp title="Vert et bleu du logo" swatches={FLAG_RAMP} />

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="font-display type-h3 text-foreground">
              Couleurs fonctionnelles — thème clair
            </h3>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FUNCTIONAL_SWATCHES.map((swatch) => (
                <SwatchTile key={swatch.token} swatch={swatch} />
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display type-h3 text-foreground">
              Couleurs fonctionnelles — thème sombre
            </h3>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FUNCTIONAL_SWATCHES_DARK.map((swatch) => (
                <SwatchTile key={swatch.token} swatch={swatch} />
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-display type-h3 text-foreground">
            Jetons sémantiques, les deux thèmes côte à côte
          </h3>
          <p className="mt-1 max-w-reading type-small text-muted-foreground">
            La colonne de droite est rendue en thème sombre quel que soit le
            thème actif de la page : les deux versions se comparent sans
            basculer.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[38rem] border-collapse text-left">
              <caption className="sr-only">
                Valeurs des jetons sémantiques en thème clair et en thème sombre
              </caption>
              <thead>
                <tr className="border-b border-border">
                  <th
                    scope="col"
                    className="py-2 pr-4 type-small font-semibold"
                  >
                    Jeton
                  </th>
                  <th
                    scope="col"
                    className="py-2 pr-4 type-small font-semibold"
                  >
                    Rôle
                  </th>
                  <th
                    scope="col"
                    className="py-2 pr-4 type-small font-semibold"
                  >
                    Clair
                  </th>
                  <th scope="col" className="py-2 type-small font-semibold">
                    Sombre
                  </th>
                </tr>
              </thead>
              <tbody>
                {SEMANTIC_TOKENS.map((entry) => (
                  <tr key={entry.token} className="border-b border-border">
                    <td className="py-2 pr-4 font-mono type-small">
                      --{entry.token}
                    </td>
                    <td className="py-2 pr-4 type-small text-muted-foreground">
                      {entry.label}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="inline-block size-6 shrink-0 rounded-xs border border-border"
                          style={{ backgroundColor: entry.light }}
                        />
                        <span className="font-mono type-small" data-numeric>
                          {entry.light}
                        </span>
                      </span>
                    </td>
                    <td className="py-2">
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="inline-block size-6 shrink-0 rounded-xs border border-border"
                          style={{ backgroundColor: entry.dark }}
                        />
                        <span className="font-mono type-small" data-numeric>
                          {entry.dark}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-border bg-background p-4">
            <p className="type-small font-semibold text-muted-foreground">
              Rendu en thème clair
            </p>
            <ThemeSample />
          </div>
          <DarkPreview>
            <p className="type-small font-semibold text-muted-foreground">
              Rendu en thème sombre
            </p>
            <ThemeSample />
          </DarkPreview>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="signature"
        tone="muted"
        title="Signature de la charte"
        description="Le logo s’adapte au thème de la page. Les trois pastilles conservent leurs couleurs."
      >
        <div>
          <h3 className="font-display type-h3 text-foreground">Le logo</h3>
          <p className="mt-1 max-w-reading type-small text-muted-foreground">
            « BOMA » en serif, « infos » en sans, et les trois pastilles — vert,
            jaune, bleu — au-dessus. Les lettres prennent la couleur du thème où
            elles se posent : marine sur blanc, blanches sur le marine. Les
            pastilles gardent leurs trois couleurs partout.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <figure>
              {/* Bloc blanc quel que soit le thème de la page : les lettres y
                  restent marine, même quand la page est sombre. */}
              <div className="rounded-md border border-border bg-white p-6 [&_use:first-child]:fill-brand-navy">
                <BrandWordmark />
              </div>
              <figcaption className="mt-2 type-small text-muted-foreground">
                Sur fond blanc : lettres marine
              </figcaption>
            </figure>
            <figure>
              <div className="dark rounded-md bg-background p-6 text-foreground">
                <BrandWordmark />
              </div>
              <figcaption className="mt-2 type-small text-muted-foreground">
                Dans une île marine : lettres blanches
              </figcaption>
            </figure>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="typographie"
        title="Typographie"
        description="Deux familles : Source Serif 4 pour les titres, Inter pour le corps, l'interface et les données. Toutes deux auto-hébergées."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-card p-4">
            <p className="type-small text-muted-foreground">Titres</p>
            <p className="mt-1 font-display type-h2">Source Serif 4</p>
            <p className="mt-2 type-small text-muted-foreground">
              La serif de la charte, celle du « BOMA » du logo. Une seule
              graisse est chargée, la 600. L&apos;emphase en gras italique,
              troisième face jamais préchargée, n&apos;est téléchargée que par
              une page qui s&apos;en sert : voir la carte « citation » de la
              colonne de lecture.
            </p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <p className="type-small text-muted-foreground">
              Corps, interface, données
            </p>
            <p className="mt-1 font-sans type-h2">Inter</p>
            <p className="mt-2 type-small text-muted-foreground" data-numeric>
              Chiffres tabulaires : 1 234 567 890 · 0,00 % · 1 108 Mds FCFA
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <caption className="sr-only">Échelle typographique</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-4 type-small font-semibold">
                  Jeton
                </th>
                <th scope="col" className="py-2 pr-4 type-small font-semibold">
                  Mobile
                </th>
                <th scope="col" className="py-2 pr-4 type-small font-semibold">
                  Desktop
                </th>
                <th scope="col" className="py-2 type-small font-semibold">
                  Usage
                </th>
              </tr>
            </thead>
            <tbody>
              {TYPE_SCALE.map((entry) => (
                <tr key={entry.token} className="border-b border-border">
                  <td className="py-3 pr-4 font-mono type-small">
                    {entry.token}
                  </td>
                  <td className="py-3 pr-4 type-small" data-numeric>
                    {entry.mobile}
                  </td>
                  <td className="py-3 pr-4 type-small" data-numeric>
                    {entry.desktop}
                  </td>
                  <td className="py-3 type-small text-muted-foreground">
                    {entry.usage}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-6 grid gap-4">
          {TYPE_SCALE.map((entry) => (
            <li
              key={entry.token}
              className="rounded-md border border-border bg-card p-4"
            >
              <p className="font-mono type-small text-muted-foreground">
                {entry.token} · {entry.mobile} → {entry.desktop}
              </p>
              <p className={`${sampleClass(entry.className)} mt-2`}>
                {entry.sample}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="lecture"
        tone="muted"
        title="Colonne de lecture"
        description="Mesure bornée à min(68ch, 39rem) : relevé entre 65 et 70 caractères par ligne selon la largeur d'écran, dans la fourchette de 65 à 75 du cahier des charges. Interligne 1,7, alignement à gauche : jamais de texte justifié, dont les fentes sont illisibles sur mobile."
      >
        <article className="rounded-md border border-border bg-card p-6 reading-column">
          <p className="type-small font-semibold tracking-wide text-accent uppercase">
            Économie
          </p>
          <h3 className="mt-2 font-display type-h2">
            Ce que la mesure impose à la mise en page
          </h3>
          <p className="mt-2 type-small text-muted-foreground" data-numeric>
            Libreville · 12 septembre 2026 · 4 min de lecture
          </p>
          <p className="mt-6 type-body">
            Une colonne trop large fatigue : l&apos;œil perd la ligne suivante
            au retour à la marge. Une colonne trop étroite hache la phrase. La
            fourchette de soixante-cinq à soixante-quinze caractères est le
            compromis que la presse imprimée a mis un siècle à établir, et que
            l&apos;écran n&apos;a aucune raison d&apos;abandonner.
          </p>
          <p className="mt-4 type-body">
            Le corps du texte reste à dix-sept pixels sur téléphone, dix-neuf
            sur ordinateur. L&apos;interligne de 1,7 laisse respirer les accents
            et les jambages ; celui des titres descend à 1,15 pour qu&apos;un
            titre sur trois lignes reste un bloc et non un empilement.
          </p>
          <figure className="boma-quote mt-6 max-w-reading border-s-2 border-border-strong ps-5 text-foreground sm:ps-6">
            <blockquote className="font-display type-h2 leading-snug text-balance">
              Une information se vérifie <em>avant</em> d&apos;être publiée,{" "}
              <em>jamais après</em>.
            </blockquote>
            <figcaption className="mt-4 type-small text-muted-foreground">
              — Exemple de carte « citation »
            </figcaption>
          </figure>
          <p className="mt-6 type-small text-muted-foreground">
            Mesure de ce bloc : min(68ch, 39rem), soit 624 px. Relevé à 65–66
            caractères par ligne entre 1024 et 1440 px ; 70 caractères pour un
            bloc de texte sans marge intérieure.
          </p>
        </article>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="espacements"
        title="Espacements et formes"
        description="Échelle de 4 px, rayons plafonnés à 16 px, séparation par filets d'un pixel et par aplats — pas d'ombre diffuse."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="font-display type-h3">Échelle d&apos;espacement</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {SPACING_SCALE.map((step) => (
                <li key={step.token} className="flex items-center gap-3">
                  <span
                    className="w-16 shrink-0 font-mono type-small text-muted-foreground"
                    data-numeric
                  >
                    {step.px} px
                  </span>
                  <span
                    aria-hidden="true"
                    className="block h-3 rounded-xs bg-brand-gold"
                    style={{ width: `${step.px}px` }}
                  />
                  <span className="font-mono type-small text-muted-foreground">
                    p-{step.token}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display type-h3">Rayons</h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {RADII.map((radius) => (
                <li
                  key={radius.token}
                  className="border border-border bg-card p-3"
                  style={{ borderRadius: `${radius.px}px` }}
                >
                  <p className="type-small font-semibold" data-numeric>
                    {radius.px} px
                  </p>
                  <p className="type-small text-muted-foreground">
                    {radius.usage}
                  </p>
                  <p className="mt-1 font-mono type-small text-muted-foreground">
                    {radius.token}
                  </p>
                </li>
              ))}
            </ul>

            <h3 className="mt-8 font-display type-h3">Points de rupture</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {BREAKPOINTS.map((breakpoint) => (
                <li
                  key={breakpoint.token}
                  className="rounded-md border border-border bg-card px-3 py-2 font-mono type-small"
                  data-numeric
                >
                  {breakpoint.token} · {breakpoint.px} px
                </li>
              ))}
            </ul>

            <h3 className="mt-8 font-display type-h3">Séparation</h3>
            <div className="mt-3 rounded-md border border-border bg-card">
              <p className="p-3 type-small hairline">
                Filet d&apos;un pixel : classe{" "}
                <code className="font-mono">hairline</code>, couleur du jeton{" "}
                <code className="font-mono">--border</code> (neutral-200 en
                thème clair)
              </p>
              <p className="bg-surface-muted p-3 type-small">
                Aplat de surface douce
              </p>
              <p className="rounded-b-md bg-card p-3 type-small shadow-floating">
                Ombre portée, réservée aux éléments flottants (menu, modale)
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="accessibilite"
        tone="muted"
        title="Accessibilité"
        description="RGAA / WCAG 2.2 niveau AA. Un seul h1 par page, hiérarchie continue, points de repère ARIA, lien d'évitement."
      >
        <div className="mb-8">
          <h3 className="font-display type-h3 text-foreground">
            Contrastes mesurés
          </h3>
          <p className="mt-1 max-w-reading type-small text-muted-foreground">
            Ratios calculés avec la formule WCAG 2.x sur les valeurs réellement
            servies par <code className="font-mono">app/globals.css</code>. Le
            seuil AA est de 4,5:1 pour le texte et de 3:1 pour les éléments
            graphiques ; la lecture longue vise 7:1.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left">
              <caption className="sr-only">
                Contrastes mesurés des principales paires de couleurs
              </caption>
              <thead>
                <tr className="border-b border-border">
                  <th
                    scope="col"
                    className="py-2 pr-4 type-small font-semibold"
                  >
                    Paire
                  </th>
                  <th
                    scope="col"
                    className="py-2 pr-4 type-small font-semibold"
                  >
                    Ratio
                  </th>
                  <th scope="col" className="py-2 type-small font-semibold">
                    Verdict
                  </th>
                </tr>
              </thead>
              <tbody>
                {CONTRAST_CHECKS.map((row) => (
                  <tr key={row.pair} className="border-b border-border">
                    <td className="py-2 pr-4 font-mono type-small">
                      {row.pair}
                    </td>
                    <td className="py-2 pr-4 type-small" data-numeric>
                      {row.ratio}
                    </td>
                    <td
                      className={`py-2 type-small ${
                        row.ok ? "text-success-token" : "text-destructive"
                      }`}
                    >
                      {row.verdict}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-reading type-small text-muted-foreground">
            <strong className="font-semibold text-foreground">
              L&apos;or de marque #F7C755 est réservé au marine et au non
              textuel.
            </strong>{" "}
            À 1,58:1 sur blanc, il ne sert qu&apos;aux aplats, filets et
            pastilles à texte marine (12,45:1) ; sur le marine, il porte
            l&apos;emphase et l&apos;action primaire (12,06:1). Dès qu&apos;il
            porte du texte sur blanc, c&apos;est{" "}
            <code className="font-mono">gold-800</code> #735606 qui
            s&apos;applique (6,86:1).{" "}
            <strong className="font-semibold text-foreground">
              Le marine de marque #0B1848 ne porte pas de texte sur le fond
              nuit.
            </strong>{" "}
            Il y tombe à 1,13:1 : les titres y passent à{" "}
            <code className="font-mono">--foreground</code> #ECF0F9 et
            l&apos;action primaire à l&apos;or.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="font-display type-h3">Focus visible</h3>
            <p className="mt-1 type-small text-muted-foreground">
              Contour de 2 px, décalé de 2 px, dans la couleur d&apos;anneau du
              thème : le bleu de la charte (5,20:1 sur blanc) en thème clair,
              l&apos;or en thème sombre. Parcourez cette page avec Tab pour le
              vérifier.
            </p>
            <button
              type="button"
              className="mt-3 inline-flex items-center rounded-md border border-border px-4 type-small touch-target"
            >
              Cible d&apos;essai
            </button>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="font-display type-h3">Cibles tactiles</h3>
            <p className="mt-1 type-small text-muted-foreground">
              44 × 44 px au minimum, y compris pour les boutons à icône.
            </p>
            <div className="mt-3 inline-flex size-11 items-center justify-center rounded-md border border-dashed border-brand-gold bg-brand-gold/15">
              <span className="font-mono type-small" data-numeric>
                44
              </span>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="font-display type-h3">Lien d&apos;évitement</h3>
            <p className="mt-1 type-small text-muted-foreground">
              Premier arrêt de tabulation de chaque page. Appuyez sur Tab depuis
              le haut du document : « Aller au contenu principal » apparaît en
              haut à gauche.
            </p>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="font-display type-h3">Mouvement réduit</h3>
            <p className="mt-1 type-small text-muted-foreground">
              Aucune librairie d&apos;animation. Les transitions d&apos;état
              durent 150 ms et sont annulées sous{" "}
              <code className="font-mono">prefers-reduced-motion</code>.
            </p>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="composants"
        title="Composants"
        description="Les primitives shadcn/ui ne sont jamais modifiées : tout ce qui suit est composé dans components/custom/."
      >
        <ComponentStates />
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="mise-en-page"
        tone="muted"
        title="Mise en page"
        description="Trois composants portent la structure de chaque page."
      >
        <dl className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-border bg-card p-4">
            <dt className="font-display type-h3">Container</dt>
            <dd className="mt-1 type-small text-muted-foreground">
              Largeur maximale 1280 px (ou la colonne de lecture), gouttières 16
              → 24 → 32 px. Rien ne touche jamais le bord de l&apos;écran.
            </dd>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <dt className="font-display type-h3">Section</dt>
            <dd className="mt-1 type-small text-muted-foreground">
              Unité de rythme vertical, titre en h2, bande alternée optionnelle
              sur la surface douce. Chaque bloc de cette page en est une.
            </dd>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <dt className="font-display type-h3">PageHeader</dt>
            <dd className="mt-1 type-small text-muted-foreground">
              Émet l&apos;unique h1 de la page et réunit le surtitre, le fil
              d&apos;Ariane et les actions quand ils sont présents.
            </dd>
          </div>
        </dl>

        <Container className="mt-6 rounded-md border border-border bg-card py-6">
          <p className="type-small text-muted-foreground">
            Ce bloc est un Container imbriqué : il conserve les gouttières et la
            largeur maximale.
          </p>
        </Container>
      </Section>
    </>
  );
}

/** Small composition reused to compare both themes side by side. */
function ThemeSample() {
  return (
    <div className="mt-3 grid gap-3">
      <p className="font-display type-h3">Titre en Source Serif 4</p>
      <p className="type-body">
        Corps de texte en Inter, sur le fond de lecture du thème.
      </p>
      <p className="type-small text-muted-foreground">
        Texte atténué : dates, signatures, légendes.
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground touch-target">
          Action primaire
        </span>
        <span className="inline-flex items-center type-small font-semibold text-accent underline underline-offset-4 touch-target">
          Lien d&apos;accent
        </span>
      </div>
      <div className="rounded-md border border-border bg-surface-muted p-3">
        <p className="type-small">Carte posée sur la surface douce.</p>
      </div>
    </div>
  );
}
