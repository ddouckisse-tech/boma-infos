/**
 * Stable anchors for article sub-headings.
 *
 * The same function is used by the body renderer and by the table of
 * contents, so the two can never drift; a shared link to `#…` therefore keeps
 * working as long as the heading text does.
 */

export function slugifyHeading(text: string): string {
  const base = text
    .normalize("NFD")
    // Enlève les diacritiques : « Réglementations » et « Reglementations »
    // doivent produire la même ancre.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "section";
}
