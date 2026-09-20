"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Megaphone, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import {
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/custom/form-field";
import { usePreferences } from "@/components/providers/preferences-provider";
import { categoryLabel, localize } from "@/lib/i18n";
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
  const { locale } = usePreferences();
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
    .map((row) => ({
      value: row.slug,
      label: categoryLabel(locale, row.slug, row.name),
    }));

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
      toast.error(humanError(error, locale));
      return null;
    }
  };

  const onSaveDraft = async () => {
    setBusy(true);
    const id = await persist();
    setBusy(false);
    if (!id) return;
    toast.success(
      localize(locale, {
        fr: "Brouillon enregistré. Vous pourrez le reprendre plus tard.",
        en: "Draft saved. You can return to it later.",
      })
    );
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
        localize(locale, {
          fr: "Dépôt transmis à la rédaction. Vous serez prévenu à chaque étape.",
          en: "Submission sent to the newsroom. You will be notified at every stage.",
        })
      );
      router.push(`/entreprise/depot/${id}`);
      router.refresh();
    } catch (error) {
      toast.error(humanError(error, locale));
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
          <span className="inline-flex items-center gap-1.5 rounded-xs border border-warning-token/40 bg-warning-token/10 px-1.5 py-0.5 type-small font-semibold tracking-wide text-warning-token uppercase">
            <Megaphone aria-hidden="true" className="size-3" />
            {localize(locale, {
              fr: "Contenu partenaire",
              en: "Partner content",
            })}
          </span>
          {localize(locale, {
            fr: "Toute publication issue d’un dépôt porte cette mention, sur l’article comme dans les listes. Elle est posée par la rédaction et ne peut pas être retirée depuis cet espace.",
            en: "Every publication created from a submission carries this label on the article and in lists. The newsroom applies it and it cannot be removed from this space.",
          })}
        </p>
      </div>

      <TextField
        label={localize(locale, { fr: "Titre", en: "Title" })}
        required
        minLength={8}
        maxLength={140}
        hint={localize(locale, {
          fr: "Huit caractères au minimum. La rédaction peut le retravailler.",
          en: "At least eight characters. The newsroom may edit it.",
        })}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <TextAreaField
        label={localize(locale, { fr: "Chapô", en: "Summary" })}
        required
        maxLength={400}
        hint={localize(locale, {
          fr: "Deux ou trois phrases : de quoi s'agit-il, et pourquoi maintenant.",
          en: "Two or three sentences: what is this about, and why now?",
        })}
        value={dek}
        onChange={(event) => setDek(event.target.value)}
      />

      <TextAreaField
        label={localize(locale, { fr: "Corps du texte", en: "Body" })}
        required
        hint={localize(locale, {
          fr: "Deux cents caractères au minimum. Séparez les paragraphes par une ligne vide.",
          en: "At least two hundred characters. Separate paragraphs with a blank line.",
        })}
        className="[&_textarea]:min-h-72"
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectField
          label={localize(locale, {
            fr: "Type de contenu",
            en: "Content type",
          })}
          required
          value={kind}
          onChange={(event) => setKind(event.target.value as Kind)}
          options={SUBMISSION_KINDS.map((entry) => ({
            value: entry.value,
            label:
              locale === "en"
                ? (
                    {
                      communique: "Press release",
                      nomination: "Appointment",
                      resultats: "Results",
                      evenement: "Event",
                      publi_redactionnel: "Advertorial",
                    } as const
                  )[entry.value]
                : entry.label,
          }))}
          hint={localize(locale, {
            fr: "Déclarez un publi-rédactionnel comme tel : l'agent de modération le détecte, et un type inexact allonge la revue.",
            en: "Identify advertorials correctly: the moderation agent detects them, and an inaccurate type slows down review.",
          })}
        />

        <SelectField
          label={localize(locale, {
            fr: "Rubrique souhaitée",
            en: "Preferred section",
          })}
          required
          value={categorySlug || options[0]?.value || ""}
          onChange={(event) => setCategorySlug(event.target.value)}
          options={
            options.length > 0
              ? options
              : [
                  {
                    value: "",
                    label: localize(locale, {
                      fr: "Chargement…",
                      en: "Loading…",
                    }),
                  },
                ]
          }
          hint={localize(locale, {
            fr: "La rédaction reste libre du placement final.",
            en: "The newsroom chooses the final placement.",
          })}
        />
      </div>

      <TextField
        label={localize(locale, {
          fr: "Date de diffusion souhaitée",
          en: "Preferred publication date",
        })}
        type="date"
        value={publishAt}
        onChange={(event) => setPublishAt(event.target.value)}
        hint={localize(locale, {
          fr: "Facultative. La rédaction publie à la date convenue.",
          en: "Optional. The newsroom publishes on the agreed date.",
        })}
      />

      <div className="flex flex-wrap gap-3">
        <ActionButton
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => void onSaveDraft()}
        >
          <Save aria-hidden="true" className="size-4" />
          {localize(locale, {
            fr: "Enregistrer le brouillon",
            en: "Save draft",
          })}
        </ActionButton>
        <ActionButton type="submit" disabled={busy}>
          <Send aria-hidden="true" className="size-4" />
          {localize(locale, {
            fr: "Transmettre à la rédaction",
            en: "Send to newsroom",
          })}
        </ActionButton>
      </div>
    </form>
  );
}
