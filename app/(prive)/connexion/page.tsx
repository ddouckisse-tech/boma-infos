"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { ActionButton } from "@/components/custom/action-button";
import { AuthShell, FormError } from "@/components/custom/auth-shell";
import { TextField } from "@/components/custom/form-field";
import { authClient } from "@/lib/auth-client";

/**
 * Sign-in — CDC §4.3, §5.3.
 *
 * One error sentence, always the same: "identifiants incorrects". Whether
 * the address is unknown or the password is wrong, the form says exactly
 * the same thing and takes the same visible time. The legacy site published
 * its `admin` account through `/wp-json/wp/v2/users`; this screen is not
 * going to hand back what that fix removed.
 *
 * When the account carries a second factor, Better Auth does **not** open a
 * session here: it hands back a challenge and the browser goes to
 * `/connexion/verification`.
 */
export default function SignInPage() {
  const router = useRouter();
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
        setError("Identifiants incorrects.");
        setPending(false);
        return;
      }
      const data = result.data as { twoFactorRedirect?: boolean } | null;
      if (data?.twoFactorRedirect) {
        router.push("/connexion/verification");
        return;
      }
      router.push("/compte");
      router.refresh();
    } catch {
      setError("Identifiants incorrects.");
      setPending(false);
    }
  };

  return (
    <AuthShell
      title="Connexion"
      intro="Espace réservé à la rédaction et aux entreprises partenaires."
      footer={
        <p>
          Votre entreprise n&apos;a pas encore d&apos;espace&nbsp;?{" "}
          <Link
            href="/inscription-entreprise"
            className="font-semibold text-accent underline underline-offset-2"
          >
            Demander l&apos;ouverture d&apos;un compte
          </Link>
          .
        </p>
      }
    >
      <form onSubmit={submit} className="grid gap-5">
        <FormError>{error}</FormError>

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

        <TextField
          label="Mot de passe"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <ActionButton type="submit" disabled={pending} className="w-full">
          <LogIn aria-hidden="true" className="size-4" />
          {pending ? "Vérification…" : "Se connecter"}
        </ActionButton>

        <p className="type-small">
          <Link
            href="/mot-de-passe-oublie"
            className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Mot de passe oublié
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
