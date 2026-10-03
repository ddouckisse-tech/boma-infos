import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AD_IMAGE_BUDGET,
  AD_ARTICLE_IMAGE_BUDGET,
  constrainAdMedia,
  isSafeAdHref,
  selectActiveCampaigns,
  validateCampaign,
  type CampaignInput,
} from "../convex/model/advertising";
import type { MediaAsset } from "../lib/media-core";

const campaign: CampaignInput = {
  title: "Édition hebdomadaire",
  advertiser: "BOMA Infos",
  kind: "house",
  format: "banner",
  href: "/newsletter",
  mediaKey: "edition-test",
  placements: ["home-primary", "listing"],
  enabled: true,
  priority: 50,
};

const asset: MediaAsset = {
  id: "edition-test",
  alt: "La couverture de notre édition hebdomadaire",
  caption: "",
  credit: "BOMA Infos",
  license: "Droits réservés",
  source: "upload",
  color: "#123456",
  width: 1280,
  height: 640,
  avif: [],
  webp: [
    { w: 320, h: 160, bytes: 12_000 },
    { w: 640, h: 320, bytes: 32_000 },
    { w: 1280, h: 640, bytes: 70_000 },
  ],
};

test("destinations accept local absolute paths and HTTPS without credentials", () => {
  for (const href of [
    "/",
    "/newsletter",
    "/magazine?edition=septembre#sommaire",
    "https://example.com/campagne?edition=1",
  ]) {
    assert.equal(isSafeAdHref(href), true, href);
  }
  for (const href of [
    "//example.com",
    "/\\example.com",
    "/%2fexample.com",
    "/%5Cexample.com",
    "/%0Aexample.com",
    "/%",
    "javascript:alert(1)",
    "data:text/html,test",
    "http://example.com",
    "https://user:password@example.com",
    "https:example.com",
    "/path//example.com",
    "https://example.com\n",
    "newsletter",
    "#sommaire",
    "",
    "/<script>",
  ]) {
    assert.equal(isSafeAdHref(href), false, href);
  }
});

test("campaign fields are normalized and never contain HTML", () => {
  const result = validateCampaign({
    ...campaign,
    title: "  Édition de septembre  ",
    href: " /newsletter ",
  });
  assert.equal(result.title, "Édition de septembre");
  assert.equal(result.href, "/newsletter");
  for (const patch of [
    { title: " " },
    { advertiser: "<b>Annonceur</b>" },
    { title: "a".repeat(121) },
    { mediaKey: "../image" },
    { priority: -1 },
    { priority: 101 },
    { priority: 1.5 },
  ]) {
    assert.throws(() => validateCampaign({ ...campaign, ...patch }));
  }
});

test("square campaigns only use the article placement; banners can share placements", () => {
  assert.doesNotThrow(() =>
    validateCampaign({ ...campaign, format: "square", placements: ["article"] })
  );
  assert.doesNotThrow(() =>
    validateCampaign({
      ...campaign,
      placements: ["home-primary", "home-secondary", "article", "listing"],
    })
  );
  assert.throws(() => validateCampaign({ ...campaign, format: "square" }));
  assert.throws(() => validateCampaign({ ...campaign, placements: [] }));
  assert.throws(() =>
    validateCampaign({ ...campaign, placements: ["article", "article"] })
  );
});

test("campaign dates must be valid ordered millisecond timestamps", () => {
  assert.doesNotThrow(() =>
    validateCampaign({ ...campaign, startsAt: 1000, endsAt: 2000 })
  );
  assert.doesNotThrow(() => validateCampaign({ ...campaign, endsAt: 2000 }));
  for (const patch of [
    { startsAt: NaN },
    { endsAt: Infinity },
    { startsAt: -1 },
    { startsAt: 1.5 },
    { startsAt: 2000, endsAt: 2000 },
    { startsAt: 3000, endsAt: 2000 },
  ]) {
    assert.throws(() => validateCampaign({ ...campaign, ...patch }));
  }
});

test("selection respects enablement, inclusive start and exclusive end", () => {
  const rows = [
    { ...campaign, _id: "active", startsAt: 1000, endsAt: 2000 },
    { ...campaign, _id: "disabled", enabled: false },
    { ...campaign, _id: "future", startsAt: 1001 },
    { ...campaign, _id: "ended", endsAt: 1000 },
  ];
  assert.deepEqual(
    selectActiveCampaigns(rows, 1000).map((row) => row._id),
    ["active"]
  );
  assert.equal(selectActiveCampaigns([rows[0]], 2000).length, 0);
});

test("feed order is stable by descending priority and capped at 24", () => {
  const rows = Array.from({ length: 30 }, (_, index) => ({
    ...campaign,
    _id: String(index).padStart(2, "0"),
    priority: index % 2 === 0 ? 80 : 50,
  }));
  const selected = selectActiveCampaigns(rows, 1000);
  assert.equal(selected.length, 24);
  assert.deepEqual(
    selected.slice(0, 3).map((row) => row._id),
    ["00", "02", "04"]
  );
  assert.equal(rows[1]._id, "01", "the input is not sorted in place");
});

