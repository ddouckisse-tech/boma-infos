"use client";

import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { OfficeHeader } from "@/components/custom/office-header";
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
      <OfficeHeader
        icon={FilePlus2}
        title="Déposer une actualité"
        description="Le dépôt part en revue dès que vous le transmettez. Vous pouvez l'enregistrer en brouillon autant de fois que nécessaire avant."
        className="mt-3"
      />
      <div className="rounded-xl border border-border bg-card p-6">
        <SubmissionForm />
      </div>
    </>
  );
}
