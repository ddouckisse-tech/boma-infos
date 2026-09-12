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

const CATEGORY_EN: Readonly<Record<string, string>> = {
  "big-deal": "Big Deal",
  "business-lifestyle": "Business & Lifestyle",
  docutheques: "Document library",
  "dossier-special": "Special reports",
  editorial: "Editorial",
  entreprendre: "Entrepreneurship",
  "espace-pro": "Professional resources",
  "femme-dirigeante": "Women leaders",
  formation: "Training",
  "graine-de-manager": "Emerging leaders",
  "gabon-infini-pfp": "GABON INFINI PFP",
  innovation: "Innovation",
  "intelligence-economique": "Business intelligence & African wealth",
  interview: "Interviews",
  leader: "Leaders",
  "non-classe": "Uncategorised",
  opportunites: "Opportunities",
  reglementations: "Regulations",
  seminaires: "Seminars",
  startup: "Startups",
  "succes-story": "Success stories",
  technologie: "Technology",
  tribune: "Opinion",
};

const CATEGORY_DESCRIPTION_EN: Readonly<Record<string, string>> = {
  "business-lifestyle":
    "The deals, markets and companies shaping Gabon's economy every day.",
  "big-deal":
    "Mergers, acquisitions and concessions: the deals changing the landscape.",
  entreprendre:
    "How to start, finance and grow a company in Gabon: processes, costs and obstacles.",
  innovation:
    "New processes, products and business models tested in the Gabonese market.",
  technologie: "Networks, digital infrastructure and data sovereignty.",
  editorial: "The editorial team's view of economic news.",
  "succes-story":
    "The journeys of entrepreneurs and executives, including their difficult chapters.",
  "femme-dirigeante": "Women who lead, and what leadership has cost them.",
  "graine-de-manager": "Gabonese management's next generation, under forty.",
  leader: "Established executives and how they make decisions.",
  startup: "Startups: business models, funding and scaling.",
  "espace-pro":
    "Practical business information: regulation, tenders, training and documentation.",
  docutheques: "Reports, legislation and studies to download.",
  formation: "Continuing education programmes, funding and opportunities.",
  opportunites: "Tenders, public contracts and calls for projects.",
  reglementations: "How new rules affect companies in practice.",
  seminaires: "Professional events, programmes and registration details.",
  tribune: "Signed, evidence-based viewpoints that commit only their authors.",
  "dossier-special":
    "In-depth investigations into an industry, supply chain or public policy.",
  "intelligence-economique":
    "Ownership maps, monetary indicators and regional economic power dynamics.",
  interview: "Interviews with decision-makers.",
  "gabon-infini-pfp": "News and analysis from the Gabon Infini PFP programme.",
  "non-classe": "Articles awaiting classification.",
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
