"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CloseButton } from "@/components/custom/close-button";
import { DataSaverToggle } from "@/components/custom/data-saver-toggle";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import {
  SECTIONS,
  STATIC_PAGES,
  sectionHref,
  subSectionHref,
} from "@/lib/navigation";

/**
 * Drawer navigation, shown below the `lg` breakpoint.
 * Sub-sections are collapsed into an accordion so the eight sections stay
 * reachable without scrolling on a 320 px screen.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center justify-center rounded-md border border-border text-foreground transition-colors touch-target hover:bg-surface-muted lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
        <span className="sr-only">Ouvrir le menu de navigation</span>
      </button>

      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-[min(22rem,88vw)] overflow-y-auto bg-popover p-0 sm:max-w-sm"
      >
        <SheetHeader className="flex-row items-center justify-between border-b border-border p-4">
          <div>
            <SheetTitle className="font-serif type-h3">Navigation</SheetTitle>
            <SheetDescription className="type-small text-muted-foreground">
              Les huit rubriques du magazine.
            </SheetDescription>
          </div>
          <SheetClose asChild>
            <CloseButton />
          </SheetClose>
        </SheetHeader>

        <nav aria-label="Navigation principale" className="p-2">
          <Accordion type="multiple" className="w-full">
            {SECTIONS.map((section) =>
              section.children.length > 0 ? (
                <AccordionItem
                  key={section.slug}
                  value={section.slug}
                  className="border-b border-border"
                >
                  <AccordionTrigger className="min-h-[44px] px-2 text-left font-serif type-body font-semibold">
                    {section.label}
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <ul className="flex flex-col">
                      <li>
                        <SheetClose asChild>
                          <Link
                            href={sectionHref(section.slug)}
                            className="flex min-h-[44px] items-center rounded-xs px-4 type-small font-semibold text-accent hover:bg-surface-muted"
                          >
                            Toute la rubrique
                          </Link>
                        </SheetClose>
                      </li>
                      {section.children.map((child) => (
                        <li key={child.slug}>
                          <SheetClose asChild>
                            <Link
                              href={subSectionHref(section.slug, child.slug)}
                              className="flex min-h-[44px] items-center rounded-xs px-4 type-small text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                            >
                              {child.label}
                            </Link>
                          </SheetClose>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div key={section.slug} className="border-b border-border">
                  <SheetClose asChild>
                    <Link
                      href={sectionHref(section.slug)}
                      className="flex min-h-[44px] items-center px-2 py-2 font-serif type-body font-semibold hover:bg-surface-muted"
                    >
                      {section.label}
                    </Link>
                  </SheetClose>
                </div>
              )
            )}
          </Accordion>

          <ul className="mt-2 flex flex-col">
            {STATIC_PAGES.map((page) => (
              <li key={page.href}>
                <SheetClose asChild>
                  <Link
                    href={page.href}
                    className="flex min-h-[44px] items-center rounded-xs px-2 type-small text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  >
                    {page.label}
                  </Link>
                </SheetClose>
              </li>
            ))}
            <li>
              <SheetClose asChild>
                <Link
                  href="/design-system"
                  className="flex min-h-[44px] items-center rounded-xs px-2 type-small text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                >
                  Design system
                </Link>
              </SheetClose>
            </li>
          </ul>
        </nav>

        <Separator />

        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2">
            <span className="type-small font-medium text-muted-foreground">
              Thème
            </span>
            <ThemeToggle labelled className="self-start" />
          </div>
          <DataSaverToggle variant="block" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
