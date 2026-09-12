import { cn } from "@/lib/utils";

export type DataColumn<Row> = {
  key: string;
  header: React.ReactNode;
  cell: (row: Row) => React.ReactNode;
  /** The column that names the row: the card's title on a phone. */
  primary?: boolean;
  /** Not worth a line on a phone (a secondary date, a raw slug…). */
  hideOnMobile?: boolean;
  className?: string;
  align?: "start" | "end";
};

/**
 * One list, two renderings — CDC §3.3 (responsive), §3.5 (touch).
 *
 * A table is the right reading of a list on a desk and the wrong one on a
 * phone, where eight columns become a horizontal scroll nobody finishes.
 * From `md` up this renders a real `<table>` (semantics, column headers,
 * keyboard); below, each row becomes a card: the primary cell as its title,
 * the other cells as labelled lines, the actions at the bottom. Both are
 * rendered and one is hidden by CSS — a back-office list is short enough for
 * that to cost nothing measurable.
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  caption,
  empty = "Aucun élément.",
  minWidth = "48rem",
  actions,
  selection,
  rowClassName,
  className,
}: {
  columns: readonly DataColumn<Row>[];
  rows: readonly Row[];
  rowKey: (row: Row) => string;
  /** Screen-reader caption of the table. */
  caption: string;
  empty?: React.ReactNode;
  /** Table width below which the desk rendering scrolls horizontally. */
  minWidth?: string;
  /** Row actions: last column on a desk, footer of the card on a phone. */
  actions?: (row: Row) => React.ReactNode;
  selection?: {
    selected: readonly string[];
    onToggle: (key: string) => void;
    label: (row: Row) => string;
  };
  /** Extra classes for one row — to mark the one that is open, for instance. */
  rowClassName?: (row: Row) => string | undefined;
  className?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-strong p-6 text-center type-small text-muted-foreground">
        {empty}
      </p>
    );
  }

  const primary = columns.find((column) => column.primary) ?? columns[0];
  const secondary = columns.filter(
    (column) => column !== primary && !column.hideOnMobile
  );

  return (
    <div className={className}>
      {/* Desk: the table. */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card md:block">
        <table className="w-full border-collapse" style={{ minWidth }}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border bg-surface-subtle">
              {selection && (
                <th scope="col" className="w-10 p-3">
                  <span className="sr-only">Sélection</span>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "p-3 type-small font-semibold text-muted-foreground",
                    column.align === "end" ? "text-end" : "text-start",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th scope="col" className="p-3 text-end">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const key = rowKey(row);
              return (
                <tr
                  key={key}
                  className={cn(
                    "border-b border-border align-top last:border-0 hover:bg-surface-subtle",
                    rowClassName?.(row)
                  )}
                >
                  {selection && (
                    <td className="p-3">
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={selection.selected.includes(key)}
                        onChange={() => selection.onToggle(key)}
                        aria-label={selection.label(row)}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "p-3 type-small",
                        column.align === "end" ? "text-end" : "text-start",
                        column.className
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                  {actions && (
                    <td className="p-3 text-end">
                      <div className="flex flex-wrap justify-end gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Phone: one card per row. */}
      <ul className="grid gap-3 md:hidden" aria-label={caption}>
        {rows.map((row) => {
          const key = rowKey(row);
          return (
            <li
              key={key}
              className={cn(
                "rounded-xl border border-border bg-card p-4",
                rowClassName?.(row)
              )}
            >
              <div className="flex items-start gap-3">
                {selection && (
                  <input
                    type="checkbox"
                    className="mt-1 size-5 shrink-0"
                    checked={selection.selected.includes(key)}
                    onChange={() => selection.onToggle(key)}
                    aria-label={selection.label(row)}
                  />
                )}
                <div className="min-w-0 flex-1 type-body font-medium">
                  {primary.cell(row)}
                </div>
              </div>
              {secondary.length > 0 && (
                <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 type-small">
                  {secondary.map((column) => (
                    <div key={column.key} className="contents">
                      <dt className="text-muted-foreground">{column.header}</dt>
                      <dd className="min-w-0">{column.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {actions && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                  {actions(row)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
