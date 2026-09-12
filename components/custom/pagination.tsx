import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Page-by-page navigation of a section list.
 *
 * Real links to real URLs (`…/page/2`), not buttons: the pages are
 * prerendered, they are crawlable, and they survive a reader with no
 * JavaScript — CDC §5.5 requires the journal to stay readable without it.
 */
export function Pagination({
  page,
  pageCount,
  hrefFor,
  className,
}: {
  page: number;
  pageCount: number;
  /** Builds the URL of a given page number. */
  hrefFor: (page: number) => string;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  // Fenêtre glissante : première, dernière, et deux pages autour de la
  // courante. Sur un écran de 320 px, sept pastilles ne tiennent pas.
  const numbers = new Set<number>([1, pageCount, page]);
  if (page - 1 > 1) numbers.add(page - 1);
  if (page + 1 < pageCount) numbers.add(page + 1);
  const ordered = [...numbers].sort((a, b) => a - b);

  const base =
    "inline-flex items-center justify-center rounded-md border border-border px-3 type-small font-medium transition-colors touch-target";

  return (
    <nav aria-label="Pagination" className={cn("mt-10", className)}>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
              prefetch={false}
              rel="prev"
              className={cn(base, "hover:bg-surface-muted")}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
              <span className="ms-1 hidden sm:inline">Précédente</span>
              <span className="sr-only sm:hidden">Page précédente</span>
            </Link>
          ) : (
            <span aria-hidden="true" className={cn(base, "opacity-40")}>
              <ChevronLeft className="size-4" />
              <span className="ms-1 hidden sm:inline">Précédente</span>
            </span>
          )}
        </li>

        {ordered.map((number, index) => (
          <li key={number} className="flex items-center gap-2">
            {index > 0 && ordered[index - 1] !== number - 1 && (
              <span
                aria-hidden="true"
                className="type-small text-muted-foreground"
              >
                …
              </span>
            )}
            {number === page ? (
              <span
                aria-current="page"
                data-numeric
                className={cn(
                  base,
                  "border-primary bg-primary text-primary-foreground"
                )}
              >
                {number}
              </span>
            ) : (
              <Link
                href={hrefFor(number)}
                prefetch={false}
                data-numeric
                className={cn(base, "hover:bg-surface-muted")}
              >
                <span className="sr-only">Page </span>
                {number}
              </Link>
            )}
          </li>
        ))}

        <li>
          {page < pageCount ? (
            <Link
              href={hrefFor(page + 1)}
              prefetch={false}
              rel="next"
              className={cn(base, "hover:bg-surface-muted")}
            >
              <span className="me-1 hidden sm:inline">Suivante</span>
              <span className="sr-only sm:hidden">Page suivante</span>
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          ) : (
            <span aria-hidden="true" className={cn(base, "opacity-40")}>
              <span className="me-1 hidden sm:inline">Suivante</span>
              <ChevronRight className="size-4" />
            </span>
          )}
        </li>
      </ul>
      <p className="mt-3 text-center type-small text-muted-foreground">
        Page {page} sur {pageCount}
      </p>
    </nav>
  );
}
