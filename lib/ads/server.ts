import "server-only";
import { cache } from "react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { AD_DEMO_MEDIA } from "@/convex/adDemoManifest";
import { DEMO_ADS } from "./demo";
import { feedUrl, parseCampaignSelection, selectFeedCampaigns } from "./feed";
import type { AdCreative, AdPlacement } from "./types";

/** Explicit local visual preview of the same five examples available to administrators. */
function previewCampaigns(): AdCreative[] {
  return DEMO_ADS.flatMap((item, index) => {
    const media = AD_DEMO_MEDIA[item.mediaKey];
    return media
      ? [
          {
            id: `preview-${item.slug}`,
            title: item.title,
            advertiser: item.advertiser,
            href: `/publicite/demo/${item.slug}`,
            format: item.format,
            placements: [...item.placements],
            device: item.device,
            kind: "house" as const,
            demo: true,
            priority: 50 - index,
            media,
          },
        ]
      : [];
  });
}

let reportedUnavailable = false;

/** One read per render; the existing editorial ISR refreshes it every five minutes. */
export const getAdvertising = cache(async (): Promise<AdCreative[]> => {
  const mode = process.env.ADS_MODE ?? "campaigns";
  if (mode === "off") return [];
  if (mode === "preview") return previewCampaigns();
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl || mode !== "campaigns") return [];
  try {
    const campaigns: AdCreative[] = await new ConvexHttpClient(convexUrl).query(
      api.advertising.publicFeed,
      {}
    );
    if (!process.env.ADS_FEED_URL) return campaigns;
    // Optional first-party campaign scheduler. No third-party browser request,
    // advertising script, cookie or token is injected in the public page.
    const response = await fetch(feedUrl(process.env.ADS_FEED_URL), {
      headers: process.env.ADS_FEED_TOKEN
        ? { Authorization: `Bearer ${process.env.ADS_FEED_TOKEN}` }
        : {},
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(2_500),
      redirect: "error",
    });
    if (!response.ok)
      throw new Error(`Flux publicitaire indisponible (${response.status}).`);
    // Bound response memory even when the remote endpoint omits Content-Length.
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Flux publicitaire vide.");
    const decoder = new TextDecoder();
    let body = "";
    let bytes = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 16_384)
          throw new Error("Flux publicitaire trop volumineux.");
        body += decoder.decode(value, { stream: true });
      }
      body += decoder.decode();
    } finally {
      await reader.cancel();
    }
    return selectFeedCampaigns(
      campaigns,
      parseCampaignSelection(JSON.parse(body))
    );
  } catch {
    // An empty inventory or a missing backend never blocks reading the journal.
    // Do not print upstream errors: they can contain a configured endpoint/token.
    if (!reportedUnavailable) {
      console.warn(
        "Publicités indisponibles : emplacements masqués. Vérifiez la configuration de la régie interne."
      );
      reportedUnavailable = true;
    }
    return [];
  }
});

export const campaignsFor = (
  campaigns: AdCreative[],
  placement: AdPlacement
): AdCreative[] => {
  const selected = campaigns.filter((campaign) =>
    campaign.placements.includes(placement)
  );
  // The browser chooses a fixed format after rechecking the dates from ISR.
  return (
    selected
      .filter((campaign) =>
        placement === "popup" || placement === "floating"
          ? campaign.format === "square"
          : placement === "article" || campaign.format === "banner"
      )
      // Device targeting is resolved in the browser, before limiting each queue.
      .slice(0, 24)
  );
};
