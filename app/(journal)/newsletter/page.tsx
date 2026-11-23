import type { Metadata } from "next";
import { LocalizedText } from "@/components/custom/localized-text";
import { NewsletterForm } from "@/components/custom/newsletter-form";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Newsletter",
  description: `La lettre hebdomadaire de ${SITE.name}, l’essentiel de l’actualité du Gabon.`,
  alternates: { canonical: "/newsletter" },
};

export default function NewsletterPage() {
  return (
    <>
      <PageHeader
        title={
          <LocalizedText
            fr="La lettre hebdomadaire"
            en="The weekly newsletter"
          />
        }
        description={
          <LocalizedText
            fr="Les articles de la semaine choisis par la rédaction de BOMA Infos."
            en="The week’s news selected by the BOMA Infos newsroom."
          />
        }
        width="reading"
      />
      <Section width="reading">
        <NewsletterForm source="page-newsletter" />
      </Section>
    </>
  );
}
