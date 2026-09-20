"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ActionButton } from "@/components/custom/action-button";
import { usePreferences } from "@/components/providers/preferences-provider";
import { authClient } from "@/lib/auth-client";
import { localeDate, localize } from "@/lib/i18n";
import type { LocaleChoice } from "@/lib/preferences";

type Session = {
  id: string;
  token: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  userAgent?: string | null;
  ipAddress?: string | null;
};

/** Where the account is signed in, and the one button that closes the others (§4.3). */
export function SessionsPanel({ active }: { active: boolean }) {
  const { locale } = usePreferences();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState(false);

  // La liste vient de Better Auth, pas de Convex : c'est le seul endroit des
  // espaces privés qui parle à un système extérieur, donc le seul qui
  // mérite un effet.
  useEffect(() => {
    if (!active) return;
    let alive = true;
    void (async () => {
      try {
        const result = await authClient.listSessions();
        if (alive) setSessions((result.data ?? []) as unknown as Session[]);
      } catch {
        if (alive) setSessions([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [active, tick]);

  const revokeOthers = async () => {
    setBusy(true);
    try {
      await authClient.revokeOtherSessions();
      toast.success(
        localize(locale, {
          fr: "Les autres appareils ont été déconnectés.",
          en: "Your other devices have been signed out.",
        })
      );
      setTick((n) => n + 1);
    } catch {
      toast.error(
        localize(locale, {
          fr: "La révocation n'a pas abouti.",
          en: "The sessions could not be revoked.",
        })
      );
    }
    setBusy(false);
  };

  return (
    <div className="grid gap-4">
      <ul className="grid gap-2">
        {sessions.length === 0 && (
          <li className="type-small text-muted-foreground">
            {localize(locale, {
              fr: "Aucun appareil listé.",
              en: "No devices listed.",
            })}
          </li>
        )}
        {sessions.map((session) => (
          <li
            key={session.id}
            className="rounded-md border border-border p-3 type-small"
          >
            <p className="font-medium">{describe(session.userAgent, locale)}</p>
            <p className="text-muted-foreground">
              {localize(locale, { fr: "Connecté le ", en: "Signed in on " })}
              {localeDate(session.createdAt, locale, {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </li>
        ))}
      </ul>
      <ActionButton
        type="button"
        variant="outline"
        onClick={() => void revokeOthers()}
        disabled={busy}
        className="justify-self-start"
      >
        {localize(locale, {
          fr: "Déconnecter tous les autres appareils",
          en: "Sign out all other devices",
        })}
      </ActionButton>
    </div>
  );
}

/** `Mozilla/5.0 (iPhone; …) … Safari/604.1` → « iPhone · Safari ». */
function describe(
  userAgent: string | null | undefined,
  locale: LocaleChoice
): string {
  if (!userAgent)
    return localize(locale, { fr: "Appareil inconnu", en: "Unknown device" });
  const device = /iPhone/.test(userAgent)
    ? "iPhone"
    : /iPad/.test(userAgent)
      ? "iPad"
      : /Android/.test(userAgent)
        ? "Android"
        : /Macintosh/.test(userAgent)
          ? "Mac"
          : /Windows/.test(userAgent)
            ? "Windows"
            : /Linux/.test(userAgent)
              ? "Linux"
              : localize(locale, { fr: "Appareil", en: "Device" });
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : localize(locale, { fr: "navigateur", en: "browser" });
  return `${device} · ${browser}`;
}
