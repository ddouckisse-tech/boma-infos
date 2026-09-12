import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { EmptyState } from "@/components/custom/empty-state";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { BreadcrumbStructuredData } from "@/components/custom/structured-data";
import { getDocuments } from "@/lib/content/server";
import { formatBytes, formatDate, isoDate } from "@/lib/format";

// Littéral et non `REVALIDATE_SECONDS` : Next analyse statiquement les
// exports de configuration de segment et n'en résout pas les identifiants
// importés. La valeur de référence est dans `lib/content/server.ts`.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Docuthèque",
  description:
    "Rapports, textes réglementaires, guides et études à télécharger : la documentation économique gabonaise rassemblée par la rédaction.",
  alternates: { canonical: "/docutheque" },
  openGraph: {
    type: "website",
    url: "/docutheque",
    title: "Docuthèque — Le Corporate",
    description:
      "Rapports, textes réglementaires, guides et études économiques à télécharger.",
  },
};

/**
 * Docuthèque (CDC §4.2).
 *
 * Every entry states its format, its page count and **its weight before the
 * click**. On a metered connection, a download button that does not say what
 * it will cost is a trap; the audit's central finding was precisely that the
 * legacy site spent the reader's data without telling them.
 */
export default async function DocuthequePage() {
  const documents = await getDocuments();

  return (
    <>
      <BreadcrumbStructuredData
        trail={[
          { name: "Accueil", href: "/" },
          { name: "Docuthèque", href: "/docutheque" },
        ]}
      />

      <PageHeader
        eyebrow="Espace pro"
        title="Docuthèque"
        description="Rapports, textes réglementaires, guides et études, tenus à jour par la rédaction. Le poids de chaque fichier est indiqué avant le téléchargement."
        breadcrumb={
          <nav aria-label="Fil d'Ariane">
            <Link
              href="/"
              prefetch={false}
              className="inline-flex min-h-11 items-center text-accent underline-offset-4 hover:underline"
            >
              Accueil
            </Link>
            <span aria-hidden="true" className="text-muted-foreground">
              {" › "}
            </span>
            <span className="text-muted-foreground">Docuthèque</span>
          </nav>
        }
      />

      <Section>
        {documents.length === 0 ? (
          <EmptyState
            title="Aucun document publié"
            description="La docuthèque sera alimentée au fil des publications de la rédaction."
          />
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {documents.map((document) => (
              <li key={document.slug}>
                <article className="flex h-full flex-col rounded-md border border-border bg-card p-5">
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-surface-muted text-navy-900 dark:text-navy-300"
                    >
                      <FileText className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="type-small font-semibold tracking-wide text-accent uppercase">
                        {document.kind}
                      </p>
                      <h2 className="mt-1 font-serif type-h3 text-balance">
                        {document.title}
                      </h2>
                    </div>
                  </div>

                  <p className="mt-3 flex-1 type-small text-muted-foreground">
                    {document.description}
                  </p>

                  <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 type-small text-muted-foreground">
                    <div className="flex gap-1">
                      <dt>Format :</dt>
                      <dd className="font-medium text-foreground">
                        {document.fileFormat}
                      </dd>
                    </div>
                    {document.pages && (
                      <div className="flex gap-1">
                        <dt>Pages :</dt>
                        <dd
                          data-numeric
                          className="font-medium text-foreground"
                        >
                          {document.pages}
                        </dd>
                      </div>
                    )}
                    <div className="flex gap-1">
                      <dt>Poids :</dt>
                      <dd data-numeric className="font-medium text-foreground">
                        {formatBytes(document.fileBytes)}
                      </dd>
                    </div>
                    <div className="flex gap-1">
                      <dt>Publié le :</dt>
                      <dd>
                        <time dateTime={isoDate(document.publishedAt)}>
                          {formatDate(document.publishedAt)}
                        </time>
                      </dd>
                    </div>
                  </dl>

                  <a
                    href={document.fileUrl}
                    download
                    className="mt-5 inline-flex items-center justify-center gap-2 self-start rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
                  >
                    <Download aria-hidden="true" className="size-4" />
                    Télécharger
                    <span className="sr-only">
                      {" "}
                      {document.title} — {document.fileFormat},{" "}
                      {formatBytes(document.fileBytes)}
                    </span>
                  </a>
                </article>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
