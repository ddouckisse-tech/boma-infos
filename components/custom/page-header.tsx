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

/** Shared title, description and navigation for the journal’s public pages. */
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
    <header className={cn("news-page-header border-b", className)}>
      <Container width={width}>
        {breadcrumb && <div className="mb-2 type-small">{breadcrumb}</div>}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            {eyebrow && (
              <p className="mb-2 type-small font-semibold text-muted-foreground">
                {eyebrow}
              </p>
            )}
            <h1 className="news-page-title font-display text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-reading type-body text-muted-foreground">
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
