"use client";

import { AuthShell } from "@/components/custom/auth-shell";
import { SignInForm } from "@/components/custom/sign-in-form";

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
  return (
    <AuthShell
      title="Connexion"
      intro="Espace réservé à la rédaction et aux entreprises partenaires."
    >
      <SignInForm />
    </AuthShell>
  );
}
