"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import {
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/custom/form-field";
import { Modal } from "@/components/custom/modal";
import { humanError } from "@/lib/private";

type Category = {
  _id: Id<"categories">;
  name: string;
  slug: string;
  parentSlug?: string;
  accent: string;
  order: number;
  description: string;
  isActive: boolean;
  articleCount: number;
};

const ACCENT_OPTIONS = [
  { value: "navy-900", label: "Navy foncé" },
  { value: "navy-700", label: "Navy" },
  { value: "navy-600", label: "Navy clair" },
  { value: "magenta-600", label: "Magenta" },
  { value: "magenta-700", label: "Magenta foncé" },
  { value: "magenta-800", label: "Magenta profond" },
] as const;

const VISIBILITY_OPTIONS = [
  { value: "true", label: "Visible" },
  { value: "false", label: "Masquée" },
] as const;

function byOrder(rows: Category[]): Category[] {
  return rows.slice().sort((a, b) => a.order - b.order);
}

/**
 * Rebuilds the full, flattened `_id` order the `reorder` mutation expects.
 *
 * The mutation just numbers whatever it is given, in sequence, starting at
 * one — it knows nothing about siblings. So a "Monter"/"Descendre" click
 * only ever swaps two rows sharing the same `parentSlug`, but the call still
 * has to carry every category, parents first and each followed by its own
 * sub-categories, or the untouched groups would lose their relative order.
 */
function fullOrderAfterSwap(
  categories: Category[],
  swapGroup: string | undefined,
  swapped: Id<"categories">[]
): Id<"categories">[] {
  const topLevelIds =
    swapGroup === undefined
      ? swapped
      : byOrder(categories.filter((c) => !c.parentSlug)).map((c) => c._id);

  const ids: Id<"categories">[] = [];
  for (const parentId of topLevelIds) {
    ids.push(parentId);
    const parent = categories.find((c) => c._id === parentId);
    if (!parent) continue;
    const childIds =
      swapGroup === parent.slug
        ? swapped
        : byOrder(categories.filter((c) => c.parentSlug === parent.slug)).map(
            (c) => c._id
          );
    ids.push(...childIds);
  }
  return ids;
}

/**
 * Rubriques — CDC §4.1 : administrables (ajout, renommage, réordonnancement,
 * couleur d'accent) sans intervention technique.
 *
 * Le slug n'apparaît nulle part comme champ modifiable : il est fixé à la
 * création et le serveur (`convex/taxonomy.ts`) ne le touche plus jamais,
 * pour ne pas casser un lien public ni le plan de redirections 301.
 */
