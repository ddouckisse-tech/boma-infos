"use client";

import { useState } from "react";
import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  PenLine,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  NewContentDialog,
  type NewContentKind,
} from "@/components/custom/new-content-dialog";
import { OfficeHeader } from "@/components/custom/office-header";
import { StatsTile } from "@/components/custom/stats-tile";
import { StatusPill } from "@/components/custom/status-pill";
import { formatDateTime, formatNumber } from "@/lib/private";
import { cn } from "@/lib/utils";
import { firstNameOf } from "@/lib/viewer";

const today = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

type Task = {
  icon: LucideIcon;
  label: string;
  detail?: string;
  href: string;
  tone: "warning" | "info" | "neutral";
};

type QuickAction = {
  icon: LucideIcon;
  label: string;
  hint: string;
} & ({ href: string } | { kind: NewContentKind });

const plural = (n: number, one: string, many: string) =>
  `${formatNumber(n)} ${n > 1 ? many : one}`;

/**
 * Newsroom dashboard — CDC §4.4, task-first since 12/09/2026.
 *
 * The first thing on the screen is what needs doing, as a list of
 * sentences that lead where the work is: deposits to review, pieces
 * waiting for a second read, proposals from the agents, companies to
 * validate, pictures without alternative text, no lead article. Then the
 * three things the newsroom posts, one tap each. The figures and the
 * audience come after — they are context, not tasks.
 */
