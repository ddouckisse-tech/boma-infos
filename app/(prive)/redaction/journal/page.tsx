"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Filter, ScrollText } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { SelectField } from "@/components/custom/form-field";
import { AUDIT_LABEL, formatDateTime } from "@/lib/private";
import { cn } from "@/lib/utils";

/** Les trois familles d'actions que le CDC nomme explicitement (§4.3, §5.3). */
const HIGHLIGHT_PREFIXES = [
  "organization.",
  "user.role_change",
  "article.publish",
];

function isHighlighted(action: string): boolean {
  return HIGHLIGHT_PREFIXES.some((prefix) => action.startsWith(prefix));
}

/**
 * Journal d'audit — CDC §4.3, §5.3.
 *
 * `convex/audit.ts` n'exporte qu'un `query` de lecture : le journal est en
 * ajout seul, aucune fonction du serveur ne modifie ni ne supprime une ligne
 * une fois écrite.
 */
export default function JournalAuditPage() {
  const [action, setAction] = useState("");
  const actions = useQuery(api.audit.actions, {});
  const rows = useQuery(api.audit.list, {
    action: action || undefined,
    limit: 200,
  });

  const options = [
    { value: "", label: "Toutes les actions" },
    ...(actions ?? []).map((code) => ({
      value: code,
      label: AUDIT_LABEL[code] ?? code,
    })),
  ];

  return (
    <>
      <h1 className="flex items-center gap-2 font-serif type-h1">
        <ScrollText aria-hidden="true" className="size-6" />
        Journal d&apos;audit
      </h1>
      <p className="mt-2 max-w-reading type-body text-muted-foreground">
        Ce journal est en ajout seul : aucune fonction du serveur ne modifie ni
        ne supprime une ligne une fois écrite.
      </p>

      <div className="mt-6 flex max-w-sm items-end gap-2">
        <Filter
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground"
        />
        <SelectField
          label="Filtrer par action"
          value={action}
          onChange={(event) => setAction(event.target.value)}
          options={options}
          className="flex-1"
        />
      </div>

      {rows === undefined ? (
        <p className="mt-6 type-body text-muted-foreground">
          Chargement du journal…
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-6 rounded-md border border-border bg-card p-6 type-body text-muted-foreground">
          Aucune action enregistrée pour ce filtre.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <caption className="sr-only">Journal d&apos;audit horodaté</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-4 type-small font-semibold">
                  Date
                </th>
                <th scope="col" className="py-2 pr-4 type-small font-semibold">
                  Action
                </th>
                <th scope="col" className="py-2 pr-4 type-small font-semibold">
                  Auteur
                </th>
                <th scope="col" className="py-2 pr-4 type-small font-semibold">
                  Cible
                </th>
                <th scope="col" className="py-2 type-small font-semibold">
                  Détail
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row._id}
                  className={cn(
                    "border-b border-l-2 border-border align-top",
                    isHighlighted(row.action)
                      ? "border-l-brand-magenta"
                      : "border-l-transparent"
                  )}
                >
                  <td className="py-3 pr-4 type-small whitespace-nowrap text-muted-foreground">
                    {formatDateTime(row.at)}
                  </td>
                  <td className="py-3 pr-4 type-small font-medium">
                    {AUDIT_LABEL[row.action] ?? row.action}
                  </td>
                  <td className="py-3 pr-4 type-small">
                    <p className="font-medium">{row.actorName}</p>
                    <p className="type-small text-muted-foreground">
                      {row.actorRole}
                    </p>
                  </td>
                  <td className="py-3 pr-4 type-small text-muted-foreground">
                    {row.targetType}
                  </td>
                  <td className="py-3 type-small text-muted-foreground">
                    {row.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
