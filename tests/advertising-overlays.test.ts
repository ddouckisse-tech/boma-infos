import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canShowOverlay,
  candidatesForSlot,
  dismissAd,
  emptyDismissals,
  isOverlayPage,
  matchesAdDevice,
  parseOverlayCap,
  selectOverlay,
} from "@/lib/ads/policy";
import { claimOverlay, getOverlayCap } from "@/lib/ads/browser";
import { AD_DISMISS_MS, type AdCreative } from "@/lib/ads/types";

const NOW = 1_800_000_000_000;
function creative(id: string, input: Partial<AdCreative> = {}): AdCreative {
  return {
    id,
    title: "Un exemple",
    advertiser: "Annonceur fictif",
    kind: "house",
    demo: true,
    format: "square",
    href: "/publicite/demo/exemple",
    placements: ["popup", "floating"],
    priority: 50,
    media: {
      id: "demo-exemple",
      alt: "Exemple fictif",
      caption: "",
      credit: "",
      source: "",
      license: "",
      color: "#ffffff",
      width: 320,
      height: 320,
      webp: [{ w: 320, h: 320, bytes: 1000 }],
      avif: [],
    },
    ...input,
  };
}

describe("responsive advertising delivery", () => {
  it("preserves untargeted campaigns and selects targeted queues before choosing a format", () => {
    const all = creative("all", { format: "banner", placements: ["article"] });
    const desktop = creative("desktop", {
      device: "desktop",
      placements: ["article"],
    });
    const mobile = creative("mobile", {
      device: "mobile",
      format: "banner",
      placements: ["article"],
    });
    assert.equal(matchesAdDevice(all, "mobile"), true);
    assert.equal(matchesAdDevice(all, "desktop"), true);
    assert.deepEqual(
      candidatesForSlot([desktop, mobile, all], "article", NOW, "mobile").map(
        (item) => item.id
      ),
      ["mobile", "all"]
    );
    assert.deepEqual(
      candidatesForSlot([desktop, mobile, all], "article", NOW, "desktop").map(
        (item) => item.id
      ),
      ["desktop"]
    );
    assert.deepEqual(
      candidatesForSlot(
        [
          creative("square", { placements: ["article-inline"] }),
          creative("banner", {
            format: "banner",
            placements: ["article-inline"],
          }),
        ],
        "article-inline",
        NOW
      ).map((item) => item.id),
      ["banner"]
    );
  });

  it("prioritizes the desktop popup and the mobile floating card with a responsive fallback", () => {
    const ads = [
      creative("popup", { placements: ["popup"] }),
      creative("floating", { placements: ["floating"] }),
    ];
    assert.equal(
      selectOverlay(ads, emptyDismissals(), "desktop", NOW)?.creative.id,
      "popup"
    );
    assert.equal(
      selectOverlay(ads, emptyDismissals(), "mobile", NOW)?.creative.id,
      "floating"
    );
    assert.equal(
      selectOverlay([ads[0]], emptyDismissals(), "mobile", NOW)?.placement,
      "popup"
    );
    assert.equal(
      selectOverlay([ads[1]], emptyDismissals(), "desktop", NOW)?.placement,
      "floating"
    );
  });

  it("never selects a stale, closed, wrong-screen, unsafe or wrong-format overlay", () => {
    const ads = [
      creative("stale", { endsAt: NOW }),
      creative("future", { startsAt: NOW + 1 }),
      creative("desktop", { device: "desktop" }),
      creative("unsafe", { href: "//other.test" }),
      creative("banner", { format: "banner" }),
      creative("closed"),
      creative("valid", { device: "mobile" }),
    ];
    const closed = dismissAd(emptyDismissals(), "article", "closed", NOW);
    assert.equal(
      selectOverlay(ads, closed, "mobile", NOW)?.creative.id,
      "valid"
    );
    const dismissedPlacements = {
      ...closed,
      placements: { popup: NOW + 1, floating: NOW + 1 },
    };
    assert.equal(
      selectOverlay(ads, dismissedPlacements, "mobile", NOW),
      undefined
    );
  });

  it("limits automatic overlays to editorial pages", () => {
    for (const page of [
      "/",
      "/article/un-sujet",
      "/rubrique/economie/entreprises",
    ]) {
      assert.equal(isOverlayPage(page), true, page);
    }
    for (const page of [
      "/contacts",
      "/newsletter",
      "/connexion",
      "/redaction",
      "/publicite",
      "/article/",
      "/rubriques",
    ]) {
      assert.equal(isOverlayPage(page), false, page);
    }
  });
});

describe("reading and frequency requirements", () => {
  const ready = {
    placement: "popup" as const,
    visibleMs: 12_000,
    scrollFraction: 0.25,
    blocked: false,
    limited: false,
    capUntil: 0,
    now: NOW,
  };
  it("requires both reading progress and visible time and respects reader preferences", () => {
    assert.equal(canShowOverlay(ready), true);
    assert.equal(canShowOverlay({ ...ready, visibleMs: 11_999 }), false);
    assert.equal(canShowOverlay({ ...ready, scrollFraction: 0.249 }), false);
    assert.equal(canShowOverlay({ ...ready, blocked: true }), false);
    assert.equal(canShowOverlay({ ...ready, limited: true }), false);
    assert.equal(canShowOverlay({ ...ready, capUntil: NOW + 1 }), false);
    assert.equal(canShowOverlay({ ...ready, capUntil: NOW }), true);
    assert.equal(
      canShowOverlay({ ...ready, placement: "floating", visibleMs: 7_999 }),
      false
    );
    assert.equal(
      canShowOverlay({ ...ready, placement: "floating", visibleMs: 8_000 }),
      true
    );
  });

  it("rejects corrupt or unbounded storage frequency caps", () => {
    for (const raw of [
      null,
      "{",
      "null",
      "[]",
      '{"version":2}',
      JSON.stringify({ version: 1, until: NOW }),
      JSON.stringify({ version: 1, until: "bad" }),
      JSON.stringify({ version: 1, until: NOW + AD_DISMISS_MS + 1 }),
    ]) {
      assert.equal(parseOverlayCap(raw, NOW), 0, raw ?? "null");
    }
    assert.equal(
      parseOverlayCap(
        JSON.stringify({ version: 1, until: NOW + AD_DISMISS_MS }),
        NOW
      ),
      NOW + AD_DISMISS_MS
    );
  });

  it("claims once across routes and refresh storage, with a tab fallback when storage is refused", () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "window");
    let stored: string | null = null;
    let denied = false;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem: () => {
            if (denied) throw new Error("Denied");
            return stored;
          },
          setItem: (_key: string, value: string) => {
            if (denied) throw new Error("Denied");
            stored = value;
          },
        },
      },
    });
    try {
      // Simulate a cap left by a previous page load, before this module claims one.
      stored = JSON.stringify({ version: 1, until: NOW + AD_DISMISS_MS });
      assert.equal(claimOverlay(NOW), false);
      assert.equal(getOverlayCap(NOW), NOW + AD_DISMISS_MS);
      assert.equal(claimOverlay(NOW + AD_DISMISS_MS), true);
      assert.equal(claimOverlay(NOW + AD_DISMISS_MS + 1), false);
      denied = true;
      assert.equal(claimOverlay(NOW + 2 * AD_DISMISS_MS), true);
      assert.equal(claimOverlay(NOW + 2 * AD_DISMISS_MS + 1), false);
    } finally {
      if (original) Object.defineProperty(globalThis, "window", original);
      else Reflect.deleteProperty(globalThis, "window");
    }
  });
});
