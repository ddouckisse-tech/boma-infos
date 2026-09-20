import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/custom/container";
import { LocalizedText } from "@/components/custom/localized-text";
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
    result.status === "unsubscribed" ||
    result.status === "already_unsubscribed";

  return (
    <>
      <PageHeader
        eyebrow="Newsletter"
        title={
          ok ? (
            <LocalizedText
              fr="Vous êtes désinscrit"
              en="You are unsubscribed"
            />
          ) : (
            <LocalizedText
              fr="Ce lien n'est plus valable"
              en="This link is no longer valid"
            />
          )
        }
        description={
          ok ? (
            <LocalizedText
              fr="Votre adresse ne recevra plus la lettre hebdomadaire. Aucune autre action n'est nécessaire."
              en="Your address will no longer receive the weekly newsletter. No further action is needed."
            />
          ) : (
            <LocalizedText
              fr="Le lien de désinscription est incorrect. Écrivez à la rédaction et nous retirerons votre adresse."
              en="The unsubscribe link is incorrect. Contact the editorial team and we will remove your address."
            />
          )
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
                {result.status === "unsubscribed" && (
                  <LocalizedText
                    fr="C'est fait. Vous pouvez vous réinscrire à tout moment, sans justification."
                    en="Done. You can subscribe again at any time, without giving a reason."
                  />
                )}
                {result.status === "already_unsubscribed" && (
                  <LocalizedText
                    fr="Cette adresse était déjà désinscrite."
                    en="This address was already unsubscribed."
                  />
                )}
                {result.status === "unknown" && (
                  <LocalizedText
                    fr="Nous n'avons trouvé aucun abonnement correspondant à ce lien."
                    en="We could not find a subscription matching this link."
                  />
                )}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  prefetch={false}
                  className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
                >
                  <LocalizedText fr="Retour à l'accueil" en="Back to home" />
                </Link>
                <Link
                  href="/contacts"
                  prefetch={false}
                  className="inline-flex items-center rounded-md border border-border px-4 type-small font-semibold transition-colors touch-target hover:bg-surface-muted"
                >
                  <LocalizedText
                    fr="Écrire à la rédaction"
                    en="Contact the editorial team"
                  />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
