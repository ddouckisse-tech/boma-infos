/** Tiny fixed controls keep advertising independent of the journal's UI bundle. */
export function AdControlIcon({ kind }: { kind: "close" | "pause" | "play" }) {
  const size = kind === "close" ? 16 : 14;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "close" ? (
        <path d="M18 6 6 18M6 6l12 12" />
      ) : kind === "pause" ? (
        <>
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </>
      ) : (
        <path d="m6 3 14 9-14 9V3Z" />
      )}
    </svg>
  );
}
