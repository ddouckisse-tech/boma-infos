"use client";

import { Moon, Sun } from "lucide-react";
import { usePreferences } from "@/components/providers/preferences-provider";
import { cn } from "@/lib/utils";

/**
 * Light / dark switch.
 *
 * One control, two positions — the reader asked for a switch, not a
 * three-way group. "Follow the system" remains the default for a reader who
 * has never touched it (the boot script resolves it before first paint); the
 * first flick makes the choice explicit and persists it.
 *
 * The knob's position and icon are driven by the `.dark` class on <html>,
 * not by React state: the boot script sets that class before the first
 * paint, so the switch is right from the very first frame and never jumps
 * after hydration. Only `aria-checked` waits for the store to be read.
 */
export function ThemeToggle({
  className,
  labelled = false,
}: {
  className?: string;
  /** Show the current state as text next to the switch (settings panel). */
  labelled?: boolean;
}) {
  const { resolvedTheme, setTheme, ready } = usePreferences();
  const dark = ready && resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Thème sombre"
      title={dark ? "Passer en thème clair" : "Passer en thème sombre"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(
        "group inline-flex min-h-11 items-center gap-2 rounded-full",
        className
      )}
    >
      {labelled && (
        <span className="type-small text-muted-foreground">
          <span className="dark:hidden">Clair</span>
          <span className="hidden dark:inline">Sombre</span>
        </span>
      )}
      <span
        aria-hidden="true"
        className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-border-strong bg-surface-muted transition-colors group-hover:border-foreground/40 dark:bg-primary/30"
      >
        <span className="absolute top-0.5 left-0.5 inline-flex size-6 items-center justify-center rounded-full bg-background text-foreground shadow-xs transition-transform dark:translate-x-5 dark:bg-primary dark:text-primary-foreground">
          <Sun className="size-3.5 dark:hidden" />
          <Moon className="hidden size-3.5 dark:block" />
        </span>
      </span>
    </button>
  );
}
