"use client";

import { Database } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/components/providers/convex-provider";
import { cn } from "@/lib/utils";

/**
 * Live proof that the browser is talking to the Convex deployment.
 *
 * Milestone 1 has no data model, so this reactive query is the only way to
 * show — rather than claim — that the connection works.
 */
export function ConvexStatus({ className }: { className?: string }) {
  if (!isConvexConfigured) {
    return (
      <StatusLine className={className} tone="muted">
        Convex non configuré (NEXT_PUBLIC_CONVEX_URL absent)
      </StatusLine>
    );
  }
  return <ConnectedStatus className={className} />;
}

function ConnectedStatus({ className }: { className?: string }) {
  const health = useQuery(api.health.status);

  if (health === undefined) {
    return (
      <StatusLine className={className} tone="muted">
        Connexion à Convex…
      </StatusLine>
    );
  }

  return (
    <StatusLine className={className} tone="ok">
      Convex connecté
    </StatusLine>
  );
}

function StatusLine({
  children,
  className,
  tone,
}: {
  children: React.ReactNode;
  className?: string;
  tone: "ok" | "muted";
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 text-small",
        tone === "ok" ? "text-[var(--success)]" : "text-muted-foreground",
        className
      )}
    >
      <Database aria-hidden="true" className="size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
