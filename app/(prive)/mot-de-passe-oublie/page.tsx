"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ActionButton } from "@/components/custom/action-button";
import { AuthShell, FormNotice } from "@/components/custom/auth-shell";
import { TextField } from "@/components/custom/form-field";
import { authClient } from "@/lib/auth-client";

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
      title="Mot de passe oublié"
      intro="Indiquez l'adresse de votre compte. Si elle correspond à un compte, un lien de réinitialisation est préparé."
      footer={
        <p>
          <Link
            href="/connexion"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Revenir à la connexion
          </Link>
        </p>
      }
    >
      {done ? (
        <FormNotice>
          Si un compte existe pour cette adresse, un lien de réinitialisation a
          été préparé. Aucun prestataire de courriel n&apos;est encore branché
          sur ce déploiement&nbsp;: le message attend dans la corbeille de
          sortie que la rédaction consulte.
        </FormNotice>
      ) : (
        <form onSubmit={submit} className="grid gap-5">
          <TextField
            label="Adresse électronique"
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
            {pending ? "Envoi…" : "Demander un lien"}
          </ActionButton>
        </form>
      )}
    </AuthShell>
  );
}
