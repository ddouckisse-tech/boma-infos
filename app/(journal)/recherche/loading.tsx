import { Container } from "@/components/custom/container";
import { LocalizedText } from "@/components/custom/localized-text";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton of the search page — the one route rendered per request.
 *
 * Shapes, not a spinner and certainly not "Loading…": the blocks match the
 * height of the results they stand in for, so nothing jumps when they are
 * replaced (CDC §5.4, CLS ≤ 0,1). The live region announces the wait to a
 * screen reader, in French.
 */
export default function SearchLoading() {
  return (
    <>
      <div className="border-b border-border py-8 md:py-10">
        <Container>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-10 w-2/3 max-w-xl" />
          <Skeleton className="mt-4 h-4 w-1/2 max-w-md" />
        </Container>
      </div>

      <Container className="py-8">
        <p role="status" className="sr-only">
          <LocalizedText fr="Recherche en cours…" en="Searching…" />
        </p>
        <ul className="divide-y divide-border border-y border-border">
          {[0, 1, 2, 3, 4].map((index) => (
            <li
              key={index}
              className="grid grid-cols-[96px_1fr] gap-4 py-4 sm:grid-cols-[160px_1fr] sm:gap-6"
            >
              <Skeleton className="aspect-[16/9] rounded-md" />
              <div className="min-w-0">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-6 w-full max-w-md" />
                <Skeleton className="mt-2 h-4 w-full max-w-lg" />
                <Skeleton className="mt-2 h-3 w-32" />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
