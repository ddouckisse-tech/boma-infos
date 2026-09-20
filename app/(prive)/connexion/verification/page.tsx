"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { ActionButton } from "@/components/custom/action-button";
import { AuthShell, FormError } from "@/components/custom/auth-shell";
import { TextField } from "@/components/custom/form-field";
import { usePreferences } from "@/components/providers/preferences-provider";
import { authClient } from "@/lib/auth-client";
import { localize } from "@/lib/i18n";

/**
 * Second factor — CDC §4.3.
 *
 * Reached only after a correct password, and only for an account that has
 * enrolled. No session exists at this point: Better Auth holds a short-lived
 * challenge cookie and opens the session when, and only when, the code
 * checks out. Five attempts a minute, enforced on the deployment
 * (`convex/auth.ts`).
 */
export default function TwoFactorPage() {
  const router = useRouter();
  const { locale } = usePreferences();
  const [code, setCode] = useState("");
  const [backup, setBackup] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = backup
        ? await authClient.twoFactor.verifyBackupCode({ code: code.trim() })
        : await authClient.twoFactor.verifyTotp({ code: code.trim() });
      if (result.error) {
        setError(
          localize(locale, {
            fr: "Code incorrect ou expiré.",
            en: "Incorrect or expired code.",
          })
        );
        setPending(false);
        return;
      }
      router.push("/compte");
      router.refresh();
    } catch {
      setError(
        localize(locale, {
          fr: "Code incorrect ou expiré.",
          en: "Incorrect or expired code.",
        })
      );
      setPending(false);
    }
  };

  return (
    <AuthShell
      title={localize(locale, {
        fr: "Vérification en deux étapes",
        en: "Two-step verification",
      })}
      intro={
        backup
          ? localize(locale, {
              fr: "Saisissez l'un des codes de secours remis lors de l'activation. Chaque code ne sert qu'une fois.",
              en: "Enter one of the backup codes provided during setup. Each code can only be used once.",
            })
          : localize(locale, {
              fr: "Ouvrez votre application d'authentification et saisissez le code à six chiffres.",
              en: "Open your authenticator app and enter the six-digit code.",
            })
      }
    >
      <form onSubmit={submit} className="grid gap-5">
        <FormError>{error}</FormError>

        <TextField
          label={
            backup
              ? localize(locale, { fr: "Code de secours", en: "Backup code" })
              : localize(locale, {
                  fr: "Code à six chiffres",
                  en: "Six-digit code",
                })
          }
          name="code"
          inputMode={backup ? "text" : "numeric"}
          autoComplete="one-time-code"
          spellCheck={false}
          autoFocus
          required
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="[&_input]:font-mono [&_input]:tracking-[0.3em]"
        />

        <ActionButton type="submit" disabled={pending} className="w-full">
          <ShieldCheck aria-hidden="true" className="size-4" />
          {pending
            ? localize(locale, { fr: "Vérification…", en: "Verifying…" })
            : localize(locale, { fr: "Valider", en: "Continue" })}
        </ActionButton>

        <button
          type="button"
          onClick={() => {
            setBackup((value) => !value);
            setCode("");
            setError("");
          }}
          className="justify-self-start type-small text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {backup
            ? localize(locale, {
                fr: "Utiliser l'application d'authentification",
                en: "Use the authenticator app",
              })
            : localize(locale, {
                fr: "Utiliser un code de secours",
                en: "Use a backup code",
              })}
        </button>
      </form>
    </AuthShell>
  );
}
