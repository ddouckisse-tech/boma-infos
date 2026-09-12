import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionButtonProps = React.ComponentProps<typeof Button> & {
  /** `icon` renders a 44 × 44 square; the label must then move to aria-label. */
  shape?: "text" | "icon";
};

/**
 * House button.
 *
 * `components/ui/button.tsx` ships 32–36 px tall controls; CDC §3.5 requires
 * touch targets of at least 44 × 44 px. Rather than editing the shadcn
 * primitive (which is never modified), this composition raises the height and
 * the label size and keeps every variant available.
 */
export function ActionButton({
  className,
  shape = "text",
  size,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      size={size ?? (shape === "icon" ? "icon-lg" : "lg")}
      className={cn(
        "rounded-md type-small font-semibold touch-target",
        shape === "text" ? "px-4" : "p-0",
        className
      )}
      {...props}
    />
  );
}
