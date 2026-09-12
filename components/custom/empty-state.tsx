import { FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * What a section with nothing in it says.
 *
 * The audit found that the legacy site served the generic latest-news feed on
 * its three empty sections: a reader clicking "Startup" got articles about
 * the national budget, under an untranslated "Our Journal" heading. An empty
 * section must say it is empty and offer a way out — never silently serve
 * something else.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-md border border-dashed border-border-strong px-6 py-12 text-center",
        className
      )}
    >
      <FileQuestion
        aria-hidden="true"
        className="size-8 text-muted-foreground"
      />
      <p className="mt-4 font-display type-h3 text-foreground">{title}</p>
      {description && (
        <div className="mt-2 max-w-reading type-small text-muted-foreground">
          {description}
        </div>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
