"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { UserRound } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { AccountPanels } from "@/components/custom/account-panels";
import { OfficeHeader } from "@/components/custom/office-header";

/**
 * « Mon compte », inside the back office (12/09/2026) — the same panels as
 * `/compte`, reached from the navigation card without leaving the shell.
 * This is where an Éditeur, who has no « Réglages », changes their access
 * code.
 */
export default function NewsroomAccountPage() {
  const { isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.accounts.me, isAuthenticated ? {} : "skip");

  return (
    <>
      <OfficeHeader
        icon={UserRound}
        title="Mon compte"
        description="Votre profil, votre code d'accès et vos appareils connectés."
      />
      {viewer ? (
        <AccountPanels viewer={viewer} />
      ) : (
        <p className="type-body text-muted-foreground" role="status">
          Chargement du compte…
        </p>
      )}
    </>
  );
}
