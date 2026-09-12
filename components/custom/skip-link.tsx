/**
 * Skip link (CAHIER-DES-CHARGES.md §3.5): the first tab stop of every page,
 * invisible until it takes focus.
 */
export function SkipLink() {
  return (
    <a href="#contenu" className="skip-link type-small">
      Aller au contenu principal
    </a>
  );
}
