"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Save, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import {
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/custom/form-field";
import { PartnerTag } from "@/components/custom/partner-tag";
import {
  SUBMISSION_KINDS,
  blocksToText,
  humanError,
  textToBlocks,
} from "@/lib/private";

type Kind = (typeof SUBMISSION_KINDS)[number]["value"];

export type SubmissionDraft = {
  _id: Id<"submissions">;
  title: string;
  dek: string;
  body: readonly { type: string; text?: string; items?: string[] }[];
  kind: string;
  requestedCategorySlug: string;
  requestedPublishAt?: number;
  mediaKeys: string[];
};

const toDateInput = (value?: number): string =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

/**
 * Company deposit — CDC §3.4 (`SubmissionForm`), §4.4 step 2.
 *
 * Saved as a draft as often as the depositor likes; handed over only when
 * they press "Transmettre". The two are different mutations on purpose:
 * a draft is theirs, a submitted deposit belongs to the workflow and can no
 * longer be edited behind the newsroom's back.
 *
 * The body is a plain textarea rather than a rich editor. A press release
 * is running text, the model behind it is a list of paragraph blocks, and
 * a WYSIWYG would let a depositor smuggle in styling the newsroom would
 * then have to undo.
 */
export function SubmissionForm({
  draft,
  onSaved,
}: {
  draft?: SubmissionDraft;
  onSaved?: (id: Id<"submissions">) => void;
}) {
  const router = useRouter();
  const categories = useQuery(api.journal.navigation, {});
  const save = useMutation(api.portal.saveDraft);
  const submit = useMutation(api.portal.submitForReview);

  const [title, setTitle] = useState(draft?.title ?? "");
  const [dek, setDek] = useState(draft?.dek ?? "");
  const [body, setBody] = useState(draft ? blocksToText(draft.body) : "");
  const [kind, setKind] = useState<Kind>(
    (draft?.kind as Kind | undefined) ?? "communique"
  );
  const [categorySlug, setCategorySlug] = useState(
    draft?.requestedCategorySlug ?? ""
  );
  const [publishAt, setPublishAt] = useState(
    toDateInput(draft?.requestedPublishAt)
  );
  const [busy, setBusy] = useState(false);

  const options = (categories ?? [])
    .filter((row) => !row.parentSlug)
    .sort((a, b) => a.order - b.order)
    .map((row) => ({ value: row.slug, label: row.name }));

  const payload = () => ({
    id: draft?._id,
    title,
    dek,
    body: textToBlocks(body),
    kind,
    requestedCategorySlug: categorySlug || options[0]?.value || "",
    requestedPublishAt: publishAt
      ? new Date(`${publishAt}T08:00:00`).getTime()
      : undefined,
    mediaKeys: draft?.mediaKeys ?? [],
  });

  const persist = async (): Promise<Id<"submissions"> | null> => {
    try {
      const id = await save(payload());
      return id;
    } catch (error) {
      toast.error(humanError(error));
      return null;
    }
  };

  const onSaveDraft = async () => {
    setBusy(true);
    const id = await persist();
    setBusy(false);
    if (!id) return;
    toast.success("Brouillon enregistré. Vous pourrez le reprendre plus tard.");
    onSaved?.(id);
    if (!draft) router.replace(`/entreprise/depot/${id}`);
  };

  const onSubmit = async () => {
    setBusy(true);
    const id = await persist();
    if (!id) {
      setBusy(false);
      return;
    }
    try {
      await submit({ id });
      toast.success(
        "Dépôt transmis à la rédaction. Vous serez prévenu à chaque étape."
      );
      router.push(`/entreprise/depot/${id}`);
      router.refresh();
    } catch (error) {
      toast.error(humanError(error));
    }
    setBusy(false);
  };

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <div className="rounded-md border border-warning-token/40 bg-warning-token/10 p-4">
        <p className="flex flex-wrap items-center gap-2 type-small">
          <PartnerTag size="small" />
          Toute publication issue d&apos;un dépôt porte cette mention, sur
          l&apos;article comme dans les listes. Elle est posée par la rédaction
          et ne peut pas être retirée depuis cet espace.
        </p>
      </div>

      <TextField
        label="Titre"
        required
        minLength={8}
        maxLength={140}
        hint="Huit caractères au minimum. La rédaction peut le retravailler."
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <TextAreaField
        label="Chapô"
        required
        maxLength={400}
        hint="Deux ou trois phrases : de quoi s'agit-il, et pourquoi maintenant."
        value={dek}
        onChange={(event) => setDek(event.target.value)}
      />

      <TextAreaField
        label="Corps du texte"
        required
        hint="Deux cents caractères au minimum. Séparez les paragraphes par une ligne vide."
        className="[&_textarea]:min-h-72"
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          label="Type de contenu"
          required
          value={kind}
          onChange={(event) => setKind(event.target.value as Kind)}
          options={SUBMISSION_KINDS.map((entry) => ({
            value: entry.value,
            label: entry.label,
          }))}
          hint="Déclarez un publi-rédactionnel comme tel : l'agent de modération le détecte, et un type inexact allonge la revue."
        />

        <SelectField
          label="Rubrique souhaitée"
          required
          value={categorySlug || options[0]?.value || ""}
          onChange={(event) => setCategorySlug(event.target.value)}
          options={
            options.length > 0 ? options : [{ value: "", label: "Chargement…" }]
          }
          hint="La rédaction reste libre du placement final."
        />
      </div>

      <TextField
        label="Date de diffusion souhaitée"
        type="date"
        value={publishAt}
        onChange={(event) => setPublishAt(event.target.value)}
        hint="Facultative. La rédaction publie à la date convenue."
      />

      <div className="flex flex-wrap gap-3">
        <ActionButton
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => void onSaveDraft()}
        >
          <Save aria-hidden="true" className="size-4" />
          Enregistrer le brouillon
        </ActionButton>
        <ActionButton type="submit" disabled={busy}>
          <Send aria-hidden="true" className="size-4" />
          Transmettre à la rédaction
        </ActionButton>
      </div>
    </form>
  );
}
