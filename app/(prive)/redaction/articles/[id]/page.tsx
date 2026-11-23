"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  Eye,
  ExternalLink,
  History,
  Save,
  Send,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Block } from "@/convex/model/content";
import { ActionButton } from "@/components/custom/action-button";
import { AgentSuggestionCard } from "@/components/custom/agent-suggestion-card";
import { ArticlePreview } from "@/components/custom/article-preview";
import { Editor } from "@/components/custom/editor";
import {
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/custom/form-field";
import { MediaPicker } from "@/components/custom/media-picker";
import { PartnerTag } from "@/components/custom/partner-tag";
import { StatusPill } from "@/components/custom/status-pill";
import { formatDateTime, humanError } from "@/lib/private";

const AUTOSAVE_MS = 4000;

type AgentKey =
  | "relecture"
  | "titraille"
  | "seo"
  | "media"
  | "moderation"
  | "diffusion"
  | "transcription";

/** Agents an editor can fire from this screen. Agent 4 lives in the media
 *  library, agent 5 in the deposits queue, agent 6 runs at publication. */
const EDITOR_AGENTS: { key: AgentKey; label: string; hint: string }[] = [
  {
    key: "relecture",
    label: "Relecture",
    hint: "Typographie française, orthographe, style maison.",
  },
  {
    key: "titraille",
    label: "Titraille",
    hint: "Trois titres, un chapô, une accroche, une méta-description.",
  },
  {
    key: "seo",
    label: "Référencement",
    hint: "Slug, métadonnées, mots-clés, maillage interne.",
  },
  {
    key: "diffusion",
    label: "Diffusion",
    hint: "Déclinaisons LinkedIn, WhatsApp et Facebook.",
  },
];

/**
 * Article editor — CDC §4.4.
 *
 * Autosave every four seconds of quiet, version history, preview, and the
 * agent proposals **in the flank** rather than inline: a suggestion must
 * never look like something the text already says. Each one is accepted or
 * rejected on its own (`AgentSuggestionCard`), and rejecting one stops it
 * coming back.
 */
export default function ArticleEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ArticleEditor key={id} articleId={id as Id<"articles">} />;
}

