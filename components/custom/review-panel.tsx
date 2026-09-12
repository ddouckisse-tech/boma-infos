"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { CheckCircle2, PencilLine, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionButton } from "@/components/custom/action-button";
import {
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/custom/form-field";
import { humanError } from "@/lib/private";

/**
 * Review of a company deposit — CDC §3.4 (`ReviewPanel`), §4.4 step 4.
 *
 * Three outcomes and no fourth: accept (and publish or schedule), ask for
 * changes with a situated comment, or refuse **with a mandatory reason**.
 * The reason is not merely `required` in the markup — `portal.reject`
 * refuses a short one server-side, so the refusal can never reach the
 * company without an explanation.
 */
export function ReviewPanel({
  submissionId,
  status,
  suggestedCategorySlug,
  categories,
  authors,
  media,
  requestedPublishAt,
}: {
  submissionId: Id<"submissions">;
  status: string;
  suggestedCategorySlug: string;
  categories: readonly { value: string; label: string }[];
  authors: readonly { value: string; label: string }[];
  media: readonly { value: string; label: string }[];
  requestedPublishAt?: number;
}) {
  const router = useRouter();
  const startReview = useMutation(api.portal.startReview);
  const requestChanges = useMutation(api.portal.requestChanges);
  const reject = useMutation(api.portal.reject);
  const publish = useMutation(api.portal.publishSubmission);
  const reopen = useMutation(api.portal.reopen);

  const [comment, setComment] = useState("");
  const [reason, setReason] = useState("");
  const [categorySlug, setCategorySlug] = useState(
    suggestedCategorySlug || categories[0]?.value || ""
  );
  const [authorSlug, setAuthorSlug] = useState(authors[0]?.value ?? "");
  const [heroMediaKey, setHeroMediaKey] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [publishAt, setPublishAt] = useState(
    requestedPublishAt
      ? new Date(requestedPublishAt).toISOString().slice(0, 16)
      : ""
  );
  const [busy, setBusy] = useState(false);

  const run = async (task: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await task();
      toast.success(success);
      router.refresh();
    } catch (error) {
      toast.error(humanError(error));
    }
    setBusy(false);
  };

  const decided = status === "published" || status === "scheduled";

  return (
    <div className="grid gap-6">
      {status === "submitted" && (
        <section className="rounded-md border border-border bg-card p-4">
          <h3 className="font-serif type-h3">Prendre en charge</h3>
          <p className="mt-1 type-small text-muted-foreground">
            Passe le dépôt en revue et prévient l&apos;entreprise que
            quelqu&apos;un s&apos;en occupe.
          </p>
          <ActionButton
            type="button"
            className="mt-3"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await startReview({ id: submissionId });
              }, "Dépôt pris en charge.")
            }
          >
            <PencilLine aria-hidden="true" className="size-4" />
            Mettre en revue
          </ActionButton>
        </section>
      )}

      {status === "rejected" ? (
        <section className="rounded-md border border-border bg-card p-4">
          <h3 className="font-serif type-h3">Rouvrir</h3>
          <p className="mt-1 type-small text-muted-foreground">
            Remet le dépôt entre les mains de l&apos;entreprise pour retravail.
          </p>
          <ActionButton
            type="button"
            variant="outline"
            className="mt-3"
            disabled={busy}
            onClick={() =>
              run(async () => {
                await reopen({ id: submissionId });
              }, "Dépôt rouvert.")
            }
          >
            Rouvrir le dépôt
          </ActionButton>
        </section>
      ) : (
        <>
          <section className="rounded-md border border-border bg-card p-4">
            <h3 className="flex items-center gap-2 font-serif type-h3">
              <CheckCircle2
                aria-hidden="true"
                className="size-5 text-success-token"
              />
              {decided ? "Republier / reprogrammer" : "Accepter et publier"}
            </h3>
            <p className="mt-1 type-small text-muted-foreground">
              L&apos;article créé porte l&apos;origine « partenaire » et donc la
              mention « Contenu partenaire ». Ce champ est écrit par la
              rédaction&nbsp;; l&apos;entreprise ne peut pas l&apos;enlever.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Rubrique de publication"
                value={categorySlug}
                onChange={(event) => setCategorySlug(event.target.value)}
                options={categories}
              />
              <SelectField
                label="Signature"
                value={authorSlug}
                onChange={(event) => setAuthorSlug(event.target.value)}
                options={authors}
              />
              <SelectField
                label="Média principal"
                value={heroMediaKey}
                onChange={(event) => setHeroMediaKey(event.target.value)}
                options={[{ value: "", label: "— aucun" }, ...media]}
              />
              <div className="grid gap-2">
                <label className="flex items-center gap-2 type-small font-medium touch-target">
                  <input
                    type="checkbox"
                    checked={schedule}
                    onChange={(event) => setSchedule(event.target.checked)}
                    className="size-4"
                  />
                  Programmer au lieu de publier
                </label>
                {schedule && (
                  <TextField
                    label="Date et heure"
                    type="datetime-local"
                    value={publishAt}
                    onChange={(event) => setPublishAt(event.target.value)}
                  />
                )}
              </div>
            </div>
            <ActionButton
              type="button"
              className="mt-4"
              disabled={busy || !categorySlug || !authorSlug}
              onClick={() =>
                run(
                  async () => {
                    await publish({
                      id: submissionId,
                      categorySlug,
                      authorSlug,
                      heroMediaKey: heroMediaKey || undefined,
                      schedule,
                      publishAt:
                        schedule && publishAt
                          ? new Date(publishAt).getTime()
                          : undefined,
                    });
                  },
                  schedule ? "Dépôt programmé." : "Dépôt publié."
                )
              }
            >
              <Send aria-hidden="true" className="size-4" />
              {schedule ? "Programmer" : "Publier maintenant"}
            </ActionButton>
          </section>

          <section className="rounded-md border border-warning-token/40 bg-card p-4">
            <h3 className="font-serif type-h3">Demander des modifications</h3>
            <TextAreaField
              label="Commentaire à l'entreprise"
              className="mt-3"
              hint="Dix caractères au minimum. Ce texte part tel quel à l'entreprise."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <ActionButton
              type="button"
              variant="outline"
              className="mt-3"
              disabled={busy || comment.trim().length < 10}
              onClick={() =>
                run(async () => {
                  await requestChanges({ id: submissionId, comment });
                  setComment("");
                }, "Modifications demandées.")
              }
            >
              <PencilLine aria-hidden="true" className="size-4" />
              Demander des modifications
            </ActionButton>
          </section>

          <section className="rounded-md border border-destructive/40 bg-card p-4">
            <h3 className="flex items-center gap-2 font-serif type-h3">
              <XCircle aria-hidden="true" className="size-5 text-destructive" />
              Refuser
            </h3>
            <TextAreaField
              label="Motif du refus"
              required
              className="mt-3"
              hint="Obligatoire, dix caractères au minimum. Le serveur refuse un refus sans motif."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            <ActionButton
              type="button"
              variant="destructive"
              className="mt-3"
              disabled={busy || reason.trim().length < 10}
              onClick={() =>
                run(async () => {
                  await reject({ id: submissionId, reason });
                  setReason("");
                }, "Dépôt refusé, motif transmis.")
              }
            >
              Refuser le dépôt
            </ActionButton>
          </section>
        </>
      )}
    </div>
  );
}
