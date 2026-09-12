import Link from "next/link";
import { Mail, Phone, Rss } from "lucide-react";
import {
  FacebookIcon,
  LinkedInIcon,
  WhatsAppIcon,
} from "@/components/custom/brand-icons";
import { Container } from "@/components/custom/container";
import { DataSaverToggle } from "@/components/custom/data-saver-toggle";
import { NewsletterForm } from "@/components/custom/newsletter-form";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { sectionHref, type Section } from "@/lib/navigation";
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
 * Site footer.
 *
 * The audit counted nine links here on the legacy site, of which one worked:
 * no valid `mailto:`, no valid `tel:`, four dead social icons, two inert
 * labels, and a newsroom address on a domain that was never registered.
 * Every link below resolves, the address and the phone number are real
 * `mailto:`/`tel:` targets, and the social URLs are marked for what they are
 * — generic, because the real accounts were not communicated.
 */
export function Footer({ sections }: { sections: readonly Section[] }) {
  const contactLink =
    "inline-flex min-h-11 items-center gap-2 type-small text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

  return (
    <footer className="mt-16 border-t border-border bg-surface-muted">
      <Container className="pt-12 pb-[max(3rem,env(safe-area-inset-bottom))]">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="min-w-0">
            <p className="font-serif type-h3 font-semibold text-foreground">
              {SITE.name}
            </p>
            <p className="mt-2 max-w-[42ch] type-small text-muted-foreground">
              Magazine économique gabonais, édité par {SITE.publisher}.{" "}
              {SITE.tagline}, vérifiée et mise en perspective.
            </p>

            <ul className="mt-4 flex flex-col">
              <li>
                <a href={`mailto:${SITE.email}`} className={contactLink}>
                  <Mail aria-hidden="true" className="size-4 shrink-0" />
                  {SITE.email}
                </a>
              </li>
              <li>
                <a href={SITE.phoneHref} className={contactLink}>
                  <Phone aria-hidden="true" className="size-4 shrink-0" />
                  {SITE.phone}
                </a>
              </li>
            </ul>

            <ul className="mt-4 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map(({ key, label, href }) => {
                const Icon = SOCIAL_ICONS[key];
                return (
                  <li key={key}>
                    <a
                      href={href}
                      rel="noopener noreferrer me"
                      target="_blank"
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 text-foreground transition-colors touch-target hover:border-border-strong"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="type-small">{label}</span>
                      <span className="sr-only">(nouvelle fenêtre)</span>
                    </a>
                  </li>
                );
              })}
              <li>
                <a
                  href="/rss.xml"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 text-foreground transition-colors touch-target hover:border-border-strong"
                >
                  <Rss aria-hidden="true" className="size-4 shrink-0" />
                  <span className="type-small">Flux RSS</span>
                </a>
              </li>
            </ul>
          </div>

          <nav aria-labelledby="pied-rubriques" className="min-w-0">
            <h2
              id="pied-rubriques"
              className="font-serif type-small font-semibold tracking-wide text-foreground uppercase"
            >
              Rubriques
            </h2>
            <ul className="mt-3 flex flex-col">
              {sections.map((section) => (
                <li key={section.slug}>
                  <Link
                    href={sectionHref(section.slug)}
                    prefetch={false}
                    className="flex min-h-11 items-center type-small text-muted-foreground hover:text-foreground"
                  >
                    {section.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-col gap-8">
            <nav aria-labelledby="pied-journal">
              <h2
                id="pied-journal"
                className="font-serif type-small font-semibold tracking-wide text-foreground uppercase"
              >
                Le journal
              </h2>
              <ul className="mt-3 flex flex-col">
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

            <NewsletterForm />
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-border pt-6">
          <div className="flex flex-wrap items-center gap-6">
            <DataSaverToggle />
            <div className="flex items-center gap-3">
              <span className="type-small text-muted-foreground">Thème</span>
              <ThemeToggle />
            </div>
          </div>
          <p className="type-small text-muted-foreground">
            © {new Date().getFullYear()} {SITE.name} — {SITE.publisher}. Tous
            droits réservés.
          </p>
        </div>

        <p className="mt-4 rounded-md border border-dashed border-border-strong px-4 py-3 type-small text-muted-foreground">
          {DEMO_CONTENT_NOTICE}
        </p>
      </Container>
    </footer>
  );
}
