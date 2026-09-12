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
      className={cn(
        "rounded-md border border-l-2 border-border border-l-brand-magenta bg-surface-muted p-5",
        className
      )}
    >
      <h2
        id="essentiel"
        className="font-serif type-small font-semibold tracking-wide text-foreground uppercase"
      >
        L&apos;essentiel en {points.length} points
      </h2>
      <ul className="mt-3 space-y-2">
        {points.map((point, index) => (
          <li key={index} className="flex gap-3 type-body">
            <span
              aria-hidden="true"
              data-numeric
              className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-navy-900 type-small font-semibold text-white dark:bg-navy-300 dark:text-navy-950"
            >
              {index + 1}
            </span>
            <span className="min-w-0">{point}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
