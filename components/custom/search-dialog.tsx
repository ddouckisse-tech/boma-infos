"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { CloseButton } from "@/components/custom/close-button";
import { Modal } from "@/components/custom/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Hit = {
  slug: string;
  title: string;
  categoryName: string;
  readingMinutes: number;
};

/**
 * Search, from anywhere (`Cmd+K` / `Ctrl+K`).
 *
 * Three deliberate choices:
 *
 *  - the trigger is a **link to `/recherche`**, upgraded to a dialog only
 *    once the script has run. Without JavaScript, on an old Safari with no
 *    `showModal`, or while the page is still hydrating, clicking it lands on
 *    the real search page (CDC §5.5 — the journal degrades, it does not
 *    break);
 *  - results come from `/api/recherche`, which runs the Convex full-text
 *    query server-side, so no database client ships to the browser;
 *  - the box is a native `<dialog>`, not a Radix primitive: same modality,
 *    same focus trap, none of the JavaScript (§5.4).
 *
 * Typing is debounced at 250 ms and every request is abortable, so a reader
 * on a slow link never queues eight round trips while typing one word.
 */
export function SearchDialog({ className }: { className?: string }) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const abort = useRef<AbortController | null>(null);
  const field = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // `key` peut manquer sur un événement synthétique (gestionnaire de mots
      // de passe, automatisation) : on ne plante pas le journal pour autant.
      if (
        event.key?.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Le focus n'est pas donné par `<dialog>` à un champ précis : on le pose.
  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  useEffect(() => {
    const value = term.trim();
    if (value.length < 2) {
      abort.current?.abort();
      return;
    }

    const timer = window.setTimeout(async () => {
      abort.current?.abort();
      const controller = new AbortController();
      abort.current = controller;
      try {
        const response = await fetch(
          `/api/recherche?q=${encodeURIComponent(value)}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error(String(response.status));
        const payload = (await response.json()) as { results: Hit[] };
        setHits(payload.results);
        setState("done");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setHits([]);
        setState("error");
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [term]);

  const statusId = `${inputId}-etat`;
  const resultsHref = `/recherche${term.trim() ? `?q=${encodeURIComponent(term.trim())}` : ""}`;

  return (
    <>
      <Link
        href="/recherche"
        onClick={(event) => {
          // Clic modifié (nouvel onglet) : on laisse le navigateur faire.
          if (event.metaKey || event.ctrlKey || event.shiftKey) return;
          event.preventDefault();
          setOpen(true);
        }}
        className={cn(
          "inline-flex items-center gap-2 rounded-md border border-border px-3 text-muted-foreground transition-colors touch-target hover:border-border-strong hover:text-foreground",
          className
        )}
      >
        <Search aria-hidden="true" className="size-4 shrink-0" />
        <span className="hidden type-small lg:inline">Rechercher</span>
        <kbd className="ml-1 hidden rounded-xs border border-border px-1.5 py-0.5 text-[0.75rem] text-muted-foreground lg:inline">
          ⌘ K
        </kbd>
        <span className="sr-only lg:hidden">Rechercher sur le site</span>
      </Link>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label="Rechercher un article"
        variant="panel"
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display type-h3">Rechercher</p>
              <p className="type-small text-muted-foreground">
                Titres, chapôs et corps des articles publiés.
              </p>
            </div>
            <CloseButton onClick={() => setOpen(false)} />
          </div>

          <form method="get" action="/recherche" className="mt-4 grid gap-2">
            <Label htmlFor={inputId} className="type-small">
              Mots-clés
            </Label>
            <Input
              ref={field}
              id={inputId}
              name="q"
              type="search"
              autoComplete="off"
              value={term}
              onChange={(event) => {
                const value = event.target.value;
                setTerm(value);
                // L'état est décidé ici, à la frappe : le fixer dans l'effet
                // déclencherait un rendu en cascade (règle React 19).
                if (value.trim().length < 2) {
                  setHits([]);
                  setState("idle");
                } else {
                  setState("loading");
                }
              }}
              placeholder="Ex. : manganèse, CEMAC, contenu local…"
              aria-describedby={statusId}
              className="h-11 type-body"
            />
          </form>

          <p
            id={statusId}
            role="status"
            className="mt-2 type-small text-muted-foreground"
          >
            {state === "idle" && "Saisissez au moins deux caractères."}
            {state === "loading" && "Recherche en cours…"}
            {state === "error" &&
              "La recherche est momentanément indisponible."}
            {state === "done" &&
              (hits.length === 0
                ? `Aucun article ne correspond à « ${term.trim()} ».`
                : `${hits.length} article${hits.length > 1 ? "s" : ""} trouvé${hits.length > 1 ? "s" : ""}.`)}
          </p>

          {hits.length > 0 && (
            <ul className="-mx-2 mt-2 max-h-[45vh] overflow-y-auto overscroll-contain">
              {hits.map((hit) => (
                <li key={hit.slug}>
                  <Link
                    href={`/article/${hit.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex min-h-11 flex-col justify-center rounded-md px-2 py-2 hover:bg-surface-muted"
                  >
                    <span className="type-small font-semibold text-foreground">
                      {hit.title}
                    </span>
                    <span className="type-small text-muted-foreground">
                      {hit.categoryName} · {hit.readingMinutes} min
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {term.trim().length >= 2 && (
            <Link
              href={resultsHref}
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center justify-center rounded-md border border-border px-4 type-small font-semibold transition-colors touch-target hover:bg-surface-muted"
            >
              Voir tous les résultats
            </Link>
          )}
        </div>
      </Modal>
    </>
  );
}
