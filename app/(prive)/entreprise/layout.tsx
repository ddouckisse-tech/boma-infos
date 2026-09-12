import { AccessGuard } from "@/components/custom/access-guard";
import { PrivateShell } from "@/components/custom/private-shell";

/**
 * Company portal — CDC §4.4.
 *
 * A company only ever sees its own space. The scope is resolved server-side
 * from the session (`requireOrganizationScope`), never from anything this
 * layout passes down.
 */
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateShell area="portal">
      <AccessGuard permission="portal:access">{children}</AccessGuard>
    </PrivateShell>
  );
}
