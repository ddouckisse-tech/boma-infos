"use client";

import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { OfficeHeader } from "@/components/custom/office-header";
import { SubmissionForm } from "@/components/custom/submission-form";
import { usePreferences } from "@/components/providers/preferences-provider";
import { localize } from "@/lib/i18n";

/** New company deposit — CDC §4.4 step 2. */
export default function NewSubmissionPage() {
  const { locale } = usePreferences();
  return (
    <>
      <p className="type-small">
        <Link
          href="/entreprise"
          className="text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          {localize(locale, { fr: "← Mes dépôts", en: "← My submissions" })}
        </Link>
      </p>
      <OfficeHeader
        icon={FilePlus2}
        title={localize(locale, {
          fr: "Déposer une actualité",
          en: "Submit news",
        })}
        description={localize(locale, {
          fr: "Le dépôt part en revue dès que vous le transmettez. Vous pouvez l'enregistrer en brouillon autant de fois que nécessaire avant.",
          en: "Your submission enters review when you send it. You can save it as a draft as often as needed beforehand.",
        })}
        className="mt-3"
      />
      <div className="rounded-xl border border-border bg-card p-6">
        <SubmissionForm />
      </div>
    </>
  );
}
