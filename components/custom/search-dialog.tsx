"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CloseButton } from "@/components/custom/close-button";
import { cn } from "@/lib/utils";

/**
 * Search entry point in the masthead.
 *
 * Milestone 1 ships the affordance and the shell only: the full-text index
 * (CAHIER-DES-CHARGES.md §4.2) is built in milestone 2, so the dialog states
 * plainly that no result can be returned yet rather than faking one.
 */
export function SearchDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-border px-3 text-muted-foreground transition-colors touch-target hover:border-border-strong hover:text-foreground",
          className
        )}
      >
        <Search aria-hidden="true" className="size-4 shrink-0" />
        <span className="hidden text-small lg:inline">Rechercher</span>
        <kbd className="ml-1 hidden rounded-xs border border-border px-1.5 py-0.5 text-[0.75rem] text-muted-foreground lg:inline">
          ⌘K
        </kbd>
        <span className="sr-only lg:hidden">Rechercher sur le site</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-2rem)] rounded-xl bg-popover sm:max-w-lg"
        >
          <DialogHeader className="pr-12">
            <DialogTitle className="font-serif text-h3">Rechercher</DialogTitle>
            <DialogDescription className="text-small text-muted-foreground">
              La recherche plein texte sera activée avec la mise en ligne du
              journal. Le champ ci-dessous est encore inerte.
            </DialogDescription>
          </DialogHeader>

          <div className="absolute top-2 right-2">
            <DialogClose asChild>
              <CloseButton />
            </DialogClose>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="recherche-globale" className="text-small">
              Mots-clés
            </Label>
            <Input
              id="recherche-globale"
              type="search"
              autoComplete="off"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Ex. : marché pétrolier, CEMAC, startup"
              className="h-11 text-[1.0625rem]"
            />
            <p className="text-small text-muted-foreground" role="status">
              {term.trim().length === 0
                ? "Saisissez un mot-clé pour préparer votre recherche."
                : `Aucun résultat : l'index de recherche n'est pas encore en service.`}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
