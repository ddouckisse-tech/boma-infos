import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/custom/container";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { ComponentStates } from "./_components/component-states";
import {
  BRAND_SWATCHES,
  BREAKPOINTS,
  FUNCTIONAL_SWATCHES,
  FUNCTIONAL_SWATCHES_DARK,
  MAGENTA_RAMP,
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
    "Palette, typographie, espacements et composants de base du magazine Le Corporate, en thème clair et sombre.",
  robots: { index: false, follow: false },
};

/**
 * Contrastes mesurés (formule WCAG 2.x) sur les valeurs servies par
 * `app/globals.css`. Recalculés à chaque évolution de la palette.
 */
const CONTRAST_CHECKS = [
  {
    pair: "#1A1A1A sur #FFFFFF",
    ratio: "17,40:1",
    verdict: "AAA — corps de texte, thème clair",
    ok: true,
  },
  {
    pair: "#1A1A1A sur #F5F5F5",
    ratio: "15,96:1",
    verdict: "AAA — corps de texte sur fond doux",
    ok: true,
  },
  {
    pair: "#EDEDED sur #121212",
    ratio: "16,00:1",
    verdict: "AAA — corps de texte, thème sombre",
    ok: true,
  },
  {
    pair: "#EDEDED sur #1F1F1F",
    ratio: "14,08:1",
    verdict: "AAA — corps de texte sur surface sombre",
    ok: true,
  },
  {
    pair: "#525252 sur #FFFFFF",
    ratio: "7,81:1",
    verdict: "AAA — texte atténué, thème clair",
    ok: true,
  },
  {
    pair: "#A3A3A3 sur #121212",
    ratio: "7,43:1",
    verdict: "AAA — texte atténué, thème sombre",
    ok: true,
  },
  {
    pair: "#002060 sur #FFFFFF",
    ratio: "15,27:1",
    verdict: "AAA — navy de marque, thème clair",
    ok: true,
  },
  {
    pair: "#002060 sur #121212",
    ratio: "1,23:1",
    verdict: "échec — navy proscrit en thème sombre",
    ok: false,
  },
  {
    pair: "#B83D85 sur #FFFFFF",
    ratio: "5,19:1",
    verdict: "AA — magenta textuel",
    ok: true,
  },
  {
    pair: "#B83D85 sur #F5F5F5",
    ratio: "4,76:1",
    verdict: "AA — magenta textuel sur fond doux",
    ok: true,
  },
  {
    pair: "#C74794 sur #FFFFFF",
    ratio: "4,41:1",
    verdict: "échec AA texte — aplats et titres larges uniquement",
    ok: false,
  },
  {
    pair: "#C74794 sur #F5F5F5",
    ratio: "4,05:1",
    verdict: "échec AA texte — aplats et titres larges uniquement",
    ok: false,
  },
  {
    pair: "#E06BAD sur #121212",
    ratio: "6,13:1",
    verdict: "AA — magenta textuel, thème sombre",
    ok: true,
  },
  {
    pair: "#8C8C8C sur #FFFFFF",
    ratio: "3,36:1",
    verdict: "AA non textuel — bordure de contrôle",
    ok: true,
  },
  {
    pair: "#6B6B6B sur #121212",
    ratio: "3,52:1",
    verdict: "AA non textuel — bordure de contrôle sombre",
    ok: true,
  },
] as const;

