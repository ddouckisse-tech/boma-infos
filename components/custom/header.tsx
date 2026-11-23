import Link from "next/link";
import { AccessMenu } from "@/components/custom/access-menu";
import { BrandWordmark } from "@/components/custom/brand-wordmark";
import { Container } from "@/components/custom/container";
import { LocalizedText } from "@/components/custom/localized-text";
import { MegaMenu } from "@/components/custom/mega-menu";
import { MobileNav } from "@/components/custom/mobile-nav";
import { LocaleToggle } from "@/components/custom/locale-toggle";
import { SearchDialog } from "@/components/custom/search-dialog";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { NAV_STATIC_PAGES } from "@/lib/site";
import { categoryLabel } from "@/lib/i18n";
import { sectionHref, type Section } from "@/lib/navigation";

export function Header({ sections }: { sections: readonly Section[] }) {
  return (
    <header className="journal-masthead sticky top-0 z-40">
      <div className="journal-masthead__brand">
        <Container className="flex min-h-[64px] items-center justify-between gap-2 py-2 sm:min-h-[76px] sm:gap-4">
          <BrandWordmark className="w-36 min-[380px]:w-40 sm:w-52" />

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <SearchDialog className="journal-control inline-flex" />
            <ThemeToggle compact className="journal-control" />
            <LocaleToggle className="journal-control" />
            <div className="hidden sm:contents">
              <AccessMenu />
            </div>
            <MobileNav sections={sections} pages={NAV_STATIC_PAGES} />
          </div>
        </Container>
      </div>

      <div className="journal-masthead__nav">
        <Container className="hidden lg:block">
          <MegaMenu sections={sections} />
        </Container>
        {sections.length > 0 && (
          <Container
            as="nav"
            aria-label="Rubriques principales / Main sections"
            className="journal-quick-nav lg:hidden"
          >
            <ul className="flex w-max min-w-full items-center gap-5">
              {sections.map((section) => (
                <li key={section.slug}>
                  <Link
                    href={sectionHref(section.slug)}
                    prefetch={false}
                    className="inline-flex min-h-11 items-center whitespace-nowrap"
                  >
                    <LocalizedText
                      fr={section.label}
                      en={categoryLabel("en", section.slug, section.label)}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        )}
      </div>
    </header>
  );
}
