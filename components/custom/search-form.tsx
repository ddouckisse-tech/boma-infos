import { Search } from "lucide-react";
import { LocalizedText } from "@/components/custom/localized-text";

/**
 * The classes shadcn's `Label` and `Input` produced here once merged with
 * this form's overrides — computed with the `cn` engine, frozen on native
 * elements. The form is rendered by the root `not-found` boundary, which
 * accompanies every page: through shadcn's `Label` (a client component) it
 * made every reader download Radix and the class-merge engine (§5.4).
 */
const FIELD_LABEL =
  "flex items-center gap-2 text-sm leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 type-small font-medium";
const FIELD_INPUT =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-11 min-w-0 flex-1 type-body";

/**
 * The search field of `/recherche`.
 *
 * A plain `GET` form, no client component, no JavaScript: submitting it
 * navigates to `/recherche?q=…`, which is the shareable URL of the result
 * set. It is also the fallback the `Cmd+K` dialog degrades to when scripts
 * are unavailable (CDC §5.5).
 */
export function SearchForm({ defaultValue }: { defaultValue?: string }) {
  return (
    <>
      <div lang="fr" className="lc-fr">
        <SearchFormFields
          id="recherche-fr"
          defaultValue={defaultValue}
          placeholder="Ex. : manganèse, CEMAC, contenu local…"
        />
      </div>
      <div lang="en" className="lc-en">
        <SearchFormFields
          id="recherche-en"
          defaultValue={defaultValue}
          placeholder="E.g. manganese, CEMAC, local content…"
        />
      </div>
    </>
  );
}

function SearchFormFields({
  id,
  defaultValue,
  placeholder,
}: {
  id: string;
  defaultValue?: string;
  placeholder: string;
}) {
  return (
    <form method="get" action="/recherche" role="search" className="grid gap-2">
      <label htmlFor={id} data-slot="label" className={FIELD_LABEL}>
        <LocalizedText fr="Mots-clés" en="Keywords" />
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          data-slot="input"
          id={id}
          type="search"
          name="q"
          defaultValue={defaultValue}
          autoComplete="off"
          placeholder={placeholder}
          className={FIELD_INPUT}
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
        >
          <Search aria-hidden="true" className="size-4" />
          <LocalizedText fr="Rechercher" en="Search" />
        </button>
      </div>
    </form>
  );
}
