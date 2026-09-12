"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { usePreferences } from "@/components/providers/preferences-provider";
import { THEME_LABELS, type ThemeChoice } from "@/lib/preferences";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemeChoice; Icon: typeof Sun }[] = [
  { value: "light", Icon: Sun },
  { value: "dark", Icon: Moon },
  { value: "system", Icon: Monitor },
];

/**
 * Three-state theme control: explicit light, explicit dark, follow the system.
 *
 * No flash on load: the theme is applied by a blocking inline script before
 * the first paint (`components/custom/preferences-script.tsx`). This control
 * only mirrors and changes what that script already set, so it stays inert
 * until the DOM has been read (`ready`).
 */
export function ThemeToggle({
  className,
  labelled = false,
}: {
  className?: string;
  /** Show the French label next to each icon (used in the settings panel). */
  labelled?: boolean;
}) {
  const { theme, setTheme, ready } = usePreferences();

  return (
    <div
      role="group"
      aria-label="Thème de l'interface"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5",
        className
      )}
    >
      {OPTIONS.map(({ value, Icon }) => {
        const active = ready && theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            title={THEME_LABELS[value]}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xs px-2 text-small font-medium transition-colors touch-target",
              "hover:bg-surface-muted hover:text-foreground",
              active
                ? "bg-primary text-primary-foreground hover:bg-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            {labelled ? (
              <span>{THEME_LABELS[value]}</span>
            ) : (
              <span className="sr-only">{THEME_LABELS[value]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
