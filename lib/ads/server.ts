import "server-only";
import { cache } from "react";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getMediaAsset } from "@/lib/media";
import { feedUrl, parseCampaignSelection, selectFeedCampaigns } from "./feed";
import type { AdCreative, AdPlacement } from "./types";

/** Explicit visual preview, never written to Convex or presented as a paid campaign. */
function previewCampaigns(): AdCreative[] {
  const media = getMediaAsset("documents-bureau");
  if (!media) return [];
  return [
    { id: "preview-resources", title: "Des repères pour entreprendre.", href: "/docutheque", format: "banner", placements: ["home-primary", "listing"] },
    { id: "preview-entreprises", title: "Faites connaître votre entreprise.", href: "/contacts", format: "banner", placements: ["home-secondary", "home-primary", "listing"] },
    { id: "preview-lecture", title: "L’économie mérite votre attention.", href: "/newsletter", format: "square", placements: ["article"] },
    { id: "preview-docutheque", title: "Les ressources pour aller plus loin.", href: "/docutheque", format: "square", placements: ["article"] },
  ].map((item) => ({ ...item, advertiser: "Le Corporate", kind: "house", presentation: "editorial", priority: 0, media })) as AdCreative[];
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
    const campaigns: AdCreative[] = await new ConvexHttpClient(convexUrl).query(api.advertising.publicFeed, {});
    if (!process.env.ADS_FEED_URL) return campaigns;
    // Optional first-party campaign scheduler. No third-party browser request,
    // advertising script, cookie or token is injected in the public page.
    const response = await fetch(feedUrl(process.env.ADS_FEED_URL), {
      headers: process.env.ADS_FEED_TOKEN ? { Authorization: `Bearer ${process.env.ADS_FEED_TOKEN}` } : {},
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(2_500),
      redirect: "error",
    });
    if (!response.ok) throw new Error(`Flux publicitaire indisponible (${response.status}).`);
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
        if (bytes > 16_384) throw new Error("Flux publicitaire trop volumineux.");
        body += decoder.decode(value, { stream: true });
      }
      body += decoder.decode();
    } finally {
      await reader.cancel();
    }
    return selectFeedCampaigns(campaigns, parseCampaignSelection(JSON.parse(body)));
  } catch {
    // An empty inventory or a missing backend never blocks reading the journal.
    // Do not print upstream errors: they can contain a configured endpoint/token.
    if (!reportedUnavailable) {
      console.warn("Publicités indisponibles : emplacements masqués. Vérifiez la configuration de la régie interne.");
      reportedUnavailable = true;
    }
    return [];
  }
});

export const campaignsFor = (campaigns: AdCreative[], placement: AdPlacement): AdCreative[] => {
  const selected = campaigns.filter((campaign) => campaign.placements.includes(placement));
  // The browser chooses a fixed format after rechecking the dates from ISR.
  return selected.filter((campaign) => placement === "article" || campaign.format === "banner").slice(0, 6);
};
