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
 * reach the newsroom, the legal pages, the newsletter, the two reading
 * preferences — and, discreetly, the administrator's key.
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

  return (
    <footer className="mt-16 border-t border-border bg-surface-muted">
      <Container className="pt-10 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="max-w-[46ch] min-w-0">
            <BrandWordmark />
            <p className="mt-1 type-small text-muted-foreground">
              Magazine économique gabonais, édité par {SITE.publisher}.{" "}
              {SITE.tagline}.
            </p>
            <ul className="mt-2 flex flex-wrap gap-x-5">
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
            <ul className="mt-2 flex flex-wrap gap-2">
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

          <nav aria-label="Le journal" className="min-w-0">
            <ul className="grid grid-cols-2 gap-x-8 sm:grid-cols-1">
              {[...NAV_STATIC_PAGES, ...NAV_LEGAL_PAGES].map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    prefetch={false}
                    className="flex min-h-11 items-center type-small text-muted-foreground hover:text-foreground"
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 lg:max-w-sm">
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border pt-4">
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

        <p className="mt-3 type-small text-muted-foreground">
          {DEMO_CONTENT_NOTICE}
        </p>
      </Container>
    </footer>
  );
}
