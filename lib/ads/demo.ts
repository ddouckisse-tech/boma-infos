import type { AdDevice, AdFormat, AdPlacement } from "./types";

/** Small destination-page metadata only; no image manifest enters a client bundle. */
export type DemoAd = {
  slug: string;
  title: string;
  advertiser: string;
  description: string;
  format: AdFormat;
  placements: readonly AdPlacement[];
  device: AdDevice;
  mediaKey: string;
};

/** Keep the ten original designs and their order for archived links and palettes. */
export const DEMO_POSTERS: readonly DemoAd[] = [
  {
    slug: "komo-atelier",
    title: "Du bois, du sens.",
    advertiser: "Komo Atelier",
    description:
      "Campagne fictive de démonstration pour un atelier de mobilier durable : lignes simples, matières locales et objets à transmettre.",
    format: "banner",
    placements: ["home-primary", "listing"],
    device: "all",
    mediaKey: "demo-ad-komo-atelier",
  },
  {
    slug: "lagune-horizon",
    title: "Le temps prend le large.",
    advertiser: "Lagune Horizon",
    description:
      "Campagne fictive de démonstration pour une maison d’escapades au bord de l’eau. Aucun séjour ni service réel n’est proposé.",
    format: "banner",
    placements: ["home-secondary"],
    device: "desktop",
    mediaKey: "demo-ad-lagune-horizon",
  },
  {
    slug: "liane-mobilite",
    title: "La ville, autrement.",
    advertiser: "Liane Mobilité",
    description:
      "Campagne fictive de démonstration pour une mobilité urbaine partagée, imaginée pour les petits trajets du quotidien.",
    format: "banner",
    placements: ["home-primary", "listing"],
    device: "mobile",
    mediaKey: "demo-ad-liane-mobilite",
  },
  {
    slug: "canopee-studio",
    title: "Vos idées prennent racine.",
    advertiser: "Canopée Studio",
    description:
      "Campagne fictive de démonstration pour un studio de création : identités visuelles, imprimés et récits de marques imaginaires.",
    format: "square",
    placements: ["article"],
    device: "desktop",
    mediaKey: "demo-ad-canopee-studio",
  },
  {
    slug: "soleil-okala",
    title: "Chaque toit a son soleil.",
    advertiser: "Soleil d’Okala",
    description:
      "Campagne fictive de démonstration pour une énergie solaire de proximité. Les installations et les offres présentées sont imaginaires.",
    format: "banner",
    placements: ["article-inline"],
    device: "all",
    mediaKey: "demo-ad-soleil-okala",
  },
  {
    slug: "epure-habitat",
    title: "Faites place à l’essentiel.",
    advertiser: "Épure Habitat",
    description:
      "Campagne fictive de démonstration pour une collection d’intérieurs lumineux, conçue uniquement pour présenter le format publicitaire.",
    format: "square",
    placements: ["popup"],
    device: "mobile",
    mediaKey: "demo-ad-epure-habitat",
  },
  {
    slug: "ntem-formation",
    title: "Votre prochain chapitre.",
    advertiser: "Ntem Formation",
    description:
      "Campagne fictive de démonstration pour un organisme de formation aux métiers de demain. Aucune inscription réelle n’est proposée.",
    format: "square",
    placements: ["popup"],
    device: "desktop",
    mediaKey: "demo-ad-ntem-formation",
  },
  {
    slug: "rivage-marche",
    title: "Le goût des jours heureux.",
    advertiser: "Rivage Marché",
    description:
      "Campagne fictive de démonstration pour un marché de produits frais et de saison. Annonceur et produits sont imaginaires.",
    format: "square",
    placements: ["floating"],
    device: "mobile",
    mediaKey: "demo-ad-rivage-marche",
  },
  {
    slug: "mosaique-culture",
    title: "La culture nous rassemble.",
    advertiser: "Mosaïque Culture",
    description:
      "Campagne fictive de démonstration pour un rendez-vous culturel mêlant design, musique et arts visuels. Aucun événement réel n’est annoncé.",
    format: "square",
    placements: ["floating"],
    device: "desktop",
    mediaKey: "demo-ad-mosaique-culture",
  },
  {
    slug: "baobab-connexions",
    title: "Les bonnes idées circulent.",
    advertiser: "Baobab Connexions",
    description:
      "Campagne fictive de démonstration pour un réseau d’espaces de travail partagés. Aucun lieu ni abonnement réel n’est commercialisé.",
    format: "banner",
    placements: ["home-secondary", "article-inline", "article"],
    device: "all",
    mediaKey: "demo-ad-baobab-connexions",
  },
];

/** Only these five examples are offered in the catalogue and insert-only loader. */
export const DEMO_ADS: readonly DemoAd[] = (
  [
    {
      slug: "komo-atelier",
      placements: ["home-primary", "listing"],
      device: "all",
    },
    { slug: "canopee-studio", placements: ["article"], device: "desktop" },
    {
      slug: "soleil-okala",
      placements: ["home-secondary", "article-inline"],
      device: "all",
    },
    { slug: "ntem-formation", placements: ["popup"], device: "desktop" },
    { slug: "rivage-marche", placements: ["floating"], device: "mobile" },
  ] satisfies readonly Pick<DemoAd, "slug" | "placements" | "device">[]
).map((selection) => {
  const poster = DEMO_POSTERS.find((entry) => entry.slug === selection.slug);
  if (!poster) throw new Error(`Unknown demo poster: ${selection.slug}`);
  return { ...poster, ...selection };
});
