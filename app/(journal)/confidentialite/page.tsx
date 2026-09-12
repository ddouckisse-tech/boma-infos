import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/custom/container";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Quelles données Le Corporate collecte, pourquoi, combien de temps, et comment exercer vos droits.",
  alternates: { canonical: "/confidentialite" },
};

/**
 * Privacy policy.
 *
 * The audit found the legacy site depositing Google Analytics and seven
 * WooCommerce advertising cookies before any consent, with no policy page at
 * all. This version has nothing to declare because the site collects nothing
 * by default: no analytics, no advertising tag, no third-party request.
 * That is the honest state of the application, and it is stated plainly.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <LocalizedText fr="Informations légales" en="Legal information" />
        }
        title={
          <LocalizedText
            fr="Politique de confidentialité"
            en="Privacy policy"
          />
        }
        description={
          <LocalizedText
            fr="Ce que le site enregistre, ce qu'il n'enregistre pas, et comment exercer vos droits."
            en="What the site stores, what it does not store, and how to exercise your rights."
          />
        }
        width="reading"
      />

      <Section width="reading">
        <Container width="reading" className="px-0">
          <div className="lc-fr article-body type-body" lang="fr">
            <h2 className="font-display type-h2">Aucun traçage par défaut</h2>
            <p>
              La lecture du journal ne dépose <strong>aucun cookie</strong> et
              ne déclenche <strong>aucune requête vers un tiers</strong>. Pas de
              mesure d&apos;audience, pas de régie publicitaire, pas de bouton
              social qui vous suit&nbsp;: les boutons de partage sont de simples
              liens, qui n&apos;envoient rien tant que vous ne cliquez pas. Les
              polices et les images sont servies depuis ce domaine, jamais
              depuis un serveur extérieur.
            </p>
            <p>
              C&apos;est aussi pour cela qu&apos;aucune bannière de consentement
              ne vous est présentée&nbsp;: il n&apos;y a rien à consentir.
            </p>

            <h2 className="font-display type-h2">
              Ce qui est conservé dans votre navigateur
            </h2>
            <p>
              Deux préférences, stockées localement sur votre appareil et jamais
              transmises&nbsp;:
            </p>
            <ul className="list-disc space-y-2 ps-6">
              <li>
                <strong>le thème</strong> (clair, sombre ou celui de votre
                système)&nbsp;;
              </li>
              <li>
                <strong>l&apos;économie de données</strong>, qui abaisse la
                définition des images.
              </li>
            </ul>
            <p>
              Elles disparaissent si vous videz les données de navigation. Ce ne
              sont pas des cookies&nbsp;: rien n&apos;est envoyé au serveur.
            </p>
            <p>
              Un <em>service worker</em> conserve également une copie des
              dernières pages que vous avez ouvertes, pour qu&apos;elles restent
              lisibles hors connexion. Cette copie vit sur votre appareil et
              n&apos;est accessible qu&apos;à vous.
            </p>

            <h2 className="font-display type-h2">
              Les données que vous nous confiez
            </h2>
            <h3 className="font-display type-h3">Formulaire de contact</h3>
            <ul className="list-disc space-y-2 ps-6">
              <li>
                Données&nbsp;: nom, adresse électronique, organisation
                (facultative), objet et message.
              </li>
              <li>Finalité&nbsp;: répondre à votre demande.</li>
              <li>
                Destinataire&nbsp;: la rédaction du Corporate, elle seule.
              </li>
              <li>Conservation&nbsp;: douze mois.</li>
              <li>
                Base&nbsp;: votre consentement, recueilli par la case à cocher
                du formulaire.
              </li>
            </ul>

            <h3 className="font-display type-h3">Lettre hebdomadaire</h3>
            <ul className="list-disc space-y-2 ps-6">
              <li>Donnée&nbsp;: votre adresse électronique.</li>
              <li>
                Finalité&nbsp;: vous envoyer la lettre. Rien d&apos;autre&nbsp;:
                elle n&apos;est ni vendue, ni cédée, ni utilisée pour du
                ciblage.
              </li>
              <li>
                Base&nbsp;: votre consentement, confirmé par un second clic
                (double opt-in).
              </li>
              <li>
                Conservation&nbsp;: jusqu&apos;à votre désinscription, possible
                en un clic depuis chaque envoi.
              </li>
            </ul>

            <h2 className="font-display type-h2">Hébergement des données</h2>
            <p>
              Les articles, les messages de contact et les inscriptions à la
              lettre sont stockés chez notre prestataire de base de données. Le
              nom et la localisation de l&apos;hébergement retenu seront
              précisés dans les{" "}
              <Link href="/mentions-legales" prefetch={false}>
                mentions légales
              </Link>{" "}
              avant la mise en ligne publique.
            </p>

            <h2 className="font-display type-h2">Vos droits</h2>
            <p>
              Vous disposez d&apos;un droit d&apos;accès, de rectification,
              d&apos;effacement et d&apos;opposition sur les données vous
              concernant, au titre du règlement général sur la protection des
              données et de la loi gabonaise n°&nbsp;001/2011 relative à la
              protection des données à caractère personnel. Écrivez à{" "}
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>&nbsp;: nous
              répondons sous un mois.
            </p>
            <p>
              L&apos;autorité de contrôle compétente au Gabon est la Commission
              nationale pour la protection des données à caractère personnel
              (CNPDCP).
            </p>
          </div>
          <div className="lc-en article-body type-body" lang="en">
            <h2 className="font-display type-h2">No tracking by default</h2>
            <p>
              Reading the journal sets <strong>no cookies</strong> and makes
              <strong> no requests to third parties</strong>. There is no
              audience tracking, advertising network or social button that
              follows you. Fonts and images are served from this domain.
            </p>
            <p>
              No consent banner is shown because there is nothing to consent to.
            </p>

            <h2 className="font-display type-h2">What your browser stores</h2>
            <p>
              Two preferences are stored locally on your device and are never
              transmitted:
            </p>
            <ul className="list-disc space-y-2 ps-6">
              <li>
                <strong>theme</strong> (light, dark or system);
              </li>
              <li>
                <strong>data saver</strong>, which lowers image resolution.
              </li>
            </ul>
            <p>
              They disappear when you clear browsing data. They are not cookies
              and nothing is sent to the server.
            </p>
            <p>
              A service worker also keeps copies of recently opened pages so
              they remain readable offline. These copies stay on your device.
            </p>

            <h2 className="font-display type-h2">Information you provide</h2>
            <h3 className="font-display type-h3">Contact form</h3>
            <ul className="list-disc space-y-2 ps-6">
              <li>
                Data: name, email address, optional organisation, subject and
                message.
              </li>
              <li>Purpose: to respond to your request.</li>
              <li>Recipient: the Le Corporate editorial team only.</li>
              <li>Retention: twelve months.</li>
              <li>
                Legal basis: your consent, collected through the form checkbox.
              </li>
            </ul>
            <h3 className="font-display type-h3">Weekly newsletter</h3>
            <ul className="list-disc space-y-2 ps-6">
              <li>Data: your email address.</li>
              <li>
                Purpose: to send the newsletter only. It is not sold, shared or
                used for targeting.
              </li>
              <li>Legal basis: your consent, confirmed by a second click.</li>
              <li>
                Retention: until you unsubscribe using the link in any issue.
              </li>
            </ul>

            <h2 className="font-display type-h2">Data hosting</h2>
            <p>
              Articles, contact messages and newsletter subscriptions are held
              by our database provider. Its name and hosting location will be
              stated in the{" "}
              <Link href="/mentions-legales" prefetch={false}>
                legal notice
              </Link>
              .
            </p>

            <h2 className="font-display type-h2">Your rights</h2>
            <p>
              You may request access, correction, deletion or object to the use
              of your personal data under the GDPR and Gabonese Law no.
              001/2011. Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>;
              we reply within one month.
            </p>
            <p>
              Gabon&apos;s competent authority is the CNPDCP, the national
              personal-data protection commission.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
