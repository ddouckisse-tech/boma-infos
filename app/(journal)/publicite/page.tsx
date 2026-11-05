import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/custom/page-header";
import { Section } from "@/components/custom/section";
import { ResponsiveImage } from "@/components/custom/responsive-image";
import { DEMO_ADS } from "@/lib/ads/demo";
import { getMediaAsset } from "@/lib/media";

export const metadata: Metadata = {
  title: "Publicité",
  description: "Les formats publicitaires de BOMA Infos, sur ordinateur et mobile.",
  alternates: { canonical: "/publicite" },
};
export const revalidate = 300;

const formats = [
  { title: "Au rythme du journal", text: "Des bandeaux entre les grands blocs de l’accueil et les listes d’articles, avec une distinction claire entre publicité et rédaction." },
  { title: "Au fil de la lecture", text: "Un encart dans la colonne complémentaire et une pause publicitaire entre les blocs des articles longs, sans couper une phrase." },
  { title: "Une présence mesurée", text: "Une fenêtre sur ordinateur ou une carte flottante compacte sur mobile, après le début de la lecture. Une seule à la fois, avec fermeture mémorisée pendant 24 heures." },
];

export default function AdvertisingPage() {
  return (
    <>
      <PageHeader
        eyebrow="La régie BOMA Infos"
        title="Votre message, à la bonne place."
        description="Des formats adaptés à l’écran et à la lecture, pour présenter votre activité aux lecteurs du journal."
        actions={<Link href="/contacts" prefetch={false} className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground">Contacter la régie</Link>}
      />
      <Section title="Des espaces pensés pour chaque écran">
        <div className="grid gap-5 md:grid-cols-3">
          {formats.map((format, index) => (
            <article key={format.title} className="rounded-lg border border-border bg-card p-6">
              <p className="type-small font-semibold text-accent">0{index + 1}</p>
              <h3 className="mt-3 font-display type-h3">{format.title}</h3>
              <p className="mt-3 type-small text-muted-foreground">{format.text}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section title={`${DEMO_ADS.length} exemples de campagnes`} tone="muted" description="Ces annonceurs, offres et visuels sont fictifs. Ils illustrent les formats disponibles et ne constituent ni une offre commerciale ni un partenariat réel.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_ADS.map((ad) => {
            const media = getMediaAsset(ad.mediaKey);
            return (
              <article key={ad.slug} className="overflow-hidden rounded-lg border border-border bg-card">
                <Link href={`/publicite/demo/${ad.slug}`} prefetch={false} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                  {media && <ResponsiveImage media={media} sizes="(min-width: 1024px) 400px, (min-width: 640px) 48vw, 92vw" maxWidth={640} wrapperClassName={ad.format === "square" ? "aspect-square" : "aspect-[3/1]"} className="object-contain" />}
                  <div className="p-5">
                    <p className="type-small font-semibold text-accent">Publicité · Démonstration</p>
                    <h3 className="mt-2 font-display type-h3">{ad.advertiser}</h3>
                    <p className="mt-2 type-small text-muted-foreground">{ad.title}</p>
                    <span className="mt-4 inline-flex min-h-11 items-center type-small font-semibold underline underline-offset-4">Voir l’exemple →</span>
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
