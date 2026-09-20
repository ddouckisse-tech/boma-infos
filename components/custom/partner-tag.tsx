import { Megaphone } from "lucide-react";
import { LocalizedText } from "@/components/custom/localized-text";
import { cn } from "@/lib/utils";

/**
 * « Communiqué / Contenu partenaire ».
 *
 * CDC §4.4 makes this mention mandatory, visible and impossible to bypass on
 * any commercial content. It is therefore not a discreet grey label: a warning
 * tint, a border and an icon, repeated wherever the article appears — list,
 * card and article page alike.
 */
export function PartnerTag({
  size = "default",
  className,
}: {
  size?: "default" | "small";
  className?: string;
}) {
  return (
    <span
      className={cn(
        // Jetons sémantiques (et non `--color-warning` brut) : l'ambre clair
        // #B45309 est illisible en thème sombre, où le jeton passe à #F0A742.
        // Mesuré : 4,61:1 sur le fond teinté en clair, 7,8:1 en sombre.
        "inline-flex items-center gap-1.5 rounded-xs border border-warning-token/40 bg-warning-token/10 font-semibold tracking-wide text-warning-token uppercase",
        size === "small" ? "px-1.5 py-0.5 type-small" : "px-2 py-1 type-small",
        className
      )}
    >
      <Megaphone
        aria-hidden="true"
        className={size === "small" ? "size-3" : "size-3.5"}
      />
      <LocalizedText fr="Contenu partenaire" en="Partner content" />
    </span>
  );
}
