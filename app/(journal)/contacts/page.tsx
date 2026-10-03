import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/custom/contact-form";
import { Container } from "@/components/custom/container";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { BreadcrumbStructuredData } from "@/components/custom/structured-data";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacts",
  description: `Joindre la rédaction de ${SITE.name} : formulaire et adresse électronique. Information, communiqué, droit de réponse, proposition de tribune.`,
  alternates: { canonical: "/contacts" },
  openGraph: {
    type: "website",
    url: "/contacts",
    title: `Contacts — ${SITE.name}`,
    description: `Joindre la rédaction de ${SITE.name}.`,
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

  // « Édité par » n'est affiché que si l'éditeur est connu (`SITE.publisher`).
  const publishedBy = SITE.publisher && (
    <p className="type-small text-muted-foreground">
      <span className="lc-fr" lang="fr">
        Édité par {SITE.publisher}
      </span>
      <span className="lc-en" lang="en">
        Published by {SITE.publisher}
      </span>
    </p>
  );

  return (
    <>
      <BreadcrumbStructuredData
        trail={[
          { name: "Accueil", href: "/" },
          { name: "Contacts", href: "/contacts" },
        ]}
      />

      <PageHeader
        eyebrow={<LocalizedText fr="Le journal" en="The journal" />}
        title={
          <LocalizedText
            fr="Contacter la rédaction"
            en="Contact the editorial team"
          />
        }
        description={
          <LocalizedText
            fr="Une information à porter à notre connaissance, un communiqué, un droit de réponse, une proposition de tribune ou une demande commerciale."
            en="Send us news, a press release, a right of reply, an opinion proposal or a business enquiry."
          />
        }
        breadcrumb={
          <>
            <nav aria-label="Fil d'Ariane" className="lc-fr" lang="fr">
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
            <nav aria-label="Breadcrumb" className="lc-en" lang="en">
              <Link
                href="/"
                prefetch={false}
                className="inline-flex min-h-11 items-center text-accent underline-offset-4 hover:underline"
              >
                Home
              </Link>
              <span aria-hidden="true" className="text-muted-foreground">
                {" › "}
              </span>
              <span className="text-muted-foreground">Contacts</span>
            </nav>
          </>
        }
      />

      <Section>
        <Container className="px-0">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
            <div className="min-w-0">
              <h2 className="font-display type-h2">
                <LocalizedText
                  fr="Écrire à la rédaction"
                  en="Write to the editorial team"
                />
              </h2>
              <p className="mt-2 max-w-reading type-body text-muted-foreground">
                <LocalizedText
                  fr="Les champs marqués d'un astérisque sont obligatoires."
                  en="Fields marked with an asterisk are required."
                />
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>

            <aside className="min-w-0">
              <h2 className="font-display type-h2">
                <LocalizedText fr="Coordonnées" en="Contact details" />
              </h2>
              <ul className="mt-4 grid gap-3">
                <li className={line}>
                  <Mail
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  />
                  <div className="min-w-0">
                    <p className="type-small text-muted-foreground">
                      <LocalizedText fr="Courriel" en="Email" />
                    </p>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="type-body break-words text-accent underline underline-offset-4"
                    >
                      {SITE.email}
                    </a>
                  </div>
                </li>
                {SITE.phone && SITE.phoneHref && (
                  <li className={line}>
                    <Phone
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                    />
                    <div className="min-w-0">
                      <p className="type-small text-muted-foreground">
                        <LocalizedText fr="Téléphone" en="Phone" />
                      </p>
                      <a
                        href={SITE.phoneHref}
                        className="type-body text-accent underline underline-offset-4"
                      >
                        {SITE.phone}
                      </a>
                    </div>
                  </li>
                )}
                {SITE.address ? (
                  <li className={line}>
                    <MapPin
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                    />
                    <div className="min-w-0">
                      <p className="type-small text-muted-foreground">
                        <LocalizedText fr="Adresse" en="Address" />
                      </p>
                      <p className="type-body">{SITE.address}</p>
                      {publishedBy}
                    </div>
                  </li>
                ) : (
                  publishedBy && <li className={line}>{publishedBy}</li>
                )}
              </ul>

              <div className="mt-6 rounded-md border border-border bg-surface-muted p-4">
                <h3 className="font-display type-h3">
                  <LocalizedText
                    fr="Déposer une actualité"
                    en="Submit company news"
                  />
                </h3>
                <p className="mt-2 type-small text-muted-foreground">
                  <LocalizedText
                    fr="Le portail de dépôt réservé aux entreprises partenaires ouvrira avec la prochaine version du site. En attendant, adressez votre communiqué à la rédaction par courriel : il sera traité selon les mêmes règles éditoriales et publié avec la mention « Contenu partenaire »."
                    en="The submission portal for partner companies will open in the next version of the site. Until then, email your press release to the editorial team. It will follow the same editorial rules and be labelled “Partner content”."
                  />
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
