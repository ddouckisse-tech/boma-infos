import { Footer } from "@/components/custom/footer";
import { Header } from "@/components/custom/header";
import { SkipLink } from "@/components/custom/skip-link";
import { getNavigation } from "@/lib/content/server";
import { buildSections } from "@/lib/navigation";
import { headers } from "next/headers";
import { AdsConsent } from "@/components/custom/adsense-slot";
import { AdNavigationTracker } from "@/components/custom/ad-navigation-tracker";
import { getAdSenseCmpConfig } from "@/lib/ads/adsense-config";

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
  // Keep the public layout and global not-found on the same client graph;
  // different graphs make Turbopack duplicate the whole header/footer bundle.
  const cmp = getAdSenseCmpConfig();
  const nonce = cmp ? ((await headers()).get("x-nonce") ?? undefined) : undefined;

  return (
    <>
      <AdNavigationTracker />
      {cmp && <AdsConsent config={cmp} nonce={nonce} />}
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
      <Footer />
    </>
  );
}
