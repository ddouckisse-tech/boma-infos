"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { FilePlus2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import { SelectField, TextField } from "@/components/custom/form-field";
import { StatusPill } from "@/components/custom/status-pill";
import { PartnerTag } from "@/components/custom/partner-tag";
import { STATUS_LABEL, formatDateTime, humanError } from "@/lib/private";

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

/**
 * Article list — CDC §4.4: filters (status, section, author, origin),
 * search and bulk actions.
 */
export default function ArticlesPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [authorSlug, setAuthorSlug] = useState("");
  const [origin, setOrigin] = useState("");
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<Id<"articles">[]>([]);
  const [newTitle, setNewTitle] = useState("");

  const options = useQuery(api.newsroom.editorOptions, {});
  const rows = useQuery(api.newsroom.list, {
    status: status || undefined,
    categorySlug: categorySlug || undefined,
    authorSlug: authorSlug || undefined,
    origin: origin || undefined,
    term: term || undefined,
  });
  const create = useMutation(api.newsroom.create);
  const setStatusMany = useMutation(api.newsroom.setStatusMany);

  const categories = (options?.categories ?? []).filter(
    (row) => !row.parentSlug
  );
  const writable = categories.filter((row) => row.allowed);

  const toggle = (id: Id<"articles">) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const createArticle = async () => {
    const category = writable[0];
    const author = options?.authors[0];
    if (!category || !author) {
      toast.error("Créez d'abord une rubrique et une signature.");
      return;
    }
    try {
      const id = await create({
        title: newTitle.trim() || "Nouvel article",
        categorySlug: category.slug,
        authorSlug: author.slug,
      });
      router.push(`/redaction/articles/${id}`);
    } catch (error) {
      toast.error(humanError(error));
    }
  };

  const bulk = async (next: "published" | "draft") => {
    if (selected.length === 0) return;
    try {
      const done = await setStatusMany({ ids: selected, status: next });
      toast.success(
        `${done} article(s) ${next === "published" ? "publié(s)" : "repassé(s) en brouillon"}.`
      );
      setSelected([]);
    } catch (error) {
      toast.error(humanError(error));
    }
  };

  return (
    <>
      <h1 className="font-serif type-h1">Articles</h1>

      <section className="mt-6 rounded-md border border-border bg-card p-4">
        <h2 className="font-serif type-h3">Nouvel article</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <TextField
            label="Titre de travail"
            className="min-w-64 flex-1"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
          />
          <ActionButton type="button" onClick={createArticle}>
            <FilePlus2 aria-hidden="true" className="size-4" />
            Créer
          </ActionButton>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
        <TextField
          label="Recherche"
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
      </section>

      {selected.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-3">
          <p className="type-small font-semibold">
            {selected.length} sélectionné{selected.length > 1 ? "s" : ""}
          </p>
          <ActionButton type="button" onClick={() => bulk("published")}>
            Publier
          </ActionButton>
          <ActionButton
            type="button"
            variant="outline"
            onClick={() => bulk("draft")}
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

      {rows === undefined ? (
        <p className="mt-6 type-body text-muted-foreground">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 rounded-md border border-border bg-card p-6 type-body text-muted-foreground">
          Aucun article pour ces filtres.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full min-w-[52rem] border-collapse">
            <caption className="sr-only">
              Articles filtrés, du plus récemment modifié au plus ancien
            </caption>
            <thead>
              <tr className="border-b border-border text-start">
                <th scope="col" className="p-3 type-small">
                  <span className="sr-only">Sélection</span>
                </th>
                <th scope="col" className="p-3 text-start type-small">
                  Titre
                </th>
                <th scope="col" className="p-3 text-start type-small">
                  Rubrique
                </th>
                <th scope="col" className="p-3 text-start type-small">
                  Signature
                </th>
                <th scope="col" className="p-3 text-start type-small">
                  Statut
                </th>
                <th scope="col" className="p-3 text-start type-small">
                  Modifié
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row._id}
                  className="border-b border-border last:border-0"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={selected.includes(row._id)}
                      onChange={() => toggle(row._id)}
                      aria-label={`Sélectionner « ${row.title} »`}
                    />
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/redaction/articles/${row._id}`}
                      className="type-body font-medium underline-offset-2 hover:underline"
                    >
                      {row.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {row.origin === "partenaire" && (
                        <PartnerTag size="small" />
                      )}
                      {row.pendingSuggestions > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-xs border border-border px-1.5 py-0.5 type-small text-muted-foreground">
                          <Sparkles aria-hidden="true" className="size-3" />
                          {row.pendingSuggestions}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 type-small">{row.categoryName}</td>
                  <td className="p-3 type-small">{row.authorName}</td>
                  <td className="p-3">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="p-3 type-small whitespace-nowrap">
                    {formatDateTime(row.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
