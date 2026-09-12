/**
 * Editorial tree — taken verbatim from CAHIER-DES-CHARGES.md §4.1.
 *
 * The legacy WordPress spelling "Réglementions" is corrected here to
 * "Réglementations". Labels are the user-facing French strings; identifiers
 * and slugs stay ASCII so they can be used in URLs and in code.
 *
 * Sections are meant to become administrable (add / rename / reorder / accent
 * colour) in milestone 3; this module is the single source of truth until then.
 */

/** Accent colour token, restricted to the brand ramps of §3.1. */
export type SectionAccent =
  | "navy-900"
  | "navy-700"
  | "navy-600"
  | "magenta-600"
  | "magenta-700"
  | "magenta-800";

export type SubSection = {
  readonly label: string;
  readonly slug: string;
};

export type Section = {
  readonly label: string;
  readonly slug: string;
  readonly accent: SectionAccent;
  readonly children: readonly SubSection[];
};

export const SECTIONS: readonly Section[] = [
  {
    label: "Business & Lifestyle",
    slug: "business-lifestyle",
    accent: "navy-900",
    children: [
      { label: "Big deal", slug: "big-deal" },
      { label: "Entreprendre", slug: "entreprendre" },
      { label: "Innovation", slug: "innovation" },
      { label: "Technologie", slug: "technologie" },
    ],
  },
  {
    label: "Éditorial",
    slug: "editorial",
    accent: "navy-700",
    children: [],
  },
  {
    label: "Succès story",
    slug: "succes-story",
    accent: "magenta-600",
    children: [
      { label: "Femme dirigeante", slug: "femme-dirigeante" },
      { label: "Graine de manager", slug: "graine-de-manager" },
      { label: "Leader", slug: "leader" },
      { label: "Startup", slug: "startup" },
    ],
  },
  {
    label: "Espace pro",
    slug: "espace-pro",
    accent: "navy-600",
    children: [
      { label: "Docuthèques", slug: "docutheques" },
      { label: "Formation", slug: "formation" },
      { label: "Opportunités", slug: "opportunites" },
      // Orthographe corrigée par rapport au site actuel.
      { label: "Réglementations", slug: "reglementations" },
      { label: "Séminaires", slug: "seminaires" },
    ],
  },
  { label: "Tribune", slug: "tribune", accent: "magenta-700", children: [] },
  {
    label: "Dossier spécial",
    slug: "dossier-special",
    accent: "magenta-800",
    children: [],
  },
  {
    label: "Intelligence économique & Fortune d'Afrique",
    slug: "intelligence-economique",
    accent: "navy-900",
    children: [],
  },
  { label: "Interview", slug: "interview", accent: "navy-700", children: [] },
] as const;

/** Standalone editorial pages (CAHIER-DES-CHARGES.md §4.1). */
export const STATIC_PAGES = [
  { label: "À propos", href: "/a-propos" },
  { label: "Contacts", href: "/contacts" },
] as const;

export const sectionHref = (slug: string) => `/rubrique/${slug}`;

export const subSectionHref = (sectionSlug: string, subSlug: string) =>
  `/rubrique/${sectionSlug}/${subSlug}`;

export const findSection = (slug: string): Section | undefined =>
  SECTIONS.find((section) => section.slug === slug);

/** Tailwind text colour class for a section accent, both themes covered. */
export const accentTextClass: Record<SectionAccent, string> = {
  "navy-900": "text-navy-900 dark:text-navy-300",
  "navy-700": "text-navy-700 dark:text-navy-300",
  "navy-600": "text-navy-600 dark:text-navy-400",
  "magenta-600": "text-magenta-600 dark:text-magenta-300",
  "magenta-700": "text-magenta-700 dark:text-magenta-300",
  "magenta-800": "text-magenta-800 dark:text-magenta-400",
};

/** Tailwind border colour class for a section accent, both themes covered. */
export const accentBorderClass: Record<SectionAccent, string> = {
  "navy-900": "border-navy-900 dark:border-navy-300",
  "navy-700": "border-navy-700 dark:border-navy-300",
  "navy-600": "border-navy-600 dark:border-navy-400",
  "magenta-600": "border-magenta-600 dark:border-magenta-300",
  "magenta-700": "border-magenta-700 dark:border-magenta-300",
  "magenta-800": "border-magenta-800 dark:border-magenta-400",
};
