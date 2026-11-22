"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, FileText, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import { DataTable, type DataColumn } from "@/components/custom/data-table";
import { SelectField, TextField } from "@/components/custom/form-field";
import { NewContentDialog } from "@/components/custom/new-content-dialog";
import { OfficeHeader } from "@/components/custom/office-header";
import { PartnerTag } from "@/components/custom/partner-tag";
import { StatusPill } from "@/components/custom/status-pill";
import { STATUS_LABEL, formatDateTime, humanError } from "@/lib/private";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  ...(
    [
      "draft",
      "submitted",
      "in_review",
      "changes_requested",
      "scheduled",
      "published",
      "rejected",
    ] as const
  ).map((value) => ({ value, label: STATUS_LABEL[value] })),
];

type Row = NonNullable<
  ReturnType<typeof useQuery<typeof api.newsroom.list>>
>[number];

/**
 * Article list — CDC §4.4: filters (status, section, author, origin),
 * search and bulk actions. A new piece is started from « Nouveau contenu »,
 * the same door as everywhere else; the list opens on the filter the
 * dashboard asked for (`?statut=`).
 */
export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <p className="type-body text-muted-foreground" role="status">
          Chargement…
        </p>
      }
    >
      <ArticlesList />
    </Suspense>
  );
}

function ArticlesList() {
  const params = useSearchParams();
  const [status, setStatus] = useState(params.get("statut") ?? "");
  const [categorySlug, setCategorySlug] = useState("");
  const [authorSlug, setAuthorSlug] = useState("");
  const [origin, setOrigin] = useState("");
  const [term, setTerm] = useState("");
  const searchTerm = useDebouncedValue(term.trim());
  const [selected, setSelected] = useState<Id<"articles">[]>([]);
  const [creating, setCreating] = useState(false);

  const viewer = useQuery(api.accounts.me, {});
  const options = useQuery(api.newsroom.editorOptions, {});
  const rows = useQuery(api.newsroom.list, {
    status: status || undefined,
    categorySlug: categorySlug || undefined,
    authorSlug: authorSlug || undefined,
    origin: origin || undefined,
    term: searchTerm || undefined,
  });
  const setStatusMany = useMutation(api.newsroom.setStatusMany);

  const canWrite = (
    viewer?.permissions as readonly string[] | undefined
  )?.includes("articles:write");
  const canPublish = (
    viewer?.permissions as readonly string[] | undefined
  )?.includes("articles:publish");
  const categories = (options?.categories ?? []).filter(
    (row) => !row.parentSlug
  );
  const activeFilters = [status, categorySlug, authorSlug, origin].filter(
    Boolean
  ).length;

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id as Id<"articles">)
        ? current.filter((item) => item !== id)
        : [...current, id as Id<"articles">]
    );

  const bulk = async (next: "published" | "draft") => {
    if (selected.length === 0) return;
    try {
      const done = await setStatusMany({ ids: selected, status: next });
      const message = `${done} sur ${selected.length} ${next === "published" ? "publié(s)" : "repassé(s) en brouillon"}.`;
      if (next === "published" && done < selected.length) {
        toast.warning(
          `${message} Vérifiez le statut, le chapô, le texte et l’image des articles restants.`
        );
      } else {
        toast.success(message);
      }
      setSelected([]);
    } catch (error) {
      toast.error(humanError(error));
    }
  };

  const columns: DataColumn<Row>[] = [
    {
      key: "title",
      header: "Titre",
      primary: true,
      cell: (row) => (
        <>
          <Link
            href={`/redaction/articles/${row._id}`}
            className="type-body font-medium underline-offset-2 hover:underline"
          >
            {row.title}
          </Link>
          {(row.origin === "partenaire" || row.pendingSuggestions > 0) && (
            <span className="mt-1 flex flex-wrap items-center gap-2">
              {row.origin === "partenaire" && <PartnerTag size="small" />}
              {row.pendingSuggestions > 0 && (
                <span className="inline-flex items-center gap-1 rounded-xs border border-border px-1.5 py-0.5 type-small text-muted-foreground">
                  <Sparkles aria-hidden="true" className="size-3" />
                  {row.pendingSuggestions}
                </span>
              )}
            </span>
          )}
        </>
      ),
    },
    { key: "category", header: "Rubrique", cell: (row) => row.categoryName },
    { key: "author", header: "Signature", cell: (row) => row.authorName },
    {
      key: "status",
      header: "Statut",
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      key: "updated",
      header: "Modifié",
      className: "whitespace-nowrap",
      cell: (row) => formatDateTime(row.updatedAt),
    },
  ];

  const filters = (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SelectField
        label="Statut"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        options={STATUS_OPTIONS}
      />
      <SelectField
        label="Rubrique"
        value={categorySlug}
        onChange={(event) => setCategorySlug(event.target.value)}
        options={[
          { value: "", label: "Toutes" },
          ...categories.map((row) => ({ value: row.slug, label: row.name })),
        ]}
      />
      <SelectField
        label="Signature"
        value={authorSlug}
        onChange={(event) => setAuthorSlug(event.target.value)}
        options={[
          { value: "", label: "Toutes" },
          ...(options?.authors ?? []).map((row) => ({
            value: row.slug,
            label: row.name,
          })),
        ]}
      />
      <SelectField
        label="Origine"
        value={origin}
        onChange={(event) => setOrigin(event.target.value)}
        options={[
          { value: "", label: "Toutes" },
          { value: "redaction", label: "Rédaction" },
          { value: "partenaire", label: "Contenu partenaire" },
        ]}
      />
    </div>
  );

  return (
    <>
      <OfficeHeader
        icon={FileText}
        title="Articles"
        description="Tous les papiers du journal, du brouillon à la publication."
        actions={
          canWrite && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-opacity touch-target hover:opacity-90"
            >
              <Plus aria-hidden="true" className="size-4" />
              Nouvel article
            </button>
          )
        }
      />

      <section
        aria-label="Filtres"
        className="rounded-xl border border-border bg-card p-4"
      >
        <TextField
          label="Rechercher un article"
          type="search"
          placeholder="Titre, chapô, corps…"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
        {/* Sur un téléphone, les quatre listes se replient derrière un
            bouton ; dès `md`, elles sont toujours visibles. */}
        <details className="group mt-3 md:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 type-small font-semibold [&::-webkit-details-marker]:hidden">
            <ChevronDown
              aria-hidden="true"
              className="size-4 transition-transform group-open:rotate-180"
            />
            Filtres
            {activeFilters > 0 && (
              <span className="rounded-full bg-accent px-2 text-[11px] leading-5 text-accent-foreground tabular-nums">
                {activeFilters}
              </span>
            )}
          </summary>
          <div className="mt-2">{filters}</div>
        </details>
        <div className="mt-3 hidden md:block">{filters}</div>
      </section>

      {selected.length > 0 && (
        <div
          role="region"
          aria-label="Actions groupées"
          className="sticky top-2 z-10 mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background p-3 shadow-floating lg:top-20"
        >
          <p className="type-small font-semibold">
            {selected.length} sélectionné{selected.length > 1 ? "s" : ""}
          </p>
          {canPublish && (
            <ActionButton type="button" onClick={() => void bulk("published")}>
              Publier
            </ActionButton>
          )}
          <ActionButton
            type="button"
            variant="outline"
            onClick={() => void bulk("draft")}
          >
            Repasser en brouillon
          </ActionButton>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="type-small underline underline-offset-2"
          >
            Tout désélectionner
          </button>
        </div>
      )}

      <div className="mt-4">
        {rows === undefined ? (
          <p className="type-body text-muted-foreground" role="status">
            Chargement…
          </p>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row._id}
            caption="Articles filtrés, du plus récemment modifié au plus ancien"
            empty="Aucun article pour ces filtres."
            minWidth="52rem"
            selection={{
              selected,
              onToggle: toggle,
              label: (row) => `Sélectionner « ${row.title} »`,
            }}
          />
        )}
      </div>

      {canWrite && (
        <NewContentDialog
          open={creating}
          onClose={() => setCreating(false)}
          defaultAuthorSlug={viewer?.authorSlug}
        />
      )}
    </>
  );
}
