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
import { usePreferences } from "@/components/providers/preferences-provider";
import {
  ACCESS_CODE_LENGTH,
  isAcceptablePassword,
  PASSWORD_RULE_MESSAGE,
} from "@/convex/model/password";
import { authClient } from "@/lib/auth-client";
import { localize } from "@/lib/i18n";

function ResetForm() {
  const router = useRouter();
  const { locale } = usePreferences();
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
    if (!isAcceptablePassword(password)) {
      setError(
        localize(locale, {
          fr: PASSWORD_RULE_MESSAGE,
          en: "The password must contain six digits followed by one letter (A-Z or a-z), or be at least twelve characters long.",
        })
      );
      return;
    }
    if (password !== confirmation) {
      setError(
        localize(locale, {
          fr: "Les deux saisies diffèrent.",
          en: "The two entries do not match.",
        })
      );
      return;
    }
    setPending(true);
    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (result.error) {
        setError(
          localize(locale, {
            fr: "Ce lien n'est plus valable. Demandez-en un nouveau.",
            en: "This link is no longer valid. Request a new one.",
          })
        );
        setPending(false);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/connexion"), 1500);
    } catch {
      setError(
        localize(locale, {
          fr: "Ce lien n'est plus valable. Demandez-en un nouveau.",
          en: "This link is no longer valid. Request a new one.",
        })
      );
      setPending(false);
    }
  };

  if (!token) {
    return (
      <FormError>
        {localize(locale, {
          fr: "Ce lien est incomplet. Reprenez la procédure depuis ",
          en: "This link is incomplete. Restart the process from ",
        })}
        <Link href="/mot-de-passe-oublie" className="underline">
          {localize(locale, {
            fr: "« mot de passe oublié »",
            en: "‘forgotten password’",
          })}
        </Link>
        .
      </FormError>
    );
  }

  if (done) {
    return (
      <FormNotice>
        {localize(locale, {
          fr: "Mot de passe changé. Redirection vers la connexion…",
          en: "Password changed. Redirecting to sign in…",
        })}
      </FormNotice>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <FormError>{error}</FormError>
      <TextField
        label={localize(locale, {
          fr: "Nouveau mot de passe",
          en: "New password",
        })}
        type="password"
        autoComplete="new-password"
        required
        minLength={ACCESS_CODE_LENGTH}
        hint={localize(locale, {
          fr: "Six chiffres suivis d’une lettre, ou douze caractères au minimum. La casse compte.",
          en: "Six digits followed by one letter, or at least twelve characters. Case matters.",
        })}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <TextField
        label={localize(locale, { fr: "Confirmation", en: "Confirm password" })}
        type="password"
        autoComplete="new-password"
        required
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
      />
      <ActionButton type="submit" disabled={pending} className="w-full">
        <KeyRound aria-hidden="true" className="size-4" />
        {pending
          ? localize(locale, { fr: "Enregistrement…", en: "Saving…" })
          : localize(locale, {
              fr: "Changer le mot de passe",
              en: "Change password",
            })}
      </ActionButton>
    </form>
  );
}

/** Reset screen reached from the link of `/mot-de-passe-oublie`. */
export default function ResetPasswordPage() {
  const { locale } = usePreferences();
  return (
    <AuthShell
      title={localize(locale, {
        fr: "Nouveau mot de passe",
        en: "New password",
      })}
    >
      <Suspense
        fallback={
          <p className="type-small">
            {localize(locale, { fr: "Chargement…", en: "Loading…" })}
          </p>
        }
      >
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
