"use client";

import { usePreferences } from "@/components/providers/preferences-provider";
import { cn } from "@/lib/utils";

/** Round FR/EN toggle shared by the journal and company workspace. */
export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = usePreferences();
  const english = locale === "en";
  const next = english ? "fr" : "en";

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={
        english ? "Afficher le site en français" : "Display the site in English"
      }
      title={english ? "Français" : "English"}
      className={cn(
        "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background font-display text-[0.6875rem] font-bold tracking-wide text-foreground transition-colors hover:border-border-strong hover:bg-surface-muted",
        className
      )}
    >
      <span aria-hidden="true" className="lc-fr">
        FR
      </span>
      <span aria-hidden="true" className="lc-en">
        EN
      </span>
    </button>
  );
}
