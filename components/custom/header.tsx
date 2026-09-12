"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { BrandWordmark } from "@/components/custom/brand-wordmark";
import { Container } from "@/components/custom/container";
import { MobileNav } from "@/components/custom/mobile-nav";
import { SearchDialog } from "@/components/custom/search-dialog";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import {
  SECTIONS,
  accentBorderClass,
  sectionHref,
  subSectionHref,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Masthead.
 *
 * Two rows, the way a newspaper is built: identity and tools on top, the
 * eight editorial sections (CAHIER-DES-CHARGES.md §4.1) underneath. Below the
 * `lg` breakpoint the sections collapse into a drawer (`MobileNav`).
 * Sections that own sub-sections open a mega-menu on hover and on keyboard
 * focus; the others are plain links.
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
          <NavigationMenu
            viewport={false}
            className="max-w-none justify-start"
            aria-label="Navigation principale"
          >
            <NavigationMenuList className="flex-wrap justify-start gap-x-1">
              {SECTIONS.map((section) =>
                section.children.length > 0 ? (
                  <NavigationMenuItem key={section.slug}>
                    <NavigationMenuTrigger className="h-11 rounded-none px-2 text-small font-medium touch-target hover:bg-surface-muted">
                      {section.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="rounded-md bg-popover p-0 shadow-floating">
                      <div
                        className={cn(
                          "w-[min(20rem,80vw)] border-t-2 p-2",
                          accentBorderClass[section.accent]
                        )}
                      >
                        <NavigationMenuLink asChild>
                          <Link
                            href={sectionHref(section.slug)}
                            className="flex min-h-[44px] items-center rounded-xs px-2 text-small font-semibold text-accent"
                          >
                            Toute la rubrique
                          </Link>
                        </NavigationMenuLink>
                        <ul>
                          {section.children.map((child) => (
                            <li key={child.slug}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={subSectionHref(
                                    section.slug,
                                    child.slug
                                  )}
                                  className="flex min-h-[44px] items-center rounded-xs px-2 text-small text-foreground"
                                >
                                  {child.label}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={section.slug}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={sectionHref(section.slug)}
                        className="flex h-11 items-center rounded-none px-2 text-small font-medium touch-target hover:bg-surface-muted"
                      >
                        {section.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </Container>
      </div>
    </header>
  );
}
