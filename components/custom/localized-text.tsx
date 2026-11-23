import type { LocalizedText as LocalizedTextValue } from "@/lib/i18n";

/**
 * Emits both short interface translations. The preference boot script sets
 * `data-locale` before paint and CSS selects the right one. Public pages stay
 * cacheable and this component adds no client JavaScript.
 */
export function LocalizedText({
  fr,
  en,
  as: Tag = "span",
  className,
}: LocalizedTextValue & {
  as?: "span" | "p" | "strong";
  className?: string;
}) {
  return (
    <>
      <Tag lang="fr" className={`lc-fr ${className ?? ""}`}>
        {fr}
      </Tag>
      <Tag lang="en" className={`lc-en ${className ?? ""}`}>
        {en}
      </Tag>
    </>
  );
}

/** A missing edition leaves the original available with its proper language. */
export function EditorialText({ fr, en }: { fr: string; en?: string }) {
  return en === undefined ? (
    <span lang="fr">{fr}</span>
  ) : (
    <LocalizedText fr={fr} en={en} />
  );
}
