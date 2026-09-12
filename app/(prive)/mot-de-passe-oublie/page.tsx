"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ActionButton } from "@/components/custom/action-button";
import { AuthShell, FormNotice } from "@/components/custom/auth-shell";
import { TextField } from "@/components/custom/form-field";
import { usePreferences } from "@/components/providers/preferences-provider";
import { authClient } from "@/lib/auth-client";
import { localize } from "@/lib/i18n";

/**
 * Password reset request — CDC §5.3.
 *
 * Answers the same sentence whatever happens, including when the address is
 * unknown and when the call itself fails: the form is not a way to find out
 * who has an account here.
 *
 * No mail provider is wired on this deployment. The reset link is composed
 * and dropped in the notification outbox, which an administrator can read
 * from the back office (`/redaction/depots` → « Notifications »). Saying so
 * is better than an inbox nobody is watching.
 */
export default function ForgotPasswordPage() {
  const { locale } = usePreferences();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reinitialisation",
      });
    } catch {
      // Volontairement ignoré : la réponse ne doit pas dépendre du résultat.
    }
    setDone(true);
    setPending(false);
  };

  return (
    <AuthShell
      title={localize(locale, {
        fr: "Mot de passe oublié",
        en: "Forgotten password",
      })}
      intro={localize(locale, {
        fr: "Indiquez l'adresse de votre compte. Si elle correspond à un compte, un lien de réinitialisation est préparé.",
        en: "Enter your account email address. If it matches an account, a reset link will be prepared.",
      })}
      footer={
        <p>
          <Link
            href="/connexion"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {localize(locale, {
              fr: "Revenir à la connexion",
              en: "Back to sign in",
            })}
          </Link>
        </p>
      }
    >
      {done ? (
        <FormNotice>
          {localize(locale, {
            fr: "Si un compte existe pour cette adresse, un lien de réinitialisation a été préparé. Aucun prestataire de courriel n’est encore branché sur ce déploiement : le message attend dans la boîte d’envoi consultée par la rédaction.",
            en: "If an account exists for this address, a reset link has been prepared. No email provider is connected to this deployment yet: the message is waiting in the newsroom outbox.",
          })}
        </FormNotice>
      ) : (
        <form onSubmit={submit} className="grid gap-5">
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
          <ActionButton type="submit" disabled={pending} className="w-full">
            <Mail aria-hidden="true" className="size-4" />
            {pending
              ? localize(locale, { fr: "Envoi…", en: "Sending…" })
              : localize(locale, {
                  fr: "Demander un lien",
                  en: "Request a link",
                })}
          </ActionButton>
        </form>
      )}
    </AuthShell>
  );
}
