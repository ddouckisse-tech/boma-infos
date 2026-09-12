import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/custom/container";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { api } from "@/convex/_generated/api";
import { runMutation } from "@/lib/content/server";

export const metadata: Metadata = {
  title: "Désinscription",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Unsubscribing, in one click (CDC §4.2).
 *
 * Opening the link is the whole interaction: no confirmation dialog, no
 * "are you sure", no account to log into, no survey. Leaving must be as
 * cheap as arriving.
 */
export default async function UnsubscribePage({
  searchParams,
}: PageProps<"/newsletter/desinscription">) {
  const params = await searchParams;
  const raw = params.jeton;
  const token = (Array.isArray(raw) ? raw[0] : (raw ?? "")).trim();

  const result = token
    ? await runMutation(
        api.newsletter.unsubscribe,
        { token },
        "newsletter.unsubscribe"
      ).catch(() => ({ status: "unknown" as const }))
    : { status: "unknown" as const };

  const ok =
    result.status === "unsubscribed" || result.status === "already_unsubscribed";

  return (
    <>
      <PageHeader
        eyebrow="Newsletter"
        title={ok ? "Vous êtes désinscrit" : "Ce lien n'est plus valable"}
        description={
          ok
            ? "Votre adresse ne recevra plus la lettre hebdomadaire. Aucune autre action n'est nécessaire."
            : "Le lien de désinscription est incorrect. Écrivez à la rédaction et nous retirerons votre adresse."
        }
        width="reading"
      />

      <Section width="reading">
        <Container width="reading" className="px-0">
          <div className="flex gap-3 rounded-md border border-border bg-card p-6">
            {ok ? (
              <CheckCircle2
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 text-success-token"
              />
            ) : (
              <AlertTriangle
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 text-warning-token"
              />
            )}
            <div className="min-w-0">
              <p className="type-body">
                {result.status === "unsubscribed" &&
                  "C'est fait. Vous pouvez vous réinscrire à tout moment, sans justification."}
                {result.status === "already_unsubscribed" &&
                  "Cette adresse était déjà désinscrite."}
                {result.status === "unknown" &&
                  "Nous n'avons trouvé aucun abonnement correspondant à ce lien."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
                >
                  Retour à l&apos;accueil
                </Link>
                <Link
                  href="/contacts"
                  className="inline-flex items-center rounded-md border border-border px-4 type-small font-semibold transition-colors touch-target hover:bg-surface-muted"
                >
                  Écrire à la rédaction
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
