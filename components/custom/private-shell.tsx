"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ChartNoAxesColumn,
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Plus,
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
import { initialsOf, type Viewer } from "@/lib/viewer";
import { BrandWordmark } from "@/components/custom/brand-wordmark";
import { CloseButton } from "@/components/custom/close-button";
import { Container } from "@/components/custom/container";
import { Modal } from "@/components/custom/modal";
import { LocaleToggle } from "@/components/custom/locale-toggle";
import { NewContentDialog } from "@/components/custom/new-content-dialog";
import { SecurityReminder } from "@/components/custom/security-reminder";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { usePreferences } from "@/components/providers/preferences-provider";

type Area = "newsroom" | "portal";

type Counts = {
  inReview: number;
  submissionsWaiting: number;
  pendingSuggestions: number;
  organizationsWaiting: number;
};

type Entry = {
  href: string;
  label: string;
  labelEn?: string;
  /** Shorter label for the phone's tab bar. */
  short?: string;
  shortEn?: string;
  /** One line under the label, in the drawer: what the section is for. */
  hint: string;
  hintEn?: string;
  icon: LucideIcon;
  permission: string;
  exact?: boolean;
  /** The number shown next to the entry — what is waiting there. */
  badge?: (counts: Counts) => number;
};

type Group = { title: string; titleEn?: string; entries: Entry[] };

/**
 * The newsroom, grouped by what a person is trying to do — publish, review,
 * steer, administer — rather than by table. An Éditeur sees the first three
 * groups and nothing of the fourth; that is a courtesy of the shell, the
 * server refuses the same calls regardless (`convex/model/access.ts`).
 */
const NEWSROOM: Group[] = [
  {
    title: "Publier",
    entries: [
      {
        href: "/redaction",
        label: "Tableau de bord",
        short: "Accueil",
        hint: "Vos tâches du jour et l'état du journal",
        icon: LayoutDashboard,
        permission: "newsroom:access",
        exact: true,
      },
      {
        href: "/redaction/articles",
        label: "Articles",
        hint: "Écrire, relire, programmer, publier",
        icon: FileText,
        permission: "articles:read",
        badge: (counts) => counts.inReview,
      },
      {
        href: "/redaction/medias",
        label: "Médiathèque",
        short: "Images",
        hint: "Ajouter des images, légendes et crédits",
        icon: Images,
        permission: "media:write",
      },
    ],
  },
  {
    title: "Modérer",
    entries: [
      {
        href: "/redaction/depots",
        label: "Dépôts entreprises",
        short: "Dépôts",
        hint: "Actualités déposées par les partenaires",
        icon: Inbox,
        permission: "submissions:review",
        badge: (counts) => counts.submissionsWaiting,
      },
    ],
  },
  {
    title: "Piloter",
    entries: [
      {
        href: "/redaction/agents",
        label: "Agents",
        hint: "La veille de l'actualité, les assistants et leurs propositions",
        icon: Sparkles,
        permission: "agents:run",
        badge: (counts) => counts.pendingSuggestions,
      },
      {
        href: "/redaction/statistiques",
        label: "Statistiques",
        short: "Stats",
        hint: "Audience du journal, article par article",
        icon: ChartNoAxesColumn,
        permission: "stats:read:all",
      },
    ],
  },
  {
    title: "Administrer",
    entries: [
      {
        href: "/redaction/rubriques",
        label: "Rubriques",
        hint: "Arborescence et couleurs des rubriques",
        icon: Tags,
        permission: "categories:write",
      },
      {
        href: "/redaction/comptes",
        label: "Comptes",
        hint: "Rédaction et entreprises partenaires",
        icon: UserCog,
        permission: "accounts:manage",
        badge: (counts) => counts.organizationsWaiting,
      },
      {
        href: "/redaction/publicites",
        label: "Publicités",
        hint: "Affiches, emplacements et calendrier de diffusion",
        icon: Megaphone,
        permission: "settings:manage",
      },
      {
        href: "/redaction/reglages",
        label: "Réglages",
        hint: "Identité, sécurité, newsletter, agents",
        icon: Settings,
        permission: "settings:manage",
      },
      {
        href: "/redaction/journal",
        label: "Journal d'audit",
        short: "Audit",
        hint: "Toute action sensible, horodatée",
        icon: ScrollText,
        permission: "audit:read",
      },
    ],
  },
];