function ArticleEditor({ articleId }: { articleId: Id<"articles"> }) {
  const router = useRouter();

  const article = useQuery(api.newsroom.get, { id: articleId });
  const options = useQuery(api.newsroom.editorOptions, {});
  const versions = useQuery(api.newsroom.versions, { id: articleId });
  const agent = useQuery(api.agents.forTarget, {
    targetType: "article",
    targetId: articleId,
  });

  const save = useMutation(api.newsroom.save);
  const setStatus = useMutation(api.newsroom.setStatus);
  const remove = useMutation(api.newsroom.remove);
  const restore = useMutation(api.newsroom.restoreVersion);
  const runAgent = useAction(api.agentRuntime.runOnArticle);
  const transcribe = useAction(api.agentRuntime.transcribe);

  const [form, setForm] = useState<{
    title: string;
    slug: string;
    dek: string;
    body: Block[];
    categorySlug: string;
    subCategorySlug: string;
    authorSlug: string;
    heroMediaKey: string;
    keyPoints: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    feature: "lead" | "top" | "dossier" | "none";
    tags: string;
  } | null>(null);
  const [preview, setPreview] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [autoError, setAutoError] = useState(false);
  const [loadedStamp, setLoadedStamp] = useState(-1);
  const revision = useRef(0);
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());

  /**
   * Synchronisation avec le serveur, faite au rendu plutôt que dans un effet.
   *
   * Deux exigences contradictoires à tenir ensemble : ne **jamais** écraser
   * une frappe en cours (garde-fou `dirty`), et recharger quand le document
   * a changé côté serveur — ce qui arrive chaque fois qu'on accepte une
   * proposition d'agent, puisque c'est une mutation Convex qui réécrit
   * l'article. Sans ce rechargement, l'éditeur garderait l'ancienne valeur à
   * l'écran et le prochain enregistrement automatique l'écrirait par-dessus
   * la correction acceptée.
   */
  if (
    article &&
    !dirty &&
    loadedStamp !== article.updatedAt &&
    article.updatedAt >= savedAt
  ) {
    setLoadedStamp(article.updatedAt);
    setForm({
      title: article.title,
      slug: article.slug,
      dek: article.dek,
      body: [...article.body],
      categorySlug: article.categorySlug,
      subCategorySlug: article.subCategorySlug ?? "",
      authorSlug: article.authorSlug,
      heroMediaKey: article.heroMediaKey ?? "",
      keyPoints: article.keyPoints.join("\n"),
      seoTitle: article.seo.title ?? "",
      seoDescription: article.seo.description,
      seoKeywords: article.seo.keywords.join(", "),
      feature: article.feature,
      tags: article.tags.join(", "),
    });
  }

  const editable = article?.editable;
  const galleryMediaKeys = article?.galleryMediaKeys;
  const persist = useCallback(
    async (auto: boolean) => {
      if (!form || !editable || !galleryMediaKeys) return;
      const savedRevision = revision.current;
      const pendingSave = saveQueue.current.then(() =>
        save({
          id: articleId,
          title: form.title,
          dek: form.dek,
          body: form.body,
          categorySlug: form.categorySlug,
          subCategorySlug: form.subCategorySlug || undefined,
          authorSlug: form.authorSlug,
          heroMediaKey: form.heroMediaKey || undefined,
          galleryMediaKeys,
          keyPoints: form.keyPoints.split("\n").filter((line) => line.trim()),
          seo: {
            title: form.seoTitle || undefined,
            description: form.seoDescription,
            keywords: form.seoKeywords
              .split(",")
              .map((word) => word.trim())
              .filter(Boolean),
          },
          feature: form.feature,
          tags: form.tags
            .split(",")
            .map((word) => word.trim())
            .filter(Boolean),
          slug: form.slug,
          auto,
        })
      );
      saveQueue.current = pendingSave.catch(() => undefined);
      const result = await pendingSave;
      setSavedAt(result.updatedAt);
      setAutoError(false);
      if (revision.current === savedRevision) setDirty(false);
      return result;
    },
    [articleId, editable, form, galleryMediaKeys, save]
  );

  // Enregistrement automatique après quatre secondes de calme.
  useEffect(() => {
    if (!form || !dirty || busy) return;
    const timer = setTimeout(() => {
      void persist(true).catch(() => setAutoError(true));
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [form, dirty, busy, persist]);

  /**
   * Garde-fou de fermeture : l'enregistrement automatique attend quatre
   * secondes, et personne ne doit perdre un paragraphe parce qu'il a fermé
   * l'onglet trois secondes trop tôt.
   */
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = true;
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = <Key extends keyof NonNullable<typeof form>>(
    key: Key,
    value: NonNullable<typeof form>[Key]
  ) => {
    revision.current += 1;
    setDirty(true);
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  if (article === null) {
    return <h1 className="font-display type-h1">Article introuvable</h1>;
  }
  if (article === undefined || form === null) {
    return (
      <p role="status" className="type-body text-muted-foreground">
        Chargement…
      </p>
    );
  }

  const categories = options?.categories ?? [];
  const parents = categories.filter((row) => !row.parentSlug);
  const children = categories.filter(
    (row) => row.parentSlug === form.categorySlug
  );
  const pending = (agent?.suggestions ?? []).filter(
    (item) => item.status === "pending"
  );
  const settled = (agent?.suggestions ?? []).filter(
    (item) => item.status !== "pending"
  );

  const act = async (task: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await saveQueue.current;
      await task();
      toast.success(success);
    } catch (error) {
      toast.error(humanError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <p className="type-small">
        <Link
          href="/redaction/articles"
          className="inline-flex min-h-11 items-center text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          ← Articles
        </Link>
      </p>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <h1 className="min-w-0 font-display type-h1 [overflow-wrap:anywhere]">
          {form.title || "Sans titre"}
        </h1>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {article.origin === "partenaire" && <PartnerTag size="small" />}
          <StatusPill status={article.status} />
        </div>
      </div>
      <p role="status" className="mt-1 type-small text-muted-foreground">
        {dirty
          ? autoError
            ? "L’enregistrement automatique a échoué. Utilisez « Enregistrer » pour réessayer."
            : "Modifications en cours d’enregistrement"
          : `Dernière modification le ${formatDateTime(article.updatedAt)}`}
        {!article.editable &&
          " · lecture seule (rubrique hors de votre périmètre)"}
      </p>

      <div className="sticky top-[env(safe-area-inset-top)] z-20 mt-4 flex flex-wrap gap-2 rounded-xl border border-border bg-background p-2 shadow-floating lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <ActionButton
          type="button"
          variant="outline"
          aria-haspopup="dialog"
          onClick={() => setPreview(true)}
        >
          <Eye aria-hidden="true" className="size-4" />
          Aperçu
        </ActionButton>
        {article.editable && (
          <ActionButton
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => act(() => persist(false), "Article enregistré.")}
          >
            <Save aria-hidden="true" className="size-4" />
            Enregistrer
          </ActionButton>
        )}
        {article.editable && article.status !== "published" && (
          <ActionButton
            type="button"
            disabled={busy}
            onClick={() =>
              act(async () => {
                if (dirty) await persist(false);
                await setStatus({ id: articleId, status: "published" });
              }, "Article publié.")
            }
          >
            <Send aria-hidden="true" className="size-4" />
            Publier
          </ActionButton>
        )}
        {article.status === "published" && (
          <Link
            href={`/article/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md px-3 type-small font-semibold touch-target hover:bg-surface-muted"
          >
            <ExternalLink aria-hidden="true" className="size-4" />
            Voir en ligne
          </Link>
        )}
      </div>

      <ArticlePreview
        open={preview}
        onClose={() => setPreview(false)}
        article={{
          title: form.title,
          dek: form.dek,
          body: form.body,
          heroMediaKey: form.heroMediaKey,
          keyPoints: form.keyPoints.split("\n").filter((line) => line.trim()),
          category: parents.find((row) => row.slug === form.categorySlug)?.name,
          author: options?.authors.find((row) => row.slug === form.authorSlug)
            ?.name,
          isPartner: article.origin === "partenaire",
        }}
      />

      <nav
        aria-label="Sections de l’article"
        className="mt-3 flex flex-wrap gap-x-3 lg:hidden"
      >
        {[
          ["contenu-article", "Contenu"],
          ["publication", "Publication"],
          ["referencement", "Référencement"],
          ["suivi", "Suivi"],
        ].map(([section, label]) => (
          <a
            key={section}
            href={`#${section}`}
            className="inline-flex min-h-11 items-center type-small font-medium text-accent underline-offset-4 hover:underline"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-4 grid gap-5 xl:mt-8 xl:grid-cols-[minmax(0,1fr)_minmax(16rem,21rem)] xl:gap-8">
        <fieldset
          disabled={busy || !article.editable}
          className="grid min-w-0 gap-5"
        >
          <legend className="sr-only">Modifier l’article</legend>
          <section
            id="contenu-article"
            className="scroll-mt-28 rounded-lg border border-border bg-card p-4 sm:p-6"
          >
            <h2 className="font-display type-h2">Contenu</h2>
            <div className="mt-4 grid gap-5">
              <TextField
                label="Titre"
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
              />
              <TextAreaField
                label="Chapô"
                value={form.dek}
                onChange={(event) => update("dek", event.target.value)}
              />
              <div>
                <p className="mb-2 type-small font-medium">Corps</p>
                <Editor
                  blocks={form.body}
                  onChange={(blocks) => update("body", blocks)}
                />
              </div>
              <TextAreaField
                label="L'essentiel en trois points"
                hint="Un point par ligne."
                value={form.keyPoints}
                onChange={(event) => update("keyPoints", event.target.value)}
              />
            </div>
          </section>

          <section
            id="publication"
            className="scroll-mt-28 rounded-lg border border-border bg-card p-4 sm:p-6"
          >
            <h2 className="font-display type-h2">Publication</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Rubrique"
                value={form.categorySlug}
                onChange={(event) => {
                  update("categorySlug", event.target.value);
                  update("subCategorySlug", "");
                }}
                options={parents.map((row) => ({
                  value: row.slug,
                  label: row.allowed
                    ? row.name
                    : `${row.name} (hors périmètre)`,
                  disabled: !row.allowed,
                }))}
              />
              <SelectField
                label="Sous-rubrique"
                value={form.subCategorySlug}
                onChange={(event) =>
                  update("subCategorySlug", event.target.value)
                }
                options={[
                  { value: "", label: "— aucune" },
                  ...children.map((row) => ({
                    value: row.slug,
                    label: row.name,
                  })),
                ]}
              />
              <SelectField
                label="Signature"
                value={form.authorSlug}
                onChange={(event) => update("authorSlug", event.target.value)}
                options={(options?.authors ?? []).map((row) => ({
                  value: row.slug,
                  label: row.name,
                }))}
              />
              <MediaPicker
                label="Image principale"
                value={form.heroMediaKey}
                onChange={(key) => update("heroMediaKey", key)}
                className="sm:col-span-2"
              />
              <p className="type-small text-muted-foreground sm:col-span-2">
                Cette image apparaît au partage. Une photo de l’article est
                utilisée si aucune couverture n’est choisie.
              </p>
              <SelectField
                label="Mise en avant"
                value={form.feature}
                onChange={(event) =>
                  update(
                    "feature",
                    event.target.value as "lead" | "top" | "dossier" | "none"
                  )
                }
                options={[
                  { value: "none", label: "Aucune" },
                  { value: "lead", label: "Une principale" },
                  { value: "top", label: "À la une" },
                  { value: "dossier", label: "Dossier" },
                ]}
              />
              <TextField
                label="Étiquettes"
                hint="Séparées par des virgules."
                value={form.tags}
                onChange={(event) => update("tags", event.target.value)}
              />
            </div>
          </section>

          <section
            id="referencement"
            className="scroll-mt-28 rounded-lg border border-border bg-card p-4 sm:p-6"
          >
            <h2 className="font-display type-h2">Référencement</h2>
            <div className="mt-4 grid gap-5">
              <TextField
                label="Slug"
                spellCheck={false}
                hint="Change l'adresse publique de l'article. Ajoutez une redirection si l'ancienne est déjà en ligne."
                value={form.slug}
                onChange={(event) => update("slug", event.target.value)}
              />
              <TextField
                label="Titre de référencement"
                hint="Facultatif, remplace le titre dans l'onglet et les moteurs."
                value={form.seoTitle}
                onChange={(event) => update("seoTitle", event.target.value)}
              />
              <TextAreaField
                label="Méta-description"
                hint="155 caractères environ."
                value={form.seoDescription}
                onChange={(event) =>
                  update("seoDescription", event.target.value)
                }
              />
              <TextField
                label="Mots-clés"
                hint="Séparés par des virgules."
                value={form.seoKeywords}
                onChange={(event) => update("seoKeywords", event.target.value)}
              />
            </div>
          </section>
        </fieldset>

        <aside
          id="suivi"
          className="grid min-w-0 scroll-mt-28 content-start gap-6"
        >
          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="flex items-center gap-2 font-display type-h3">
              <Sparkles
                aria-hidden="true"
                className="size-5 text-gold-600 dark:text-gold-400"
              />
              Agents
            </h2>
            <p className="mt-1 type-small text-muted-foreground">
              Un agent propose, un humain dispose. Enregistrez avant de lancer
              un agent&nbsp;: il lit la version enregistrée.
            </p>
            <div className="mt-3 grid gap-2">
              {EDITOR_AGENTS.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  disabled={busy || !article.editable}
                  onClick={() =>
                    act(async () => {
                      await persist(false);
                      await runAgent({ articleId, agent: entry.key });
                    }, `Agent ${entry.label} lancé.`)
                  }
                  className="rounded-md border border-border p-2 text-start type-small hover:bg-surface-muted disabled:opacity-50"
                >
                  <span className="font-semibold">{entry.label}</span>
                  <span className="block text-muted-foreground">
                    {entry.hint}
                  </span>
                </button>
              ))}
              <button
                type="button"
                disabled={busy || !article.editable}
                onClick={() =>
                  act(async () => {
                    await persist(false);
                    await transcribe({ articleId });
                  }, "Transcription programmée (traitement différé).")
                }
                className="rounded-md border border-border p-2 text-start type-small hover:bg-surface-muted disabled:opacity-50"
              >
                <span className="font-semibold">
                  Transcription d&apos;interview
                </span>
                <span className="block text-muted-foreground">
                  Passe le corps en texte horodaté puis en trame
                  questions/réponses. Traitement différé par
                  l&apos;ordonnanceur.
                </span>
              </button>
            </div>
          </section>

          <section>
            <h2 className="font-display type-h3">
              Propositions ({pending.length})
            </h2>
            <div className="mt-3 grid gap-3">
              {pending.length === 0 && (
                <p className="type-small text-muted-foreground">
                  Aucune proposition en attente.
                </p>
              )}
              {pending.map((item) => (
                <AgentSuggestionCard key={item._id} suggestion={item} />
              ))}
            </div>
            {settled.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer type-small text-muted-foreground">
                  Propositions déjà tranchées ({settled.length})
                </summary>
                <div className="mt-3 grid gap-3">
                  {settled.map((item) => (
                    <AgentSuggestionCard key={item._id} suggestion={item} />
                  ))}
                </div>
              </details>
            )}
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="flex items-center gap-2 font-display type-h3">
              <History aria-hidden="true" className="size-5" />
              Versions
            </h2>
            <ul className="mt-3 grid gap-2">
              {(versions ?? []).length === 0 && (
                <li className="type-small text-muted-foreground">
                  Aucune version antérieure.
                </li>
              )}
              {(versions ?? []).map((version) => (
                <li
                  key={version._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-2"
                >
                  <div className="min-w-0">
                    <p className="type-small font-medium">{version.label}</p>
                    <p className="type-small text-muted-foreground">
                      {version.authorName} · {formatDateTime(version.at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy || !article.editable}
                    onClick={() =>
                      act(async () => {
                        if (dirty) await persist(false);
                        await restore({ id: version._id });
                        setSavedAt(0);
                      }, "Version restaurée.")
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 type-small hover:bg-surface-muted disabled:opacity-50"
                  >
                    <Undo2 aria-hidden="true" className="size-3.5" />
                    Restaurer
                  </button>
                </li>
              ))}
            </ul>
          </section>
          {article.editable && (
            <section className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-4">
              {article.status === "published" ? (
                <ActionButton
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    act(
                      () => setStatus({ id: articleId, status: "draft" }),
                      "Article dépublié."
                    )
                  }
                >
                  Dépublier
                </ActionButton>
              ) : (
                <ActionButton
                  type="button"
                  variant="destructive"
                  disabled={busy}
                  onClick={() => {
                    if (
                      !window.confirm("Supprimer définitivement cet article ?")
                    )
                      return;
                    void act(async () => {
                      await remove({ id: articleId });
                      router.push("/redaction/articles");
                    }, "Article supprimé.");
                  }}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Supprimer
                </ActionButton>
              )}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
