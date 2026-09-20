"use client";

import { AuthShell } from "@/components/custom/auth-shell";
import { SignInForm } from "@/components/custom/sign-in-form";
import { usePreferences } from "@/components/providers/preferences-provider";
import { localize } from "@/lib/i18n";

/**
 * Sign-in, as a full page — CDC §4.3, §5.3.
 *
 * The masthead opens the same form in a floating card; this route stays the
 * canonical address. It is what a bookmark, a password manager, a redirect
 * after session expiry and a visitor without JavaScript all land on, so the
 * card can be an enhancement rather than a dependency.
 *
 * The form itself lives in `SignInForm`: one implementation for both entry
 * points, so the error sentence and the two-factor handoff cannot drift.
 */
export default function SignInPage() {
  const { locale } = usePreferences();
  return (
    <AuthShell
      title={localize(locale, { fr: "Connexion", en: "Sign in" })}
      intro={localize(locale, {
        fr: "Espace réservé à la rédaction et aux entreprises partenaires.",
        en: "Reserved for newsroom staff and partner companies.",
      })}
    >
      <SignInForm />
    </AuthShell>
  );
}
