import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { Container } from "@/components/custom/container";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Éditeur, directeur de publication, hébergeur et conditions d'utilisation du site ${SITE.name}.`,
  alternates: { canonical: "/mentions-legales" },
};

/**
 * Legal notice.
 *
 * The fields only the publisher can supply (publication director, publishing
 * company, RCCM and NIF, HAC receipt, postal address, newsroom phone number,
 * final newsroom email address, hosting provider, ISSN) are listed as
 * explicitly missing rather than invented, because a legal notice filled with
 * plausible-looking fiction would be worse than none. A field that
 * `lib/site.ts` declares `null` is never printed: it appears in this list
 * until the owner provides it.
 */
const TO_PROVIDE: readonly { fr: string; en: string }[] = [
  {
    fr: "Nom du directeur de la publication",
    en: "Name of the publication director",
  },
  SITE.publisher
    ? {
        fr: "Raison sociale complète et forme juridique de l'éditeur",
        en: "Publisher's full legal name and legal form",
      }
    : {
        fr: `Société éditrice de ${SITE.name} : raison sociale complète et forme juridique`,
        en: `Company that publishes ${SITE.name}: full legal name and legal form`,
      },
  {
    fr: "Numéro d'immatriculation au registre du commerce (RCCM) et NIF",
    en: "Trade register number (RCCM) and tax identification number",
  },
  {
    fr: "Numéro de récépissé ou d'agrément auprès de la Haute Autorité de la Communication (HAC)",
    en: "Receipt or accreditation number from the High Authority for Communication (HAC)",
  },
  {
    fr: "Adresse postale précise du siège de la rédaction",
    en: "Full postal address of the editorial office",
  },
  ...(SITE.phone
    ? []
    : [
        {
          fr: "Numéro de téléphone de la rédaction",
          en: "Newsroom phone number",
        },
      ]),
  {
    fr: `Adresse de courriel définitive de la rédaction (l'adresse affichée, ${SITE.email}, est déduite du nom de domaine et reste à confirmer)`,
    en: `Final newsroom email address (the address shown, ${SITE.email}, is inferred from the domain name and remains to be confirmed)`,
  },
  {
    fr: "Raison sociale et coordonnées de l'hébergeur retenu",
    en: "Legal name and contact details of the hosting provider",
  },
  {
    fr: "Numéro ISSN, le cas échéant",
    en: "ISSN, where applicable",
  },
];

