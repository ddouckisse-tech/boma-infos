"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import QRCode from "qrcode";
import {
  Copy,
  KeyRound,
  LogOut,
  MonitorSmartphone,
  ShieldCheck,
  ShieldOff,
  ShieldQuestion,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ActionButton } from "@/components/custom/action-button";
import { Container } from "@/components/custom/container";
import { TextField } from "@/components/custom/form-field";
import { BrandWordmark } from "@/components/custom/brand-wordmark";
import { authClient } from "@/lib/auth-client";
import { formatDateTime } from "@/lib/private";

type Session = {
  id: string;
  token: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  userAgent?: string | null;
  ipAddress?: string | null;
};

/**
 * Account screen — CDC §4.3: profile, second factor, revocable sessions.
 *
 * The enrolment flow is the real one: Better Auth issues a TOTP secret,
 * this page renders it as a QR code and as text, and the account is only
 * marked as carrying a second factor once a code produced by the
 * authenticator has been verified. Until then, an Administrateur or an
 * Éditeur is refused by every Convex function — that is where the
 * obligation lives, not in this page.
 */
export default function AccountPage() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.accounts.me, isAuthenticated ? {} : "skip");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [enrolment, setEnrolment] = useState<{
    uri: string;
    qr: string;
    backupCodes: string[];
  } | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [busy, setBusy] = useState(false);

  const [sessionsTick, setSessionsTick] = useState(0);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /**
   * Password change — the way out of a provisional password (§4.3).
   * Twelve characters are checked here for the message, and again by the
   * server (`convex/auth.ts`, hooks.before), which is the check that counts.
   * Other sessions are revoked: whoever knew the provisional one is out.
   */
  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (newPassword.length < 12) {
      setError(
        "Le nouveau mot de passe doit compter au moins douze caractères."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les deux saisies du nouveau mot de passe diffèrent.");
      return;
    }
    setBusy(true);
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (result.error) {
        setError(
          "Mot de passe actuel incorrect, ou nouveau mot de passe refusé."
        );
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage(
          "Mot de passe remplacé. Vos autres sessions ont été fermées."
        );
        setSessionsTick((tick) => tick + 1);
      }
    } catch {
      setError("Le changement de mot de passe n'a pas abouti.");
    }
    setBusy(false);
  };
  const refreshSessions = useCallback(() => setSessionsTick((n) => n + 1), []);

  // La liste des sessions vient de Better Auth, pas de Convex : c'est le
  // seul endroit du back-office qui parle à un système extérieur, donc le
  // seul qui mérite un effet. Les écritures d'état sont toutes derrière un
  // `await`, jamais dans le corps synchrone.
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    void (async () => {
      try {
        const result = await authClient.listSessions();
        if (active) setSessions((result.data ?? []) as unknown as Session[]);
      } catch {
        if (active) setSessions([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated, sessionsTick]);

  if (isLoading || (isAuthenticated && viewer === undefined)) {
    return (
      <Shell>
        <p className="type-body text-muted-foreground">Chargement du compte…</p>
      </Shell>
    );
  }

  if (!isAuthenticated || viewer === null || viewer === undefined) {
    return (
      <Shell>
        <p className="type-body">
          Vous n&apos;êtes pas connecté.{" "}
          <Link href="/connexion" className="text-accent underline">
            Se connecter
          </Link>
          .
        </p>
      </Shell>
    );
  }

  const startEnrolment = async () => {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const result = await authClient.twoFactor.enable({ password });
      if (result.error || !result.data) {
        setError("Mot de passe incorrect.");
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
      setError("L'activation n'a pas abouti.");
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
        setError("Code incorrect. Vérifiez l'heure de votre téléphone.");
        setBusy(false);
        return;
      }
      setEnrolment(null);
      setCode("");
      setMessage("Double authentification activée.");
      router.refresh();
    } catch {
      setError("Code incorrect.");
    }
    setBusy(false);
  };

  const disable = async () => {
    setError("");
    setBusy(true);
    try {
      const result = await authClient.twoFactor.disable({ password });
      if (result.error) {
        setError("Mot de passe incorrect.");
        setBusy(false);
        return;
      }
      setPassword("");
      setMessage("Double authentification désactivée.");
      router.refresh();
    } catch {
      setError("La désactivation n'a pas abouti.");
    }
    setBusy(false);
  };

  const revokeOthers = async () => {
    setBusy(true);
    try {
      await authClient.revokeOtherSessions();
      setMessage("Les autres appareils ont été déconnectés.");
      refreshSessions();
    } catch {
      setError("La révocation n'a pas abouti.");
    }
    setBusy(false);
  };

  const signOut = async () => {
    await authClient.signOut();
    router.replace("/connexion");
  };

  return (
    <Shell>
      <div className="grid gap-6">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-serif type-h3">Profil</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Row label="Nom" value={viewer.name} />
            <Row label="Adresse" value={viewer.email} />
            <Row label="Rôle" value={viewer.roleName} />
            <Row
              label="Espace"
              value={
                viewer.organizationName ??
                (viewer.permissions.includes("newsroom:access")
                  ? "Rédaction"
                  : "—")
              }
            />
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={viewer.home}
              className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground touch-target"
            >
              Aller à mon espace
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 type-small font-semibold touch-target hover:bg-surface-muted"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Se déconnecter
            </button>
          </div>
        </section>

        {(message || error) && (
          <p
            role="status"
            className={
              error
                ? "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 type-small text-destructive"
                : "rounded-md border border-success-token/40 bg-success-token/10 px-3 py-2 type-small text-success-token"
            }
          >
            {error || message}
          </p>
        )}

        <section
          id="mot-de-passe"
          className={
            "rounded-lg border bg-card p-6 " +
            (viewer.passwordChangeRequired
              ? "border-warning-token"
              : "border-border")
          }
        >
          <h2 className="flex items-center gap-2 font-serif type-h3">
            <KeyRound
              aria-hidden="true"
              className={
                "size-5 " +
                (viewer.passwordChangeRequired
                  ? "text-warning-token"
                  : "text-muted-foreground")
              }
            />
            Mot de passe
          </h2>
          <p className="mt-2 type-small text-muted-foreground">
            {viewer.passwordChangeRequired
              ? "Votre mot de passe est provisoire : choisissez-en un définitif maintenant. Tant qu'il n'est pas remplacé, le serveur refuse toute action de ce compte."
              : "Douze caractères au minimum. Le changement ferme vos autres sessions."}
          </p>
          <form onSubmit={changePassword} className="mt-5 grid max-w-md gap-4">
            <TextField
              label="Mot de passe actuel"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            <TextField
              label="Nouveau mot de passe"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              hint="Douze caractères au minimum."
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <TextField
              label="Confirmation du nouveau mot de passe"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <ActionButton type="submit" disabled={busy}>
              Remplacer le mot de passe
            </ActionButton>
          </form>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 font-serif type-h3">
            {viewer.twoFactorEnabled ? (
              <ShieldCheck
                aria-hidden="true"
                className="size-5 text-success-token"
              />
            ) : (
              <ShieldQuestion
                aria-hidden="true"
                className="size-5 text-warning-token"
              />
            )}
            Double authentification
          </h2>
          <p className="mt-2 type-small text-muted-foreground">
            {viewer.twoFactorRequired
              ? "Obligatoire pour votre rôle (CDC §4.3). Sans elle, le serveur refuse toute action, y compris depuis l'API."
              : "Facultative pour votre rôle, recommandée."}
          </p>

          {viewer.twoFactorEnabled ? (
            <div className="mt-5 grid max-w-md gap-4">
              <p className="type-small">
                Active. Pour la désactiver, confirmez votre mot de passe.
              </p>
              <TextField
                label="Mot de passe"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <ActionButton
                type="button"
                variant="outline"
                onClick={disable}
                disabled={busy || password === ""}
                className="justify-self-start"
              >
                <ShieldOff aria-hidden="true" className="size-4" />
                Désactiver
              </ActionButton>
            </div>
          ) : enrolment ? (
            <div className="mt-5 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={enrolment.qr}
                  alt="Code QR à scanner dans votre application d'authentification"
                  width={220}
                  height={220}
                  className="rounded-md border border-border bg-white p-2"
                />
                <div className="grid min-w-0 gap-3">
                  <p className="type-small">
                    Scannez ce code, ou saisissez l&apos;adresse ci-dessous à la
                    main dans votre application d&apos;authentification.
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
                      <span className="sr-only">Copier l&apos;adresse</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-warning-token/40 bg-warning-token/10 p-4">
                <p className="type-small font-semibold text-foreground">
                  Codes de secours — notez-les maintenant, ils ne seront plus
                  affichés.
                </p>
                <ul className="mt-2 grid grid-cols-2 gap-1 font-mono type-small sm:grid-cols-5">
                  {enrolment.backupCodes.map((backup) => (
                    <li key={backup}>{backup}</li>
                  ))}
                </ul>
              </div>

              <div className="grid max-w-xs gap-3">
                <TextField
                  label="Code à six chiffres"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  spellCheck={false}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
                <ActionButton
                  type="button"
                  onClick={confirmEnrolment}
                  disabled={busy || code.trim().length < 6}
                >
                  <ShieldCheck aria-hidden="true" className="size-4" />
                  Confirmer l&apos;activation
                </ActionButton>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid max-w-md gap-4">
              <TextField
                label="Mot de passe actuel"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <ActionButton
                type="button"
                onClick={startEnrolment}
                disabled={busy || password === ""}
                className="justify-self-start"
              >
                <ShieldCheck aria-hidden="true" className="size-4" />
                Activer la double authentification
              </ActionButton>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 font-serif type-h3">
            <MonitorSmartphone aria-hidden="true" className="size-5" />
            Sessions
          </h2>
          <p className="mt-2 type-small text-muted-foreground">
            Chaque connexion ouvre une session révocable (CDC §4.3).
          </p>
          <ul className="mt-4 grid gap-2">
            {sessions.length === 0 && (
              <li className="type-small text-muted-foreground">
                Aucune session listée.
              </li>
            )}
            {sessions.map((session) => (
              <li
                key={session.id}
                className="rounded-md border border-border p-3 type-small"
              >
                <p className="font-medium">
                  {session.userAgent?.slice(0, 90) ?? "Appareil inconnu"}
                </p>
                <p className="text-muted-foreground">
                  Ouverte le{" "}
                  {formatDateTime(new Date(session.createdAt).getTime())}
                </p>
              </li>
            ))}
          </ul>
          <ActionButton
            type="button"
            variant="outline"
            onClick={revokeOthers}
            disabled={busy}
            className="mt-4"
          >
            Déconnecter tous les autres appareils
          </ActionButton>
        </section>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-muted">
      <div className="border-b border-border bg-background">
        <Container
          width="page"
          className="flex items-center justify-between py-3"
        >
          <BrandWordmark />
          <Link
            href="/"
            className="inline-flex items-center rounded-md px-3 type-small font-semibold text-muted-foreground touch-target hover:text-foreground"
          >
            Retour au journal
          </Link>
        </Container>
      </div>
      <main id="contenu" tabIndex={-1} className="focus-visible:outline-none">
        <Container width="page" className="py-8">
          <h1 className="mb-6 font-serif type-h1">Mon compte</h1>
          {children}
        </Container>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="type-small text-muted-foreground">{label}</dt>
      <dd className="type-body font-medium">{value}</dd>
    </div>
  );
}
