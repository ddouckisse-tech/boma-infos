import { cn } from "@/lib/utils";

/**
 * One figure, named — CDC §3.4 (`StatsTile`).
 *
 * Inter's tabular figures are used on purpose (§3.2): a column of numbers
 * that shifts as the value changes is unreadable at a glance, and this is a
 * business magazine.
 */
export function StatsTile({
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warning" | "danger" | "success";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border bg-card p-4",
        tone === "warning"
          ? "border-warning-token/40"
          : tone === "danger"
            ? "border-destructive/40"
            : tone === "success"
              ? "border-success-token/40"
              : "border-border",
        className
      )}
    >
      <p className="type-small text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-serif type-h2 tabular-nums",
          tone === "warning"
            ? "text-warning-token"
            : tone === "danger"
              ? "text-destructive"
              : tone === "success"
                ? "text-success-token"
                : "text-foreground"
        )}
      >
        {value}
      </p>
      {hint && (
        <p className="mt-1 type-small text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
