"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePreferences } from "@/components/providers/preferences-provider";
import {
  accentBorderClass,
  sectionHref,
  subSectionHref,
  type Section,
} from "@/lib/navigation";
import { categoryLabel, localize } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Desktop section bar with its mega-menus.
 *
 * Written by hand rather than on top of Radix's NavigationMenu: that
 * primitive never opens under the Turbopack dev server (it works only in a
 * production build), and the behaviour needed here is small enough to own.
 * It also keeps the JavaScript budget of CAHIER-DES-CHARGES.md §5.4 down.
 *
 * Behaviour:
 *  - opens on hover after a short delay, on click, and on keyboard focus;
 *  - closes on pointer leave, on Escape (focus returns to the trigger), on
 *    click outside and when focus leaves the section;
 *  - one panel open at a time; a closed panel carries `hidden`, so its links
 *    are out of the tab order.
 */

const OPEN_DELAY_MS = 100;
const CLOSE_DELAY_MS = 150;

export function MegaMenu({
  sections,
  className,
}: {
  sections: readonly Section[];
  className?: string;
}) {
  const { locale } = usePreferences();
  const baseId = useId();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(
    (slug: string) => {
      clearTimer();
      timerRef.current = setTimeout(() => setOpenSlug(slug), OPEN_DELAY_MS);
    },
    [clearTimer]
  );

  const scheduleClose = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setOpenSlug(null), CLOSE_DELAY_MS);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  // Fermeture au clic à l'extérieur de la barre de rubriques.
  useEffect(() => {
    if (!openSlug) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenSlug(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openSlug]);

  return (
    <nav
      ref={navRef}
      aria-label={localize(locale, {
        fr: "Navigation principale",
        en: "Main navigation",
      })}
      className={cn("relative", className)}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !openSlug) return;
        event.stopPropagation();
        const trigger = navRef.current?.querySelector<HTMLButtonElement>(
          `[data-trigger="${openSlug}"]`
        );
        setOpenSlug(null);
        trigger?.focus();
      }}
    >
      <ul className="flex flex-wrap items-center gap-x-1">
        {sections.map((section) => {
          const hasChildren = section.children.length > 0;
          const isOpen = openSlug === section.slug;
          const panelId = `${baseId}-${section.slug}`;

          if (!hasChildren) {
            return (
              <li key={section.slug}>
                <Link
                  href={sectionHref(section.slug)}
                  prefetch={false}
                  className="flex items-center rounded-xs px-2 type-small font-medium transition-colors touch-target hover:bg-surface-muted"
                  onPointerEnter={() => {
                    clearTimer();
                    setOpenSlug(null);
                  }}
                >
                  {categoryLabel(locale, section.slug, section.label)}
                </Link>
              </li>
            );
          }

          return (
            <li
              key={section.slug}
              className="relative"
              onPointerEnter={() => scheduleOpen(section.slug)}
              onPointerLeave={scheduleClose}
              onFocus={() => {
                clearTimer();
                setOpenSlug(section.slug);
              }}
              onBlur={(event) => {
                if (event.currentTarget.contains(event.relatedTarget)) return;
                setOpenSlug(null);
              }}
            >
              <button
                type="button"
                data-trigger={section.slug}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => {
                  clearTimer();
                  setOpenSlug(isOpen ? null : section.slug);
                }}
                className={cn(
                  "flex items-center gap-1 rounded-xs px-2 type-small font-medium transition-colors touch-target hover:bg-surface-muted",
                  isOpen && "bg-surface-muted"
                )}
              >
                {categoryLabel(locale, section.slug, section.label)}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-3.5 shrink-0 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              <div
                id={panelId}
                hidden={!isOpen}
                className={cn(
                  "absolute top-full left-0 z-50 w-[min(20rem,80vw)] rounded-md border-t-2 bg-popover p-2 shadow-floating",
                  accentBorderClass[section.accent]
                )}
              >
                <ul>
                  <li>
                    <Link
                      href={sectionHref(section.slug)}
                      prefetch={false}
                      className="flex min-h-[44px] items-center rounded-xs px-2 type-small font-semibold text-accent hover:bg-surface-muted"
                      onClick={() => setOpenSlug(null)}
                    >
                      {localize(locale, {
                        fr: "Toute la rubrique",
                        en: "View the full section",
                      })}
                    </Link>
                  </li>
                  {section.children.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={subSectionHref(section.slug, child.slug)}
                        prefetch={false}
                        className="flex min-h-[44px] items-center rounded-xs px-2 type-small text-foreground hover:bg-surface-muted"
                        onClick={() => setOpenSlug(null)}
                      >
                        {categoryLabel(locale, child.slug, child.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
