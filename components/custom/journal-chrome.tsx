import { Footer } from "@/components/custom/footer";
import { Header } from "@/components/custom/header";
import { SkipLink } from "@/components/custom/skip-link";
import { getNavigation } from "@/lib/content/server";
import { buildSections } from "@/lib/navigation";

/**
 * Masthead, reading area and footer of the **public journal**.
 *
 * Milestone 3 splits the application in two: `app/(journal)` keeps this
 * chrome, `app/(prive)` gets its own. The root layout therefore no longer
 * carries the masthead — which is why it also has to be available to
 * `app/not-found.tsx`, a file Next.js insists on keeping outside any route
 * group.
 */
export async function JournalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const sections = buildSections(await getNavigation());

  return (
    <>
      <SkipLink />
      <Header sections={sections} />
      {/* tabIndex={-1} : cible du lien d'évitement, focalisable par
          programme mais hors de l'ordre de tabulation. */}
      <main
        id="contenu"
        tabIndex={-1}
        className="flex-1 focus-visible:outline-none"
      >
        {children}
      </main>
      <Footer sections={sections} />
    </>
  );
}
