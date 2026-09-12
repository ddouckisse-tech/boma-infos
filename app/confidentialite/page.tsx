import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/custom/container";
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
        eyebrow="Informations légales"
        title="Politique de confidentialité"
        description="Ce que le site enregistre, ce qu'il n'enregistre pas, et comment exercer vos droits."
        width="reading"
      />

      <Section width="reading">
        <Container width="reading" className="px-0">
          <div className="article-body type-body">
            <h2 className="font-serif type-h2">Aucun traçage par défaut</h2>
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

            <h2 className="font-serif type-h2">
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

            <h2 className="font-serif type-h2">
              Les données que vous nous confiez
            </h2>
            <h3 className="font-serif type-h3">Formulaire de contact</h3>
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

            <h3 className="font-serif type-h3">Lettre hebdomadaire</h3>
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

            <h2 className="font-serif type-h2">Hébergement des données</h2>
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

            <h2 className="font-serif type-h2">Vos droits</h2>
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
