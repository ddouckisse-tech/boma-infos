import { BrandWordmark } from "@/components/custom/brand-wordmark";
import { Container } from "@/components/custom/container";
import { MegaMenu } from "@/components/custom/mega-menu";
import { MobileNav } from "@/components/custom/mobile-nav";
import { SearchDialog } from "@/components/custom/search-dialog";
import { ThemeToggle } from "@/components/custom/theme-toggle";

/**
 * Masthead.
 *
 * Two rows, the way a newspaper is built: identity and tools on top, the
 * eight editorial sections (CAHIER-DES-CHARGES.md §4.1) underneath. Below the
 * `lg` breakpoint the sections collapse into a drawer (`MobileNav`); from
 * `lg` up they are laid out by `MegaMenu`, which opens a panel for the
 * sections that own sub-sections.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <Container className="flex min-h-[64px] items-center justify-between gap-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNav />
          <BrandWordmark />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SearchDialog />
          <ThemeToggle className="hidden sm:inline-flex" />
        </div>
      </Container>

      <div className="hidden border-t border-border lg:block">
        <Container>
          <MegaMenu />
        </Container>
      </div>
    </header>
  );
}
