import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Opening block of every back-office screen.
 *
 * One shape for the ten sections, so a person always finds the same things
 * in the same place: what the screen is (title, icon), what it is for (one
 * sentence), and what they can do from here (actions, on the right on a
 * desk, under the title on a phone). The icon sits in a tinted square — it
 * is the same glyph as the navigation entry, which is how the two connect.
 */
export function OfficeHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  icon?: LucideIcon;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-accent-surface text-accent"
          >
            <Icon className="size-5" />
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="type-small font-semibold tracking-wide text-muted-foreground uppercase">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display type-h1 text-foreground">{title}</h1>
          {description && (
            <p className="mt-1 max-w-reading type-small text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
          {actions}
        </div>
      )}
    </header>
  );
}

/** A titled card, the unit every back-office screen is made of. */
export function OfficeSection({
  title,
  description,
  icon: Icon,
  actions,
  id,
  className,
  children,
  tone = "default",
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  id?: string;
  className?: string;
  children?: React.ReactNode;
  tone?: "default" | "warning";
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-xl border bg-card p-4 sm:p-6",
        tone === "warning" ? "border-warning-token/60" : "border-border",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-display type-h3">
            {Icon && (
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-5 shrink-0",
                  tone === "warning" ? "text-warning-token" : "text-accent"
                )}
              />
            )}
            {title}
          </h2>
          {description && (
            <p className="mt-1 type-small text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
