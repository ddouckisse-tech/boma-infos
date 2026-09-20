"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { Copy, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { ActionButton } from "@/components/custom/action-button";
import { FormError } from "@/components/custom/auth-shell";
import { TextField } from "@/components/custom/form-field";
import { usePreferences } from "@/components/providers/preferences-provider";
import { authClient } from "@/lib/auth-client";
import { localize } from "@/lib/i18n";

/**
 * Verification by an authenticator app — optional since 12/09/2026.
 *
 * The enrolment flow is the real one: Better Auth issues a TOTP secret,
 * this panel renders it as a QR code and as text, and the account is only
 * marked as carrying a second factor once a code produced by the app has
 * been verified. Nothing refuses an account that skips it; the panel is
 * simply there, folded away, for whoever wants the extra lock.
 */
export function TwoFactorPanel({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const { locale } = usePreferences();
  const [password, setPassword] = useState("");
  const [enrolment, setEnrolment] = useState<{
    uri: string;
    qr: string;
    backupCodes: string[];
  } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const startEnrolment = async () => {
    setError("");
    setBusy(true);
    try {
      const result = await authClient.twoFactor.enable({ password });
      if (result.error || !result.data) {
        setError(
          localize(locale, {
            fr: "Code d'accès incorrect.",
            en: "Incorrect access code.",
          })
        );
        setBusy(false);
        return;
      }
      const uri = result.data.totpURI;
      setEnrolment({
        uri,
        qr: await QRCode.toDataURL(uri, { margin: 1, width: 220 }),
        backupCodes: result.data.backupCodes ?? [],
      });
      setPassword("");
    } catch {
      setError(
        localize(locale, {
          fr: "L'activation n'a pas abouti.",
          en: "Activation failed.",
        })
      );
    }
    setBusy(false);
  };

  const confirmEnrolment = async () => {
    setError("");
    setBusy(true);
    try {
      const result = await authClient.twoFactor.verifyTotp({
        code: code.trim(),
      });
      if (result.error) {
        setError(
          localize(locale, {
            fr: "Code incorrect. Vérifiez l'heure de votre téléphone.",
            en: "Incorrect code. Check the time on your phone.",
          })
        );
        setBusy(false);
        return;
      }
      setEnrolment(null);
      setCode("");
      toast.success(
        localize(locale, {
          fr: "Vérification par application activée.",
          en: "App-based verification enabled.",
        })
      );
      router.refresh();
    } catch {
      setError(
        localize(locale, { fr: "Code incorrect.", en: "Incorrect code." })
      );
    }
    setBusy(false);
  };

  const disable = async () => {
    setError("");
    setBusy(true);
    try {
      const result = await authClient.twoFactor.disable({ password });
      if (result.error) {
        setError(
          localize(locale, {
            fr: "Code d'accès incorrect.",
            en: "Incorrect access code.",
          })
        );
        setBusy(false);
        return;
      }
      setPassword("");
      toast.success(
        localize(locale, {
          fr: "Vérification par application désactivée.",
          en: "App-based verification disabled.",
        })
      );
      router.refresh();
    } catch {
      setError(
        localize(locale, {
          fr: "La désactivation n'a pas abouti.",
          en: "Deactivation failed.",
        })
      );
    }
    setBusy(false);
  };

  return (
    <div className="grid gap-4">
      <FormError>{error}</FormError>

      {enabled ? (
        <div className="grid max-w-md gap-4">
          <p className="flex items-center gap-2 type-small">
            <ShieldCheck
              aria-hidden="true"
              className="size-4 text-success-token"
            />
            {localize(locale, {
              fr: "Active : un code de l’application est demandé à chaque connexion.",
              en: "Active: a code from your app is required whenever you sign in.",
            })}
          </p>
          <TextField
            label={localize(locale, {
              fr: "Code d'accès actuel",
              en: "Current access code",
            })}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <ActionButton
            type="button"
            variant="outline"
            onClick={() => void disable()}
            disabled={busy || password === ""}
            className="justify-self-start"
          >
            <ShieldOff aria-hidden="true" className="size-4" />
            {localize(locale, { fr: "Désactiver", en: "Disable" })}
          </ActionButton>
        </div>
      ) : enrolment ? (
        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={enrolment.qr}
              alt={localize(locale, {
                fr: "Code QR à scanner dans votre application d'authentification",
                en: "QR code to scan in your authenticator app",
              })}
              width={220}
              height={220}
              className="rounded-md border border-border bg-white p-2"
            />
            <div className="grid min-w-0 gap-3">
              <p className="type-small">
                {localize(locale, {
                  fr: "Scannez ce code, ou saisissez l’adresse ci-dessous à la main dans votre application d’authentification.",
                  en: "Scan this code, or enter the address below manually in your authenticator app.",
                })}
              </p>
              <div className="flex items-start gap-2">
                <code className="min-w-0 flex-1 overflow-x-auto rounded-md border border-border bg-surface-muted p-2 font-mono type-small break-all">
                  {enrolment.uri}
                </code>
                <button
                  type="button"
                  onClick={() =>
                    void navigator.clipboard.writeText(enrolment.uri)
                  }
                  className="inline-flex shrink-0 items-center rounded-md border border-border px-3 type-small touch-target"
                >
                  <Copy aria-hidden="true" className="size-4" />
                  <span className="sr-only">
                    {localize(locale, {
                      fr: "Copier l'adresse",
                      en: "Copy address",
                    })}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-warning-token/40 bg-warning-token/10 p-4">
            <p className="type-small font-semibold text-foreground">
              {localize(locale, {
                fr: "Codes de secours — notez-les maintenant, ils ne seront plus affichés.",
                en: "Backup codes — save them now, as they will not be shown again.",
              })}
            </p>
            <ul className="mt-2 grid grid-cols-2 gap-1 font-mono type-small sm:grid-cols-5">
              {enrolment.backupCodes.map((backup) => (
                <li key={backup}>{backup}</li>
              ))}
            </ul>
          </div>

          <div className="grid max-w-xs gap-3">
            <TextField
              label={localize(locale, {
                fr: "Code de l'application",
                en: "App code",
              })}
              inputMode="numeric"
              autoComplete="one-time-code"
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            <ActionButton
              type="button"
              onClick={() => void confirmEnrolment()}
              disabled={busy || code.trim().length < 6}
            >
              <ShieldCheck aria-hidden="true" className="size-4" />
              {localize(locale, {
                fr: "Confirmer l'activation",
                en: "Confirm activation",
              })}
            </ActionButton>
          </div>
        </div>
      ) : (
        <div className="grid max-w-md gap-4">
          <p className="type-small text-muted-foreground">
            {localize(locale, {
              fr: "Facultatif. Une application comme Google Authenticator ou Aegis produit un code supplémentaire demandé à chaque connexion. Confirmez votre code d’accès pour commencer.",
              en: "Optional. An app such as Google Authenticator or Aegis generates an additional code required whenever you sign in. Confirm your access code to begin.",
            })}
          </p>
          <TextField
            label={localize(locale, {
              fr: "Code d'accès actuel",
              en: "Current access code",
            })}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <ActionButton
            type="button"
            variant="outline"
            onClick={() => void startEnrolment()}
            disabled={busy || password === ""}
            className="justify-self-start"
          >
            <ShieldCheck aria-hidden="true" className="size-4" />
            {localize(locale, {
              fr: "Activer la vérification par application",
              en: "Enable app-based verification",
            })}
          </ActionButton>
        </div>
      )}
    </div>
  );
}
