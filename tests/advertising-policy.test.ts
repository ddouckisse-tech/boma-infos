import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import {
  activeDismissals,
  advanceRotation,
  candidatesForSlot,
  dismissAd,
  emptyDismissals,
  isCampaignDismissed,
  isCreativeActive,
  isPlacementDismissed,
  isSafeAdHref,
  mergeDismissals,
  parseDismissals,
  serializeDismissals,
} from "@/lib/ads/policy";
import {
  AD_PREFERENCES_SCRIPT,
  beginAdNavigation,
  dismissAdvertisement,
  getAdSnapshot,
  subscribeAds,
} from "@/lib/ads/browser";
import {
  AD_DISMISS_MS,
  AD_ROTATION_MS,
  type AdCreative,
} from "@/lib/ads/types";

const NOW = 1_800_000_000_000;
const creative = (
  id: string,
  overrides: Partial<AdCreative> = {}
): AdCreative => ({
  id,
  title: "Des repères pour entreprendre.",
  advertiser: "Le Corporate",
  kind: "house",
  format: "banner",
  href: "/docutheque",
  placements: ["home-primary", "home-secondary", "article", "listing"],
  priority: 0,
  media: {
    id: "test-artwork",
    alt: "Création de test",
    caption: "",
    credit: "",
    license: "",
    source: "",
    color: "#ffffff",
    width: 640,
    height: 320,
    avif: [],
    webp: [{ w: 640, h: 320, bytes: 100 }],
  },
  ...overrides,
});

describe("reader dismissal policy", () => {
  it("closes both placement and campaign for exactly 24 hours", () => {
    const closed = dismissAd(emptyDismissals(), "article", "campaign-one", NOW);
    assert.equal(closed.placements.article, NOW + AD_DISMISS_MS);
    assert.equal(closed.campaigns["campaign-one"], NOW + AD_DISMISS_MS);
    assert.equal(isPlacementDismissed(closed, "listing"), false);
    assert.equal(isCampaignDismissed(closed, "campaign-one"), true);
  });

  it("keeps the page snapshot closed at and after expiry; only navigation expires it", () => {
    const page = activeDismissals(
      dismissAd(emptyDismissals(), "article", "one", NOW),
      NOW + 1
    );
    assert.equal(isPlacementDismissed(page, "article"), true);
    assert.equal(isCampaignDismissed(page, "one"), true);
    assert.equal(
      isPlacementDismissed(
        activeDismissals(page, NOW + AD_DISMISS_MS - 1),
        "article"
      ),
      true
    );
    assert.deepEqual(
      activeDismissals(page, NOW + AD_DISMISS_MS),
      emptyDismissals()
    );
    // Applying the next navigation's policy does not mutate the opened page.
    assert.equal(isPlacementDismissed(page, "article"), true);
  });

  it("preserves closures through serialization and later navigation", () => {
    const closed = dismissAd(emptyDismissals(), "home-primary", "one", NOW);
    const restored = parseDismissals(serializeDismissals(closed));
    assert.deepEqual(activeDismissals(restored, NOW + 60_000), closed);
  });

  it("merges concurrent closures without shortening either expiry", () => {
    const first = dismissAd(emptyDismissals(), "article", "one", NOW);
    const later = dismissAd(emptyDismissals(), "listing", "one", NOW + 1_000);
    const merged = mergeDismissals(later, first);
    assert.equal(merged.placements.article, NOW + AD_DISMISS_MS);
    assert.equal(merged.placements.listing, NOW + 1_000 + AD_DISMISS_MS);
    assert.equal(merged.campaigns.one, NOW + 1_000 + AD_DISMISS_MS);
    assert.deepEqual(mergeDismissals(merged, emptyDismissals()), merged);
  });

  it("ignores corrupt storage, unknown placements and invalid timestamps", () => {
    for (const raw of [null, "{", "null", "[]", '{"version":2}']) {
      assert.deepEqual(parseDismissals(raw), emptyDismissals());
    }
    assert.deepEqual(
      parseDismissals(
        '{"version":1,"placements":{"article":42,"fake":42,"listing":-1},"campaigns":{"ok":123,"bad":"123","infinite":1e400}}'
      ),
      {
        placements: { article: 42 },
        campaigns: { ok: 123 },
      }
    );
  });

  it("does not interpret prototype names as an existing campaign dismissal", () => {
    assert.equal(isCampaignDismissed(emptyDismissals(), "toString"), false);
    const parsed = parseDismissals(
      '{"version":1,"campaigns":{"__proto__":123}}'
    );
    assert.equal(isCampaignDismissed(parsed, "__proto__"), true);
    assert.equal(Object.getPrototypeOf(parsed.campaigns), Object.prototype);
  });
});

