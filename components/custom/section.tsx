import { cn } from "@/lib/utils";
import { Container } from "@/components/custom/container";

type SectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  /** Visible French heading; rendered as <h2> with the serif face. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Right-hand slot: "voir tout", filters, counters… */
  action?: React.ReactNode;
  /** Alternating band, using the soft surface of CDC §3.1. */
  tone?: "default" | "muted";
  spacing?: "compact" | "default" | "loose";
  width?: "page" | "reading" | "wide";
  /** Set to false to lay out the children yourself. */
  contained?: boolean;
};

const spacingClass = {
  compact: "py-6 md:py-8",
  default: "py-8 md:py-12",
  loose: "py-12 md:py-16",
} as const;

/**
 * Vertical rhythm unit of a page: an optional titled header plus its content.
 * Separation is a 1 px hairline or a flat tint — never a diffuse shadow
 * (CDC §3.3).
 */
export function Section({
  className,
  title,
  description,
  action,
  tone = "default",
  spacing = "default",
  width = "page",
  contained = true,
  children,
  ...props
}: SectionProps) {
  const content = (
    <>
      {(title || description || action) && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h2 className="font-serif text-h2 text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-2 max-w-reading text-small text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </>
  );

  return (
    <section
      className={cn(
        spacingClass[spacing],
        tone === "muted" && "bg-surface-muted",
        className
      )}
      {...props}
    >
      {contained ? <Container width={width}>{content}</Container> : content}
    </section>
  );
}
