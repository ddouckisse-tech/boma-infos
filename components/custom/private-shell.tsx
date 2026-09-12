"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Building2,
  ChartNoAxesColumn,
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Settings,
  Sparkles,
  Tags,
  UserCog,
  UserRound,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { BrandWordmark } from "@/components/custom/brand-wordmark";
import { Container } from "@/components/custom/container";
import { ThemeToggle } from "@/components/custom/theme-toggle";

type Entry = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: string;
  exact?: boolean;
};

const NEWSROOM: Entry[] = [
  {
    href: "/redaction",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    permission: "newsroom:access",
    exact: true,
  },
  {
    href: "/redaction/articles",
    label: "Articles",
    icon: FileText,
    permission: "articles:read",
  },
  {
    href: "/redaction/depots",
    label: "Dépôts entreprises",
    icon: Inbox,
    permission: "submissions:review",
  },
  {
    href: "/redaction/medias",
    label: "Médiathèque",
    icon: Images,
    permission: "media:write",
  },
  {
    href: "/redaction/agents",
    label: "Agents",
    icon: Sparkles,
    permission: "agents:run",
  },
  {
    href: "/redaction/statistiques",
    label: "Statistiques",
    icon: ChartNoAxesColumn,
    permission: "stats:read:all",
  },
  {
    href: "/redaction/rubriques",
    label: "Rubriques",
    icon: Tags,
    permission: "categories:write",
  },
  {
    href: "/redaction/comptes",
    label: "Comptes",
    icon: UserCog,
    permission: "accounts:manage",
  },
  {
    href: "/redaction/reglages",
    label: "Réglages",
    icon: Settings,
    permission: "settings:manage",
  },
  {
    href: "/redaction/journal",
    label: "Journal d'audit",
    icon: ScrollText,
    permission: "audit:read",
  },
];

const PORTAL: Entry[] = [
  {
    href: "/entreprise",
    label: "Mes dépôts",
    icon: Building2,
    permission: "portal:access",
    exact: true,
  },
  {
    href: "/entreprise/statistiques",
    label: "Statistiques",
    icon: ChartNoAxesColumn,
    permission: "stats:read:own",
  },
];

/**
 * Chrome of the private areas — CDC §4.4.
 *
 * The navigation is filtered by the permissions the **server** reported, so
 * an Éditeur simply has no "Comptes" or "Réglages" entry. That is a
 * courtesy, not a control: the corresponding Convex functions refuse the
 * same call anyway (`convex/model/access.ts`). Hiding a menu has never
 * stopped anybody.
 */
export function PrivateShell({
  area,
  children,
}: {
  area: "newsroom" | "portal";
  children: React.ReactNode;
}) {
  // La requête n'est émise qu'une fois le jeton de session posé sur le
  // client Convex : sinon elle part non authentifiée et la navigation
  // clignote à vide au premier rendu.
  const { isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.accounts.me, isAuthenticated ? {} : "skip");
  const pathname = usePathname();
  const router = useRouter();

  const entries = (area === "newsroom" ? NEWSROOM : PORTAL).filter((entry) =>
    (viewer?.permissions as readonly string[] | undefined)?.includes(
      entry.permission
    )
  );

  const signOut = async () => {
    await authClient.signOut();
    router.replace("/connexion");
    router.refresh();
  };

  const twoFactorOwed = Boolean(
    viewer && viewer.twoFactorRequired && !viewer.twoFactorEnabled
  );

  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted">
      <header className="border-b border-border bg-background">
        <Container
          width="wide"
          className="flex flex-wrap items-center gap-4 py-3"
        >
          <BrandWordmark />
          <span
            aria-hidden="true"
            className="hidden h-6 w-px bg-border sm:block"
          />
          <p className="type-small font-semibold text-muted-foreground">
            {area === "newsroom"
              ? "Back-office rédaction"
              : "Espace entreprise"}
          </p>
          <div className="ms-auto flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/compte"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 type-small font-semibold transition-colors touch-target hover:bg-surface-muted"
            >
              <UserRound aria-hidden="true" className="size-4" />
              <span className="max-w-40 truncate">
                {viewer?.name ?? "Mon compte"}
              </span>
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 type-small font-semibold transition-colors touch-target hover:bg-surface-muted"
            >
              <LogOut aria-hidden="true" className="size-4" />
              <span className="sr-only sm:not-sr-only">Déconnexion</span>
            </button>
          </div>
        </Container>
      </header>

      {twoFactorOwed && (
        <div className="border-b border-warning-token/40 bg-warning-token/10">
          <Container
            width="wide"
            className="flex flex-wrap items-center gap-3 py-3"
          >
            <AlertTriangle
              aria-hidden="true"
              className="size-5 shrink-0 text-warning-token"
            />
            <p className="type-small text-foreground">
              La double authentification est obligatoire pour votre rôle. Tant
              qu&apos;elle n&apos;est pas activée, le serveur refuse toute
              action.
            </p>
            <Link
              href="/compte"
              className="ms-auto inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground touch-target"
            >
              Activer maintenant
            </Link>
          </Container>
        </div>
      )}

      <Container
        width="wide"
        className="flex flex-1 flex-col gap-6 py-6 lg:flex-row"
      >
        <nav
          aria-label={
            area === "newsroom"
              ? "Sections du back-office"
              : "Sections de l'espace entreprise"
          }
          className="lg:w-60 lg:shrink-0"
        >
          <ul className="flex flex-wrap gap-1 lg:flex-col">
            {entries.map((entry) => {
              const active = entry.exact
                ? pathname === entry.href
                : pathname.startsWith(entry.href);
              const Icon = entry.icon;
              return (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex w-full items-center gap-2 rounded-md px-3 type-small font-semibold transition-colors touch-target",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    {entry.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <main
          id="contenu"
          tabIndex={-1}
          className="min-w-0 flex-1 focus-visible:outline-none"
        >
          {children}
        </main>
      </Container>
    </div>
  );
}
