"use client";

import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Discreet entry to the administrator sign-in — page footer and card footer.
 *
 * A small key, low in contrast, that does nothing on a single click and opens
 * the administration sign-in on a **double** click. The point is to keep the
 * affordance out of the way of readers, not to hide the door: the real
 * security is server-side (roles checked in every Convex function, mandatory
 * second factor), and `/connexion` stays reachable to anyone who types it.
 *
 * Keyboard users cannot double-click. A keyboard activation arrives as a
 * `click` with `detail === 0` (no pointer) and opens directly — one deliberate
 * Enter on a control they had to find and focus on purpose is the same
 * intent as two clicks from a mouse.
 */
export function AdminTrigger({
  onOpen,
  className,
}: {
  onOpen: (trigger: HTMLElement) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onDoubleClick={(event) => onOpen(event.currentTarget)}
      onClick={(event) => {
        if (event.detail === 0) onOpen(event.currentTarget);
      }}
      aria-label="Accès administrateur"
      title="Administration — double-clic"
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-md text-muted-foreground/45 transition-colors select-none hover:text-muted-foreground focus-visible:text-foreground",
        className
      )}
    >
      <KeyRound aria-hidden="true" className="size-4" />
    </button>
  );
}
