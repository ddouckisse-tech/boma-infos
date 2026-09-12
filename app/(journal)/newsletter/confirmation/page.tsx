import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/custom/container";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { api } from "@/convex/_generated/api";
import { runMutation } from "@/lib/content/server";

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
        title={ok ? "Inscription confirmée" : "Ce lien n'est plus valable"}
        description={
          ok
            ? "Vous recevrez la lettre hebdomadaire du Corporate chaque vendredi matin."
            : "Le lien de confirmation est incorrect, ou il a déjà été utilisé et remplacé par une demande plus récente."
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
                {result.status === "confirmed" &&
                  "Votre adresse est désormais inscrite. Chaque envoi comportera un lien de désinscription en un clic."}
                {result.status === "already_confirmed" &&
                  "Cette adresse était déjà inscrite : rien n'a changé."}
                {result.status === "unknown" &&
                  "Reprenez l'inscription depuis la page de la newsletter ; un nouveau lien de confirmation vous sera proposé."}
              </p>

              {ok && result.unsubscribeToken && (
                <p className="mt-4 type-small text-muted-foreground">
                  Conservez ce lien de désinscription&nbsp;:{" "}
                  <Link
                    href={`/newsletter/desinscription?jeton=${result.unsubscribeToken}`}
                    prefetch={false}
                    className="text-accent underline underline-offset-4"
                  >
                    se désinscrire en un clic
                  </Link>
                  . Il sera présent dans chaque envoi.
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/"
                  prefetch={false}
                  className="inline-flex items-center rounded-md bg-primary px-4 type-small font-semibold text-primary-foreground transition-colors touch-target hover:bg-primary/90"
                >
                  Retour à l&apos;accueil
                </Link>
                {!ok && (
                  <Link
                    href="/newsletter"
                    prefetch={false}
                    className="inline-flex items-center rounded-md border border-border px-4 type-small font-semibold transition-colors touch-target hover:bg-surface-muted"
                  >
                    Reprendre l&apos;inscription
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
