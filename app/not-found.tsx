import Link from "next/link";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SearchForm } from "@/components/custom/search-form";
import { getNavigation } from "@/lib/content/server";
import { buildSections, sectionHref } from "@/lib/navigation";

/**
 * 404.
 *
 * Offers a way forward — search and the section list — rather than a dead
 * end. The section list is read from the database like everywhere else, so a
 * renamed section cannot leave a stale link here.
 */
export default async function NotFound() {
  const sections = buildSections(await getNavigation()).filter(
    (section) => section.slug !== "espace-pro"
  );

  return (
    <>
      <PageHeader
        eyebrow="Erreur 404"
        title="Cette page n'existe pas"
        description="L'adresse demandée ne correspond à aucun article ni à aucune rubrique. Elle a peut-être changé, ou le contenu a été retiré."
        width="reading"
      />

      <Section width="reading" spacing="compact">
        <SearchForm />
      </Section>

      <Section title="Parcourir les rubriques">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/"
              className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
            >
              Accueil
            </Link>
          </li>
          {sections.map((section) => (
            <li key={section.slug}>
              <Link
                href={sectionHref(section.slug)}
                className="inline-flex items-center rounded-md border border-border px-4 type-small transition-colors touch-target hover:bg-surface-muted"
              >
                {section.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/docutheque"
              className="inline-flex items-center rounded-md border border-border px-4 type-small transition-colors touch-target hover:bg-surface-muted"
            >
              Docuthèque
            </Link>
          </li>
        </ul>
      </Section>
    </>
  );
}
