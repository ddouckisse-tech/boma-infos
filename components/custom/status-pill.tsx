import { cn } from "@/lib/utils";
import {
  STATUS_LABEL,
  STATUS_TONE,
  type WorkflowStatus,
} from "@/lib/private";

const TONE_CLASS = {
  neutral: "border-border bg-surface-muted text-muted-foreground",
  info: "border-info-token/40 bg-info-token/10 text-info-token",
  warning: "border-warning-token/40 bg-warning-token/10 text-warning-token",
  success: "border-success-token/40 bg-success-token/10 text-success-token",
  danger: "border-destructive/40 bg-destructive/10 text-destructive",
} as const;

/**
 * Workflow state — CDC §3.4 (`StatusPill`), §4.4.
 *
 * Colour is a second channel, never the only one: the label spells the
 * state out, so the pill still reads on a monochrome screen and to someone
 * who does not distinguish the tints (§3.5).
 */
export function StatusPill({
  status,
  className,
}: {
  status: WorkflowStatus | string;
  className?: string;
}) {
  const known = (status in STATUS_LABEL ? status : "draft") as WorkflowStatus;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs border px-2 py-0.5 type-small font-semibold whitespace-nowrap",
        TONE_CLASS[STATUS_TONE[known]],
        className
      )}
    >
      {STATUS_LABEL[known]}
    </span>
  );
}
