/** A server-side scheduler may select approved campaigns; it never supplies markup. */
export function parseCampaignSelection(value: unknown): string[] {
  if (!value || typeof value !== "object" || !("campaignIds" in value)) {
    throw new Error("Flux publicitaire invalide : campaignIds attendu.");
  }
  const ids = value.campaignIds;
  if (
    !Array.isArray(ids) || ids.length > 24 ||
    ids.some((id) => typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(id))
  ) {
    throw new Error("Flux publicitaire invalide : 24 identifiants maximum.");
  }
  return [...new Set(ids)] as string[];
}

export function feedUrl(raw: string): string {
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("Le flux publicitaire exige une URL HTTPS sans identifiants.");
  }
  return url.href;
}

export function selectFeedCampaigns<T extends { id: string }>(campaigns: T[], ids: string[]): T[] {
  const byId = new Map(campaigns.map((campaign) => [campaign.id, campaign]));
  return ids.flatMap((id) => {
    const campaign = byId.get(id);
    return campaign ? [campaign] : [];
  });
}
