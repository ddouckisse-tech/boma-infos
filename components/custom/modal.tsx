"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Modal built on the native `<dialog>` element.
 *
 * The browser provides the modality, the focus trap, the Escape key, the
 * inert background and the `::backdrop` — everything Radix's Dialog provides,
 * for none of the twenty-odd kilobytes it costs on every page of the site
 * (CDC §5.4). What is left is opening it, closing it, and closing it when the
 * reader clicks outside.
 *
 * Safari iOS 15.0–15.3 has `<dialog>` but not `showModal()`. There, the box
 * is shown non-modally with the `open` attribute: no backdrop and no focus
 * trap, but the content is reachable and dismissible. Nothing is lost that
 * the reader cannot work around, and nobody is locked out.
 */
export function Modal({
  open,
  onClose,
  label,
  variant,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Accessible name of the dialog. */
  label: string;
  /** `drawer` slides from the inline start, `panel` is centred at the top. */
  variant: "drawer" | "panel";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open) {
      if (typeof dialog.showModal === "function") {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    } else if (dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }, [open]);

  // `cancel` couvre la touche Échap, `close` la fermeture par le navigateur.
  const handleClose = useCallback(() => {
    if (open) onClose();
  }, [open, onClose]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={handleClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Un clic sur le ::backdrop atteint l'élément <dialog> lui-même ;
        // un clic dans le contenu atteint un descendant.
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "lc-dialog",
        variant === "drawer" ? "lc-drawer" : "lc-panel",
        className
      )}
    >
      {children}
    </dialog>
  );
}
