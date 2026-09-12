"use client";

import { useId } from "react";
import { Gauge } from "lucide-react";
import { usePreferences } from "@/components/providers/preferences-provider";
import { localize } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Data saver switch (CDC §2.2).
 *
 * Reads the `data-data-saver` attribute the blocking script of milestone 1
 * put on `<html>`, and writes it back. Milestone 2 consumes it: every lazy
 * picture drops to its 320 px rendition and no video is ever preloaded.
 *
 * Built on a **native checkbox** rather than `components/ui/switch.tsx`: the
 * Radix primitive would pull its own runtime into every page of the site for
 * one control in the footer, and the budget of §5.4 pays for articles, not
 * for a styled checkbox. `role="switch"` is implicit on a checkbox with
 * `switch` semantics, so it is declared explicitly; the label, the focus
 * ring and the keyboard behaviour come free with the native element.
 */
export function DataSaverToggle({
  className,
  variant = "inline",
}: {
  className?: string;
  /** `block` shows the explanatory sentence, `inline` stays compact. */
  variant?: "inline" | "block";
}) {
  const id = useId();
  const { dataSaver, locale, setDataSaver, ready } = usePreferences();

  return (
    <div
      className={cn(
        "flex items-start gap-3",
        variant === "block" &&
          "rounded-md border border-border bg-surface-muted p-4",
        className
      )}
    >
      <Gauge
        aria-hidden="true"
        className="mt-3.5 size-4 shrink-0 text-muted-foreground"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={id}
          className="flex min-h-11 cursor-pointer items-center gap-3 type-small font-medium text-foreground"
        >
          {/* La case elle-même occupe 44 x 44 px et reste transparente ;
              la piste et le curseur sont dessinés par les deux spans, que la
              case pilote via `peer-checked`. La cible tactile vaut donc bien
              44 px, sans que la bascule n'en ait l'air (§3.5). */}
          <span className="relative inline-flex size-11 shrink-0 items-center">
            <input
              id={id}
              type="checkbox"
              role="switch"
              checked={dataSaver}
              disabled={!ready}
              onChange={(event) => setDataSaver(event.target.checked)}
              aria-describedby={variant === "block" ? `${id}-help` : undefined}
              className="peer absolute inset-0 size-11 cursor-pointer appearance-none rounded-md disabled:cursor-not-allowed"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none block h-5 w-9 rounded-full border border-border-strong bg-input/20 transition-colors peer-checked:border-primary peer-checked:bg-primary peer-disabled:opacity-50"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-0.5 size-3.5 -translate-y-1/2 rounded-full bg-foreground transition-transform peer-checked:translate-x-[1.1rem] peer-checked:bg-primary-foreground peer-disabled:opacity-50"
            />
          </span>
          <span>
            {localize(locale, {
              fr: "Économie de données",
              en: "Data saver",
            })}
          </span>
        </label>
        {variant === "block" && (
          <p id={`${id}-help`} className="type-small text-muted-foreground">
            {localize(locale, {
              fr: "Images en basse définition et vidéos jamais préchargées. Utile sur forfait limité ou réseau lent.",
              en: "Lower-resolution images and no video preloading. Useful with limited data or a slow connection.",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
