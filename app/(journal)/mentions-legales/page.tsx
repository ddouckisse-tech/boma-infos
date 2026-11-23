import type { Metadata } from "next";
import Link from "next/link";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Identification de l’éditeur, droit de réponse et textes gabonais applicables à ${SITE.name}.`,
  alternates: { canonical: "/mentions-legales" },
};

const gaboneseTexts = [
  {
    href: "https://journal-officiel.ga/18190-025-2021-/",
    fr: "Loi n° 025/2021 sur les transactions électroniques, notamment les articles 23 et 24 sur l’identification de l’éditeur et le droit de réponse.",
    en: "Law No. 025/2021 on electronic transactions, including sections 23 and 24 on publisher identification and the right of reply.",
  },
  {
    href: "https://www.journal-officiel.ga/22405-0012-pr-2026-/",
    fr: "Code de la communication (loi n° 019/2016), modifié notamment par l’ordonnance n° 0012/PR/2026, ratifiée par la loi n° 0017/2026.",
    en: "Communications Code (Law No. 019/2016), as amended, including by Ordinance No. 0012/PR/2026, ratified by Law No. 0017/2026.",
  },
  {
    href: "https://journal-officiel.ga/20866-0011-pr-2024-/",
    fr: "Ordonnance n° 0011/PR/2024 sur le droit d’auteur et les droits voisins, ratifiée par la loi n° 007/2024.",
    en: "Ordinance No. 0011/PR/2024 on copyright and related rights, ratified by Law No. 007/2024.",
  },
  {
    href: "https://journal-officiel.ga/20085-025-2023-/",
    fr: "Loi n° 001/2011 sur les données à caractère personnel, modifiée par la loi n° 025/2023.",
    en: "Law No. 001/2011 on personal data protection, as amended by Law No. 025/2023.",
  },
];

export default function LegalPage() {
  return (
    <>
      <PageHeader
        title={<LocalizedText fr="Mentions légales" en="Legal notice" />}
        description={
          <LocalizedText
            fr="Éditeur, droit de réponse et textes gabonais de référence."
            en="Publisher, right of reply and the relevant Gabonese legislation."
          />
        }
        width="reading"
      />

      <Section width="reading">
        <div className="article-body type-body">
          <h2 className="type-h2">
            <LocalizedText fr="Éditeur du site" en="Site publisher" />
          </h2>
          <p>
            <LocalizedText
              fr={`${SITE.name} (${SITE.domain}) est un journal en ligne consacré à l’actualité du Gabon.`}
              en={`${SITE.name} (${SITE.domain}) is an online newspaper covering news from Gabon.`}
            />{" "}
            <Link href="/a-propos" prefetch={false}>
              <LocalizedText fr="À propos du journal" en="About the journal" />
            </Link>
            .
          </p>
          <ul className="list-disc space-y-2 ps-6">
            {SITE.publisher && (
              <li>
                <LocalizedText fr="Éditeur" en="Publisher" />
                {": "}
                {SITE.publisher}
              </li>
            )}
            {SITE.address && (
              <li>
                <LocalizedText
                  fr="Adresse de la rédaction"
                  en="Editorial office"
                />
                {": "}
                {SITE.address}
              </li>
            )}
            {SITE.phone && SITE.phoneHref && (
              <li>
                <LocalizedText fr="Téléphone" en="Phone" />
                {": "}
                <a href={SITE.phoneHref}>{SITE.phone}</a>
              </li>
            )}
            <li>
              <Link href="/contacts" prefetch={false}>
                <LocalizedText
                  fr="Contacter la rédaction"
                  en="Contact the newsroom"
                />
              </Link>
            </li>
          </ul>
          <p>
            <LocalizedText
              fr="L’éditeur doit encore confirmer son identité légale complète et ses coordonnées, le nom du directeur de publication, l’identité et les coordonnées de l’hébergeur, ainsi que les références administratives applicables auprès de la HAC et de l’APDPVP. Les numéros d’immatriculation (RCCM, NIF) et l’ISSN sont à préciser le cas échéant."
              en="The publisher still needs to confirm its full legal identity and contact details, the publication director’s name, the hosting provider’s identity and contact details, and any applicable HAC and APDPVP registration references. Trade register and tax numbers (RCCM, NIF) and the ISSN should also be provided where applicable."
            />
          </p>

          <h2 className="type-h2">
            <LocalizedText
              fr="Droit de réponse et correction"
              en="Right of reply and corrections"
            />
          </h2>
          <p>
            <LocalizedText
              fr="Si un article vous cite ou vous désigne, vous pouvez adresser une demande de réponse ou de correction à la rédaction. Indiquez le lien de l’article, le passage concerné et, le cas échéant, le texte de votre réponse."
              en="If you are named or identified in an article, you can ask the newsroom for a right of reply or a correction. Include the article link, the passage in question and, where relevant, the text of your reply."
            />{" "}
            <Link href="/contacts" prefetch={false}>
              <LocalizedText
                fr="Écrire à la rédaction"
                en="Write to the newsroom"
              />
            </Link>
            .
          </p>

          <h2 className="type-h2">
            <LocalizedText
              fr="Droit d’auteur et crédits"
              en="Copyright and credits"
            />
          </h2>
          <p>
            <LocalizedText
              fr="L’utilisation des textes, images et autres contenus dépend des droits de leurs auteurs et des licences indiquées. Une reproduction peut nécessiter une autorisation, sous réserve des exceptions légales. Consultez les crédits associés aux images."
              en="Use of text, images and other content is governed by the rights of their authors and the licences shown. Reproduction may require permission, subject to statutory exceptions. See the credits provided with images."
            />
          </p>

          <h2 className="type-h2">
            <LocalizedText
              fr="Textes applicables au Gabon"
              en="Relevant legislation in Gabon"
            />
          </h2>
          <ul className="list-disc space-y-2 ps-6">
            {gaboneseTexts.map(({ href, fr, en }) => (
              <li key={href}>
                <a href={href}>
                  <LocalizedText fr={fr} en={en} />
                </a>
              </li>
            ))}
          </ul>
          <p>
            <Link href="/confidentialite#vos-droits" prefetch={false}>
              <LocalizedText
                fr="Données personnelles, vos droits et recours auprès de l’APDPVP"
                en="Personal data, your rights and complaints to the APDPVP"
              />
            </Link>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
