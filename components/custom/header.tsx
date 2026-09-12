import { AccessMenu } from "@/components/custom/access-menu";
import { BrandWordmark } from "@/components/custom/brand-wordmark";
import { Container } from "@/components/custom/container";
import { MegaMenu } from "@/components/custom/mega-menu";
import { MobileNav } from "@/components/custom/mobile-nav";
import { SearchDialog } from "@/components/custom/search-dialog";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { NAV_STATIC_PAGES } from "@/lib/site";
import type { Section } from "@/lib/navigation";

/**
 * Masthead.
 *
 * Two rows, the way a newspaper is built: identity and tools on top, the
 * editorial sections underneath. Below `lg` the sections collapse into a
 * drawer (`MobileNav`); from `lg` up they are laid out by `MegaMenu`, which
 * opens a panel for the sections that own sub-sections.
 *
 * The section tree is passed down as data — it comes from the `categories`
 * table, so renaming or reordering a section is an editorial act, not a
 * deployment (CDC §4.1).
 */
export function Header({ sections }: { sections: readonly Section[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container className="flex min-h-[64px] items-center justify-between gap-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <MobileNav sections={sections} pages={NAV_STATIC_PAGES} />
          <BrandWordmark />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SearchDialog />
          <ThemeToggle className="hidden sm:inline-flex" />
          <span aria-hidden="true" className="hidden h-5 w-px bg-border md:block" />
          <AccessMenu />
        </div>
      </Container>

      <div className="hidden border-t border-border lg:block">
        <Container>
          <MegaMenu sections={sections} />
        </Container>
      </div>
    </header>
  );
}
