import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import {
  SECTIONS,
  findSection,
  sectionHref,
  subSectionHref,
  type Section as EditorialSection,
  type SubSection,
} from "@/lib/navigation";

/**
 * Placeholder section (and sub-section) page.
 *
 * Milestone 1 owns no content model, so this route only proves that the eight
 * sections of CAHIER-DES-CHARGES.md §4.1 and their sub-sections are reachable
 * from the masthead, and that the layout components hold. Milestone 2
 * replaces it with the real paginated list (§4.2).
 */
type Resolved = { section: EditorialSection; child?: SubSection };

const resolve = (segments: string[]): Resolved | null => {
  if (segments.length === 0 || segments.length > 2) return null;
  const section = findSection(segments[0]);
  if (!section) return null;
  if (segments.length === 1) return { section };
  const child = section.children.find((item) => item.slug === segments[1]);
  return child ? { section, child } : null;
};

export function generateStaticParams() {
  return SECTIONS.flatMap((section) => [
    { segments: [section.slug] },
    ...section.children.map((child) => ({
      segments: [section.slug, child.slug],
    })),
  ]);
}

export async function generateMetadata({
  params,
}: PageProps<"/rubrique/[...segments]">): Promise<Metadata> {
  const { segments } = await params;
  const resolved = resolve(segments);
  if (!resolved) return { title: "Rubrique introuvable" };
  const title = resolved.child
    ? `${resolved.child.label} — ${resolved.section.label}`
    : resolved.section.label;
  return {
    title,
    description: `Tous les articles de la rubrique ${title} du magazine Le Corporate.`,
  };
}

export default async function SectionPage({
  params,
}: PageProps<"/rubrique/[...segments]">) {
  const { segments } = await params;
  const resolved = resolve(segments);
  if (!resolved) notFound();

  const { section, child } = resolved;

  return (
    <>
      <PageHeader
        eyebrow={child ? section.label : "Rubrique"}
        title={child ? child.label : section.label}
        breadcrumb={
          <nav aria-label="Fil d'Ariane">
            <Link href="/" className="text-accent underline underline-offset-4">
              Accueil
            </Link>
            <span className="text-muted-foreground" aria-hidden="true">
              {" › "}
            </span>
            {child ? (
              <>
                <Link
                  href={sectionHref(section.slug)}
                  className="text-accent underline underline-offset-4"
                >
                  {section.label}
                </Link>
                <span className="text-muted-foreground">
                  {" › "}
                  {child.label}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">{section.label}</span>
            )}
          </nav>
        }
        description={
          child
            ? `Sous-rubrique de ${section.label}.`
            : section.children.length > 0
              ? `Sous-rubriques : ${section.children.map((item) => item.label).join(" · ")}`
              : "Cette rubrique n'a pas de sous-rubrique."
        }
      />

      <Section>
        <Alert>
          <Info aria-hidden="true" />
          <AlertTitle>Rubrique en préparation</AlertTitle>
          <AlertDescription>
            Le lot 1 ne livre que le socle et le design system. La liste paginée
            des articles, les filtres par sous-rubrique et le tri arrivent au
            lot 2.
          </AlertDescription>
        </Alert>

        {!child && section.children.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {section.children.map((item) => (
              <li key={item.slug}>
                <Link
                  href={subSectionHref(section.slug, item.slug)}
                  className="inline-flex items-center rounded-md border border-border px-4 text-small transition-colors touch-target hover:bg-surface-muted"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
