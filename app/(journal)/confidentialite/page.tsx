import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/custom/container";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SITE } from "@/lib/site";
import { getAdSenseCmpConfig } from "@/lib/ads/adsense-config";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Quelles données ${SITE.name} collecte, pourquoi, combien de temps, et comment exercer vos droits.`,
  alternates: { canonical: "/confidentialite" },
};

/**
 * Privacy policy.
 *
 * The audit found the legacy site depositing Google Analytics and seven
 * WooCommerce advertising cookies before any consent, with no policy page at
 * all. Display campaigns now use the site's own media and keep dismissal
 * preferences locally, without third-party advertising scripts.
 */
export default function PrivacyPage() {
  const externalAdvertising = getAdSenseCmpConfig() !== null;
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
            <h2 className="font-display type-h2">
              Publicité et choix de lecture
            </h2>
            {externalAdvertising ? (
              <p>
                Des emplacements Google AdSense peuvent financer le journal.
                Leur chargement attend le signal de consentement de la
                plateforme de gestion des choix. Sans accord, aucun encart
                Google n&apos;est demandé par le site. Vous pouvez revoir vos
                choix dans le panneau de consentement ; un retrait masque les
                encarts et bloque les nouvelles demandes. Les annonces Google ne
                sont pas soumises à la rotation des campagnes internes.
              </p>
            ) : (
              <>
                <p>
                  Les encarts publicitaires utilisent la médiathèque du journal,
                  sans script publicitaire tiers ni profil de ciblage. Les
                  images sont servies par le site ou son stockage Convex. Les
                  boutons de partage et les publicités sont de simples
                  liens&nbsp;: le site de destination ne s&apos;ouvre que
                  lorsque vous cliquez.
                </p>
                <p>
                  Aucun identifiant de suivi publicitaire n&apos;est créé. Les
                  éventuelles mesures d&apos;audience du journal restent
                  distinctes des encarts et ne servent pas à choisir leurs
                  créations.
                </p>
              </>
            )}

            <h2 className="font-display type-h2">
              Ce qui est conservé dans votre navigateur
            </h2>
            <p>
              Le site conserve vos préférences de lecture sur cet
              appareil&nbsp;:
            </p>
            <ul className="list-disc space-y-2 ps-6">
              <li>
                <strong>le thème</strong> (clair, sombre ou celui de votre
                système)&nbsp;;
              </li>
              <li>
                <strong>l&apos;économie de données</strong>, qui abaisse la
                définition des images&nbsp;;
              </li>
              <li>
                <strong>la langue de l&apos;interface</strong> (français ou
                anglais)&nbsp;;
              </li>
              <li>
                <strong>la fermeture des publicités</strong>, mémorisée pendant
                24 heures pour l&apos;emplacement et la campagne. Un encart
                fermé ne revient pas tant que vous restez sur la même page.
              </li>
            </ul>
            <p>
              Elles disparaissent si vous videz les données de navigation. La
              fermeture des publicités reste locale et n&apos;est jamais
              transmise au serveur. L&apos;économie de données est aussi portée
              par un cookie de préférence pour servir des images plus légères.
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
                Destinataire&nbsp;: la rédaction de {SITE.name}, elle seule.
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
            <h2 className="font-display type-h2">
              Advertising and reading preferences
            </h2>
            {externalAdvertising ? (
              <p>
                Google AdSense placements may help fund the journal. They wait
                for a consent signal from the consent management platform before
                loading. Without consent, the site does not request any Google
                ads. You can review your choices in the consent panel;
                withdrawing consent hides ads and blocks new requests. Google
                ads do not use the rotation applied to internal campaigns.
              </p>
            ) : (
              <>
                <p>
                  Ads use the journal&apos;s media library, without third-party
                  advertising scripts or targeting profiles. Images are served
                  by the site or its Convex storage. Share buttons and ads are
                  simple links: the destination site opens only when you click.
                </p>
                <p>
                  No advertising tracking identifier is created. Any audience
                  measurement by the journal remains separate from ads and is
                  not used to select their creatives.
                </p>
              </>
            )}

            <h2 className="font-display type-h2">What your browser stores</h2>
            <p>The site stores your reading preferences on this device:</p>
            <ul className="list-disc space-y-2 ps-6">
              <li>
                <strong>theme</strong> (light, dark or system);
              </li>
              <li>
                <strong>data saver</strong>, which lowers image resolution;
              </li>
              <li>
                <strong>interface language</strong> (French or English);
              </li>
              <li>
                <strong>ad dismissal</strong>, remembered for 24 hours for the
                placement and campaign. A dismissed ad does not return while you
                remain on the same page.
              </li>
            </ul>
            <p>
              They disappear when you clear browsing data. Ad dismissals stay
              local and are never sent to the server. Data saver is also stored
              in a preference cookie to serve lighter images.
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
              <li>Recipient: the {SITE.name} editorial team only.</li>
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