export default function LegalPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <LocalizedText fr="Informations légales" en="Legal information" />
        }
        title={<LocalizedText fr="Mentions légales" en="Legal notice" />}
        description={
          <LocalizedText
            fr="Identification de l'éditeur et conditions d'utilisation du site."
            en="Publisher identification and terms of use for this site."
          />
        }
        width="reading"
      />

      <Section width="reading">
        <Container width="reading" className="px-0">
          <div
            role="note"
            className="flex gap-3 rounded-md border border-warning-token/40 bg-warning-token/10 p-4"
          >
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-warning-token"
            />
            <p className="type-small">
              <LocalizedText
                fr="Page en cours de constitution. Les mentions ci-dessous sont celles dont la rédaction dispose ; les éléments listés plus bas doivent être fournis par l'éditeur avant la mise en ligne publique. Aucune information n'est inventée ici."
                en="This page is still being completed. The information below is what the editorial team currently has; the publisher must supply the remaining items. No information has been invented."
              />
            </p>
          </div>

          <div className="lc-fr article-body mt-8 type-body" lang="fr">
            <h2 className="font-display type-h2">Éditeur du site</h2>
            <p>
              {SITE.name} ({SITE.domain}) est un média d&apos;information
              générale en ligne, consacré à l&apos;actualité du Gabon.
              {SITE.publisher && ` Il est édité par ${SITE.publisher}.`}
            </p>
            <ul className="list-disc space-y-2 ps-6">
              <li>
                Courriel de la rédaction&nbsp;:{" "}
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
              {SITE.phone && SITE.phoneHref && (
                <li>
                  Téléphone&nbsp;: <a href={SITE.phoneHref}>{SITE.phone}</a>
                </li>
              )}
              {SITE.address && (
                <li>Adresse de la rédaction&nbsp;: {SITE.address}</li>
              )}
            </ul>

            <h2 className="font-display type-h2">Éléments à compléter</h2>
            <p>
              Un organe de presse doit pouvoir être identifié par son lecteur.
              Les mentions suivantes relèvent de l&apos;éditeur et seront
              publiées ici dès leur transmission&nbsp;:
            </p>
            <ul className="list-disc space-y-2 ps-6">
              {TO_PROVIDE.map((item) => (
                <li key={item.fr}>{item.fr}</li>
              ))}
            </ul>

            <h2 className="font-display type-h2">Propriété intellectuelle</h2>
            <p>
              Les textes publiés sur ce site sont la propriété de leur auteur et
              de l&apos;éditeur. Toute reproduction intégrale est soumise à
              autorisation&nbsp;; la citation courte avec lien vers
              l&apos;article d&apos;origine est libre.
            </p>
            <p>
              Les photographies proviennent de Wikimedia Commons et sont
              publiées sous licence libre&nbsp;: l&apos;auteur et la licence
              sont indiqués sous chaque image, conformément aux termes de
              celle-ci.
            </p>

            <h2 className="font-display type-h2">Responsabilité</h2>
            <p>
              Les tribunes signées n&apos;engagent que leurs auteurs. Les
              contenus d&apos;origine commerciale portent la mention
              «&nbsp;Contenu partenaire&nbsp;» et sont identifiés comme tels
              partout où ils apparaissent.
            </p>

            <h2 className="font-display type-h2">Droit de réponse</h2>
            <p>
              Toute personne nommée dans un article dispose d&apos;un droit de
              réponse. Adressez votre demande à la rédaction&nbsp;: elle sera
              traitée dans les délais prévus par la loi gabonaise.
            </p>
          </div>
          <div className="lc-en article-body mt-8 type-body" lang="en">
            <h2 className="font-display type-h2">Site publisher</h2>
            <p>
              {SITE.name} ({SITE.domain}) is an online general news outlet
              devoted to the news from Gabon.
              {SITE.publisher && ` It is published by ${SITE.publisher}.`}
            </p>
            <ul className="list-disc space-y-2 ps-6">
              <li>
                Editorial email:{" "}
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
              {SITE.phone && SITE.phoneHref && (
                <li>
                  Phone: <a href={SITE.phoneHref}>{SITE.phone}</a>
                </li>
              )}
              {SITE.address && <li>Editorial office: {SITE.address}</li>}
            </ul>
            <h2 className="font-display type-h2">
              Information to be completed
            </h2>
            <p>
              A press publication must be identifiable to its readers. The
              publisher must provide:
            </p>
            <ul className="list-disc space-y-2 ps-6">
              {TO_PROVIDE.map((item) => (
                <li key={item.en}>{item.en}</li>
              ))}
            </ul>
            <h2 className="font-display type-h2">Intellectual property</h2>
            <p>
              Texts published on this site belong to their authors and the
              publisher. Full reproduction requires permission; short quotations
              with a link to the original article are permitted.
            </p>
            <p>
              Photographs from Wikimedia Commons are published under open
              licences. The author and licence are shown beneath each image.
            </p>
            <h2 className="font-display type-h2">Liability</h2>
            <p>
              Signed opinion pieces commit only their authors. Commercial
              material is labelled “Partner content” wherever it appears.
            </p>
            <h2 className="font-display type-h2">Right of reply</h2>
            <p>
              Anyone named in an article has a right of reply. Send your request
              to the editorial team; it will be handled within the time limits
              set by Gabonese law.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
