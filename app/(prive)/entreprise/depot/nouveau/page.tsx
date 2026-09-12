"use client";

import Link from "next/link";
import { SubmissionForm } from "@/components/custom/submission-form";

/** New company deposit — CDC §4.4 step 2. */
export default function NewSubmissionPage() {
  return (
    <>
      <p className="type-small">
        <Link
          href="/entreprise"
          className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          ← Mes dépôts
        </Link>
      </p>
      <h1 className="mt-3 font-display type-h1">Déposer une actualité</h1>
      <p className="mt-2 max-w-reading type-body text-muted-foreground">
        Le dépôt part en revue dès que vous le transmettez. Vous pouvez
        l&apos;enregistrer en brouillon autant de fois que nécessaire avant.
      </p>
      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <SubmissionForm />
      </div>
    </>
  );
}
