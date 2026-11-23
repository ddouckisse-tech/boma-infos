import type { Metadata } from "next";
import Link from "next/link";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { ResponsiveImage } from "@/components/custom/responsive-image";
import { DEMO_ADS } from "@/lib/ads/demo";
import { getMediaAsset } from "@/lib/media";

export const metadata: Metadata = {
  title: "Publicité",
  description:
    "Les formats publicitaires de BOMA Infos, sur ordinateur et mobile.",
  alternates: { canonical: "/publicite" },
};
export const revalidate = 300;

const formats = [
  {
    title: { fr: "Au rythme du journal", en: "Across the newspaper" },
    text: {
      fr: "Des bandeaux entre les grands blocs de l’accueil et les listes d’articles, avec une distinction claire entre publicité et rédaction.",
      en: "Banners appear between major blocks on the home page and article listings. Advertising is clearly labelled.",
    },
  },
  {
    title: { fr: "Au fil de la lecture", en: "Alongside articles" },
    text: {
      fr: "Un encart dans la colonne complémentaire et une pause publicitaire entre les blocs des articles longs, sans couper une phrase.",
      en: "Place an ad in the reading sidebar or between complete sections of a longer article.",
    },
  },
  {
    title: { fr: "Une présence mesurée", en: "One ad at a time" },
    text: {
      fr: "Une fenêtre sur ordinateur ou une carte flottante compacte sur mobile, après le début de la lecture. Une seule à la fois, avec fermeture mémorisée pendant 24 heures.",
      en: "A desktop pop-up or compact mobile card appears after reading starts. Closing it hides it for 24 hours.",
    },
  },
];

export default function AdvertisingPage() {
  return (
    <>
      <PageHeader
        eyebrow={
          <LocalizedText
            fr="La régie BOMA Infos"
            en="Advertise with BOMA Infos"
          />
        }
        title={
          <LocalizedText
            fr="Votre message, à la bonne place."
            en="Reach readers on BOMA Infos"
          />
        }
        description={
          <LocalizedText
            fr="Des formats adaptés à l’écran et à la lecture, pour présenter votre activité aux lecteurs du journal."
            en="Introduce your business to our readers with formats designed for their screens."
          />
        }
        actions={
          <Link
            href="/contacts"
            prefetch={false}
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground"
          >
            <LocalizedText
              fr="Contacter la régie"
              en="Contact the advertising team"
            />
          </Link>
        }
      />
      <Section
        title={
          <LocalizedText
            fr="Des espaces pensés pour chaque écran"
            en="Advertising formats for each screen"
          />
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          {formats.map((format, index) => (
            <article
              key={format.title.fr}
              className="rounded-lg border border-border bg-card p-6"
            >
              <p className="type-small font-semibold text-accent">
                0{index + 1}
              </p>
              <h3 className="mt-3 font-display type-h3">
                <LocalizedText {...format.title} />
              </h3>
              <p className="mt-3 type-small text-muted-foreground">
                <LocalizedText {...format.text} />
              </p>
            </article>
          ))}
        </div>
      </Section>
      <Section
        title={
          <LocalizedText
            fr={`${DEMO_ADS.length} exemples de campagnes`}
            en={`${DEMO_ADS.length} campaign examples`}
          />
        }
        tone="muted"
        description={
          <LocalizedText
            fr="Ces annonceurs, offres et visuels sont fictifs. Ils illustrent les formats disponibles et ne constituent ni une offre commerciale ni un partenariat réel."
            en="These fictional advertisers, offers and images illustrate the available formats."
          />
        }
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_ADS.map((ad) => {
            const media = getMediaAsset(ad.mediaKey);
            return (
              <article
                key={ad.slug}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <Link
                  href={`/publicite/demo/${ad.slug}`}
                  prefetch={false}
                  className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  {media && (
                    <ResponsiveImage
                      media={media}
                      mobileMedia={getMediaAsset(ad.mobileMediaKey)}
                      mobileSizes="(min-width: 640px) 48vw, 92vw"
                      sizes="(min-width: 1024px) 400px, (min-width: 640px) 48vw, 92vw"
                      maxWidth={640}
                      wrapperClassName={
                        ad.format === "square"
                          ? "aspect-video lg:aspect-square"
                          : "aspect-video lg:aspect-[3/1]"
                      }
                      className="object-contain"
                    />
                  )}
                  <div className="p-5">
                    <p className="type-small font-semibold text-accent">
                      <LocalizedText
                        fr="Publicité · Démonstration"
                        en="Advertisement · Example"
                      />
                    </p>
                    <h3 className="mt-2 font-display type-h3">
                      {ad.advertiser}
                    </h3>
                    <p className="mt-2 type-small text-muted-foreground">
                      <LocalizedText fr={ad.title} en={ad.titleEn} />
                    </p>
                    <span className="mt-4 inline-flex min-h-11 items-center type-small font-semibold underline underline-offset-4">
                      <LocalizedText
                        fr="Voir l’exemple →"
                        en="View example →"
                      />
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </Section>
    </>
  );
}
