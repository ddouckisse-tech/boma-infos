import { AccessMenu } from "@/components/custom/access-menu";
import { BrandWordmark } from "@/components/custom/brand-wordmark";
import { Container } from "@/components/custom/container";
import { MegaMenu } from "@/components/custom/mega-menu";
import { MobileNav } from "@/components/custom/mobile-nav";
import { LocaleToggle } from "@/components/custom/locale-toggle";
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
 *
 * The masthead is a **navy island**: the `dark` class on the element applies
 * the tokens of the dark theme to everything it contains, whatever the theme
 * of the page — white wordmark, gold focus ring, navy menus and drawers. It
 * is the first thing the charter shows, and it is closed by the tricolour
 * rule. `text-foreground` is set here on purpose: `color` is inherited as a
 * computed value from `<body>`, so the island has to re-read the token.
 */
export function Header({ sections }: { sections: readonly Section[] }) {
  return (
    <header className="dark sticky top-0 z-40 bg-background text-foreground supports-[backdrop-filter]:bg-background/92 supports-[backdrop-filter]:backdrop-blur-md">
      <Container className="flex min-h-[64px] items-center justify-between gap-2 py-2 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <BrandWordmark />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <SearchDialog className="hidden sm:inline-flex" />
          <ThemeToggle compact />
          <LocaleToggle />
          <span
            aria-hidden="true"
            className="hidden h-5 w-px bg-border md:block"
          />
          <div className="hidden sm:contents">
            <AccessMenu />
          </div>
          <MobileNav sections={sections} pages={NAV_STATIC_PAGES} />
        </div>
      </Container>

      <div className="hidden border-t border-border lg:block">
        <Container>
          <MegaMenu sections={sections} />
        </Container>
      </div>
      {/* Le filet de la charte ferme le bandeau, d'un bord à l'autre. */}
      <span aria-hidden="true" className="boma-rule rounded-none" />
    </header>
  );
}
