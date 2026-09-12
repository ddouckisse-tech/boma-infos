import { cn } from "@/lib/utils";
import { Container } from "@/components/custom/container";

type PageHeaderProps = {
  /** The one and only <h1> of the page (CDC §3.5: nine of them today). */
  title: React.ReactNode;
  /** Short label above the title: section name, "Dossier", "Interview"… */
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  /** Breadcrumb or back link. */
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  width?: "page" | "reading" | "wide";
};

/**
 * Page opening block. Emits the single <h1> and the accent rule that carries
 * the brand magenta without relying on it for text contrast.
 */
export function PageHeader({
  title,
  eyebrow,
  description,
  breadcrumb,
  actions,
  className,
  width = "page",
}: PageHeaderProps) {
  return (
    <header className={cn("border-b border-border py-8 md:py-10", className)}>
      <Container width={width}>
        {breadcrumb && <div className="mb-4 type-small">{breadcrumb}</div>}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-2 type-small font-semibold tracking-wide text-accent uppercase">
                {eyebrow}
              </p>
            )}
            <h1 className="font-display type-h1 text-foreground">{title}</h1>
            <span
              aria-hidden="true"
              className="mt-4 block h-[3px] w-16 rounded-xs bg-brand-magenta"
            />
            {description && (
              <p className="mt-4 max-w-reading type-body text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>
          )}
        </div>
      </Container>
    </header>
  );
}
