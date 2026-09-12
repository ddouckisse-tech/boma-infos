import { X } from "lucide-react";
import { LocalizedText } from "@/components/custom/localized-text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * French close affordance for dialogs and drawers.
 *
 * The shadcn primitives ship an English "Close" label and a 28 px target.
 * `components/ui/` is never edited, so every dialog and sheet in this project
 * is rendered with `showCloseButton={false}` and uses this button instead,
 * wrapped in `<DialogClose asChild>` / `<SheetClose asChild>`.
 */
export function CloseButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className={cn("rounded-md touch-target", className)}
      {...props}
    >
      <X aria-hidden="true" className="size-5" />
      <span className="sr-only">
        <LocalizedText fr="Fermer" en="Close" />
      </span>
    </Button>
  );
}
