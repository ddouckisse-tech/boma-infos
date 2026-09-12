"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { CloseButton } from "@/components/custom/close-button";
import { Modal } from "@/components/custom/modal";
import { DataSaverToggle } from "@/components/custom/data-saver-toggle";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { sectionHref, subSectionHref, type Section } from "@/lib/navigation";

/**
 * Drawer navigation, shown below the `lg` breakpoint.
 *
 * Two Radix primitives are deliberately absent. The drawer is a native
 * `<dialog>` (see `components/custom/modal.tsx`) and the sub-sections
 * collapse into native `<details>`: the browser already implements both
 * patterns — modality, focus trap, Escape, `aria-expanded` — and dropping
 * the primitives takes their runtime off every page of the site (CDC §5.4).
 * The sections stay reachable without scrolling on a 320 px screen.
 */
export function MobileNav({
  sections,
  pages,
}: {
  sections: readonly Section[];
  pages: readonly { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  const leafLink =
    "flex min-h-11 items-center rounded-xs px-4 type-small text-muted-foreground hover:bg-surface-muted hover:text-foreground";

  const close = () => setOpen(false);

  return (
    <>
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

      <Modal
        open={open}
        onClose={close}
        label="Menu de navigation"
        variant="drawer"
        className="pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border p-4">
          <div className="min-w-0">
            <p className="font-display type-h3">Navigation</p>
            <p className="type-small text-muted-foreground">
              Les {sections.length} rubriques du magazine.
            </p>
          </div>
          <CloseButton onClick={close} />
        </div>

        <nav aria-label="Navigation principale" className="p-2">
          <ul className="flex flex-col">
            {sections.map((section) =>
              section.children.length > 0 ? (
                <li key={section.slug} className="border-b border-border">
                  <details className="group/section">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-2 font-display type-body font-semibold [&::-webkit-details-marker]:hidden">
                      {section.label}
                      <ChevronDown
                        aria-hidden="true"
                        className="size-4 shrink-0 transition-transform group-open/section:rotate-180"
                      />
                    </summary>
                    <ul className="flex flex-col pb-2">
                      <li>
                        <Link
                          href={sectionHref(section.slug)}
                          onClick={close}
                          className="flex min-h-11 items-center rounded-xs px-4 type-small font-semibold text-accent hover:bg-surface-muted"
                        >
                          Toute la rubrique
                        </Link>
                      </li>
                      {section.children.map((child) => (
                        <li key={child.slug}>
                          <Link
                            href={subSectionHref(section.slug, child.slug)}
                            onClick={close}
                            className={leafLink}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ) : (
                <li key={section.slug} className="border-b border-border">
                  <Link
                    href={sectionHref(section.slug)}
                    onClick={close}
                    className="flex min-h-11 items-center px-2 font-display type-body font-semibold hover:bg-surface-muted"
                  >
                    {section.label}
                  </Link>
                </li>
              )
            )}
          </ul>

          <ul className="mt-2 flex flex-col">
            {pages.map((page) => (
              <li key={page.href}>
                <Link href={page.href} onClick={close} className={leafLink}>
                  {page.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/newsletter" onClick={close} className={leafLink}>
                Newsletter
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex flex-col gap-4 border-t border-border p-4">
          <div className="flex flex-col gap-2">
            <span className="type-small font-medium text-muted-foreground">
              Thème
            </span>
            <ThemeToggle labelled className="self-start" />
          </div>
          <DataSaverToggle variant="block" />
        </div>
      </Modal>
    </>
  );
}
