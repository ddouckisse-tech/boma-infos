"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ActionButton } from "@/components/custom/action-button";
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

/** Where the account is signed in, and the one button that closes the others (§4.3). */
export function SessionsPanel({ active }: { active: boolean }) {
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
      toast.success("Les autres appareils ont été déconnectés.");
      setTick((n) => n + 1);
    } catch {
      toast.error("La révocation n'a pas abouti.");
    }
    setBusy(false);
  };

  return (
    <div className="grid gap-4">
      <ul className="grid gap-2">
        {sessions.length === 0 && (
          <li className="type-small text-muted-foreground">
            Aucun appareil listé.
          </li>
        )}
        {sessions.map((session) => (
          <li
            key={session.id}
            className="rounded-md border border-border p-3 type-small"
          >
            <p className="font-medium">{describe(session.userAgent)}</p>
            <p className="text-muted-foreground">
              Connecté le{" "}
              {formatDateTime(new Date(session.createdAt).getTime())}
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
        Déconnecter tous les autres appareils
      </ActionButton>
    </div>
  );
}

/** `Mozilla/5.0 (iPhone; …) … Safari/604.1` → « iPhone · Safari ». */
function describe(userAgent: string | null | undefined): string {
  if (!userAgent) return "Appareil inconnu";
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
              : "Appareil";
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
            : "navigateur";
  return `${device} · ${browser}`;
}
