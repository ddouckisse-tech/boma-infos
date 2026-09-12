import { JournalChrome } from "@/components/custom/journal-chrome";

/**
 * Layout of the public journal (milestone 2).
 *
 * The route group keeps the URLs unchanged — `/`, `/article/…`, `/rubrique/…`
 * are exactly where they were — while giving the private areas of milestone 3
 * a different shell. Nothing here is a client component, and no Convex
 * browser client is mounted. Campaigns keep editorial prerendering; a fully
 * configured AdSense mode uses dynamic HTML for its CSP nonce.
 */
export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <JournalChrome>{children}</JournalChrome>;
}
