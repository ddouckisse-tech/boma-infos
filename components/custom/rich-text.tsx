import Link from "next/link";
import { Fragment } from "react";

/**
 * Inline markup of a paragraph, rendered as React nodes.
 *
 * The grammar is deliberately tiny — `**gras**`, `*italique*`,
 * `[libellé](/lien)` — and it is parsed into elements rather than injected as
 * HTML: nothing in this project ever reaches `dangerouslySetInnerHTML`, so a
 * compromised or careless editor cannot inject a script, whatever the
 * Content-Security-Policy happens to allow (CDC §5.3).
 *
 * External links get `rel="noopener noreferrer"` and an off-screen mention
 * that they open a new window (CDC §3.5).
 */

const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;

export function RichText({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter((part) => part !== "");

  return (
    <>
      {parts.map((part, index) => {
        const key = `${index}-${part.slice(0, 12)}`;

        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={key}>{part.slice(2, -2)}</strong>;
        }

        if (
          part.length > 2 &&
          part.startsWith("*") &&
          part.endsWith("*") &&
          !part.startsWith("**")
        ) {
          return <em key={key}>{part.slice(1, -1)}</em>;
        }

        const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
        if (link) {
          const [, label, href] = link;
          if (href.startsWith("/")) {
            return (
              <Link key={key} href={href}>
                {label}
              </Link>
            );
          }
          if (/^https?:\/\//.test(href) || href.startsWith("mailto:")) {
            return (
              <a
                key={key}
                href={href}
                rel="noopener noreferrer"
                target={href.startsWith("mailto:") ? undefined : "_blank"}
              >
                {label}
                {!href.startsWith("mailto:") && (
                  <span className="sr-only"> (nouvelle fenêtre)</span>
                )}
              </a>
            );
          }
          // Un schéma inattendu (`javascript:`…) n'est jamais rendu en lien.
          return <Fragment key={key}>{label}</Fragment>;
        }

        return <Fragment key={key}>{part}</Fragment>;
      })}
    </>
  );
}

/** Same grammar, stripped — for meta descriptions and the search index. */
export const stripMarkup = (text: string): string =>
  text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1");