describe("eligible stable creative queue", () => {
  it("honours exact start/end boundaries and rejects invalid dates", () => {
    const scheduled = creative("scheduled", {
      startsAt: NOW,
      endsAt: NOW + 1_000,
    });
    assert.equal(isCreativeActive(scheduled, NOW - 1), false);
    assert.equal(isCreativeActive(scheduled, NOW), true);
    assert.equal(isCreativeActive(scheduled, NOW + 999), true);
    assert.equal(isCreativeActive(scheduled, NOW + 1_000), false);
    assert.equal(
      isCreativeActive(creative("invalid", { endsAt: NaN }), NOW),
      false
    );
    assert.equal(
      isCreativeActive(creative("invalid", { startsAt: Infinity }), NOW),
      false
    );
  });

  it("drops stale cached campaigns before choosing the page's format", () => {
    const stale = creative("stale", { endsAt: NOW });
    const future = creative("future", { startsAt: NOW + 1 });
    assert.deepEqual(
      candidatesForSlot(
        [stale, future, creative("current")],
        "home-primary",
        NOW
      ).map((item) => item.id),
      ["current"]
    );
    assert.deepEqual(
      candidatesForSlot(
        [
          creative("stale-square", { format: "square", endsAt: NOW }),
          creative("banner"),
        ],
        "article",
        NOW
      ).map((item) => item.id),
      ["banner"]
    );
  });

  it("accepts internal and HTTPS links, rejects script and ambiguous links", () => {
    for (const href of [
      "/contacts",
      "/rubrique/economie?source=ad",
      "https://example.com/offer",
    ]) {
      assert.equal(isSafeAdHref(href), true, href);
    }
    for (const href of [
      "javascript:alert(1)",
      "data:text/html,hi",
      "//example.com",
      "/\\example.com",
      "https://user:secret@example.com",
      "https://example.com\n",
      " /contacts",
      "http://example.com",
      "#anchor",
    ]) {
      assert.equal(isSafeAdHref(href), false, href);
    }
  });

  it("allows only banners in home/listing and one format in the article rail", () => {
    const creatives = [
      creative("square", { format: "square" }),
      creative("banner"),
      creative("square-two", { format: "square" }),
    ];
    assert.deepEqual(
      candidatesForSlot(creatives, "listing").map((item) => item.id),
      ["banner"]
    );
    assert.deepEqual(
      candidatesForSlot(creatives, "article").map((item) => item.id),
      ["square", "square-two"]
    );
  });

  it("excludes wrong placement, missing image renditions and unsafe destinations", () => {
    const emptyMedia = { ...creative("none").media, webp: [] };
    const creatives = [
      creative("wrong", { placements: ["article"] }),
      creative("no-image", { media: emptyMedia }),
      creative("unsafe", { href: "javascript:alert(1)" }),
      creative("valid"),
    ];
    assert.deepEqual(
      candidatesForSlot(creatives, "home-primary").map((item) => item.id),
      ["valid"]
    );
  });

  it("deduplicates campaigns and caps the queue at six without changing order", () => {
    const creatives = [
      creative("one"),
      creative("one"),
      ...Array.from({ length: 8 }, (_, i) => creative(String(i))),
    ];
    assert.deepEqual(
      candidatesForSlot(creatives, "home-primary").map((item) => item.id),
      ["one", "0", "1", "2", "3", "4"]
    );
    assert.deepEqual(candidatesForSlot([], "article"), []);
  });
});

describe("visible time rotation", () => {
  it("accumulates separate visible intervals and rotates only at 90 seconds", () => {
    const start = { index: 0, rotations: 0, elapsedMs: 0 };
    const first = advanceRotation(start, 40_000, 3);
    const second = advanceRotation(first, 49_999, 3);
    assert.deepEqual(second, { index: 0, rotations: 0, elapsedMs: 89_999 });
    assert.deepEqual(advanceRotation(second, 1, 3), {
      index: 1,
      rotations: 1,
      elapsedMs: 0,
    });
  });

  it("never catches up through multiple ads after a delayed timer", () => {
    assert.deepEqual(
      advanceRotation(
        { index: 0, rotations: 0, elapsedMs: 0 },
        10 * AD_ROTATION_MS,
        4
      ),
      { index: 1, rotations: 1, elapsedMs: 0 }
    );
  });

  it("stops after two rotations and leaves a single campaign unchanged", () => {
    const last = { index: 2, rotations: 2, elapsedMs: 0 };
    assert.equal(advanceRotation(last, AD_ROTATION_MS, 6), last);
    const single = { index: 0, rotations: 0, elapsedMs: 0 };
    assert.equal(advanceRotation(single, AD_ROTATION_MS, 1), single);
    assert.deepEqual(
      advanceRotation(
        { index: 1, rotations: 1, elapsedMs: 0 },
        AD_ROTATION_MS,
        2
      ),
      { index: 0, rotations: 2, elapsedMs: 0 }
    );
  });

  it("does not count negative or zero elapsed time", () => {
    const state = { index: 0, rotations: 0, elapsedMs: 50 };
    assert.deepEqual(advanceRotation(state, -100, 3), state);
    assert.deepEqual(advanceRotation(state, 0, 3), state);
  });
});