export default function CategoriesPage() {
  const categories = useQuery(api.taxonomy.list, {});
  const createCategory = useMutation(api.taxonomy.create);
  const reorderCategories = useMutation(api.taxonomy.reorder);

  const [editingId, setEditingId] = useState<Id<"categories"> | null>(null);
  const [deletingId, setDeletingId] = useState<Id<"categories"> | null>(null);

  const [name, setName] = useState("");
  const [parentSlug, setParentSlug] = useState("");
  const [accent, setAccent] = useState<string>(ACCENT_OPTIONS[0].value);
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const rows = categories ?? [];
  const topLevel = byOrder(rows.filter((c) => !c.parentSlug));
  const editingCategory = rows.find((c) => c._id === editingId) ?? null;
  const deletingCategory = rows.find((c) => c._id === deletingId) ?? null;

  const move = async (row: Category, direction: "up" | "down") => {
    const siblings = byOrder(
      rows.filter((c) => c.parentSlug === row.parentSlug)
    );
    const index = siblings.findIndex((c) => c._id === row._id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= siblings.length) return;

    const swapped = siblings.slice();
    [swapped[index], swapped[target]] = [swapped[target], swapped[index]];

    try {
      await reorderCategories({
        ids: fullOrderAfterSwap(
          rows,
          row.parentSlug,
          swapped.map((c) => c._id)
        ),
      });
    } catch (error) {
      toast.error(humanError(error));
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    try {
      await createCategory({
        name: name.trim(),
        parentSlug: parentSlug || undefined,
        accent,
        description: description.trim(),
      });
      toast.success("Rubrique créée.");
      setName("");
      setParentSlug("");
      setAccent(ACCENT_OPTIONS[0].value);
      setDescription("");
    } catch (error) {
      toast.error(humanError(error));
    }
    setCreating(false);
  };

  return (
    <>
      <h1 className="font-serif type-h1">Rubriques</h1>
      <p className="mt-2 max-w-reading type-body text-muted-foreground">
        Le slug d&apos;une rubrique ne change jamais lors d&apos;un
        renommage&nbsp;: il figure dans les adresses publiques et dans le plan
        de redirections 301. Seuls le nom, l&apos;accent, la description et la
        visibilité restent modifiables.
      </p>

      {categories === undefined ? (
        <p className="mt-6 type-body text-muted-foreground">
          Chargement des rubriques…
        </p>
      ) : topLevel.length === 0 ? (
        <p className="mt-6 rounded-md border border-border bg-card p-6 type-body text-muted-foreground">
          Aucune rubrique n&apos;a encore été créée.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {topLevel.map((parent) => {
            const children = byOrder(
              rows.filter((c) => c.parentSlug === parent.slug)
            );
            const parentIndex = topLevel.findIndex(
              (c) => c._id === parent._id
            );
            return (
              <li key={parent._id} className="grid gap-3">
                <CategoryRow
                  category={parent}
                  canMoveUp={parentIndex > 0}
                  canMoveDown={parentIndex < topLevel.length - 1}
                  onMoveUp={() => move(parent, "up")}
                  onMoveDown={() => move(parent, "down")}
                  onEdit={() => setEditingId(parent._id)}
                  onDelete={() => setDeletingId(parent._id)}
                />
                {children.length > 0 && (
                  <ul className="grid gap-3 ps-6 sm:ps-10">
                    {children.map((child, index) => (
                      <li key={child._id}>
                        <CategoryRow
                          category={child}
                          canMoveUp={index > 0}
                          canMoveDown={index < children.length - 1}
                          onMoveUp={() => move(child, "up")}
                          onMoveDown={() => move(child, "down")}
                          onEdit={() => setEditingId(child._id)}
                          onDelete={() => setDeletingId(child._id)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <section className="mt-10 rounded-md border border-border bg-card p-4 sm:p-6">
        <h2 className="font-serif type-h2">Nouvelle rubrique</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:max-w-xl">
          <TextField
            label="Nom"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <SelectField
            label="Rubrique parente"
            value={parentSlug}
            onChange={(event) => setParentSlug(event.target.value)}
            options={[
              { value: "", label: "— aucune (rubrique principale)" },
              ...topLevel.map((c) => ({ value: c.slug, label: c.name })),
            ]}
          />
          <SelectField
            label="Accent"
            value={accent}
            onChange={(event) => setAccent(event.target.value)}
            options={ACCENT_OPTIONS}
          />
          <TextAreaField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <ActionButton
            type="submit"
            disabled={creating || name.trim().length < 2}
            className="justify-self-start"
          >
            <Plus aria-hidden="true" className="size-4" />
            Créer la rubrique
          </ActionButton>
        </form>
      </section>

      <Modal
        open={editingCategory !== null}
        onClose={() => setEditingId(null)}
        label={
          editingCategory
            ? `Modifier ${editingCategory.name}`
            : "Modifier la rubrique"
        }
        variant="panel"
      >
        {editingCategory && (
          <EditCategoryForm
            key={editingCategory._id}
            category={editingCategory}
            onClose={() => setEditingId(null)}
          />
        )}
      </Modal>

      <Modal
        open={deletingCategory !== null}
        onClose={() => setDeletingId(null)}
        label={
          deletingCategory
            ? `Supprimer ${deletingCategory.name}`
            : "Supprimer la rubrique"
        }
        variant="panel"
      >
        {deletingCategory && (
          <DeleteCategoryForm
            key={deletingCategory._id}
            category={deletingCategory}
            onClose={() => setDeletingId(null)}
          />
        )}
      </Modal>
    </>
  );
}

function CategoryRow({
  category,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: {
  category: Category;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-3">
      <span
        aria-hidden="true"
        className="size-3 shrink-0 rounded-xs"
        style={{ backgroundColor: `var(--color-${category.accent})` }}
      />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 type-body font-semibold">
          {category.name}
          {!category.isActive && (
            <span className="rounded-xs border border-border px-1.5 py-0.5 type-small font-semibold text-warning-token">
              Masquée
            </span>
          )}
        </p>
        <p className="type-small text-muted-foreground">
          <span className="font-mono">{category.slug}</span> ·{" "}
          {category.articleCount} article
          {category.articleCount > 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <ActionButton
          type="button"
          variant="outline"
          onClick={onMoveUp}
          disabled={!canMoveUp}
        >
          <ArrowUp aria-hidden="true" className="size-4" />
          Monter
        </ActionButton>
        <ActionButton
          type="button"
          variant="outline"
          onClick={onMoveDown}
          disabled={!canMoveDown}
        >
          <ArrowDown aria-hidden="true" className="size-4" />
          Descendre
        </ActionButton>
        <ActionButton type="button" variant="outline" onClick={onEdit}>
          <Pencil aria-hidden="true" className="size-4" />
          Modifier
        </ActionButton>
        <ActionButton
          type="button"
          variant="outline"
          onClick={onDelete}
          className="text-destructive"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          Supprimer
        </ActionButton>
      </div>
    </div>
  );
}

function EditCategoryForm({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const updateCategory = useMutation(api.taxonomy.update);
  const [name, setName] = useState(category.name);
  const [accent, setAccent] = useState(category.accent);
  const [description, setDescription] = useState(category.description);
  const [isActive, setIsActive] = useState(category.isActive);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateCategory({
        id: category._id,
        name: name.trim(),
        accent,
        description: description.trim(),
        isActive,
      });
      toast.success("Rubrique modifiée.");
      onClose();
    } catch (error) {
      toast.error(humanError(error));
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 p-5">
      <div>
        <p className="font-serif type-h3">Modifier la rubrique</p>
        <p className="mt-1 type-small text-muted-foreground">
          Slug&nbsp;: <span className="font-mono">{category.slug}</span> — ne
          change pas.
        </p>
      </div>
      <TextField
        label="Nom"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <SelectField
        label="Accent"
        value={accent}
        onChange={(event) => setAccent(event.target.value)}
        options={ACCENT_OPTIONS}
      />
      <TextAreaField
        label="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <SelectField
        label="Visibilité"
        value={isActive ? "true" : "false"}
        onChange={(event) => setIsActive(event.target.value === "true")}
        options={VISIBILITY_OPTIONS}
      />
      <div className="flex flex-wrap gap-3">
        <ActionButton
          type="submit"
          disabled={saving || name.trim().length < 2}
        >
          Enregistrer
        </ActionButton>
        <ActionButton
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={saving}
        >
          Annuler
        </ActionButton>
      </div>
    </form>
  );
}

function DeleteCategoryForm({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const removeCategory = useMutation(api.taxonomy.remove);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await removeCategory({ id: category._id });
      toast.success("Rubrique supprimée.");
      onClose();
    } catch (error) {
      toast.error(humanError(error));
    }
    setBusy(false);
  };

  return (
    <div className="grid gap-4 p-5">
      <div>
        <p className="font-serif type-h3">Supprimer la rubrique</p>
        <p className="mt-2 type-body">
          Confirmez la suppression de «&nbsp;{category.name}&nbsp;». Cette
          action est irréversible.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <ActionButton
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="text-destructive"
        >
          <Trash2 aria-hidden="true" className="size-4" />
          Confirmer la suppression
        </ActionButton>
        <ActionButton
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={busy}
        >
          Annuler
        </ActionButton>
      </div>
    </div>
  );
}