export default function NewsroomDashboard() {
  const { isAuthenticated } = useConvexAuth();
  const viewer = useQuery(api.accounts.me, isAuthenticated ? {} : "skip");
  const data = useQuery(api.newsroom.dashboard, {});
  const [creating, setCreating] = useState<NewContentKind | null>(null);

  const permissions = (viewer?.permissions ?? []) as readonly string[];
  const can = (permission: string) => permissions.includes(permission);
  const canWrite = can("articles:write");

  const header = (
    <OfficeHeader
      icon={LayoutDashboard}
      eyebrow={today.format(new Date())}
      title={viewer ? `Bonjour ${firstNameOf(viewer.name)}` : "Tableau de bord"}
      description="Voici où en est le journal, et ce qui vous attend."
      actions={
        canWrite && (
          <button
            type="button"
            onClick={() => setCreating("article")}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-opacity touch-target hover:opacity-90"
          >
            <Plus aria-hidden="true" className="size-4" />
            Nouveau contenu
          </button>
        )
      }
    />
  );

  if (data === undefined) {
    return (
      <>
        {header}
        <p className="type-body text-muted-foreground" role="status">
          Chargement…
        </p>
      </>
    );
  }

  const tasks: Task[] = [];
  if (can("submissions:review") && data.submissionsWaiting > 0) {
    tasks.push({
      icon: Inbox,
      label: `${plural(data.submissionsWaiting, "dépôt d'entreprise", "dépôts d'entreprises")} à traiter`,
      detail: "Accepter, demander des modifications ou refuser.",
      href: "/redaction/depots",
      tone: "warning",
    });
  }
  if (data.counts.inReview > 0) {
    tasks.push({
      icon: FileText,
      label: `${plural(data.counts.inReview, "article", "articles")} en attente de relecture`,
      detail: "Soumis par la rédaction, à relire avant publication.",
      href: "/redaction/articles?statut=in_review",
      tone: "warning",
    });
  }
  if (can("agents:run") && data.tasks.pendingSuggestions > 0) {
    tasks.push({
      icon: Sparkles,
      label: `${plural(data.tasks.pendingSuggestions, "proposition d'agent", "propositions d'agents")} à trancher`,
      detail: "Un agent propose, vous disposez.",
      href: "/redaction/agents",
      tone: "info",
    });
  }
  if (can("accounts:manage") && data.organizationsWaiting > 0) {
    tasks.push({
      icon: Building2,
      label: `${plural(data.organizationsWaiting, "entreprise", "entreprises")} en attente de validation`,
      detail: "Ouvrir leur espace de dépôt, ou refuser.",
      href: "/redaction/comptes",
      tone: "warning",
    });
  }
  if (can("media:write") && data.tasks.mediaMissingAlt > 0) {
    tasks.push({
      icon: Images,
      label: `${plural(data.tasks.mediaMissingAlt, "image", "images")} sans texte alternatif`,
      detail: "Obligatoire avant de placer l'image dans un article.",
      href: "/redaction/medias?filtre=sans-alt",
      tone: "info",
    });
  }
  if (canWrite && !data.tasks.hasLead) {
    tasks.push({
      icon: Star,
      label: "Aucun article en « une principale »",
      detail: "Choisissez-le dans « Mise en avant », au bas de l'article.",
      href: "/redaction/articles?statut=published",
      tone: "info",
    });
  }
  if (data.counts.scheduled > 0) {
    tasks.push({
      icon: CalendarClock,
      label: `${plural(data.counts.scheduled, "article programmé", "articles programmés")}`,
      detail: "Ils paraîtront seuls, à la date prévue.",
      href: "/redaction/articles?statut=scheduled",
      tone: "neutral",
    });
  }

  const actions: QuickAction[] = [];
  if (canWrite) {
    actions.push({
      icon: FileText,
      label: "Écrire un article",
      hint: "Un brouillon s'ouvre tout de suite.",
      kind: "article",
    });
    actions.push({
      icon: PenLine,
      label: "Écrire un éditorial",
      hint: "Dans la rubrique Éditorial.",
      kind: "editorial",
    });
  }
  if (can("media:write")) {
    actions.push({
      icon: Images,
      label: "Ajouter des images",
      hint: "Depuis votre téléphone ou votre ordinateur.",
      href: "/redaction/medias?ajouter=1",
    });
  }
  if (can("submissions:review")) {
    actions.push({
      icon: Inbox,
      label: "Relire les dépôts",
      hint: "Les actualités des partenaires.",
      href: "/redaction/depots",
    });
  }

  return (
    <>
      {header}

      <section aria-labelledby="a-faire">
        <h2 id="a-faire" className="font-display type-h2">
          À faire
        </h2>
        {tasks.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-success-token/40 bg-success-token/10 p-4 type-body">
            <CheckCircle2
              aria-hidden="true"
              className="size-5 shrink-0 text-success-token"
            />
            Rien en attente : tout est à jour.
          </p>
        ) : (
          <ol className="mt-3 grid gap-2">
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <li key={task.label}>
                  <Link
                    href={task.href}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/40 sm:p-4"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "inline-flex size-10 shrink-0 items-center justify-center rounded-full",
                        task.tone === "warning"
                          ? "bg-warning-token/15 text-warning-token"
                          : task.tone === "info"
                            ? "bg-accent-surface text-accent"
                            : "bg-surface-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block type-body font-semibold">
                        {task.label}
                      </span>
                      {task.detail && (
                        <span className="block type-small text-muted-foreground">
                          {task.detail}
                        </span>
                      )}
                    </span>
                    <ChevronRight
                      aria-hidden="true"
                      className="size-5 shrink-0 text-muted-foreground"
                    />
                  </Link>
                </li>
              );
            })}
          </ol>
        )}

        {data.tasks.awaitingReview.length > 0 && (
          <ul className="mt-3 grid gap-2 ps-0 sm:ps-13">
            {data.tasks.awaitingReview.map((row) => (
              <li key={row._id}>
                <Link
                  href={`/redaction/articles/${row._id}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 type-small transition-colors hover:border-foreground/40"
                >
                  <span className="min-w-0 truncate font-medium">
                    {row.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                    {row.authorName}
                    <StatusPill status={row.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {actions.length > 0 && (
        <section aria-labelledby="publier" className="mt-8">
          <h2 id="publier" className="font-display type-h2">
            Publier
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {actions.map((action) => {
              const Icon = action.icon;
              const body = (
                <>
                  <span
                    aria-hidden="true"
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block type-body font-semibold">
                      {action.label}
                    </span>
                    <span className="block type-small text-muted-foreground">
                      {action.hint}
                    </span>
                  </span>
                </>
              );
              const className =
                "flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-start transition-colors hover:border-foreground/40";
              return (
                <li key={action.label}>
                  {"href" in action ? (
                    <Link href={action.href} className={className}>
                      {body}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCreating(action.kind)}
                      className={className}
                    >
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="etat" className="mt-8">
        <h2 id="etat" className="font-display type-h2">
          Le journal en chiffres
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatsTile label="Brouillons" value={data.counts.draft} />
          <StatsTile
            label="En relecture"
            value={data.counts.inReview}
            tone={data.counts.inReview > 0 ? "warning" : "default"}
          />
          <StatsTile label="Programmés" value={data.counts.scheduled} />
          <StatsTile
            label="Publiés"
            value={data.counts.published}
            tone="success"
          />
        </div>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="recents" className="min-w-0">
          <div className="flex items-end justify-between gap-3">
            <h2 id="recents" className="font-display type-h2">
              Derniers articles
            </h2>
            <Link
              href="/redaction/articles"
              className="type-small font-semibold text-accent underline-offset-2 hover:underline"
            >
              Tous les articles
            </Link>
          </div>
          {data.recent.length === 0 ? (
            <p className="mt-3 type-body text-muted-foreground">
              Aucun article pour l&apos;instant.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {data.recent.map((row) => (
                <li key={row._id}>
                  <Link
                    href={`/redaction/articles/${row._id}`}
                    className="block rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="type-body font-medium">{row.title}</p>
                        <p className="mt-0.5 type-small text-muted-foreground">
                          {row.categoryName} · {row.authorName} · modifié le{" "}
                          {formatDateTime(row.updatedAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {row.pendingSuggestions > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-xs border border-border px-1.5 py-0.5 type-small text-muted-foreground">
                            <Sparkles aria-hidden="true" className="size-3" />
                            {row.pendingSuggestions}
                          </span>
                        )}
                        <StatusPill status={row.status} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="audience" className="min-w-0">
          <h2 id="audience" className="font-display type-h2">
            Audience
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-1">
            <StatsTile
              label="Vues — 7 derniers jours"
              value={formatNumber(data.audience.views7d)}
            />
            <StatsTile
              label="Vues — 30 derniers jours"
              value={formatNumber(data.audience.views30d)}
            />
          </div>
          <h3 className="mt-5 font-display type-h3">Les plus lus</h3>
          {data.audience.topArticles.length === 0 ? (
            <p className="mt-2 type-small text-muted-foreground">
              Aucune vue enregistrée. Les compteurs se remplissent à la première
              visite d&apos;un article publié.
            </p>
          ) : (
            <ol className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-1">
              {data.audience.topArticles.map((item) => (
                <li
                  key={item.slug}
                  className="flex items-baseline justify-between gap-3 type-small"
                >
                  <span className="min-w-0 truncate">{item.title}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {formatNumber(item.views)}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <Link
            href="/redaction/statistiques"
            className="mt-4 inline-flex items-center rounded-md border border-border px-3 type-small font-semibold touch-target hover:bg-surface-muted"
          >
            Toutes les statistiques
          </Link>
        </section>
      </div>

      {canWrite && (
        <NewContentDialog
          open={creating !== null}
          kind={creating ?? "article"}
          onClose={() => setCreating(null)}
          defaultAuthorSlug={viewer?.authorSlug}
        />
      )}
    </>
  );
}
