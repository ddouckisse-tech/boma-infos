import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/custom/container";
import { LocalizedText } from "@/components/custom/localized-text";
import { PageHeader } from "@/components/custom/page-header";
import { ResponsiveImage } from "@/components/custom/responsive-image";
import { DEMO_ADS, DEMO_POSTERS } from "@/lib/ads/demo";
import { getMediaAsset } from "@/lib/media";

export const dynamicParams = false;
export const revalidate = 300;

export function generateStaticParams() {
  return DEMO_POSTERS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ad = DEMO_POSTERS.find((item) => item.slug === slug);
  return {
    title: ad
      ? `${ad.advertiser} — exemple publicitaire`
      : "Exemple introuvable",
    robots: { index: false, follow: false },
  };
}

export default async function DemoAdvertisementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ad = DEMO_POSTERS.find((item) => item.slug === slug);
  if (!ad) notFound();
  const media = getMediaAsset(ad.mediaKey);
  const mobile = getMediaAsset(
    DEMO_ADS.find((item) => item.slug === slug)?.mobileMediaKey
  );
  return (
    <>
      <PageHeader
        eyebrow={
          <LocalizedText
            fr="Publicité · Démonstration"
            en="Advertisement · Example"
          />
        }
        title={ad.advertiser}
        description={<LocalizedText fr={ad.title} en={ad.titleEn} />}
        breadcrumb={
          <Link
            href="/publicite"
            prefetch={false}
            className="inline-flex min-h-11 items-center text-accent underline underline-offset-4"
          >
            <LocalizedText
              fr="← Tous les exemples publicitaires"
              en="← All advertising examples"
            />
          </Link>
        }
      />
      <Container width="reading" className="py-10 md:py-14">
        {media && (
          <ResponsiveImage
            media={media}
            mobileMedia={mobile}
            sizes="(min-width: 768px) 640px, 92vw"
            maxWidth={640}
            wrapperClassName={
              ad.format === "square"
                ? "mx-auto aspect-video overflow-hidden rounded-lg lg:aspect-square lg:max-w-md"
                : "aspect-video overflow-hidden rounded-lg lg:aspect-[3/1]"
            }
            className="object-contain"
          />
        )}
        <p
          role="note"
          className="mt-8 rounded-md border border-warning-token/40 bg-warning-token/10 p-4 type-small"
        >
          <LocalizedText
            fr="Cet annonceur et cette offre sont fictifs. Cette page sert uniquement à démontrer le parcours d’une publicité sur BOMA Infos. Aucun achat ni aucune réservation ne sont proposés."
            en="This fictional example shows how readers open an advertisement on BOMA Infos. Purchases and bookings are unavailable."
          />
        </p>
        <p className="mt-6 type-body">
          <LocalizedText fr={ad.description} en={ad.descriptionEn} />
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/contacts"
            prefetch={false}
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground"
          >
            <LocalizedText
              fr="Préparer une vraie campagne"
              en="Plan an advertising campaign"
            />
          </Link>
          <Link
            href="/"
            prefetch={false}
            className="inline-flex min-h-11 items-center px-3 underline underline-offset-4"
          >
            <LocalizedText fr="Revenir au journal" en="Back to the newspaper" />
          </Link>
        </div>
      </Container>
    </>
  );
}
