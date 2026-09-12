import { AdSlot } from "@/components/custom/ad-slot";
import { AdSenseSlot } from "@/components/custom/adsense-slot";
import { headers } from "next/headers";
import { getAdSenseConfig } from "@/lib/ads/adsense-config";
import { campaignsFor, getAdvertising } from "@/lib/ads/server";
import type { AdPlacement } from "@/lib/ads/types";

export async function Advertising({
  placement,
  pageKey,
  className,
}: {
  placement: AdPlacement;
  pageKey: string;
  className?: string;
}) {
  if (process.env.ADS_MODE === "adsense") {
    const config = getAdSenseConfig(placement);
    if (!config) return null;
    const nonce = (await headers()).get("x-nonce") ?? undefined;
    return (
      <AdSenseSlot
        key={`${pageKey}:${placement}`}
        placement={placement}
        pageKey={pageKey}
        config={{ ...config, nonce }}
        className={className}
      />
    );
  }
  const creatives = campaignsFor(await getAdvertising(), placement);
  if (!creatives.length) return null;
  return (
    <AdSlot
      key={`${pageKey}:${placement}`}
      placement={placement}
      pageKey={pageKey}
      creatives={creatives}
      className={className}
    />
  );
}
