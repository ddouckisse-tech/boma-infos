import { Search } from "lucide-react";
import { LocalizedText } from "@/components/custom/localized-text";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <Label htmlFor={id} className="type-small font-medium">
        <LocalizedText fr="Mots-clés" en="Keywords" />
      </Label>
      <div className="flex flex-wrap gap-2">
        <Input
          id={id}
          type="search"
          name="q"
          defaultValue={defaultValue}
          autoComplete="off"
          placeholder={placeholder}
          className="h-11 min-w-0 flex-1 type-body"
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
