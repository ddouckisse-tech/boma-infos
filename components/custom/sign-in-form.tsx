"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { ActionButton } from "@/components/custom/action-button";
import { FormError } from "@/components/custom/auth-shell";
import { TextField } from "@/components/custom/form-field";
import { usePreferences } from "@/components/providers/preferences-provider";
import { authClient } from "@/lib/auth-client";
import { localize } from "@/lib/i18n";

/**
 * Sign-in form — CDC §4.3, §5.3.
 *
 * Extracted from the page so the very same form serves the full-page route
 * and the floating card opened from the masthead. One implementation, one
 * behaviour: the error sentence, the timing and the two-factor handoff
 * cannot drift between the two entry points.
 *
 * One error sentence, always the same: "identifiants incorrects". Whether
 * the address is unknown or the password is wrong, the form says exactly the
 * same thing. The legacy site published its `admin` account through
 * `/wp-json/wp/v2/users`; this form is not going to hand back what that fix
 * removed.
 *
 * When the account carries a second factor, Better Auth does **not** open a
 * session here: it hands back a challenge and the browser goes to
 * `/connexion/verification` — a full page even from the card, because the
 * challenge is a step of its own, not a detail of the box it started in.
 */
export function SignInForm({
  onSwitchToRegister,
  variant = "default",
}: {
  /** In the floating card, swaps to registration instead of navigating. */
  onSwitchToRegister?: () => void;
  /** `admin` lands on the newsroom after sign-in and drops the company line. */
  variant?: "default" | "admin";
}) {
  const router = useRouter();
  const { locale } = usePreferences();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });
      if (result.error) {
        // Message indifférencié, quel que soit le code renvoyé.
        setError(
          localize(locale, {
            fr: "Identifiants incorrects.",
            en: "Incorrect sign-in details.",
          })
        );
        setPending(false);
        return;
      }
      const data = result.data as { twoFactorRedirect?: boolean } | null;
      if (data?.twoFactorRedirect) {
        router.push("/connexion/verification");
        return;
      }
      router.push(variant === "admin" ? "/redaction" : "/compte");
      router.refresh();
    } catch {
      setError(
        localize(locale, {
          fr: "Identifiants incorrects.",
          en: "Incorrect sign-in details.",
        })
      );
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-5">
      <FormError>{error}</FormError>

      <TextField
        label={localize(locale, {
          fr: "Adresse électronique",
          en: "Email address",
        })}
        type="email"
        name="email"
        inputMode="email"
        autoComplete="username"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <TextField
        label={localize(locale, { fr: "Mot de passe", en: "Password" })}
        type="password"
        name="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <ActionButton type="submit" disabled={pending} className="w-full">
        <LogIn aria-hidden="true" className="size-4" />
        {pending
          ? localize(locale, { fr: "Vérification…", en: "Signing in…" })
          : localize(locale, { fr: "Se connecter", en: "Sign in" })}
      </ActionButton>

      <p className="type-small">
        <Link
          href="/mot-de-passe-oublie"
          className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {localize(locale, {
            fr: "Mot de passe oublié",
            en: "Forgotten password",
          })}
        </Link>
      </p>

      {variant !== "admin" && (
        <p className="type-small text-muted-foreground">
          {localize(locale, {
            fr: "Votre entreprise n’a pas encore d’espace ? ",
            en: "Does your company need an account? ",
          })}
          {onSwitchToRegister ? (
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-accent underline underline-offset-2"
            >
              {localize(locale, {
                fr: "Demander l’ouverture d’un compte",
                en: "Request an account",
              })}
            </button>
          ) : (
            <Link
              href="/inscription-entreprise"
              className="font-semibold text-accent underline underline-offset-2"
            >
              {localize(locale, {
                fr: "Demander l’ouverture d’un compte",
                en: "Request an account",
              })}
            </Link>
          )}
          .
        </p>
      )}
    </form>
  );
}
