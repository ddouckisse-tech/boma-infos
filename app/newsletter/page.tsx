import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Container } from "@/components/custom/container";
import { NewsletterForm } from "@/components/custom/newsletter-form";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "La lettre hebdomadaire du Corporate : les articles à retenir, les échéances réglementaires et les appels d'offres ouverts. Inscription à double confirmation.",
  alternates: { canonical: "/newsletter" },
  robots: { index: true, follow: true },
};

const PROMISES = [
  "Un envoi par semaine, le vendredi matin. Jamais davantage.",
  "Les articles à retenir, les échéances réglementaires de la semaine à venir et les appels d'offres encore ouverts.",
  "Votre adresse n'est ni vendue, ni cédée, ni utilisée pour autre chose que cette lettre.",
  "Un lien de désinscription en un clic dans chaque envoi — pas de formulaire, pas de compte à créer.",
];

/**
 * Newsletter landing page (CDC §4.2).
 *
 * Double opt-in is stated before the field, not buried in a footnote: the
 * reader is told there will be a confirmation step, and why.
 */
export default function NewsletterPage() {
  return (
    <>
      <PageHeader
        eyebrow="Le journal"
        title="La lettre hebdomadaire"
        description="Un courriel par semaine, écrit par la rédaction, pour suivre l'économie gabonaise sans ouvrir le site tous les jours."
        width="reading"
      />

      <Section width="reading">
        <Container width="reading" className="px-0">
          <ul className="grid gap-3">
            {PROMISES.map((promise) => (
              <li key={promise} className="flex gap-3 type-body">
                <Check
                  aria-hidden="true"
                  className="mt-1 size-5 shrink-0 text-success-token"
                />
                <span className="min-w-0">{promise}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-md border border-border bg-surface-muted p-6">
            <NewsletterForm source="page-newsletter" variant="block" />
          </div>

          <div className="article-body mt-10 type-body">
            <h2 className="font-serif type-h2">
              Comment fonctionne l&apos;inscription
            </h2>
            <ol className="list-decimal space-y-2 ps-6">
              <li>
                Vous saisissez votre adresse. Rien n&apos;est encore enregistré
                comme un abonnement.
              </li>
              <li>
                Vous recevez un message de confirmation. Tant que vous ne
                cliquez pas, vous ne recevez aucune lettre&nbsp;: c&apos;est ce
                qu&apos;on appelle le double consentement, et cela protège les
                personnes dont l&apos;adresse serait saisie par un tiers.
              </li>
              <li>
                Vous cliquez, l&apos;abonnement devient actif. Chaque envoi
                porte un lien de désinscription qui fonctionne en un clic.
              </li>
            </ol>
            <p>
              Vos données&nbsp;: seule votre adresse électronique est conservée,
              le temps de votre abonnement. Elle sert uniquement à vous envoyer
              cette lettre. Voir la{" "}
              <a href="/confidentialite">politique de confidentialité</a>.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
