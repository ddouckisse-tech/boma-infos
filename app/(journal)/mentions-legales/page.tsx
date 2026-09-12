import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { Container } from "@/components/custom/container";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Éditeur, directeur de publication, hébergeur et conditions d'utilisation du site Le Corporate.",
  alternates: { canonical: "/mentions-legales" },
};

/**
 * Legal notice.
 *
 * The audit's first "urgence" was that this page did not exist — four
 * candidate URLs, four 404s — while the site tracked its readers. It exists
 * now; the fields the publisher alone can supply (directeur de publication,
 * RCCM, récépissé HAC, hébergeur) are shown as explicitly missing rather
 * than invented, because a legal notice filled with plausible-looking
 * fiction would be worse than none.
 */
const TO_PROVIDE = [
  "Nom du directeur de la publication",
  "Raison sociale complète et forme juridique de l'éditeur",
  "Numéro d'immatriculation au registre du commerce (RCCM) et NIF",
  "Numéro de récépissé ou d'agrément auprès de la Haute Autorité de la Communication (HAC)",
  "Adresse postale précise du siège de la rédaction",
  "Raison sociale et coordonnées de l'hébergeur retenu",
  "Numéro ISSN, le cas échéant",
];

export default function LegalPage() {
  return (
    <>
      <PageHeader
        eyebrow="Informations légales"
        title="Mentions légales"
        description="Identification de l'éditeur et conditions d'utilisation du site."
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
              Page en cours de constitution. Les mentions ci-dessous sont celles
              dont la rédaction dispose&nbsp;; les éléments listés plus bas
              doivent être fournis par l&apos;éditeur avant la mise en ligne
              publique. Aucune information n&apos;est inventée ici.
            </p>
          </div>

          <div className="article-body mt-8 type-body">
            <h2 className="font-serif type-h2">Éditeur du site</h2>
            <p>
              {SITE.name}, magazine économique en ligne, édité par{" "}
              {SITE.publisher}, {SITE.address}.
            </p>
            <ul className="list-disc space-y-2 ps-6">
              <li>
                Courriel de la rédaction&nbsp;:{" "}
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
              <li>
                Téléphone&nbsp;: <a href={SITE.phoneHref}>{SITE.phone}</a>
              </li>
            </ul>

            <h2 className="font-serif type-h2">Éléments à compléter</h2>
            <p>
              Un organe de presse doit pouvoir être identifié par son lecteur.
              Les mentions suivantes relèvent de l&apos;éditeur et seront
              publiées ici dès leur transmission&nbsp;:
            </p>
            <ul className="list-disc space-y-2 ps-6">
              {TO_PROVIDE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2 className="font-serif type-h2">Propriété intellectuelle</h2>
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

            <h2 className="font-serif type-h2">Responsabilité</h2>
            <p>
              Les tribunes signées n&apos;engagent que leurs auteurs. Les
              contenus d&apos;origine commerciale portent la mention
              «&nbsp;Contenu partenaire&nbsp;» et sont identifiés comme tels
              partout où ils apparaissent.
            </p>

            <h2 className="font-serif type-h2">Droit de réponse</h2>
            <p>
              Toute personne nommée dans un article dispose d&apos;un droit de
              réponse. Adressez votre demande à la rédaction&nbsp;: elle sera
              traitée dans les délais prévus par la loi gabonaise.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
