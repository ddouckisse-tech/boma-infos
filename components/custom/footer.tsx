import Link from "next/link";
import { Mail, Phone, Rss } from "lucide-react";
import { AdminEntry } from "@/components/custom/admin-entry";
import {
  FacebookIcon,
  LinkedInIcon,
  WhatsAppIcon,
} from "@/components/custom/brand-icons";
import { BrandWordmark } from "@/components/custom/brand-wordmark";
import { Container } from "@/components/custom/container";
import { DataSaverToggle } from "@/components/custom/data-saver-toggle";
import { NewsletterForm } from "@/components/custom/newsletter-form";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { cn } from "@/lib/utils";
import {
  DEMO_CONTENT_NOTICE,
  NAV_LEGAL_PAGES,
  NAV_STATIC_PAGES,
  SITE,
} from "@/lib/site";

const SOCIAL_ICONS = {
  whatsapp: WhatsAppIcon,
  linkedin: LinkedInIcon,
  facebook: FacebookIcon,
} as const;

const SOCIAL_LINKS = [
  { key: "whatsapp", label: "WhatsApp", href: "https://wa.me/" },
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/" },
] as const;

/**
 * Site footer — deliberately short.
 *
 * The masthead is sticky: the sections travel with the reader, so listing
 * them again here would be the second copy of the same menu on every page.
 * What remains is what a masthead does not carry: who publishes, how to
 * reach the newsroom, the site's own pages, the newsletter, the two reading
 * preferences — and, discreetly, the administrator's key.
 *
 * Four blocks on a two-column grid. Top row: the publication (wordmark and
 * tagline) beside the newsletter. Second row: the newsroom's channels beside
 * the site's pages, laid out as two horizontal lines — the three editorial
 * pages, then the four legal and service pages. The rows are shared across
 * the columns, so the contact line sits level with the first line of pages
 * and the social pills with the second. Between `lg` and `xl` the columns
 * are too narrow for a line of four pages or four pills, so those two blocks
 * take the full width, each on a single line, instead of wrapping onto a
 * third; below `lg` everything stacks in reading order.
 *
 * Every link resolves. The audit counted nine links on the legacy footer, of
 * which one worked; the social URLs are still generic because the real
 * accounts were not communicated, and are marked as opening a new window.
 */
export function Footer() {
  const link =
    "inline-flex min-h-11 items-center gap-2 type-small text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";
  const pill =
    "inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 text-foreground transition-colors touch-target hover:border-border-strong";
  const pageLink =
    "inline-flex min-h-11 items-center type-small underline-offset-4 hover:underline";
  // Two lists: two lines in a column (`xl`), side by side on one line when
  // the block spans the full width (`lg`), stacked below.
  const twoLines =
    "flex min-w-0 flex-col gap-2 lg:col-span-2 lg:flex-row lg:flex-wrap lg:gap-x-5 xl:col-span-1 xl:flex-col";

  return (
    <footer className="mt-16 border-t border-border bg-surface-muted">
      <Container className="pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="grid gap-x-12 gap-y-6 lg:grid-cols-2 lg:gap-y-4">
          <div className="min-w-0">
            <BrandWordmark />
            <p className="mt-1 max-w-[60ch] type-small text-muted-foreground">
              Magazine économique gabonais, édité par {SITE.publisher}.{" "}
              {SITE.tagline}.
            </p>
          </div>

          {/* The wordmark is centred in its 44 px touch target; the label of
              the form is not. The top padding brings both first lines to the
              same height once the two blocks sit side by side. */}
          <div className="min-w-0 lg:pt-3">
            <NewsletterForm />
          </div>

          <div className={twoLines}>
            <ul className="flex flex-wrap gap-x-5">
              <li>
                <a href={`mailto:${SITE.email}`} className={link}>
                  <Mail aria-hidden="true" className="size-4 shrink-0" />
                  {SITE.email}
                </a>
              </li>
              <li>
                <a href={SITE.phoneHref} className={link}>
                  <Phone aria-hidden="true" className="size-4 shrink-0" />
                  {SITE.phone}
                </a>
              </li>
            </ul>
            <ul className="flex flex-wrap gap-2">
              {SOCIAL_LINKS.map(({ key, label, href }) => {
                const Icon = SOCIAL_ICONS[key];
                return (
                  <li key={key}>
                    <a
                      href={href}
                      rel="noopener noreferrer me"
                      target="_blank"
                      className={pill}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="type-small">{label}</span>
                      <span className="sr-only">(nouvelle fenêtre)</span>
                    </a>
                  </li>
                );
              })}
              <li>
                <a href="/rss.xml" className={pill}>
                  <Rss aria-hidden="true" className="size-4 shrink-0" />
                  <span className="type-small">Flux RSS</span>
                </a>
              </li>
            </ul>
          </div>

          <nav aria-label="Le journal" className={twoLines}>
            <ul className="flex flex-wrap gap-x-5">
              {NAV_STATIC_PAGES.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    prefetch={false}
                    className={cn(pageLink, "text-foreground")}
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="flex flex-wrap gap-x-5">
              {NAV_LEGAL_PAGES.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    prefetch={false}
                    className={cn(
                      pageLink,
                      "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border pt-2">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <DataSaverToggle />
            <div className="flex items-center gap-3">
              <span className="type-small text-muted-foreground">Thème</span>
              <ThemeToggle />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <p className="type-small text-muted-foreground">
              © {new Date().getFullYear()} {SITE.name} — {SITE.publisher}. Tous
              droits réservés.
            </p>
            <AdminEntry />
          </div>
        </div>

        <p className="mt-1 type-small text-muted-foreground">
          {DEMO_CONTENT_NOTICE}
        </p>
      </Container>
    </footer>
  );
}