describe("before-paint dismissal script", () => {
  it("hides only active slots and escapes stored campaign IDs in CSS", () => {
    const dataset: Record<string, string> = {};
    const sheets: Array<{ textContent?: string }> = [];
    const window: Record<string, unknown> = {};
    const escaped: string[] = [];
    runInNewContext(AD_PREFERENCES_SCRIPT, {
      Date: { now: () => NOW },
      localStorage: {
        getItem: () =>
          JSON.stringify({
            version: 1,
            placements: { article: NOW + 1, listing: NOW, fake: NOW + 1 },
            campaigns: { 'id"with-special': NOW + 1, expired: NOW },
          }),
      },
      document: {
        documentElement: { dataset },
        createElement: () => ({}),
        head: {
          appendChild: (style: { textContent?: string }) => sheets.push(style),
        },
      },
      CSS: {
        escape: (id: string) => {
          escaped.push(id);
          return "safely-escaped-id";
        },
      },
      window,
    });
    assert.equal(dataset.adDismissed, "article");
    assert.deepEqual(escaped, ['id"with-special']);
    assert.equal(
      sheets[0].textContent,
      '.lc-ad-slot[data-ad-campaign="safely-escaped-id"]{display:none!important}'
    );
    assert.ok(window.__lcAdInitial);
  });

  it("does not break the head when storage is forbidden", () => {
    assert.doesNotThrow(() =>
      runInNewContext(AD_PREFERENCES_SCRIPT, {
        localStorage: {
          getItem: () => {
            throw new Error("Storage denied");
          },
        },
      })
    );
  });
});

describe("browser dismissal store", () => {
  it("syncs other tabs, locks open pages and falls back to memory when storage is forbidden", () => {
    const names = ["window", "document", "CSS"] as const;
    const originals = names.map((name) =>
      Object.getOwnPropertyDescriptor(globalThis, name)
    );
    const originalNow = Date.now;
    let now = NOW;
    let stored: string | null = null;
    let forbidden = false;
    let storageListener:
      ((event: { key: string; newValue: string | null }) => void) | undefined;
    let dispose: (() => void) | undefined;
    const fakeStyle = { textContent: "" };
    const mocks = {
      window: {
        localStorage: {
          getItem: () => {
            if (forbidden) throw new Error("Denied");
            return stored;
          },
          setItem: (_key: string, value: string) => {
            if (forbidden) throw new Error("Denied");
            stored = value;
          },
        },
        addEventListener: (_name: string, listener: typeof storageListener) => {
          storageListener = listener;
        },
        removeEventListener: () => {
          storageListener = undefined;
        },
      },
      document: {
        documentElement: { dataset: {} },
        getElementById: () => fakeStyle,
      },
      CSS: { escape: (id: string) => id },
    };
    try {
      names.forEach((name) =>
        Object.defineProperty(globalThis, name, {
          configurable: true,
          value: mocks[name],
        })
      );
      Date.now = () => now;
      dispose = subscribeAds("/first", () => {});
      dismissAdvertisement("article", "browser-one");
      assert.equal(
        isPlacementDismissed(getAdSnapshot().dismissals, "article"),
        true
      );
      now += AD_DISMISS_MS + 1;
      assert.equal(
        isPlacementDismissed(getAdSnapshot().dismissals, "article"),
        true
      );
      dispose();
      dispose = subscribeAds("/first", () => {});
      assert.equal(
        isPlacementDismissed(getAdSnapshot().dismissals, "article"),
        true
      );
      dispose();
      beginAdNavigation("/without-advertisements");
      dispose = subscribeAds("/first", () => {});
      assert.equal(
        isPlacementDismissed(getAdSnapshot().dismissals, "article"),
        false
      );
      dispose();
      dispose = subscribeAds("/second", () => {});
      assert.equal(
        isPlacementDismissed(getAdSnapshot().dismissals, "article"),
        false
      );

      const fromOtherTab = dismissAd(
        emptyDismissals(),
        "listing",
        "browser-two",
        now
      );
      storageListener?.({
        key: "lc-ad-dismissals-v1",
        newValue: serializeDismissals(fromOtherTab),
      });
      assert.equal(
        isCampaignDismissed(getAdSnapshot().dismissals, "browser-two"),
        true
      );
      storageListener?.({ key: "lc-ad-dismissals-v1", newValue: null });
      assert.equal(
        isPlacementDismissed(getAdSnapshot().dismissals, "listing"),
        true
      );

      // The same route can mount again after all advertising listeners left.
      dispose();
      stored = serializeDismissals(
        dismissAd(emptyDismissals(), "home-secondary", "closed-while-away", now)
      );
      dispose = subscribeAds("/second", () => {});
      assert.equal(
        isCampaignDismissed(getAdSnapshot().dismissals, "closed-while-away"),
        true
      );

      forbidden = true;
      dismissAdvertisement("home-primary", "browser-three");
      dispose();
      dispose = subscribeAds("/third", () => {});
      assert.equal(
        isPlacementDismissed(getAdSnapshot().dismissals, "home-primary"),
        true
      );
      assert.equal(
        isCampaignDismissed(getAdSnapshot().dismissals, "browser-three"),
        true
      );
    } finally {
      dispose?.();
      Date.now = originalNow;
      names.forEach((name, index) => {
        const descriptor = originals[index];
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else Reflect.deleteProperty(globalThis, name);
      });
    }
  });
});
