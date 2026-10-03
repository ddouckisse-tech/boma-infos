"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { ScrollText } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { DataTable, type DataColumn } from "@/components/custom/data-table";
import { SelectField } from "@/components/custom/form-field";
import { OfficeHeader } from "@/components/custom/office-header";
import { AUDIT_LABEL, formatDateTime } from "@/lib/private";

/** Les trois familles d'actions que le CDC nomme explicitement (§4.3, §5.3). */
const HIGHLIGHT_PREFIXES = [
  "organization.",
  "user.role_change",
  "article.publish",
];

function isHighlighted(action: string): boolean {
  return HIGHLIGHT_PREFIXES.some((prefix) => action.startsWith(prefix));
}

type Row = NonNullable<
  ReturnType<typeof useQuery<typeof api.audit.list>>
>[number];

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

  const columns: DataColumn<Row>[] = [
    {
      key: "date",
      header: "Date",
      className: "whitespace-nowrap",
      cell: (row) => (
        <span className="text-muted-foreground">{formatDateTime(row.at)}</span>
      ),
    },
    {
      key: "action",
      header: "Action",
      primary: true,
      cell: (row) => (
        <span className="inline-flex items-center gap-2">
          {isHighlighted(row.action) && (
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-brand-gold"
            />
          )}
          <span className="font-medium">
            {AUDIT_LABEL[row.action] ?? row.action}
          </span>
        </span>
      ),
    },
    {
      key: "actor",
      header: "Auteur",
      cell: (row) => (
        <>
          <p className="font-medium">{row.actorName}</p>
          <p className="type-small text-muted-foreground">{row.actorRole}</p>
        </>
      ),
    },
    {
      key: "target",
      header: "Cible",
      cell: (row) => (
        <span className="text-muted-foreground">{row.targetType}</span>
      ),
    },
    {
      key: "detail",
      header: "Détail",
      cell: (row) => (
        <span className="text-muted-foreground">{row.summary}</span>
      ),
    },
  ];

  return (
    <>
      <OfficeHeader
        icon={ScrollText}
        title="Journal d'audit"
        description="Ce journal est en ajout seul : aucune fonction du serveur ne modifie ni ne supprime une ligne une fois écrite."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SelectField
          label="Filtrer par action"
          value={action}
          onChange={(event) => setAction(event.target.value)}
          options={options}
        />
      </div>

      <div className="mt-6">
        {rows === undefined ? (
          <p className="type-body text-muted-foreground">
            Chargement du journal…
          </p>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row._id}
            caption="Journal d'audit horodaté"
            empty="Aucune action enregistrée pour ce filtre."
            minWidth="52rem"
          />
        )}
      </div>
    </>
  );
}
