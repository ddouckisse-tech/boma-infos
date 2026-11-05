import type { MediaAsset } from "../media-core";

export const AD_PLACEMENTS = [
  "home-primary",
  "home-secondary",
  "article",
  "listing",
  "article-inline",
  "popup",
  "floating",
] as const;
export type AdPlacement = (typeof AD_PLACEMENTS)[number];
export type AdFormat = "square" | "banner";
export const AD_DEVICES = ["all", "desktop", "mobile"] as const;
export type AdDevice = (typeof AD_DEVICES)[number];
export type AdCreative = {
  id: string;
  title: string;
  advertiser: string;
  kind: "paid" | "house";
  /** Local preview only; real campaigns always display their chosen poster. */
  presentation?: "editorial";
  format: AdFormat;
  href: string;
  placements: AdPlacement[];
  /** Missing on existing campaigns means every device. */
  device?: AdDevice;
  /** Explicit example campaign, never a claim of a real advertiser. */
  demo?: boolean;
  startsAt?: number;
  endsAt?: number;
  priority: number;
  media: MediaAsset;
  /** Optional smartphone poster; otherwise render the usual campaign image. */
  mobileMedia?: MediaAsset;
};

export const AD_ROTATION_MS = 90_000;
export const AD_DISMISS_MS = 24 * 60 * 60 * 1_000;
export const AD_MAX_ROTATIONS = 2;
export const AD_STORAGE_KEY = "lc-ad-dismissals-v1";
