import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/custom/container";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { api } from "@/convex/_generated/api";
import { runMutation } from "@/lib/content/server";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Confirmation d'inscription",
  robots: { index: false, follow: false },
};

/**
 * Second step of the double opt-in (CDC §4.2).
 *
 * The token arrives in the URL and is consumed here. `dynamic = "force-dynamic"`
 * because the page writes: prerendering it would confirm an abonnement at
 * build time, which is exactly the bug double opt-in exists to prevent.
 */
export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  searchParams,
}: PageProps<"/newsletter/confirmation">) {
  const params = await searchParams;
  const raw = params.jeton;
  const token = (Array.isArray(raw) ? raw[0] : (raw ?? "")).trim();

  const result = token
    ? await runMutation(
        api.newsletter.confirm,
        { token },
        "newsletter.confirm"
      ).catch(() => ({
        status: "unknown" as const,
        unsubscribeToken: undefined,
      }))
    : { status: "unknown" as const, unsubscribeToken: undefined };

  const ok =
    result.status === "confirmed" || result.status === "already_confirmed";

  return (
    <>
      <PageHeader
        eyebrow="Newsletter"
        title={
          ok ? (
            <LocalizedText
              fr="Inscription confirmée"
              en="Subscription confirmed"
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
              fr={`Vous recevrez la lettre hebdomadaire de ${SITE.name} chaque vendredi matin.`}
              en={`You will receive the ${SITE.name} weekly newsletter every Friday morning.`}
            />
          ) : (
            <LocalizedText
              fr="Le lien de confirmation est incorrect, ou il a déjà été utilisé et remplacé par une demande plus récente."
              en="The confirmation link is incorrect, or it has already been used and replaced by a newer request."
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
                {result.status === "confirmed" && (
                  <LocalizedText
                    fr="Votre adresse est désormais inscrite. Chaque envoi comportera un lien de désinscription en un clic."
                    en="Your address is now subscribed. Every issue will include a one-click unsubscribe link."
                  />
                )}
                {result.status === "already_confirmed" && (
                  <LocalizedText
                    fr="Cette adresse était déjà inscrite : rien n'a changé."
                    en="This address was already subscribed; nothing has changed."
                  />
                )}
                {result.status === "unknown" && (
                  <LocalizedText
                    fr="Reprenez l'inscription depuis la page de la newsletter ; un nouveau lien de confirmation vous sera proposé."
                    en="Start again from the newsletter page to receive a new confirmation link."
                  />
                )}
              </p>

              {ok && result.unsubscribeToken && (
                <p className="mt-4 type-small text-muted-foreground">
                  <LocalizedText
                    fr="Conservez ce lien de désinscription : "
                    en="Keep this unsubscribe link: "
                  />
                  <Link
                    href={`/newsletter/desinscription?jeton=${result.unsubscribeToken}`}
                    prefetch={false}
                    className="text-accent underline underline-offset-4"
                  >
                    <LocalizedText
                      fr="se désinscrire en un clic"
                      en="unsubscribe in one click"
                    />
                  </Link>
                  <LocalizedText
                    fr=". Il sera présent dans chaque envoi."
                    en=". It will appear in every issue."
                  />
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  prefetch={false}
                  className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
                >
                  <LocalizedText fr="Retour à l'accueil" en="Back to home" />
                </Link>
                {!ok && (
                  <Link
                    href="/newsletter"
                    prefetch={false}
                    className="inline-flex items-center rounded-md border border-border px-4 type-small font-semibold transition-colors touch-target hover:bg-surface-muted"
                  >
                    <LocalizedText
                      fr="Reprendre l'inscription"
                      en="Start subscription again"
                    />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
