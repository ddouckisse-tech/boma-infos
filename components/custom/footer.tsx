import Link from "next/link";
import { AdminEntry } from "@/components/custom/admin-entry";
import { Container } from "@/components/custom/container";
import { DataSaverToggle } from "@/components/custom/data-saver-toggle";
import { LocalizedText } from "@/components/custom/localized-text";
import { NAV_LEGAL_PAGES, PUBLISHER_NAME, SEARCH_INDEXABLE } from "@/lib/site";

const links = [
  { href: "/contacts", label: "Contact", en: "Contact" },
  ...NAV_LEGAL_PAGES,
];

export function Footer() {
  return (
    <footer className="journal-footer border-t">
      <Container className="pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {!SEARCH_INDEXABLE && (
          <p role="note" className="type-small text-muted-foreground">
            <LocalizedText
              fr="Édition de test. Les contenus de démonstration sont fictifs."
              en="Test edition. Demonstration content is fictional."
            />
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-x-6">
          <nav aria-label="Informations légales et contact / Legal information and contact">
            <ul className="flex flex-wrap gap-x-5">
              {links.map(({ href, label, en }) => (
                <li key={href}>
                  <Link
                    href={href}
                    prefetch={false}
                    className="inline-flex min-h-11 items-center type-small text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    <LocalizedText fr={label} en={en} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hidden lg:flex">
            <DataSaverToggle />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3">
          <p className="type-small text-muted-foreground">
            © {new Date().getFullYear()} {PUBLISHER_NAME}
          </p>
          <AdminEntry />
        </div>
      </Container>
    </footer>
  );
}
