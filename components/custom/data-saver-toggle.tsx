"use client";

import { useId } from "react";
import { Gauge } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { usePreferences } from "@/components/providers/preferences-provider";
import { cn } from "@/lib/utils";

/**
 * Data saver switch (CDC §2.2).
 *
 * Milestone 1 establishes the state, the storage key and the `data-data-saver`
 * attribute on <html>; milestone 2 reads it to serve low-definition images and
 * stop preloading video. The reader's choice is remembered across visits.
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
  const { dataSaver, setDataSaver, ready } = usePreferences();

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
        className="mt-1 size-4 shrink-0 text-muted-foreground"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={id}
          className="flex min-h-[44px] cursor-pointer items-center gap-3 text-small font-medium text-foreground"
        >
          <Switch
            id={id}
            checked={dataSaver}
            disabled={!ready}
            onCheckedChange={setDataSaver}
            aria-describedby={variant === "block" ? `${id}-help` : undefined}
          />
          <span>Économie de données</span>
        </label>
        {variant === "block" && (
          <p id={`${id}-help`} className="text-small text-muted-foreground">
            Images en basse définition et vidéos jamais préchargées. Utile sur
            forfait limité ou réseau lent.
          </p>
        )}
      </div>
    </div>
  );
}
