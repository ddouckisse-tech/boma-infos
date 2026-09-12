import { AccessGuard } from "@/components/custom/access-guard";
import { PrivateShell } from "@/components/custom/private-shell";

/**
 * Newsroom back office — CDC §4.4.
 *
 * The shell filters the navigation by permission; `AccessGuard` explains a
 * refusal instead of showing a broken page. Neither is the control: every
 * Convex function under `convex/newsroom.ts`, `convex/taxonomy.ts`,
 * `convex/settings.ts` and the rest re-checks the same permission on the
 * server, so the CLI has no more access than the browser.
 */
export default function NewsroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateShell area="newsroom">
      <AccessGuard permission="newsroom:access">{children}</AccessGuard>
    </PrivateShell>
  );
}
