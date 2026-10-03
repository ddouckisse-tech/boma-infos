import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Container } from "@/components/custom/container";
import { LocalizedText } from "@/components/custom/localized-text";
import { NewsletterForm } from "@/components/custom/newsletter-form";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Newsletter",
  description: `La lettre hebdomadaire de ${SITE.name} : l'essentiel de l'actualité du Gabon, chaque vendredi matin. Inscription à double confirmation.`,
  alternates: { canonical: "/newsletter" },
  robots: { index: true, follow: true },
};

const PROMISES = [
  {
    fr: "Un envoi par semaine, le vendredi matin. Jamais davantage.",
    en: "One issue a week, on Friday morning. Never more.",
  },
  {
    fr: "L'essentiel de l'actualité du Gabon : les articles à retenir de la semaine.",
    en: "The essential news from Gabon: the week's articles worth keeping.",
  },
  {
    fr: "Votre adresse n'est ni vendue, ni cédée, ni utilisée pour autre chose que cette lettre.",
    en: "Your address is never sold, shared or used for anything other than this newsletter.",
  },
  {
    fr: "Un lien de désinscription en un clic dans chaque envoi — pas de formulaire, pas de compte à créer.",
    en: "Every issue includes one-click unsubscribe, with no form or account required.",
  },
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
        eyebrow={<LocalizedText fr="Le journal" en="The journal" />}
        title={
          <LocalizedText
            fr="La lettre hebdomadaire"
            en="The weekly newsletter"
          />
        }
        description={
          <LocalizedText
            fr="Un courriel par semaine, écrit par la rédaction, pour suivre l'actualité du Gabon sans ouvrir le site tous les jours."
            en="One email a week from the editorial team, so you can follow the news from Gabon without checking the site every day."
          />
        }
        width="reading"
      />

      <Section width="reading">
        <Container width="reading" className="px-0">
          <ul className="grid gap-3">
            {PROMISES.map((promise) => (
              <li key={promise.fr} className="flex gap-3 type-body">
                <Check
                  aria-hidden="true"
                  className="mt-1 size-5 shrink-0 text-success-token"
                />
                <span className="min-w-0">
                  <LocalizedText {...promise} />
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-md border border-border bg-surface-muted p-6">
            <NewsletterForm source="page-newsletter" variant="block" />
          </div>

          <div className="article-body mt-10 type-body">
            <h2 className="font-display type-h2">
              <LocalizedText
                fr="Comment fonctionne l'inscription"
                en="How subscription works"
              />
            </h2>
            <ol className="list-decimal space-y-2 ps-6">
              <li>
                <LocalizedText
                  fr="Vous saisissez votre adresse. Rien n'est encore enregistré comme un abonnement."
                  en="Enter your email address. It is not yet recorded as a subscription."
                />
              </li>
              <li>
                <LocalizedText
                  fr="Vous recevez un message de confirmation. Tant que vous ne cliquez pas, vous ne recevez aucune lettre : ce double consentement protège les personnes dont l'adresse serait saisie par un tiers."
                  en="You receive a confirmation message. No newsletter is sent until you click, protecting anyone whose address may have been entered by someone else."
                />
              </li>
              <li>
                <LocalizedText
                  fr="Vous cliquez, l'abonnement devient actif. Chaque envoi porte un lien de désinscription qui fonctionne en un clic."
                  en="Click to activate the subscription. Every issue includes a one-click unsubscribe link."
                />
              </li>
            </ol>
            <p>
              <LocalizedText
                fr="Vos données : seule votre adresse électronique est conservée pendant votre abonnement. Elle sert uniquement à vous envoyer cette lettre. Voir la "
                en="Your data: only your email address is stored while you subscribe. It is used solely to send this newsletter. Read the "
              />
              <Link href="/confidentialite" prefetch={false}>
                <LocalizedText
                  fr="politique de confidentialité"
                  en="privacy policy"
                />
              </Link>
              .
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
