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
import { LocalizedText } from "@/components/custom/localized-text";
import { NewsletterForm } from "@/components/custom/newsletter-form";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { cn } from "@/lib/utils";
import {
  DEMO_CONTENT_NOTICE,
  NAV_LEGAL_PAGES,
  NAV_STATIC_PAGES,
  PUBLISHER_NAME,
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

const PAGE_LABELS_EN: Readonly<Record<string, string>> = {
  "/a-propos": "About",
  "/docutheque": "Document library",
  "/contacts": "Contact",
  "/mentions-legales": "Legal notice",
  "/confidentialite": "Privacy policy",
  "/newsletter": "Newsletter",
  "/design-system": "Design system",
};

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
 * Every link resolves. The social URLs are still generic because the real
 * accounts were not communicated, and are marked as opening a new window; the
 * phone number is only printed once the owner has provided one.
 *
 * Like the masthead, the footer is a **navy island** — the ground of the
 * charter, with its dotted field — opened by the tricolour rule and closed,
 * as the charter is, by the address of the site between two hairlines. While
 * the demonstration corpus is online, the notice that it is fictional is
 * printed here, on every page (`DEMO_CONTENT_NOTICE`).
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
    <footer className="dark mt-16 boma-field text-foreground">
      <span aria-hidden="true" className="boma-rule rounded-none" />
      <Container className="pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {DEMO_CONTENT_NOTICE && (
          <p
            role="note"
            className="mb-6 rounded-md border border-border bg-card px-4 py-3 type-small text-muted-foreground"
          >
            <LocalizedText
              fr={DEMO_CONTENT_NOTICE.fr}
              en={DEMO_CONTENT_NOTICE.en}
            />
          </p>
        )}
        <div className="grid gap-x-12 gap-y-6 lg:grid-cols-2 lg:gap-y-4">
          <div className="min-w-0">
            <BrandWordmark />
            <p className="mt-1 max-w-[60ch] type-small text-muted-foreground">
              <LocalizedText
                fr={`${SITE.tagline}\u00a0: politique, économie, société, tourisme, culture et sport.`}
                en={`${SITE.taglineEn}: politics, the economy, society, tourism, culture and sport.`}
              />
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
              {SITE.phone && SITE.phoneHref && (
                <li>
                  <a href={SITE.phoneHref} className={link}>
                    <Phone aria-hidden="true" className="size-4 shrink-0" />
                    {SITE.phone}
                  </a>
                </li>
              )}
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
                      <span className="sr-only">
                        <LocalizedText
                          fr="(nouvelle fenêtre)"
                          en="(opens in a new window)"
                        />
                      </span>
                    </a>
                  </li>
                );
              })}
              <li>
                <a href="/rss.xml" className={pill}>
                  <Rss aria-hidden="true" className="size-4 shrink-0" />
                  <span className="type-small">
                    <LocalizedText fr="Flux RSS" en="RSS feed" />
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <nav aria-labelledby="footer-navigation-label" className={twoLines}>
            <span id="footer-navigation-label" className="sr-only">
              <LocalizedText fr="Le journal" en="The journal" />
            </span>
            <ul className="flex flex-wrap gap-x-5">
              {NAV_STATIC_PAGES.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    prefetch={false}
                    className={cn(pageLink, "text-foreground")}
                  >
                    <LocalizedText
                      fr={page.label}
                      en={PAGE_LABELS_EN[page.href] ?? page.label}
                    />
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/installer" prefetch={false} className={cn(pageLink, "text-foreground")}>
                  <LocalizedText fr="Installer l’application" en="Install the app" />
                </Link>
              </li>
              <li>
                <Link href="/publicite" prefetch={false} className={cn(pageLink, "text-foreground")}>
                  <LocalizedText fr="Publicité" en="Advertising" />
                </Link>
              </li>
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
                    <LocalizedText
                      fr={page.label}
                      en={PAGE_LABELS_EN[page.href] ?? page.label}
                    />
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
              <span className="type-small text-muted-foreground">
                <LocalizedText fr="Thème" en="Theme" />
              </span>
              <ThemeToggle />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <p className="type-small text-muted-foreground">
              <LocalizedText
                fr={`© ${new Date().getFullYear()} ${PUBLISHER_NAME}. Tous droits réservés.`}
                en={`© ${new Date().getFullYear()} ${PUBLISHER_NAME}. All rights reserved.`}
              />
            </p>
            <AdminEntry />
          </div>
        </div>

        {/* La signature de la charte : l'adresse du site entre deux filets. */}
        <p
          aria-hidden="true"
          className="mt-6 flex items-center gap-4 type-small font-semibold tracking-wide text-foreground"
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border-strong" />
          {SITE.domain}
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border-strong" />
        </p>
      </Container>
    </footer>
  );
}
