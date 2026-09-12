"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  KeyRound,
  LogOut,
  MonitorSmartphone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { ActionButton } from "@/components/custom/action-button";
import { OfficeSection } from "@/components/custom/office-header";
import { PasswordChangeForm } from "@/components/custom/password-change-form";
import { SessionsPanel } from "@/components/custom/sessions-panel";
import { TwoFactorPanel } from "@/components/custom/two-factor-panel";
import { authClient } from "@/lib/auth-client";
import type { Viewer } from "@/lib/viewer";

/** Newsroom roles use a six-digit code; company and reader accounts a long password. */
export const passwordModeFor = (viewer: Viewer): "pin" | "password" =>
  viewer.roleSlug === "administrateur" || viewer.roleSlug === "editeur"
    ? "pin"
    : "password";

/**
 * The account screen, as sections — shared by « Mon compte » inside the
 * back office and by `/compte` for the other roles (12/09/2026).
 *
 * Order of appearance is the order of importance: who you are, the access
 * code (highlighted while it is still the provisional one), the optional
 * verification by app folded away, then the devices.
 */
export function AccountPanels({
  viewer,
  showHome = false,
}: {
  viewer: Viewer;
  /** Adds « Aller à mon espace » and « Se déconnecter » (page outside the shell). */
  showHome?: boolean;
}) {
  const router = useRouter();
  const mode = passwordModeFor(viewer);

  const signOut = async () => {
    await authClient.signOut();
    router.replace("/connexion");
  };

  return (
    <div className="grid gap-6">
      <OfficeSection title="Profil" icon={UserRound}>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Row label="Nom" value={viewer.name} />
          <Row label="Adresse" value={viewer.email} />
          <Row label="Rôle" value={viewer.roleName} />
          <Row
            label="Espace"
            value={
              viewer.organizationName ??
              (viewer.permissions.includes("newsroom:access")
                ? "Rédaction"
                : "—")
            }
          />
        </dl>
        {showHome && (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={viewer.home}
              className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground touch-target"
            >
              Aller à mon espace
            </Link>
            <ActionButton
              type="button"
              variant="outline"
              onClick={() => void signOut()}
            >
              <LogOut aria-hidden="true" className="size-4" />
              Se déconnecter
            </ActionButton>
          </div>
        )}
      </OfficeSection>

      <OfficeSection
        id="mot-de-passe"
        icon={KeyRound}
        tone={viewer.passwordChangeRequired ? "warning" : "default"}
        title={
          mode === "pin"
            ? "Changement du code d'accès"
            : "Changement du mot de passe"
        }
        description={
          viewer.passwordChangeRequired
            ? mode === "pin"
              ? "Le code qui vous a été remis est provisoire : choisissez le vôtre. Trois fois six chiffres."
              : "Votre mot de passe est provisoire : choisissez-en un définitif."
            : mode === "pin"
              ? "Six chiffres, connus de vous seul. Le changement déconnecte vos autres appareils."
              : "Douze caractères au minimum. Le changement ferme vos autres sessions."
        }
      >
        <div className="max-w-md">
          <PasswordChangeForm mode={mode} />
        </div>
      </OfficeSection>

      <details className="group rounded-xl border border-border bg-card">
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 px-4 sm:px-6 [&::-webkit-details-marker]:hidden">
          <ShieldCheck
            aria-hidden="true"
            className={
              "size-5 " +
              (viewer.twoFactorEnabled
                ? "text-success-token"
                : "text-muted-foreground")
            }
          />
          <span className="font-display type-h3">
            Vérification par application
          </span>
          <span className="type-small text-muted-foreground">
            {viewer.twoFactorEnabled ? "· active" : "· facultatif"}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="ms-auto size-4 shrink-0 transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="border-t border-border p-4 sm:p-6">
          <TwoFactorPanel enabled={viewer.twoFactorEnabled} />
        </div>
      </details>

      <OfficeSection
        title="Appareils connectés"
        icon={MonitorSmartphone}
        description="Chaque connexion ouvre une session que vous pouvez fermer d'ici."
      >
        <SessionsPanel active />
      </OfficeSection>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="type-small text-muted-foreground">{label}</dt>
      <dd className="type-body font-medium break-words">{value}</dd>
    </div>
  );
}
