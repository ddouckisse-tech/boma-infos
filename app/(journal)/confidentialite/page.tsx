import type { Metadata } from "next";
import Link from "next/link";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { getAdSenseCmpConfig } from "@/lib/ads/adsense-config";
import { SITE } from "@/lib/site";

const APDPVP_EMAIL = "contact@apdpvp.ga";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Les données traitées par ${SITE.name}, vos droits et les recours auprès de l’APDPVP au Gabon.`,
  alternates: { canonical: "/confidentialite" },
};

export default function PrivacyPage() {
  const externalAdvertising = getAdSenseCmpConfig() !== null;

  return (
    <>
      <PageHeader
        title={<LocalizedText fr="Confidentialité" en="Privacy policy" />}
        description={
          <LocalizedText
            fr="Les données traitées par BOMA Infos et vos droits au Gabon."
            en="How BOMA Infos handles personal data and what your rights are in Gabon."
          />
        }
        width="reading"
      />

      <Section width="reading">
        <div className="article-body type-body">
          <h2 className="type-h2">
            <LocalizedText
              fr="Qui traite vos données"
              en="Who handles your data"
            />
          </h2>
          <p>
            {SITE.publisher ? (
              <LocalizedText
                fr={`${SITE.publisher}, éditeur de ${SITE.name}, est responsable des traitements présentés ici.`}
                en={`${SITE.publisher}, the publisher of ${SITE.name}, is responsible for the processing described here.`}
              />
            ) : (
              <LocalizedText
                fr="La rédaction de BOMA Infos est le point de contact pour les demandes relatives aux données personnelles. L’identité juridique complète du responsable du traitement reste à préciser."
                en="The BOMA Infos newsroom is the point of contact for personal data requests. The controller’s full legal identity is pending confirmation."
              />
            )}{" "}
            <Link href="/mentions-legales" prefetch={false}>
              <LocalizedText
                fr="Voir les mentions légales"
                en="See the legal notice"
              />
            </Link>
            .
          </p>

          <h2 className="type-h2" id="formulaires">
            <LocalizedText fr="Formulaires et compte" en="Forms and accounts" />
          </h2>
          <h3 className="type-h3">
            <LocalizedText fr="Contact" en="Contact" />
          </h3>
          <p>
            <LocalizedText
              fr="Avec votre accord, nous enregistrons votre nom, votre adresse électronique, votre organisation si vous la renseignez, l’objet et le message. Ces informations permettent à la rédaction de répondre et d’assurer le suivi de votre demande. Le formulaire indique les champs nécessaires à l’envoi."
              en="With your consent, we store your name, email address, optional organisation, subject and message so the newsroom can respond and follow up. The form marks the fields needed to send your message."
            />
          </p>
          <h3 className="type-h3" id="lettre-hebdomadaire">
            <LocalizedText fr="Lettre hebdomadaire" en="Weekly newsletter" />
          </h3>
          <p>
            <LocalizedText
              fr="Quand vous demandez à recevoir la lettre, le site enregistre votre adresse électronique, l’origine de l’inscription, son état, les dates utiles et les jetons de confirmation et de désinscription. L’adresse est nécessaire pour l’envoi de la lettre. La confirmation se fait actuellement à l’écran. Le lien de désinscription arrête l’abonnement. Un enregistrement de la désinscription reste conservé."
              en="When you sign up, the site stores your email address, where you signed up, your subscription status, relevant dates and confirmation and unsubscribe tokens. Your email is needed to send the newsletter. Confirmation currently takes place on screen. The unsubscribe link stops the subscription. A record of unsubscribing is retained."
            />
          </p>
          <h3 className="type-h3" id="espace-entreprise">
            <LocalizedText fr="Espace entreprise" en="Company accounts" />
          </h3>
          <p>
            <LocalizedText
              fr="Les informations du compte et de l’entreprise servent à gérer votre accès et à permettre à la rédaction d’examiner les contenus que vous lui transmettez. Les éléments désignés comme obligatoires servent à créer le compte ou à examiner le dépôt."
              en="Account and company information is used to manage access and let the newsroom review the material you submit. Fields marked as required are used to create the account or review the submission."
            />
          </p>

          <h2 className="type-h2">
            <LocalizedText
              fr="Conservation et hébergement"
              en="Retention and hosting"
            />
          </h2>
          <p>
            <LocalizedText
              fr="Convex fournit la base de données et le stockage de fichiers du site. Les durées précises de conservation, le pays d’hébergement du déploiement et les éventuelles garanties de transfert restent à confirmer par l’éditeur."
              en="Convex provides the site’s database and file storage. The publisher still needs to confirm specific retention periods, the deployment’s hosting country and any safeguards for transfers."
            />
          </p>

          <h2 className="type-h2">
            <LocalizedText
              fr="Préférences, audience et publicité"
              en="Preferences, audience and advertising"
            />
          </h2>
          <p>
            <LocalizedText
              fr="Le navigateur mémorise votre langue, votre thème et vos choix de lecture. Un cookie permet au site de servir des images plus légères lorsque l’économie de données est activée. Des pages consultées peuvent être gardées sur l’appareil pour la lecture hors connexion. Le navigateur permet d’effacer ces données."
              en="Your browser remembers your language, theme and reading preferences. A cookie lets the site serve smaller images when data saver is active. Pages you open may be cached on your device for offline reading. You can clear this data in your browser."
            />
          </p>
          <p>
            <LocalizedText
              fr="Lorsqu’elle est activée, la mesure d’audience remonte des vues, des durées de lecture et des canaux de partage pour établir des statistiques sur les articles."
              en="When audience measurement is enabled, page views, reading times and sharing channels are recorded to produce article statistics."
            />
          </p>
          <p>
            {externalAdvertising ? (
              <LocalizedText
                fr="Les annonces Google AdSense sont demandées après le signal de consentement du panneau publicitaire. Ce panneau permet aussi de modifier ou de retirer votre accord."
                en="Google AdSense ads are requested once the advertising panel signals consent. The same panel lets you change or withdraw consent."
              />
            ) : (
              <LocalizedText
                fr="Les campagnes gérées directement par le journal utilisent ses propres visuels. La fermeture d’un encart est enregistrée dans le navigateur pendant 24 heures."
                en="Campaigns managed directly by the journal use its own media. Your browser remembers ad dismissals for 24 hours."
              />
            )}
          </p>

          <h2 className="type-h2" id="vos-droits">
            <LocalizedText
              fr="Vos droits et recours au Gabon"
              en="Your rights and remedies in Gabon"
            />
          </h2>
          <p>
            <LocalizedText
              fr="Ces droits sont prévus par la loi gabonaise n° 001/2011 du 25 septembre 2011 relative à la protection des données à caractère personnel, modifiée par la loi n° 025/2023."
              en="These rights are provided by Gabonese Law No. 001/2011 of 25 September 2011 on personal data protection, as amended by Law No. 025/2023."
            />{" "}
            <a href="https://journal-officiel.ga/20085-025-2023-/">
              <LocalizedText
                fr="Consulter le texte au Journal officiel"
                en="Read the law in the Official Gazette"
              />
            </a>
            .
          </p>
          <ul className="list-disc space-y-2 ps-6">
            <li>
              <LocalizedText
                fr="Vous informer sur le traitement de vos données et demander à y accéder ou à en recevoir une copie."
                en="Ask how your data is processed, request access and receive a copy."
              />
            </li>
            <li>
              <LocalizedText
                fr="Faire corriger ou compléter vos données et, dans les cas prévus par la loi, demander leur effacement, la limitation de leur traitement ou leur portabilité."
                en="Have your data corrected or completed and, where the law provides, request deletion, restriction or portability."
              />
            </li>
            <li>
              <LocalizedText
                fr="Vous opposer au traitement dans les conditions prévues par la loi, notamment à la prospection, et retirer à tout moment un consentement donné."
                en="Object to processing where provided by law, including direct marketing, and withdraw consent at any time."
              />
            </li>
            <li>
              <LocalizedText
                fr="Exercer les garanties prévues par la loi lorsqu’une décision est prise uniquement par un traitement automatisé."
                en="Exercise the safeguards provided by law when a decision is based solely on automated processing."
              />
            </li>
          </ul>
          <p>
            <LocalizedText
              fr="Pour exercer un droit, écrivez à la rédaction et précisez votre demande."
              en="To exercise a right, write to the newsroom and explain your request."
            />{" "}
            <Link href="/contacts" prefetch={false}>
              <LocalizedText
                fr="Contacter BOMA Infos"
                en="Contact BOMA Infos"
              />
            </Link>
            .
          </p>
          <p>
            <LocalizedText
              fr="Vous pouvez aussi adresser une réclamation à l’Autorité pour la protection des données personnelles et de la vie privée (APDPVP), à Libreville."
              en="You can also lodge a complaint with Gabon’s Personal Data and Privacy Protection Authority (APDPVP), based in Libreville."
            />{" "}
            <a href={`mailto:${APDPVP_EMAIL}`}>{APDPVP_EMAIL}</a>
            {" · "}
            <a href="https://www.apdpvp.ga/contact-two/">
              <LocalizedText fr="Contacter l’APDPVP" en="Contact the APDPVP" />
            </a>
            {" · "}
            <a href="https://www.apdpvp.ga/vos-droits/">
              <LocalizedText
                fr="Guide officiel de vos droits"
                en="Official guide to your rights"
              />
            </a>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
