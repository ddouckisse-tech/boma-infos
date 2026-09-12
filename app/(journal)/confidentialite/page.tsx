import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/custom/container";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SITE } from "@/lib/site";
import { getAdSenseCmpConfig } from "@/lib/ads/adsense-config";

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
 * all. Display campaigns now use the site's own media and keep dismissal
 * preferences locally, without third-party advertising scripts.
 */
export default function PrivacyPage() {
  const externalAdvertising = getAdSenseCmpConfig() !== null;
  return (
    <>
      <PageHeader
        eyebrow="Informations légales"
        title="Politique de confidentialité"
        description="Ce que le site enregistre, ce qu'il n'enregistre pas, et comment exercer vos droits."
        width="reading"
      />

      <Section width="reading">
        <Container width="reading" className="px-0">
          <div className="article-body type-body">
            <h2 className="font-display type-h2">Publicité et choix de lecture</h2>
            {externalAdvertising ? (
              <p>
                Des emplacements Google AdSense peuvent financer le journal.
                Leur chargement attend le signal de consentement de la plateforme
                de gestion des choix. Sans accord, aucun encart Google n&apos;est
                demandé par le site. Vous pouvez revoir vos choix dans le panneau
                de consentement ; un retrait masque les encarts et bloque les
                nouvelles demandes. Les annonces Google ne sont pas soumises à la
                rotation des campagnes internes.
              </p>
            ) : (
              <>
            <p>
              Les encarts publicitaires utilisent la médiathèque du journal,
              sans script publicitaire tiers ni profil de ciblage. Les images
              sont servies par le site ou son stockage Convex. Les boutons de
              partage et les publicités sont de simples liens&nbsp;: le site
              de destination ne s&apos;ouvre que lorsque vous cliquez.
            </p>
            <p>
              Aucun identifiant de suivi publicitaire n&apos;est créé. Les
              éventuelles mesures d&apos;audience du journal restent distinctes
              des encarts et ne servent pas à choisir leurs créations.
            </p>
              </>
            )}

            <h2 className="font-display type-h2">
              Ce qui est conservé dans votre navigateur
            </h2>
            <p>
              Le site conserve vos préférences de lecture sur cet appareil&nbsp;:
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
                <strong>la fermeture des publicités</strong>, mémorisée pendant
                24 heures pour l&apos;emplacement et la campagne. Un encart
                fermé ne revient pas tant que vous restez sur la même page.
              </li>
            </ul>
            <p>
              Elles disparaissent si vous videz les données de navigation.
              La fermeture des publicités reste locale et n&apos;est jamais
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
        </Container>
      </Section>
    </>
  );
}
