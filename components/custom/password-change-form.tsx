"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { ActionButton } from "@/components/custom/action-button";
import { FormError } from "@/components/custom/auth-shell";
import { TextField } from "@/components/custom/form-field";
import { PinField } from "@/components/custom/pin-field";
import { isPinCode } from "@/convex/model/password";
import { authClient } from "@/lib/auth-client";

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
      setError("Le nouveau code doit compter exactement six chiffres.");
      return;
    }
    if (!pin && next.length < LONG_MINIMUM) {
      setError(
        "Le nouveau mot de passe doit compter au moins douze caractères."
      );
      return;
    }
    if (next === current) {
      setError(
        pin
          ? "Choisissez un code différent de l'actuel."
          : "Choisissez un mot de passe différent de l'actuel."
      );
      return;
    }
    if (next !== confirmation) {
      setError(
        pin
          ? "Les deux saisies du nouveau code diffèrent."
          : "Les deux saisies du nouveau mot de passe diffèrent."
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
          message.includes("six chiffres")
            ? message
            : pin
              ? "Code actuel incorrect."
              : "Mot de passe actuel incorrect, ou nouveau mot de passe refusé."
        );
      } else {
        setCurrent("");
        setNext("");
        setConfirmation("");
        toast.success(
          pin
            ? "Code d'accès remplacé. Vos autres appareils ont été déconnectés."
            : "Mot de passe remplacé. Vos autres sessions ont été fermées."
        );
        onDone?.();
      }
    } catch {
      setError("Le changement n'a pas abouti. Réessayez.");
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="grid gap-5">
      <FormError>{error}</FormError>

      {pin ? (
        <>
          <PinField
            label="Code actuel"
            value={current}
            onChange={setCurrent}
            disabled={busy}
            autoFocus={autoFocus}
          />
          <PinField
            label="Nouveau code"
            value={next}
            onChange={setNext}
            disabled={busy}
            hint="Six chiffres. Le changement déconnecte vos autres appareils."
          />
          <PinField
            label="Confirmez le nouveau code"
            value={confirmation}
            onChange={setConfirmation}
            disabled={busy}
            error={
              confirmation.length === 6 && confirmation !== next
                ? "Les deux saisies diffèrent."
                : undefined
            }
          />
        </>
      ) : (
        <>
          <TextField
            label="Mot de passe actuel"
            type="password"
            autoComplete="current-password"
            required
            autoFocus={autoFocus}
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
          />
          <TextField
            label="Nouveau mot de passe"
            type="password"
            autoComplete="new-password"
            required
            minLength={LONG_MINIMUM}
            hint="Douze caractères au minimum. Le changement ferme vos autres sessions."
            value={next}
            onChange={(event) => setNext(event.target.value)}
          />
          <TextField
            label="Confirmation du nouveau mot de passe"
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
          ? "Enregistrement…"
          : (submitLabel ??
            (pin ? "Remplacer le code" : "Remplacer le mot de passe"))}
      </ActionButton>
    </form>
  );
}