const PORTAL: Group[] = [
  {
    title: "Espace entreprise",
    titleEn: "Company workspace",
    entries: [
      {
        href: "/entreprise",
        label: "Mes dépôts",
        labelEn: "My submissions",
        short: "Dépôts",
        shortEn: "Submissions",
        hint: "Vos actualités et leur statut",
        hintEn: "Your news and its status",
        icon: Building2,
        permission: "portal:access",
        exact: true,
      },
      {
        href: "/entreprise/statistiques",
        label: "Statistiques",
        labelEn: "Analytics",
        short: "Stats",
        shortEn: "Analytics",
        hint: "Audience de vos publications",
        hintEn: "Audience for your publications",
        icon: ChartNoAxesColumn,
        permission: "stats:read:own",
      },
    ],
  },
];

const ACCOUNT: Record<Area, Entry> = {
  newsroom: {
    href: "/redaction/compte",
    label: "Mon compte",
    short: "Compte",
    hint: "Profil, code d'accès, appareils connectés",
    icon: UserRound,
    permission: "newsroom:access",
  },
  portal: {
    href: "/compte",
    label: "Mon compte",
    labelEn: "My account",
    short: "Compte",
    shortEn: "Account",
    hint: "Profil, mot de passe, appareils connectés",
    hintEn: "Profile, password and connected devices",
    icon: UserRound,
    permission: "portal:access",
  },
};

const AREA_LABEL: Record<Area, string> = {
  newsroom: "Back-office rédaction",
  portal: "Espace entreprise",
};

/**
 * Chrome of the private areas — CDC §4.4, recomposed on 12/09/2026.
 *
 * Three ways in, one navigation. On a desk the sections live in a **card
 * detached from the page** — sticky, its own border and shadow, the
 * "Nouveau" button at the top and the account at the bottom. On a phone or
 * a tablet the same entries become a **tab bar** along the bottom edge (the
 * four most used) plus a drawer for everything else; nothing is more than
 * one tap away, and the thumb never has to reach the top of the screen.
 *
 * The entries are filtered by the permissions the **server** reported, so
 * an Éditeur simply has no "Comptes" or "Réglages" entry. That is a
 * courtesy, not a control: the Convex functions refuse the same calls
 * anyway. The little numbers come from `newsroom.navCounts` and say what is
 * waiting where — the shell's only job beyond getting out of the way.
 */
