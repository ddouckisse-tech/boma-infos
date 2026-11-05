import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/custom/container";
import { PageHeader } from "@/components/custom/page-header";
import { ResponsiveImage } from "@/components/custom/responsive-image";
import { DEMO_ADS } from "@/lib/ads/demo";
import { getMediaAsset } from "@/lib/media";

export const dynamicParams = false;
export const revalidate = 300;

export function generateStaticParams() {
  return DEMO_ADS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ad = DEMO_ADS.find((item) => item.slug === slug);
  return {
    title: ad ? `${ad.advertiser} — exemple publicitaire` : "Exemple introuvable",
    robots: { index: false, follow: false },
  };
}

export default async function DemoAdvertisementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ad = DEMO_ADS.find((item) => item.slug === slug);
  if (!ad) notFound();
  const media = getMediaAsset(ad.mediaKey);
  return (
    <>
      <PageHeader
        eyebrow="Publicité · Démonstration"
        title={ad.advertiser}
        description={ad.title}
        breadcrumb={<Link href="/publicite" prefetch={false} className="inline-flex min-h-11 items-center text-accent underline underline-offset-4">← Tous les exemples publicitaires</Link>}
      />
      <Container width="reading" className="py-10 md:py-14">
        {media && <ResponsiveImage media={media} sizes="(min-width: 768px) 640px, 92vw" maxWidth={640} wrapperClassName={ad.format === "square" ? "mx-auto aspect-square max-w-sm overflow-hidden rounded-lg" : "aspect-[3/1] overflow-hidden rounded-lg"} className="object-contain" />}
        <p role="note" className="mt-8 rounded-md border border-warning-token/40 bg-warning-token/10 p-4 type-small">Cet annonceur et cette offre sont fictifs. Cette page sert uniquement à démontrer le parcours d’une publicité sur BOMA Infos. Aucun achat ni aucune réservation ne sont proposés.</p>
        <p className="mt-6 type-body">{ad.description}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/contacts" prefetch={false} className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground">Préparer une vraie campagne</Link>
          <Link href="/" prefetch={false} className="inline-flex min-h-11 items-center px-3 underline underline-offset-4">Revenir au journal</Link>
        </div>
      </Container>
    </>
  );
}
