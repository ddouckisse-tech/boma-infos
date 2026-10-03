import Link from "next/link";
import { BrandWordmark } from "@/components/custom/brand-wordmark";
import { LocaleToggle } from "@/components/custom/locale-toggle";
import { LocalizedText } from "@/components/custom/localized-text";
import { ThemeToggle } from "@/components/custom/theme-toggle";

/**
 * Frame of the sign-in, reset and registration screens — CDC §4.3.
 *
 * Deliberately spare: one column, one task. The link back to the journal is
 * there so nobody is ever trapped on a form.
 */
export function AuthShell({
  title,
  intro,
  children,
  footer,
}: {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted">
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-page items-center justify-between page-gutter py-3">
          <BrandWordmark className="w-36 sm:w-56" />
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle compact />
            <LocaleToggle />
            <Link
              href="/"
              className="hidden items-center rounded-md px-3 type-small font-semibold text-muted-foreground transition-colors touch-target hover:text-foreground sm:inline-flex"
            >
              <LocalizedText fr="Retour au journal" en="Back to the journal" />
            </Link>
          </div>
        </div>
      </div>

      <main
        id="contenu"
        tabIndex={-1}
        className="flex flex-1 items-start justify-center page-gutter py-10 focus-visible:outline-none md:py-16"
      >
        <div className="w-full max-w-[34rem]">
          <div className="rounded-lg border border-border bg-card p-6 md:p-8">
            <h1 className="font-display type-h2 text-foreground">{title}</h1>
            <span
              aria-hidden="true"
              className="mt-3 boma-rule w-16"
            />
            {intro && (
              <div className="mt-4 type-small text-muted-foreground">
                {intro}
              </div>
            )}
            <div className="mt-6">{children}</div>
          </div>
          {footer && (
            <div className="mt-4 type-small text-muted-foreground">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/** Inline error, announced to assistive technology as it appears. */
export function FormError({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 type-small text-destructive"
    >
      {children}
    </p>
  );
}

export function FormNotice({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="status"
      className="rounded-md border border-success-token/40 bg-success-token/10 px-3 py-2 type-small text-success-token"
    >
      {children}
    </p>
  );
}
