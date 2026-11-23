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

/**
 * Accent token of a section, restricted to the hues of the charter: the navy
 * (two steps), and the three colours of the wordmark — gold, green,
 * blue — each at the step that carries text on a white page.
 */
export type SectionAccent =
  "navy-900" | "navy-700" | "gold-800" | "green-700" | "blue-600";

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

export const SECTION_ACCENTS: readonly SectionAccent[] = [
  "navy-900",
  "navy-700",
  "gold-800",
  "green-700",
  "blue-600",
];

const isAccent = (value: string): value is SectionAccent =>
  (SECTION_ACCENTS as readonly string[]).includes(value);

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

/**
 * Text colour for an accent. Each pair clears 4,5:1 on its ground: the dark
 * step on white (navy 16,96 and 11,33 · gold 6,86 · green 6,81 · blue 6,77),
 * the light step on the navy of the dark theme (navy-300 10,51 · gold-400
 * 12,06 · green-400 9,36 · blue-400 6,58). The navy of the brand is unusable
 * as text on the dark theme (1,13:1), hence navy-300.
 */
export const accentTextClass: Record<SectionAccent, string> = {
  "navy-900": "text-navy-900 dark:text-navy-300",
  "navy-700": "text-navy-700 dark:text-navy-300",
  "gold-800": "text-gold-800 dark:text-gold-400",
  "green-700": "text-green-700 dark:text-green-400",
  "blue-600": "text-blue-600 dark:text-blue-400",
};

/**
 * Solid fill for a badge. The pair is chosen so the label always clears
 * 4,5:1 — white on the two navy steps (16,96 and 11,33), on green-700 (6,81)
 * and on blue-600 (6,77). Gold is the exception that follows the charter: a
 * gold fill carries navy text (12,45:1), never white, in both themes. On the
 * dark theme every fill is a light step carrying navy-950 (6,79:1 at least).
 */
export const accentFillClass: Record<SectionAccent, string> = {
  "navy-900": "bg-navy-900 text-white dark:bg-navy-300 dark:text-navy-950",
  "navy-700": "bg-navy-700 text-white dark:bg-navy-400 dark:text-navy-950",
  "gold-800": "bg-gold-400 text-navy-950",
  "green-700": "bg-green-700 text-white dark:bg-green-400 dark:text-navy-950",
  "blue-600": "bg-blue-600 text-white dark:bg-blue-400 dark:text-navy-950",
};
