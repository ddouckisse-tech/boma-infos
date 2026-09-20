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
import { usePreferences } from "@/components/providers/preferences-provider";
import { authClient } from "@/lib/auth-client";
import { localize } from "@/lib/i18n";
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
  const { locale } = usePreferences();
  const mode = passwordModeFor(viewer);
  const roleName =
    locale === "en"
      ? ((
          {
            administrateur: "Administrator",
            editeur: "Editor",
            entreprise: "Company",
            lecteur: "Reader",
          } as Record<string, string>
        )[viewer.roleSlug] ?? viewer.roleName)
      : viewer.roleName;

  const signOut = async () => {
    await authClient.signOut();
    router.replace("/connexion");
  };

  return (
    <div className="grid gap-6">
      <OfficeSection
        title={localize(locale, { fr: "Profil", en: "Profile" })}
        icon={UserRound}
      >
        <dl className="grid gap-3 sm:grid-cols-2">
          <Row
            label={localize(locale, { fr: "Nom", en: "Name" })}
            value={viewer.name}
          />
          <Row
            label={localize(locale, { fr: "Adresse", en: "Email address" })}
            value={viewer.email}
          />
          <Row
            label={localize(locale, { fr: "Rôle", en: "Role" })}
            value={roleName}
          />
          <Row
            label={localize(locale, { fr: "Espace", en: "Space" })}
            value={
              viewer.organizationName ??
              (viewer.permissions.includes("newsroom:access")
                ? localize(locale, { fr: "Rédaction", en: "Newsroom" })
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
              {localize(locale, {
                fr: "Aller à mon espace",
                en: "Go to my space",
              })}
            </Link>
            <ActionButton
              type="button"
              variant="outline"
              onClick={() => void signOut()}
            >
              <LogOut aria-hidden="true" className="size-4" />
              {localize(locale, { fr: "Se déconnecter", en: "Sign out" })}
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
            ? localize(locale, {
                fr: "Changement du code d'accès",
                en: "Change access code",
              })
            : localize(locale, {
                fr: "Changement du mot de passe",
                en: "Change password",
              })
        }
        description={
          viewer.passwordChangeRequired
            ? mode === "pin"
              ? localize(locale, {
                  fr: "Le code qui vous a été remis est provisoire : choisissez le vôtre. Trois fois six chiffres.",
                  en: "The code you received is temporary: choose your own. Enter six digits three times.",
                })
              : localize(locale, {
                  fr: "Votre mot de passe est provisoire : choisissez-en un définitif.",
                  en: "Your password is temporary: choose a permanent one.",
                })
            : mode === "pin"
              ? localize(locale, {
                  fr: "Six chiffres, connus de vous seul. Le changement déconnecte vos autres appareils.",
                  en: "Six digits known only to you. Changing it signs out your other devices.",
                })
              : localize(locale, {
                  fr: "Douze caractères au minimum. Le changement ferme vos autres sessions.",
                  en: "At least twelve characters. Changing it closes your other sessions.",
                })
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
            {localize(locale, {
              fr: "Vérification par application",
              en: "App-based verification",
            })}
          </span>
          <span className="type-small text-muted-foreground">
            {viewer.twoFactorEnabled
              ? localize(locale, { fr: "· active", en: "· active" })
              : localize(locale, { fr: "· facultatif", en: "· optional" })}
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
        title={localize(locale, {
          fr: "Appareils connectés",
          en: "Signed-in devices",
        })}
        icon={MonitorSmartphone}
        description={localize(locale, {
          fr: "Chaque connexion ouvre une session que vous pouvez fermer d'ici.",
          en: "Each sign-in opens a session that you can close here.",
        })}
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
