import Link from "next/link";
import { MessageCircle, Network, Rss, Users } from "lucide-react";
import { Container } from "@/components/custom/container";
import { ConvexStatus } from "@/components/custom/convex-status";
import { DataSaverToggle } from "@/components/custom/data-saver-toggle";
import { NewsletterForm } from "@/components/custom/newsletter-form";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { SECTIONS, STATIC_PAGES, sectionHref } from "@/lib/navigation";

const SOCIAL_LINKS = [
  { label: "WhatsApp", href: "https://wa.me/", Icon: MessageCircle },
  { label: "LinkedIn", href: "https://www.linkedin.com/", Icon: Network },
  { label: "Facebook", href: "https://www.facebook.com/", Icon: Users },
] as const;

const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/confidentialite" },
  { label: "Design system", href: "/design-system" },
] as const;

/**
 * Site footer: sections, editorial pages, social reach, newsletter opt-in and
 * the two reader preferences. WhatsApp comes first among the social links —
 * it is the main sharing channel in Gabon (CAHIER-DES-CHARGES.md §2.2).
 */
export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface-muted">
      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="min-w-0">
            <p className="font-serif text-h3 font-semibold text-foreground">
              Le Corporate
            </p>
            <p className="mt-2 max-w-[38ch] text-small text-muted-foreground">
              Magazine économique gabonais, édité par Up Concept.
              L&apos;économie du Gabon et de la zone CEMAC, vérifiée et mise en
              perspective.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    rel="noopener noreferrer me"
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 text-foreground transition-colors touch-target hover:border-border-strong"
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className="text-small">{label}</span>
                    <span className="sr-only">(nouvelle fenêtre)</span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/rss.xml"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 text-foreground transition-colors touch-target hover:border-border-strong"
                >
                  <Rss aria-hidden="true" className="size-4 shrink-0" />
                  <span className="text-small">Flux RSS</span>
                </a>
              </li>
            </ul>
          </div>

          <nav aria-labelledby="pied-rubriques" className="min-w-0">
            <h2
              id="pied-rubriques"
              className="font-serif text-small font-semibold tracking-wide text-foreground uppercase"
            >
              Rubriques
            </h2>
            <ul className="mt-3 flex flex-col">
              {SECTIONS.map((section) => (
                <li key={section.slug}>
                  <Link
                    href={sectionHref(section.slug)}
                    className="flex min-h-[44px] items-center text-small text-muted-foreground hover:text-foreground"
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
                className="font-serif text-small font-semibold tracking-wide text-foreground uppercase"
              >
                Le journal
              </h2>
              <ul className="mt-3 flex flex-col">
                {[...STATIC_PAGES, ...LEGAL_LINKS].map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="flex min-h-[44px] items-center text-small text-muted-foreground hover:text-foreground"
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
              <span className="text-small text-muted-foreground">Thème</span>
              <ThemeToggle />
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <ConvexStatus />
            <p className="text-small text-muted-foreground">
              © {new Date().getFullYear()} Le Corporate — Up Concept. Tous
              droits réservés.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