export function PrivateShell({
  area,
  children,
}: {
  area: Area;
  children: React.ReactNode;
}) {
  // La requête n'est émise qu'une fois le jeton de session posé sur le
  // client Convex : sinon elle part non authentifiée et la navigation
  // clignote à vide au premier rendu.
  const { isAuthenticated } = useConvexAuth();
  const { locale } = usePreferences();
  const english = area === "portal" && locale === "en";
  const viewer = useQuery(api.accounts.me, isAuthenticated ? {} : "skip");
  const permissions = (viewer?.permissions ?? []) as readonly string[];
  const counts = useQuery(
    api.newsroom.navCounts,
    area === "newsroom" && permissions.includes("newsroom:access") ? {} : "skip"
  );
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [creating, setCreating] = useState(false);

  const groups = (area === "newsroom" ? NEWSROOM : PORTAL)
    .map((group) => ({
      ...group,
      title: english && group.titleEn ? group.titleEn : group.title,
      entries: group.entries
        .filter((entry) => permissions.includes(entry.permission))
        .map((entry) => ({
          ...entry,
          label: english && entry.labelEn ? entry.labelEn : entry.label,
          short: english && entry.shortEn ? entry.shortEn : entry.short,
          hint: english && entry.hintEn ? entry.hintEn : entry.hint,
        })),
    }))
    .filter((group) => group.entries.length > 0);
  const rawAccount = ACCOUNT[area];
  const account = {
    ...rawAccount,
    label:
      english && rawAccount.labelEn ? rawAccount.labelEn : rawAccount.label,
    short:
      english && rawAccount.shortEn ? rawAccount.shortEn : rawAccount.short,
    hint: english && rawAccount.hintEn ? rawAccount.hintEn : rawAccount.hint,
  };
  const areaLabel = english ? "Company workspace" : AREA_LABEL[area];
  const showAccount = permissions.includes(account.permission);
  const canCreate =
    area === "newsroom" && permissions.includes("articles:write");
  const entries = groups.flatMap((group) => group.entries);
  const tabs = entries.slice(0, canCreate ? 3 : 4);
  const mobileActions = canCreate
    ? [...tabs.slice(0, 2), "create" as const, ...tabs.slice(2)]
    : tabs;
  const menuActive =
    !tabs.some(isActive) &&
    (entries.some(isActive) || (showAccount && isActive(account)));

  function isActive(entry: Entry) {
    return (
      pathname === entry.href ||
      (!entry.exact && pathname.startsWith(`${entry.href}/`))
    );
  }

  const signOut = async () => {
    await authClient.signOut();
    router.replace("/connexion");
    router.refresh();
  };

  const closeDrawer = () => setDrawer(false);
  const openCreate = () => {
    setDrawer(false);
    setCreating(true);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted">
      <header className="z-30 border-b border-border bg-background pt-[env(safe-area-inset-top)] lg:sticky lg:top-0">
        <Container
          width="wide"
          className="flex items-center gap-2 py-2 sm:gap-3"
        >
          <BrandWordmark
            href={area === "newsroom" ? "/redaction" : "/entreprise"}
            className="w-28 shrink-0 sm:w-44 lg:w-56"
          />
          <span
            aria-hidden="true"
            className="hidden h-6 w-px bg-border lg:block"
          />
          <p className="hidden type-small font-semibold whitespace-nowrap text-muted-foreground lg:block">
            {areaLabel}
          </p>
          <div className="ms-auto flex items-center gap-2">
            <ThemeToggle compact />
            {area === "portal" && <LocaleToggle />}
            {showAccount && (
              <Link
                href={account.href}
                aria-current={isActive(account) ? "page" : undefined}
                aria-label={account.label}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-2 type-small font-semibold transition-colors touch-target sm:px-3",
                  isActive(account)
                    ? "border-foreground/40 bg-surface-muted"
                    : "border-border hover:bg-surface-muted"
                )}
              >
                <Avatar name={viewer?.name} />
                <span className="hidden max-w-40 truncate md:inline">
                  {viewer?.name ?? (english ? "My account" : "Mon compte")}
                </span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => void signOut()}
              className="hidden items-center gap-2 rounded-md border border-border px-2 type-small font-semibold transition-colors touch-target hover:bg-surface-muted sm:inline-flex sm:px-3"
            >
              <LogOut aria-hidden="true" className="size-4" />
              <span className="sr-only md:not-sr-only">
                {english ? "Sign out" : "Déconnexion"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-expanded={drawer}
              aria-haspopup="dialog"
              className={cn(
                "inline-flex items-center justify-center rounded-md border border-border text-foreground transition-colors touch-target hover:bg-surface-muted lg:hidden",
                tabs.length > 0 && "hidden"
              )}
            >
              <Menu aria-hidden="true" className="size-5" />
              <span className="sr-only">
                {english ? "Open menu" : "Ouvrir le menu"}
              </span>
            </button>
          </div>
        </Container>
      </header>

      {/* Pas d'`items-start` : la colonne du menu doit occuper toute la
          hauteur de la rangée pour que la carte collante ait où voyager. */}
      <Container
        width="wide"
        className="flex flex-1 gap-6 py-4 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:py-8"
      >
        {/* Le menu, détaché de la page : une carte collante à sa hauteur. */}
        <aside className="hidden lg:block lg:w-64 lg:shrink-0 xl:w-72">
          <div className="sticky top-20 flex max-h-[calc(100dvh-6rem)] flex-col overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-floating">
            {canCreate && (
              <button
                type="button"
                onClick={openCreate}
                className="mb-3 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-opacity touch-target hover:opacity-90"
              >
                <Plus aria-hidden="true" className="size-4" />
                Nouveau contenu
              </button>
            )}
            <NavList
              groups={groups}
              counts={counts}
              isActive={isActive}
              label={
                area === "newsroom"
                  ? "Sections du back-office"
                  : english
                    ? "Company workspace sections"
                    : "Sections de l'espace entreprise"
              }
            />
            {viewer && showAccount && (
              <div className="mt-3 border-t border-border pt-3">
                <AccountLink
                  viewer={viewer}
                  entry={account}
                  active={isActive(account)}
                />
              </div>
            )}
          </div>
        </aside>

        <main
          id="contenu"
          tabIndex={-1}
          className="min-w-0 flex-1 [overflow-wrap:anywhere] focus-visible:outline-none"
        >
          {children}
        </main>
      </Container>

      {tabs.length > 0 && (
        <nav
          aria-label={english ? "Quick navigation" : "Navigation rapide"}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background ps-[env(safe-area-inset-left)] pe-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          <ul
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${mobileActions.length + 1}, minmax(0, 1fr))`,
            }}
          >
            {mobileActions.map((entry) => {
              if (entry === "create") {
                return (
                  <li key={entry}>
                    <button
                      type="button"
                      onClick={openCreate}
                      aria-label="Nouveau contenu"
                      aria-haspopup="dialog"
                      className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] leading-tight font-bold text-primary"
                    >
                      <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Plus aria-hidden="true" className="size-4" />
                      </span>
                      Nouveau
                    </button>
                  </li>
                );
              }
              const Icon = entry.icon;
              const active = isActive(entry);
              const badge = counts && entry.badge ? entry.badge(counts) : 0;
              return (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] leading-tight font-semibold transition-colors",
                      active
                        ? "bg-accent-surface text-accent"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="relative">
                      <Icon aria-hidden="true" className="size-5" />
                      {badge > 0 && <Badge count={badge} floating />}
                    </span>
                    <span>{entry.short ?? entry.label}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={() => setDrawer(true)}
                aria-expanded={drawer}
                aria-haspopup="dialog"
                className={cn(
                  "flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 text-[11px] leading-tight font-semibold transition-colors hover:text-foreground",
                  menuActive
                    ? "bg-accent-surface text-accent"
                    : "text-muted-foreground"
                )}
              >
                <Menu aria-hidden="true" className="size-5" />
                <span>Menu</span>
              </button>
            </li>
          </ul>
        </nav>
      )}

      <Modal
        open={drawer}
        onClose={closeDrawer}
        label="Menu"
        variant="drawer"
        className="pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-popover p-4">
          <div className="min-w-0">
            <p className="font-display type-h3">Menu</p>
            <p className="type-small text-muted-foreground">{areaLabel}</p>
          </div>
          <CloseButton onClick={closeDrawer} />
        </div>
        <div className="p-3">
          {canCreate && (
            <button
              type="button"
              onClick={openCreate}
              className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground touch-target"
            >
              <Plus aria-hidden="true" className="size-4" />
              Nouveau contenu
            </button>
          )}
          <NavList
            groups={groups}
            counts={counts}
            isActive={isActive}
            onNavigate={closeDrawer}
            withHints
            label={
              area === "newsroom"
                ? "Sections du back-office"
                : english
                  ? "Company workspace sections"
                  : "Sections de l'espace entreprise"
            }
          />
        </div>
        <div className="mt-auto grid gap-3 border-t border-border p-4">
          {viewer && showAccount && (
            <AccountLink
              viewer={viewer}
              entry={account}
              active={isActive(account)}
              onNavigate={closeDrawer}
            />
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 type-small font-semibold touch-target hover:bg-surface-muted"
            >
              <LogOut aria-hidden="true" className="size-4" />
              {english ? "Sign out" : "Déconnexion"}
            </button>
          </div>
        </div>
      </Modal>

      {canCreate && (
        <NewContentDialog
          open={creating}
          onClose={() => setCreating(false)}
          defaultAuthorSlug={viewer?.authorSlug}
        />
      )}

      {viewer && <SecurityReminder viewer={viewer} />}
    </div>
  );
}

function NavList({
  groups,
  counts,
  isActive,
  onNavigate,
  withHints = false,
  label,
}: {
  groups: Group[];
  counts: Counts | undefined;
  isActive: (entry: Entry) => boolean;
  onNavigate?: () => void;
  withHints?: boolean;
  label: string;
}) {
  return (
    <nav aria-label={label} className="grid gap-3">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-1 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {group.title}
          </p>
          <ul className="grid gap-0.5">
            {group.entries.map((entry) => {
              const Icon = entry.icon;
              const active = isActive(entry);
              const badge = counts && entry.badge ? entry.badge(counts) : 0;
              return (
                <li key={entry.href}>
                  <Link
                    href={entry.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={withHints ? undefined : entry.hint}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-md px-3 py-1.5 type-small font-semibold transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-surface-muted"
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{entry.label}</span>
                      {withHints && (
                        <span
                          className={cn(
                            "block truncate font-normal",
                            active
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          )}
                        >
                          {entry.hint}
                        </span>
                      )}
                    </span>
                    {badge > 0 && <Badge count={badge} inverted={active} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function AccountLink({
  viewer,
  entry,
  active,
  onNavigate,
}: {
  viewer: Viewer;
  entry: Entry;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={entry.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md p-2 transition-colors",
        active ? "bg-surface-muted" : "hover:bg-surface-muted"
      )}
    >
      <Avatar name={viewer.name} size="large" />
      <span className="min-w-0 flex-1">
        <span className="block truncate type-small font-semibold">
          {viewer.name}
        </span>
        <span className="block truncate type-small text-muted-foreground">
          {viewer.roleName}
        </span>
      </span>
      <UserRound
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
    </Link>
  );
}

function Avatar({
  name,
  size = "small",
}: {
  name: string | undefined;
  size?: "small" | "large";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-display font-bold text-primary-foreground",
        size === "large" ? "size-9 type-small" : "size-7 text-[11px]"
      )}
    >
      {name ? initialsOf(name) : <UserRound className="size-4" />}
    </span>
  );
}

function Badge({
  count,
  inverted = false,
  floating = false,
}: {
  count: number;
  inverted?: boolean;
  floating?: boolean;
}) {
  const { locale } = usePreferences();
  // `newsroom.navCounts` stops counting at 100: past 99, the exact figure is
  // neither shown nor known.
  const many = count > 99;
  return (
    <span
      aria-label={
        locale === "en"
          ? many
            ? "More than 99 pending"
            : `${count} pending`
          : many
            ? "Plus de 99 en attente"
            : `${count} en attente`
      }
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] leading-5 font-bold tabular-nums",
        inverted
          ? "bg-primary-foreground text-primary"
          : "bg-accent text-accent-foreground",
        floating && "absolute -top-1.5 -right-2.5"
      )}
    >
      {many ? "99+" : count}
    </span>
  );
}
