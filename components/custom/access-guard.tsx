"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { Lock } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { usePreferences } from "@/components/providers/preferences-provider";
import { localize } from "@/lib/i18n";
import { ACCESS_MESSAGE } from "@/lib/private";

/**
 * Client-side gate of a private area.
 *
 * **This is not the security boundary.** Every Convex function checks the
 * same permission on the server (`convex/model/access.ts`), which is what
 * actually stops an Éditeur from touching the settings or one company from
 * reading another's deposits. What this component does is spare people a
 * screen full of red errors: it shows a sentence, and sends someone who is
 * not signed in to the sign-in form.
 *
 * The `AuthLoading` / `Unauthenticated` / `Authenticated` triplet matters
 * more than it looks. Without it, the page's queries fire during the split
 * second before the session token reaches the Convex client — the server
 * refuses them, correctly, and the reader sees a flash of "accès refusé"
 * on a page they are perfectly entitled to. Children are mounted only once
 * the connection is authenticated.
 */
export function AccessGuard({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const { locale } = usePreferences();
  return (
    <>
      <AuthLoading>
        <p className="type-body text-muted-foreground" role="status">
          {localize(locale, { fr: "Chargement…", en: "Loading…" })}
        </p>
      </AuthLoading>
      <Unauthenticated>
        <SignInRedirect />
      </Unauthenticated>
      <Authenticated>
        <PermissionGate permission={permission}>{children}</PermissionGate>
      </Authenticated>
    </>
  );
}

function SignInRedirect() {
  const router = useRouter();
  const { locale } = usePreferences();
  useEffect(() => {
    router.replace("/connexion");
  }, [router]);
  return (
    <p className="type-body text-muted-foreground" role="status">
      {localize(locale, {
        fr: "Redirection vers la connexion…",
        en: "Redirecting to sign in…",
      })}
    </p>
  );
}

function PermissionGate({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const viewer = useQuery(api.accounts.me, {});
  const { locale } = usePreferences();

  if (viewer === undefined) {
    return (
      <p className="type-body text-muted-foreground" role="status">
        {localize(locale, { fr: "Chargement…", en: "Loading…" })}
      </p>
    );
  }

  if (viewer === null) {
    return (
      <Refusal
        title={localize(locale, {
          fr: "Compte incomplet",
          en: "Incomplete account",
        })}
        message={localize(locale, {
          fr: ACCESS_MESSAGE.NO_PROFILE,
          en: "This account is not linked to a profile. Contact the newsroom.",
        })}
        href="/"
        cta={localize(locale, {
          fr: "Retour au journal",
          en: "Back to the newspaper",
        })}
      />
    );
  }

  // Ni le code provisoire ni l'absence de second facteur ne ferment plus la
  // porte (12/09/2026) : la carte flottante de l'espace s'en charge, sans
  // bloquer — et le serveur ne refuse plus non plus.
  if (!(viewer.permissions as readonly string[]).includes(permission)) {
    return (
      <Refusal
        title={localize(locale, { fr: "Accès refusé", en: "Access denied" })}
        message={localize(locale, {
          fr: `${ACCESS_MESSAGE.FORBIDDEN} Votre rôle est « ${viewer.roleName} ».`,
          en: `You do not have access to this item. Your role is “${({ administrateur: "Administrator", editeur: "Editor", entreprise: "Company", lecteur: "Reader" } as Record<string, string>)[viewer.roleSlug] ?? viewer.roleName}”.`,
        })}
        href={viewer.home}
        cta={localize(locale, {
          fr: "Aller à mon espace",
          en: "Go to my space",
        })}
      />
    );
  }

  return <>{children}</>;
}

function Refusal({
  title,
  message,
  href,
  cta,
}: {
  title: string;
  message: string;
  href: string;
  cta: string;
}) {
  return (
    <div
      role="status"
      className="rounded-lg border border-l-2 border-border border-l-warning-token bg-card p-6"
    >
      <h2 className="flex items-center gap-2 font-display type-h3">
        <Lock aria-hidden="true" className="size-5 text-warning-token" />
        {title}
      </h2>
      <p className="mt-2 type-body text-muted-foreground">{message}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground touch-target"
      >
        {cta}
      </Link>
    </div>
  );
}
