import { X } from "lucide-react";
import { LocalizedText } from "@/components/custom/localized-text";
import { cx } from "@/lib/cx";

/**
 * The classes `<Button variant="ghost" size="icon-lg">` produced once merged
 * with `rounded-md touch-target` — computed with the `cn` engine and frozen
 * here, so the drawer and the search box of every public page stop shipping
 * the shadcn button, class-variance-authority and the merge engine (§5.4).
 */
const CLOSE_BUTTON =
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 size-9 rounded-md touch-target";

/**
 * French close affordance for dialogs and drawers.
 *
 * The shadcn primitives ship an English "Close" label and a 28 px target.
 * `components/ui/` is never edited, so every dialog and sheet in this project
 * is rendered with `showCloseButton={false}` and uses this button instead,
 * wrapped in `<DialogClose asChild>` / `<SheetClose asChild>`. A native
 * `<button>`: `asChild` hands it the dialog's props all the same.
 */
export function CloseButton({
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type={type}
      data-slot="button"
      data-variant="ghost"
      data-size="icon-lg"
      className={cx(CLOSE_BUTTON, className)}
      {...props}
    >
      <X aria-hidden="true" className="size-5" />
      <span className="sr-only">
        <LocalizedText fr="Fermer" en="Close" />
      </span>
    </button>
  );
}
