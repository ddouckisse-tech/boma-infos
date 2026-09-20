import Link from "next/link";
import { JournalChrome } from "@/components/custom/journal-chrome";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SearchForm } from "@/components/custom/search-form";
import { getNavigation } from "@/lib/content/server";
import { categoryLabel } from "@/lib/i18n";
import { buildSections, sectionHref } from "@/lib/navigation";

/**
 * 404.
 *
 * Offers a way forward — search and the section list — rather than a dead
 * end. The section list is read from the database like everywhere else, so a
 * renamed section cannot leave a stale link here.
 *
 * It lives at the root rather than in `app/(journal)`, because Next.js only
 * uses `app/not-found.tsx` for URLs that match no route at all — so the page
 * carries the masthead itself instead of inheriting it from a layout.
 */
export default async function NotFound() {
  const sections = buildSections(await getNavigation()).filter(
    (section) => section.slug !== "espace-pro"
  );

  return (
    <JournalChrome>
      <PageHeader
        eyebrow={<LocalizedText fr="Erreur 404" en="Error 404" />}
        title={
          <LocalizedText
            fr="Cette page n'existe pas"
            en="This page does not exist"
          />
        }
        description={
          <LocalizedText
            fr="L'adresse demandée ne correspond à aucun article ni à aucune rubrique. Elle a peut-être changé, ou le contenu a été retiré."
            en="The requested address does not match an article or section. It may have changed, or the content may have been removed."
          />
        }
        width="reading"
      />

      <Section width="reading" spacing="compact">
        <SearchForm />
      </Section>

      <Section
        title={
          <LocalizedText fr="Parcourir les rubriques" en="Browse sections" />
        }
      >
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/"
              prefetch={false}
              className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
            >
              <LocalizedText fr="Accueil" en="Home" />
            </Link>
          </li>
          {sections.map((section) => (
            <li key={section.slug}>
              <Link
                href={sectionHref(section.slug)}
                prefetch={false}
                className="inline-flex items-center rounded-md border border-border px-4 type-small transition-colors touch-target hover:bg-surface-muted"
              >
                <LocalizedText
                  fr={section.label}
                  en={categoryLabel("en", section.slug, section.label)}
                />
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/docutheque"
              prefetch={false}
              className="inline-flex items-center rounded-md border border-border px-4 type-small transition-colors touch-target hover:bg-surface-muted"
            >
              <LocalizedText fr="Docuthèque" en="Document library" />
            </Link>
          </li>
        </ul>
      </Section>
    </JournalChrome>
  );
}