const SUMMARY = [
  { href: "#couleurs", label: "Couleurs" },
  { href: "#typographie", label: "Typographie" },
  { href: "#lecture", label: "Colonne de lecture" },
  { href: "#espacements", label: "Espacements et formes" },
  { href: "#accessibilite", label: "Accessibilité" },
  { href: "#composants", label: "Composants" },
  { href: "#mise-en-page", label: "Mise en page" },
] as const;

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
      <h3 className="font-serif type-h3 text-foreground">{title}</h3>
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
        description="Deux couleurs de marque relevées en production, leurs échelles dérivées, une échelle de neutres qui porte tous les fonds, quatre couleurs fonctionnelles. Aucune autre couleur n'existe dans le projet : les scories de greffons de l'ancien site (#148DFE, #066AAB, #461CFB, #DD8502) ont été supprimées, ainsi que les anciens fonds bleutés #E6E7F3 et #F1F6FE et l'encre #0D1B3E, remplacés par des neutres purs en v1.1 du cahier des charges."
      >
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BRAND_SWATCHES.map((swatch) => (
            <SwatchTile key={swatch.token} swatch={swatch} />
          ))}
        </ul>

        <Ramp
          title="Échelle de neutres — elle porte tous les fonds"
          swatches={NEUTRAL_RAMP}
        />
        <Ramp
          title="Échelle navy — navy-900 est la couleur de marque"
          swatches={NAVY_RAMP}
        />
        <Ramp
          title="Échelle magenta — magenta-500 pour les aplats, magenta-600 pour le texte"
          swatches={MAGENTA_RAMP}
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="font-serif type-h3 text-foreground">
              Couleurs fonctionnelles — thème clair
            </h3>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FUNCTIONAL_SWATCHES.map((swatch) => (
                <SwatchTile key={swatch.token} swatch={swatch} />
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-serif type-h3 text-foreground">
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
          <h3 className="font-serif type-h3 text-foreground">
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
        id="typographie"
        title="Typographie"
        description="Deux familles au lieu de six : Source Serif 4 pour les titres et les chapôs, Inter pour le corps, l'interface et les données. Les deux sont auto-hébergées, sous-ensemble latin étendu, font-display: swap."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-card p-4">
            <p className="type-small text-muted-foreground">Titres et chapôs</p>
            <p className="mt-1 font-serif type-h2">Source Serif 4</p>
            <p className="mt-2 type-small text-muted-foreground">
              L&apos;autorité éditoriale qui manquait au Poppins de
              l&apos;ancien site.
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
              <p className={`${entry.className} mt-2`}>{entry.sample}</p>
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
            Intelligence économique
          </p>
          <h3 className="mt-2 font-serif type-h2">
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
          <blockquote className="mt-6 border-l-2 border-brand-magenta pl-4 font-serif type-body italic">
            « Chaque kilo-octet est un arbitrage éditorial. »
          </blockquote>
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
            <h3 className="font-serif type-h3">Échelle d&apos;espacement</h3>
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
                    className="block h-3 rounded-xs bg-brand-magenta"
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
            <h3 className="font-serif type-h3">Rayons</h3>
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

            <h3 className="mt-8 font-serif type-h3">Points de rupture</h3>
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

            <h3 className="mt-8 font-serif type-h3">Séparation</h3>
            <div className="mt-3 rounded-md border border-border bg-card">
              <p className="p-3 type-small hairline">
                Filet d&apos;un pixel en navy-100
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
          <h3 className="font-serif type-h3 text-foreground">
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
              Le magenta de marque #C74794 est réservé au non textuel.
            </strong>{" "}
            À 4,41:1 sur blanc et 4,05:1 sur le fond doux, il échoue au seuil AA
            pour le texte courant : il ne sert qu&apos;aux aplats, filets,
            puces, fonds de badge et titres larges (≥ 24 px, ou ≥ 18,7 px en
            gras, où le seuil tombe à 3:1). Dès qu&apos;il porte du texte,
            c&apos;est <code className="font-mono">--brand-magenta-600</code>{" "}
            #B83D85 qui s&apos;applique. De même, le navy #002060 tombe à 1,23:1
            sur le fond sombre : il y est proscrit, les titres passent à
            #EDEDED.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="font-serif type-h3">Focus visible</h3>
            <p className="mt-1 type-small text-muted-foreground">
              Contour de 2 px, décalé de 2 px, dans la couleur d&apos;anneau du
              thème. Parcourez cette page avec Tab pour le vérifier.
            </p>
            <button
              type="button"
              className="mt-3 inline-flex items-center rounded-md border border-border px-4 type-small touch-target"
            >
              Cible d&apos;essai
            </button>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="font-serif type-h3">Cibles tactiles</h3>
            <p className="mt-1 type-small text-muted-foreground">
              44 × 44 px au minimum, y compris pour les boutons à icône.
            </p>
            <div className="mt-3 inline-flex size-11 items-center justify-center rounded-md border border-dashed border-brand-magenta bg-brand-magenta/15">
              <span className="font-mono type-small" data-numeric>
                44
              </span>
            </div>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="font-serif type-h3">Lien d&apos;évitement</h3>
            <p className="mt-1 type-small text-muted-foreground">
              Premier arrêt de tabulation de chaque page. Appuyez sur Tab depuis
              le haut du document : « Aller au contenu principal » apparaît en
              haut à gauche.
            </p>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <h3 className="font-serif type-h3">Mouvement réduit</h3>
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
            <dt className="font-serif type-h3">Container</dt>
            <dd className="mt-1 type-small text-muted-foreground">
              Largeur maximale 1280 px (ou la colonne de lecture), gouttières 16
              → 24 → 32 px. Rien ne touche jamais le bord de l&apos;écran.
            </dd>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <dt className="font-serif type-h3">Section</dt>
            <dd className="mt-1 type-small text-muted-foreground">
              Unité de rythme vertical, titre en h2, bande alternée optionnelle
              sur la surface douce. Chaque bloc de cette page en est une.
            </dd>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <dt className="font-serif type-h3">PageHeader</dt>
            <dd className="mt-1 type-small text-muted-foreground">
              Émet l&apos;unique h1 de la page, son surtitre et son filet
              d&apos;accent. Le bloc en tête de cette page en est un.
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
      <p className="font-serif type-h3">Titre en Source Serif 4</p>
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
