import type { AdDevice, AdFormat, AdPlacement } from "./types";

/** Small destination-page metadata only; no image manifest enters a client bundle. */
export type DemoAd = {
  slug: string;
  title: string;
  titleEn: string;
  advertiser: string;
  description: string;
  descriptionEn: string;
  format: AdFormat;
  placements: readonly AdPlacement[];
  device: AdDevice;
  mediaKey: string;
  /** Art-directed 16:9 poster for compact screens, independently composed. */
  mobileMediaKey?: string;
};

/** Keep the ten original designs and their order for archived links and palettes. */
export const DEMO_POSTERS: readonly DemoAd[] = [
  {
    slug: "komo-atelier",
    title: "Du bois, du sens.",
    titleEn: "Timber with purpose",
    advertiser: "Komo Atelier",
    description:
      "Campagne fictive de démonstration pour un atelier de mobilier durable : lignes simples, matières locales et objets à transmettre.",
    descriptionEn:
      "A fictional campaign for a sustainable furniture studio, featuring simple lines, local materials and pieces made to last.",
    format: "banner",
    placements: ["home-primary", "listing"],
    device: "all",
    mediaKey: "demo-ad-komo-atelier",
  },
  {
    slug: "lagune-horizon",
    title: "Le temps prend le large.",
    titleEn: "Time to get away",
    advertiser: "Lagune Horizon",
    description:
      "Campagne fictive de démonstration pour une maison d’escapades au bord de l’eau. Aucun séjour ni service réel n’est proposé.",
    descriptionEn:
      "A fictional campaign for a waterside escape. No trips or services are available.",
    format: "banner",
    placements: ["home-secondary"],
    device: "desktop",
    mediaKey: "demo-ad-lagune-horizon",
  },
  {
    slug: "liane-mobilite",
    title: "La ville, autrement.",
    titleEn: "A different way around town",
    advertiser: "Liane Mobilité",
    description:
      "Campagne fictive de démonstration pour une mobilité urbaine partagée, imaginée pour les petits trajets du quotidien.",
    descriptionEn:
      "A fictional campaign for a shared urban transport service designed for everyday short trips.",
    format: "banner",
    placements: ["home-primary", "listing"],
    device: "mobile",
    mediaKey: "demo-ad-liane-mobilite",
  },
  {
    slug: "canopee-studio",
    title: "Vos idées prennent racine.",
    titleEn: "Let your ideas take root",
    advertiser: "Canopée Studio",
    description:
      "Campagne fictive de démonstration pour un studio de création : identités visuelles, imprimés et récits de marques imaginaires.",
    descriptionEn:
      "A fictional campaign for a creative studio, showing visual identities, print and brand stories.",
    format: "square",
    placements: ["article"],
    device: "desktop",
    mediaKey: "demo-ad-canopee-studio",
  },
  {
    slug: "soleil-okala",
    title: "Chaque toit a son soleil.",
    titleEn: "Sunshine for every roof",
    advertiser: "Soleil d’Okala",
    description:
      "Campagne fictive de démonstration pour une énergie solaire de proximité. Les installations et les offres présentées sont imaginaires.",
    descriptionEn:
      "A fictional campaign for local solar power. The installations and offers shown are invented.",
    format: "banner",
    placements: ["article-inline"],
    device: "all",
    mediaKey: "demo-ad-soleil-okala",
  },
  {
    slug: "epure-habitat",
    title: "Faites place à l’essentiel.",
    titleEn: "Make room for what matters",
    advertiser: "Épure Habitat",
    description:
      "Campagne fictive de démonstration pour une collection d’intérieurs lumineux, conçue uniquement pour présenter le format publicitaire.",
    descriptionEn:
      "A fictional campaign for a collection of bright interiors, created to illustrate the advertising format.",
    format: "square",
    placements: ["popup"],
    device: "mobile",
    mediaKey: "demo-ad-epure-habitat",
  },
  {
    slug: "ntem-formation",
    title: "Votre prochain chapitre.",
    titleEn: "Your next chapter",
    advertiser: "Ntem Formation",
    description:
      "Campagne fictive de démonstration pour un organisme de formation aux métiers de demain. Aucune inscription réelle n’est proposée.",
    descriptionEn:
      "A fictional campaign for a training provider focused on future careers. Enrolment is unavailable.",
    format: "square",
    placements: ["popup"],
    device: "desktop",
    mediaKey: "demo-ad-ntem-formation",
  },
  {
    slug: "rivage-marche",
    title: "Le goût des jours heureux.",
    titleEn: "Good food for good days",
    advertiser: "Rivage Marché",
    description:
      "Campagne fictive de démonstration pour un marché de produits frais et de saison. Annonceur et produits sont imaginaires.",
    descriptionEn:
      "A fictional campaign for a market selling fresh, seasonal food. The advertiser and products are invented.",
    format: "square",
    placements: ["floating"],
    device: "mobile",
    mediaKey: "demo-ad-rivage-marche",
  },
  {
    slug: "mosaique-culture",
    title: "La culture nous rassemble.",
    titleEn: "Culture brings us together",
    advertiser: "Mosaïque Culture",
    description:
      "Campagne fictive de démonstration pour un rendez-vous culturel mêlant design, musique et arts visuels. Aucun événement réel n’est annoncé.",
    descriptionEn:
      "A fictional campaign for a cultural event featuring design, music and visual art. No actual event is scheduled.",
    format: "square",
    placements: ["floating"],
    device: "desktop",
    mediaKey: "demo-ad-mosaique-culture",
  },
  {
    slug: "baobab-connexions",
    title: "Les bonnes idées circulent.",
    titleEn: "Good ideas get around",
    advertiser: "Baobab Connexions",
    description:
      "Campagne fictive de démonstration pour un réseau d’espaces de travail partagés. Aucun lieu ni abonnement réel n’est commercialisé.",
    descriptionEn:
      "A fictional campaign for a network of coworking spaces. No locations or memberships are for sale.",
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
  return {
    ...poster,
    ...selection,
    mobileMediaKey: `${poster.mediaKey}-mobile`,
  };
});
