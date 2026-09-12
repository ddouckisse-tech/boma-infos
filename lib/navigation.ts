/**
 * Editorial tree — helpers and accent mapping.
 *
 * The tree itself is **data**, not code: it lives in the `categories` table
 * (CDC §4.1 asks for sections that can be added, renamed, reordered and
 * recoloured without a developer). This module only turns the flat rows
 * Convex returns into something the masthead can lay out, and maps an accent
 * token onto Tailwind classes that hold in both themes.
 *
 * The seed values are in `convex/seed/catalog.ts`.
 */

/** Accent token, restricted to the brand ramps of CDC §3.1. */
export type SectionAccent =
  | "navy-900"
  | "navy-700"
  | "navy-600"
  | "magenta-600"
  | "magenta-700"
  | "magenta-800";

export type CategoryRow = {
  readonly name: string;
  readonly slug: string;
  readonly parentSlug?: string;
  readonly accent: string;
  readonly order: number;
  readonly description: string;
};

export type SubSection = {
  readonly label: string;
  readonly slug: string;
  readonly description: string;
};

export type Section = {
  readonly label: string;
  readonly slug: string;
  readonly accent: SectionAccent;
  readonly description: string;
  readonly children: readonly SubSection[];
};

const ACCENTS: readonly SectionAccent[] = [
  "navy-900",
  "navy-700",
  "navy-600",
  "magenta-600",
  "magenta-700",
  "magenta-800",
];

const isAccent = (value: string): value is SectionAccent =>
  (ACCENTS as readonly string[]).includes(value);

/** Falls back to the primary ramp rather than dropping an unknown accent. */
export const toAccent = (value: string): SectionAccent =>
  isAccent(value) ? value : "navy-900";

/** Flat Convex rows → ordered two-level tree. */
export function buildSections(rows: readonly CategoryRow[]): Section[] {
  const parents = rows
    .filter((row) => !row.parentSlug)
    .sort((a, b) => a.order - b.order);

  return parents.map((parent) => ({
    label: parent.name,
    slug: parent.slug,
    accent: toAccent(parent.accent),
    description: parent.description,
    children: rows
      .filter((row) => row.parentSlug === parent.slug)
      .sort((a, b) => a.order - b.order)
      .map((child) => ({
        label: child.name,
        slug: child.slug,
        description: child.description,
      })),
  }));
}

export const sectionHref = (slug: string) => `/rubrique/${slug}`;

export const subSectionHref = (sectionSlug: string, subSlug: string) =>
  `/rubrique/${sectionSlug}/${subSlug}`;

export const findSection = (
  sections: readonly Section[],
  slug: string
): Section | undefined => sections.find((section) => section.slug === slug);

/** Text colour for an accent — navy is unusable on the dark theme (CDC §3.1). */
export const accentTextClass: Record<SectionAccent, string> = {
  "navy-900": "text-navy-900 dark:text-navy-300",
  "navy-700": "text-navy-700 dark:text-navy-300",
  "navy-600": "text-navy-600 dark:text-navy-400",
  "magenta-600": "text-magenta-600 dark:text-magenta-300",
  "magenta-700": "text-magenta-700 dark:text-magenta-300",
  "magenta-800": "text-magenta-800 dark:text-magenta-400",
};

export const accentBorderClass: Record<SectionAccent, string> = {
  "navy-900": "border-navy-900 dark:border-navy-300",
  "navy-700": "border-navy-700 dark:border-navy-300",
  "navy-600": "border-navy-600 dark:border-navy-400",
  "magenta-600": "border-magenta-600 dark:border-magenta-300",
  "magenta-700": "border-magenta-700 dark:border-magenta-300",
  "magenta-800": "border-magenta-800 dark:border-magenta-400",
};

/**
 * Solid fill for a badge. The pair is chosen so the label always clears
 * 4,5:1 — white on these three navy steps, white on magenta-700/800, and
 * white on magenta-600 (5,19:1). `#C74794` itself never carries text.
 */
export const accentFillClass: Record<SectionAccent, string> = {
  "navy-900": "bg-navy-900 text-white dark:bg-navy-300 dark:text-navy-950",
  "navy-700": "bg-navy-700 text-white dark:bg-navy-300 dark:text-navy-950",
  "navy-600": "bg-navy-600 text-white dark:bg-navy-400 dark:text-navy-950",
  "magenta-600":
    "bg-magenta-600 text-white dark:bg-magenta-300 dark:text-magenta-950",
  "magenta-700":
    "bg-magenta-700 text-white dark:bg-magenta-300 dark:text-magenta-950",
  "magenta-800":
    "bg-magenta-800 text-white dark:bg-magenta-400 dark:text-magenta-950",
};
