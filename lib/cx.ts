/**
 * Class joiner for the client components of the public journal — no merging.
 *
 * `cn` (`lib/utils.ts`, the `cn` package) resolves Tailwind conflicts so that
 * a `className` passed to a shadcn primitive can override its defaults. That
 * engine is about 10 Ko of JavaScript once compressed, and the article page
 * sat at 179,9 Ko for a ceiling of 180 (CDC §5.4, measured on 13/09/2026).
 *
 * The journal's own client components do not need it: their classes do not
 * contradict each other, and the two places where a caller replaces a
 * default — the width of the logo, the fit of a picture — say so explicitly
 * in the component rather than relying on a merge. The back office keeps
 * `cn` and the shadcn primitives; this is for what every reader downloads.
 */
export type ClassValue = string | false | null | undefined;

export function cx(...values: ClassValue[]): string {
  let classes = "";
  for (const value of values) {
    if (value) classes = classes ? `${classes} ${value}` : value;
  }
  return classes;
}
