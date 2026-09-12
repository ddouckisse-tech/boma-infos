"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { ActionButton } from "@/components/custom/action-button";
import {
  AuthShell,
  FormError,
  FormNotice,
} from "@/components/custom/auth-shell";
import { TextField } from "@/components/custom/form-field";
import { authClient } from "@/lib/auth-client";

const MINIMUM = 12;

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < MINIMUM) {
      setError(`Le mot de passe doit compter au moins ${MINIMUM} caractères.`);
      return;
    }
    if (password !== confirmation) {
      setError("Les deux saisies diffèrent.");
      return;
    }
    setPending(true);
    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (result.error) {
        setError("Ce lien n'est plus valable. Demandez-en un nouveau.");
        setPending(false);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/connexion"), 1500);
    } catch {
      setError("Ce lien n'est plus valable. Demandez-en un nouveau.");
      setPending(false);
    }
  };

  if (!token) {
    return (
      <FormError>
        Ce lien est incomplet. Reprenez la procédure depuis{" "}
        <Link href="/mot-de-passe-oublie" className="underline">
          « mot de passe oublié »
        </Link>
        .
      </FormError>
    );
  }

  if (done) {
    return (
      <FormNotice>
        Mot de passe changé. Redirection vers la connexion…
      </FormNotice>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <FormError>{error}</FormError>
      <TextField
        label="Nouveau mot de passe"
        type="password"
        autoComplete="new-password"
        required
        minLength={MINIMUM}
        hint={`Douze caractères au minimum (CDC §4.3).`}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <TextField
        label="Confirmation"
        type="password"
        autoComplete="new-password"
        required
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
      />
      <ActionButton type="submit" disabled={pending} className="w-full">
        <KeyRound aria-hidden="true" className="size-4" />
        {pending ? "Enregistrement…" : "Changer le mot de passe"}
      </ActionButton>
    </form>
  );
}

/** Reset screen reached from the link of `/mot-de-passe-oublie`. */
export default function ResetPasswordPage() {
  return (
    <AuthShell title="Nouveau mot de passe">
      <Suspense fallback={<p className="type-small">Chargement…</p>}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
