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
  const invoker = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open) {
      // Mémorise le contrôle qui a ouvert la boîte, pour y ramener le focus
      // à la fermeture (WCAG 2.4.3). `<dialog>` le fait quand il ferme
      // lui-même, pas quand on le ferme par programme.
      invoker.current = document.activeElement as HTMLElement | null;
      if (typeof dialog.showModal === "function") {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      return;
    }

    if (dialog.open) dialog.close();
    else dialog.removeAttribute("open");

    const previous = invoker.current;
    invoker.current = null;
    if (previous && document.contains(previous)) previous.focus();
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
      onKeyDown={(event) => {
        // Le `cancel` natif ne suffit pas. Un `<input type="search">`
        // consomme Échap pour vider son contenu, et le navigateur n'émet
        // alors jamais `cancel` — la boîte resterait ouverte, mesuré dans
        // Chrome. Sans `showModal()` (Safari iOS 15.0–15.3) il n'y a pas de
        // `cancel` du tout. On ferme donc explicitement.
        if (event.key !== "Escape") return;
        event.stopPropagation();
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
