import Link from "next/link";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SECTIONS, sectionHref } from "@/lib/navigation";

/**
 * 404. A soigné page rather than a server error: several pages announced by
 * the footer (À propos, Contacts, mentions légales) are built in later
 * milestones and land here in the meantime.
 */
export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="Erreur 404"
        title="Cette page n'existe pas encore"
        description="Le lot 1 de la refonte ne livre que le socle applicatif et le design system. Les pages éditoriales, la recherche et les espaces privés arrivent aux lots suivants."
        actions={
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-primary px-4 text-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
          >
            Retour à l&apos;accueil
          </Link>
        }
      />
      <Section title="Aller ailleurs">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/design-system"
              className="inline-flex items-center rounded-md border border-border px-4 text-small transition-colors touch-target hover:bg-surface-muted"
            >
              Design system
            </Link>
          </li>
          {SECTIONS.map((section) => (
            <li key={section.slug}>
              <Link
                href={sectionHref(section.slug)}
                className="inline-flex items-center rounded-md border border-border px-4 text-small transition-colors touch-target hover:bg-surface-muted"
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
