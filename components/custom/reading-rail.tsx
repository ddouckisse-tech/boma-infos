import "./reading-rail.css";

/** Keep the whole rail reachable: sticky only if it fits below the masthead. */
export function ReadingRail({ children }: { children: React.ReactNode }) {
  return (
    <aside
      aria-label="Suggestions"
      className="lc-reading-rail min-w-0 self-start"
      data-reading-rail
    >
      {children}
    </aside>
  );
}
