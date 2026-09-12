import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/custom/contact-form";
import { Container } from "@/components/custom/container";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { BreadcrumbStructuredData } from "@/components/custom/structured-data";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacts",
  description:
    "Joindre la rédaction du Corporate : formulaire, adresse électronique, téléphone. Information, communiqué, droit de réponse, proposition de tribune.",
  alternates: { canonical: "/contacts" },
  openGraph: {
    type: "website",
    url: "/contacts",
    title: "Contacts — Le Corporate",
    description: "Joindre la rédaction du magazine économique Le Corporate.",
  },
};

/**
 * Contacts (CDC §4.2).
 *
 * The audit's fourth "urgence" was that no contact route on the legacy site
 * worked: an empty `href`, a malformed `tel:`, a newsroom address on an
 * unregistered domain. Everything here is a working link, stated once.
 */
export default function ContactsPage() {
  const line =
    "flex items-start gap-3 rounded-md border border-border bg-card p-4";

  return (
    <>
      <BreadcrumbStructuredData
        trail={[
          { name: "Accueil", href: "/" },
          { name: "Contacts", href: "/contacts" },
        ]}
      />

      <PageHeader
        eyebrow="Le journal"
        title="Contacter la rédaction"
        description="Une information à porter à notre connaissance, un communiqué, un droit de réponse, une proposition de tribune ou une demande commerciale."
        breadcrumb={
          <nav aria-label="Fil d'Ariane">
            <Link
              href="/"
              prefetch={false}
              className="inline-flex min-h-11 items-center text-accent underline-offset-4 hover:underline"
            >
              Accueil
            </Link>
            <span aria-hidden="true" className="text-muted-foreground">
              {" › "}
            </span>
            <span className="text-muted-foreground">Contacts</span>
          </nav>
        }
      />

      <Section>
        <Container className="px-0">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
            <div className="min-w-0">
              <h2 className="font-serif type-h2">Écrire à la rédaction</h2>
              <p className="mt-2 max-w-reading type-body text-muted-foreground">
                Les champs marqués d&apos;un astérisque sont obligatoires.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>

            <aside className="min-w-0">
              <h2 className="font-serif type-h2">Coordonnées</h2>
              <ul className="mt-4 grid gap-3">
                <li className={line}>
                  <Mail
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  />
                  <div className="min-w-0">
                    <p className="type-small text-muted-foreground">Courriel</p>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="type-body break-words text-accent underline underline-offset-4"
                    >
                      {SITE.email}
                    </a>
                  </div>
                </li>
                <li className={line}>
                  <Phone
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  />
                  <div className="min-w-0">
                    <p className="type-small text-muted-foreground">
                      Téléphone
                    </p>
                    <a
                      href={SITE.phoneHref}
                      className="type-body text-accent underline underline-offset-4"
                    >
                      {SITE.phone}
                    </a>
                  </div>
                </li>
                <li className={line}>
                  <MapPin
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  />
                  <div className="min-w-0">
                    <p className="type-small text-muted-foreground">Adresse</p>
                    <p className="type-body">{SITE.address}</p>
                    <p className="type-small text-muted-foreground">
                      Édité par {SITE.publisher}
                    </p>
                  </div>
                </li>
              </ul>

              <div className="mt-6 rounded-md border border-border bg-surface-muted p-4">
                <h3 className="font-serif type-h3">Déposer une actualité</h3>
                <p className="mt-2 type-small text-muted-foreground">
                  Le portail de dépôt réservé aux entreprises partenaires
                  ouvrira avec la prochaine version du site. En attendant,
                  adressez votre communiqué à la rédaction par courriel&nbsp;:
                  il sera traité selon les mêmes règles éditoriales, et publié
                  avec la mention «&nbsp;Contenu partenaire&nbsp;».
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
