import { cn } from "@/lib/utils";

type ContainerProps = React.ComponentProps<"div"> & {
  /** `page` = 1280 px (CDC §3.3), `reading` = 68ch reading column (CDC §3.2). */
  width?: "page" | "reading" | "wide";
  as?: "div" | "section" | "header" | "footer" | "nav" | "main" | "article";
};

const widthClass = {
  page: "max-w-page",
  wide: "max-w-[1536px]",
  reading: "max-w-reading",
} as const;

/**
 * Horizontal layout shell: caps the measure and holds the gutters.
 * Gutters grow 16 → 24 → 32 px, so nothing ever touches the screen edge.
 */
export function Container({
  className,
  width = "page",
  as: Tag = "div",
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-4 md:px-6 lg:px-8",
        widthClass[width],
        className
      )}
      {...props}
    />
  );
}
