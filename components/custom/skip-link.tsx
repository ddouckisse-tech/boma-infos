/**
 * Skip link (CAHIER-DES-CHARGES.md §3.5): the first tab stop of every page,
 * invisible until it takes focus.
 */
export function SkipLink() {
  return (
    <a href="#contenu" className="skip-link type-small">
      <LocalizedText
        fr="Aller au contenu principal"
        en="Skip to main content"
      />
    </a>
  );
}
import { LocalizedText } from "@/components/custom/localized-text";
