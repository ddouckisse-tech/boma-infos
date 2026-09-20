"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { ActionButton } from "@/components/custom/action-button";
import { FormError } from "@/components/custom/auth-shell";
import { TextField } from "@/components/custom/form-field";
import { PinField } from "@/components/custom/pin-field";
import { usePreferences } from "@/components/providers/preferences-provider";
import { isPinCode } from "@/convex/model/password";
import { authClient } from "@/lib/auth-client";
import { localize } from "@/lib/i18n";

const LONG_MINIMUM = 12;

/**
 * "Changement du mot de passe" — the newsroom's security gesture (12/09/2026).
 *
 * `pin` mode is the newsroom's: three rows of six boxes — the current code,
 * the new one, the new one again. `password` mode keeps the classic three
 * fields for company accounts, whose password is twelve characters or more.
 * Both call Better Auth's `changePassword`, which revokes every other
 * session: whoever knew the previous code is out. The provisional flag on
 * the profile falls server-side (`convex/auth.ts`, hooks.after), never here.
 */
export function PasswordChangeForm({
  mode = "pin",
  onDone,
  autoFocus,
  submitLabel,
}: {
  mode?: "pin" | "password";
  onDone?: () => void;
  autoFocus?: boolean;
  submitLabel?: string;
}) {
  const { locale } = usePreferences();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const pin = mode === "pin";
  const complete = pin
    ? [current, next, confirmation].every(isPinCode)
    : current !== "" && next.length >= LONG_MINIMUM && confirmation !== "";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (pin && !isPinCode(next)) {
      setError(
        localize(locale, {
          fr: "Le nouveau code doit compter exactement six chiffres.",
          en: "The new code must contain exactly six digits.",
        })
      );
      return;
    }
    if (!pin && next.length < LONG_MINIMUM) {
      setError(
        localize(locale, {
          fr: "Le nouveau mot de passe doit compter au moins douze caractères.",
          en: "The new password must be at least twelve characters long.",
        })
      );
      return;
    }
    if (next === current) {
      setError(
        pin
          ? localize(locale, {
              fr: "Choisissez un code différent de l'actuel.",
              en: "Choose a code that differs from your current one.",
            })
          : localize(locale, {
              fr: "Choisissez un mot de passe différent de l'actuel.",
              en: "Choose a password that differs from your current one.",
            })
      );
      return;
    }
    if (next !== confirmation) {
      setError(
        pin
          ? localize(locale, {
              fr: "Les deux saisies du nouveau code diffèrent.",
              en: "The two new-code entries do not match.",
            })
          : localize(locale, {
              fr: "Les deux saisies du nouveau mot de passe diffèrent.",
              en: "The two new-password entries do not match.",
            })
      );
      return;
    }
    setBusy(true);
    try {
      const result = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: true,
      });
      if (result.error) {
        const message = result.error.message ?? "";
        setError(
          locale === "fr" && message.includes("six chiffres")
            ? message
            : pin
              ? localize(locale, {
                  fr: "Code actuel incorrect.",
                  en: "Incorrect current code.",
                })
              : localize(locale, {
                  fr: "Mot de passe actuel incorrect, ou nouveau mot de passe refusé.",
                  en: "The current password is incorrect, or the new password was rejected.",
                })
        );
      } else {
        setCurrent("");
        setNext("");
        setConfirmation("");
        toast.success(
          pin
            ? localize(locale, {
                fr: "Code d'accès remplacé. Vos autres appareils ont été déconnectés.",
                en: "Access code changed. Your other devices have been signed out.",
              })
            : localize(locale, {
                fr: "Mot de passe remplacé. Vos autres sessions ont été fermées.",
                en: "Password changed. Your other sessions have been closed.",
              })
        );
        onDone?.();
      }
    } catch {
      setError(
        localize(locale, {
          fr: "Le changement n'a pas abouti. Réessayez.",
          en: "The change failed. Please try again.",
        })
      );
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="grid gap-5">
      <FormError>{error}</FormError>

      {pin ? (
        <>
          <PinField
            label={localize(locale, { fr: "Code actuel", en: "Current code" })}
            value={current}
            onChange={setCurrent}
            disabled={busy}
            autoFocus={autoFocus}
          />
          <PinField
            label={localize(locale, { fr: "Nouveau code", en: "New code" })}
            value={next}
            onChange={setNext}
            disabled={busy}
            hint={localize(locale, {
              fr: "Six chiffres. Le changement déconnecte vos autres appareils.",
              en: "Six digits. Changing it signs out your other devices.",
            })}
          />
          <PinField
            label={localize(locale, {
              fr: "Confirmez le nouveau code",
              en: "Confirm new code",
            })}
            value={confirmation}
            onChange={setConfirmation}
            disabled={busy}
            error={
              confirmation.length === 6 && confirmation !== next
                ? localize(locale, {
                    fr: "Les deux saisies diffèrent.",
                    en: "The two entries do not match.",
                  })
                : undefined
            }
          />
        </>
      ) : (
        <>
          <TextField
            label={localize(locale, {
              fr: "Mot de passe actuel",
              en: "Current password",
            })}
            type="password"
            autoComplete="current-password"
            required
            autoFocus={autoFocus}
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
          />
          <TextField
            label={localize(locale, {
              fr: "Nouveau mot de passe",
              en: "New password",
            })}
            type="password"
            autoComplete="new-password"
            required
            minLength={LONG_MINIMUM}
            hint={localize(locale, {
              fr: "Douze caractères au minimum. Le changement ferme vos autres sessions.",
              en: "At least twelve characters. Changing it closes your other sessions.",
            })}
            value={next}
            onChange={(event) => setNext(event.target.value)}
          />
          <TextField
            label={localize(locale, {
              fr: "Confirmation du nouveau mot de passe",
              en: "Confirm new password",
            })}
            type="password"
            autoComplete="new-password"
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </>
      )}

      <ActionButton
        type="submit"
        disabled={busy || !complete}
        className="justify-self-start"
      >
        <KeyRound aria-hidden="true" className="size-4" />
        {busy
          ? localize(locale, { fr: "Enregistrement…", en: "Saving…" })
          : (submitLabel ??
            (pin
              ? localize(locale, { fr: "Remplacer le code", en: "Change code" })
              : localize(locale, {
                  fr: "Remplacer le mot de passe",
                  en: "Change password",
                })))}
      </ActionButton>
    </form>
  );
}
