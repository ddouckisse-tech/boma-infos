import { LocalizedText } from "@/components/custom/localized-text";
import { cn } from "@/lib/utils";

/**
 * « L'essentiel en 3 points » (CDC §4.2).
 *
 * Placed between the chapô and the body: a reader on a metered connection
 * gets the substance of the piece in the first screen, before deciding
 * whether to spend the rest of the page. Marked up as a real list under a
 * real heading so a screen reader announces "liste de 3 éléments".
 */
export function KeyPoints({
  points,
  className,
}: {
  points: readonly string[];
  className?: string;
}) {
  if (points.length === 0) return null;

  return (
    <aside
      aria-labelledby="essentiel"
      className={cn("border-y border-border py-4", className)}
    >
      <h2 id="essentiel" className="font-display type-h3 text-foreground">
        <LocalizedText fr="L’essentiel" en="Key points" />
      </h2>
      <ul className="mt-3 list-disc space-y-2 ps-5">
        {points.map((point, index) => (
          <li key={index} className="type-body">
            {point}
          </li>
        ))}
      </ul>
    </aside>
  );
}
