import { slugifyHeading } from "@/lib/headings";
import { cn } from "@/lib/utils";
import type { Block } from "@/convex/model/content";

/**
 * Table of contents for long pieces.
 *
 * Plain anchors, no JavaScript, no scroll-spy: the highlight-as-you-scroll
 * behaviour costs a listener on every frame for an ornament, and the budget
 * of CDC §5.4 is spent on the article itself. Rendered only when the body has
 * at least three level-2 headings — below that it is noise.
 */
export function TableOfContents({
  blocks,
  className,
}: {
  blocks: readonly Block[];
  className?: string;
}) {
  const headings = blocks.filter(
    (block): block is Extract<Block, { type: "heading" }> =>
      block.type === "heading" && block.level === 2
  );

  if (headings.length < 3) return null;

  return (
    <nav
      aria-labelledby="sommaire"
      className={cn("rounded-md border border-border p-5", className)}
    >
      <h2
        id="sommaire"
        className="font-display type-small font-semibold tracking-wide text-foreground uppercase"
      >
        Sommaire
      </h2>
      <ol className="mt-3 space-y-1">
        {headings.map((heading, index) => (
          <li key={index}>
            <a
              href={`#${slugifyHeading(heading.text)}`}
              className="flex min-h-[44px] items-center gap-2 type-small text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <span aria-hidden="true" data-numeric className="text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">{heading.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