test("only actual offered renditions under the image budget remain", () => {
  for (const format of ["square", "banner"] as const) {
    const result = constrainAdMedia(asset, format);
    assert.deepEqual(
      result.webp.map((variant) => variant.w),
      [320, 640]
    );
    assert.ok(
      result.webp.every((variant) => variant.bytes <= AD_IMAGE_BUDGET[format])
    );
    assert.equal(asset.webp.length, 3);
  }
});

test("budget boundary is inclusive and cannot leave only an undersized banner", () => {
  const exact = {
    ...asset,
    webp: [{ w: 640, h: 320, bytes: AD_IMAGE_BUDGET.banner }],
  };
  assert.equal(constrainAdMedia(exact, "banner").webp.length, 1);
  assert.throws(() =>
    constrainAdMedia(
      {
        ...exact,
        webp: [{ ...exact.webp[0], bytes: AD_IMAGE_BUDGET.banner + 1 }],
      },
      "banner"
    )
  );
  assert.throws(() =>
    constrainAdMedia({ ...asset, webp: [asset.webp[0]] }, "banner")
  );
});

test("article campaigns cap square and banner renditions at 16 KiB, including shared placements", () => {
  const articleAsset: MediaAsset = {
    ...asset,
    avif: [
      { w: 320, h: 160, bytes: 12_000 },
      { w: 640, h: 320, bytes: AD_ARTICLE_IMAGE_BUDGET + 1 },
    ],
    webp: [
      { w: 320, h: 160, bytes: 12_000 },
      { w: 640, h: 320, bytes: AD_ARTICLE_IMAGE_BUDGET },
      { w: 1280, h: 640, bytes: AD_ARTICLE_IMAGE_BUDGET + 1 },
    ],
    urls: {
      "avif-320": "https://files.example.com/320.avif",
      "avif-640": "https://files.example.com/640.avif",
      "webp-320": "https://files.example.com/320.webp",
      "webp-640": "https://files.example.com/640.webp",
      "webp-1280": "https://files.example.com/1280.webp",
    },
  };
  for (const format of ["square", "banner"] as const) {
    for (const placements of [
      ["article"],
      ["home-primary", "article", "listing"],
    ] as const) {
      const result = constrainAdMedia(articleAsset, format, placements);
      assert.deepEqual(
        result.webp.map((variant) => variant.w),
        [320, 640]
      );
      assert.deepEqual(
        result.avif.map((variant) => variant.w),
        [320]
      );
      assert.ok(
        [...result.webp, ...result.avif].every(
          (variant) => variant.bytes <= AD_ARTICLE_IMAGE_BUDGET
        )
      );
      assert.deepEqual(Object.keys(result.urls!), [
        "webp-320",
        "webp-640",
        "avif-320",
      ]);
      assert.throws(
        () =>
          constrainAdMedia(
            {
              ...articleAsset,
              webp: [{ w: 640, h: 320, bytes: AD_ARTICLE_IMAGE_BUDGET + 1 }],
            },
            format,
            placements
          ),
        /16 Kio maximum/
      );
    }
  }
});

test("non-article placements retain format budgets and adding article tightens them", () => {
  for (const format of ["square", "banner"] as const) {
    const large = {
      ...asset,
      webp: [{ w: 640, h: 320, bytes: AD_IMAGE_BUDGET[format] }],
    };
    assert.equal(
      constrainAdMedia(large, format, ["home-primary", "listing"]).webp.length,
      1
    );
    assert.throws(
      () =>
        constrainAdMedia(large, format, ["home-primary", "listing", "article"]),
      /16 Kio maximum/
    );
  }
});

test("invalid, empty or missing media renditions and alt are refused", () => {
  for (const patch of [
    { alt: " " },
    { alt: "<img src=x>" },
    { width: 0 },
    { color: "red" },
    { webp: [] },
    { webp: [{ w: 640, h: 320, bytes: -1 }] },
    { webp: [{ w: 640, h: NaN, bytes: 1000 }] },
  ]) {
    assert.throws(() => constrainAdMedia({ ...asset, ...patch }, "banner"));
  }
});

test("storage URLs are retained only for offered versions; missing URLs never fall back to static files", () => {
  const urls = {
    "webp-320": "https://files.example.com/320",
    "webp-640": "https://files.example.com/640",
    "webp-1280": "https://files.example.com/1280",
  };
  const result = constrainAdMedia({ ...asset, urls }, "banner");
  assert.deepEqual(Object.keys(result.urls!), ["webp-320", "webp-640"]);
  assert.throws(() =>
    constrainAdMedia(
      { ...asset, urls: { "webp-320": urls["webp-320"] } },
      "banner"
    )
  );
});
