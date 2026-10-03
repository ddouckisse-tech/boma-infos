import type { LocaleChoice } from "@/lib/preferences";

export type LocalizedText = Readonly<{ fr: string; en: string }>;

export const localize = (locale: LocaleChoice, text: LocalizedText): string =>
  text[locale];

export const interfaceLocale = (locale: LocaleChoice): string =>
  locale === "en" ? "en-GB" : "fr-FR";

export const localeDate = (
  value: Date | number | string,
  locale: LocaleChoice,
  options?: Intl.DateTimeFormatOptions
): string =>
  new Intl.DateTimeFormat(interfaceLocale(locale), options).format(
    value instanceof Date ? value : new Date(value)
  );

export const plural = (
  locale: LocaleChoice,
  count: number,
  one: string,
  many: string
): string => `${count} ${count === 1 ? one : many}`;

/**
 * English interface labels of the sections of `convex/seed/catalog.ts`, one
 * entry per slug, sub-sections included. The sections themselves live in the
 * database and can be renamed from the back office; these tables only
 * translate the interface. A slug absent from them falls back to the French
 * label stored in the database (see `categoryLabel`).
 */
const CATEGORY_EN: Readonly<Record<string, string>> = {
  politique: "Politics",
  institutions: "Institutions",
  gouvernement: "Government",
  diplomatie: "Diplomacy",
  territoires: "Regions",
  economie: "Economy",
  entreprises: "Business",
  "mines-energie": "Mining & energy",
  "finances-publiques": "Public finances",
  numerique: "Digital",
  societe: "Society",
  education: "Education",
  sante: "Health",
  emploi: "Employment",
  tourisme: "Tourism",
  destinations: "Destinations",
  "parcs-nationaux": "National parks",
  "hotellerie-transport": "Hospitality & transport",
  environnement: "Environment",
  culture: "Culture",
  musique: "Music",
  patrimoine: "Heritage",
  sport: "Sport",
  football: "Football",
  "autres-disciplines": "Other sports",
  editorial: "Editorial",
  idees: "Ideas",
  tribune: "Opinion",
  interview: "Interviews",
  "espace-pro": "Professional resources",
  opportunites: "Opportunities",
  reglementations: "Regulations",
  formation: "Training",
  docutheques: "Document library",
};

const CATEGORY_DESCRIPTION_EN: Readonly<Record<string, string>> = {
  politique:
    "The life of the institutions, the government's decisions and public debate, explained without taking sides.",
  institutions:
    "Parliament, courts, independent authorities: who decides what, and under which rules.",
  gouvernement:
    "Reforms and public policy, followed over time rather than at the moment of announcement.",
  diplomatie:
    "Gabon in its region and in the world: agreements, summits, cooperation.",
  territoires:
    "Provinces, departments and communes: public decision-making seen from the ground.",
  economie:
    "Companies, industries and public finances: what keeps the Gabonese economy running.",
  entreprises:
    "Starting, financing and growing a company in Gabon: operations, markets, procedures.",
  "mines-energie":
    "Oil, manganese, electricity: the industries that carry weight in the country's accounts.",
  "finances-publiques":
    "Budget, debt, taxation and currency, backed by figures.",
  numerique: "Networks, online services and data sovereignty.",
  societe:
    "Schools, health, employment, everyday life: what changes in practice for Gabonese people.",
  education: "From primary school to university: resources, results, reforms.",
  sante: "Healthcare provision, prevention and public health policy.",
  emploi: "Training, young people's entry into work and the labour market.",
  tourisme:
    "Destinations, national parks, accommodation: discovering Gabon and understanding its tourism industry.",
  destinations:
    "Where to go, when and how: itineraries reported on the ground.",
  "parcs-nationaux":
    "Thirteen parks, from the coast to the plateaux: access, seasons, visiting rules.",
  "hotellerie-transport":
    "Accommodation, air and road links: the behind-the-scenes side of travel.",
  environnement:
    "Forest, coastline, climate and wildlife: the country's natural resources and the people who protect them.",
  culture:
    "Music, heritage, books and live performance: Gabonese creative work and its memory.",
  musique:
    "Music scenes, artists and instruments, from the epics of the mvet to the studios of Libreville.",
  patrimoine:
    "Museums, traditions and sites: what the country preserves and hands down.",
  sport:
    "Football, athletics, combat sports: results, behind the scenes and amateur practice.",
  football: "From the national teams to neighbourhood pitches.",
  "autres-disciplines": "Athletics, basketball, martial arts, water sports.",
  editorial: "The newsroom's position on the country's news.",
  idees:
    "Opinion pieces and major interviews: signed viewpoints that commit only their authors.",
  tribune: "Reasoned, signed viewpoints that commit only their authors.",
  interview: "Interviews with those who decide, create or challenge.",
  "espace-pro":
    "Useful information for professionals: regulations, tenders, training, documentation.",
  opportunites: "Tenders, public contracts and calls for projects.",
  reglementations:
    "What regulations change in practice for companies and users.",
  formation: "Schemes, funding and continuing education programmes.",
  docutheques: "Reports, texts and studies to download.",
};

const NAV_EN: Readonly<Record<string, string>> = {
  "/a-propos": "About",
  "/docutheque": "Document library",
  "/contacts": "Contact",
  "/mentions-legales": "Legal notice",
  "/confidentialite": "Privacy policy",
  "/newsletter": "Newsletter",
  "/design-system": "Design system",
};

export const categoryLabel = (
  locale: LocaleChoice,
  slug: string,
  fallback: string
): string => (locale === "en" ? (CATEGORY_EN[slug] ?? fallback) : fallback);

export const categoryDescription = (
  locale: LocaleChoice,
  slug: string,
  fallback: string
): string =>
  locale === "en" ? (CATEGORY_DESCRIPTION_EN[slug] ?? fallback) : fallback;

export const navigationLabel = (
  locale: LocaleChoice,
  href: string,
  fallback: string
): string => (locale === "en" ? (NAV_EN[href] ?? fallback) : fallback);
