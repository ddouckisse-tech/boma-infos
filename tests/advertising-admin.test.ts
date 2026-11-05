import assert from "node:assert/strict";
import { test } from "node:test";
import type { Id } from "../convex/_generated/dataModel";
import {
  buildCampaignSubmission,
  localDateInput,
} from "../components/custom/advertising-manager";

type FormValues = Parameters<typeof buildCampaignSubmission>[0];

const form: FormValues = {
  title: "  Édition du journal  ",
  advertiser: "  BOMA Infos  ",
  kind: "house",
  format: "banner",
  device: "all",
  href: "  /newsletter  ",
  mediaKey: "affiche-test",
  placements: ["home-primary", "article-inline"],
  startsAt: "",
  endsAt: "",
  priority: "50",
  enabled: true,
};

test("the editor sends normalized fields, device and dates without changing the campaign identity", () => {
  const original = {
    _id: "campaign-test" as Id<"adCampaigns">,
    startsAt: Date.UTC(2026, 9, 25, 1, 30, 0, 123),
    endsAt: Date.UTC(2026, 10, 5, 21, 45, 6, 789),
    demoKey: "editorial-demo",
  };
  const input = {
    ...form,
    device: "mobile" as const,
    startsAt: localDateInput(original.startsAt),
    endsAt: localDateInput(original.endsAt),
    priority: "0",
    enabled: false,
  };
  const snapshot = structuredClone(input);
  const payload = buildCampaignSubmission(input, original);
  assert.equal(payload.id, original._id);
  assert.equal(payload.title, "Édition du journal");
  assert.equal(payload.advertiser, "BOMA Infos");
  assert.equal(payload.href, "/newsletter");
  assert.equal(payload.device, "mobile");
  assert.equal(payload.startsAt, original.startsAt);
  assert.equal(payload.endsAt, original.endsAt);
  assert.equal(payload.priority, 0);
  assert.equal(payload.enabled, false);
  assert.deepEqual(payload.placements, input.placements);
  assert.notEqual(payload.placements, input.placements);
  assert.deepEqual(input, snapshot);
  // The client cannot create or clear this server-owned marker.
  assert.equal("demoKey" in payload, false);
});

test("clearing a date removes it and legacy campaigns default to every screen", () => {
  const payload = buildCampaignSubmission(
    { ...form, device: undefined },
    {
      _id: "campaign-test" as Id<"adCampaigns">,
      startsAt: 1_000,
      endsAt: 2_000,
    }
  );
  assert.equal(payload.startsAt, undefined);
  assert.equal(payload.endsAt, undefined);
  assert.equal(payload.device, "all");
  assert.equal(payload.mobileMediaKey, undefined);
});

test("a dedicated smartphone poster is sent without replacing the primary desktop poster", () => {
  const input = {
    ...form,
    mobileMediaKey: "  affiche-smartphone  ",
    device: "all" as const,
  };
  const payload = buildCampaignSubmission(input, null);
  assert.equal(payload.mediaKey, form.mediaKey);
  assert.equal(payload.mobileMediaKey, "affiche-smartphone");
  assert.equal(payload.device, "all");
  assert.equal(payload.format, form.format);
  assert.equal(payload.enabled, form.enabled);
  assert.deepEqual(payload.placements, form.placements);
  assert.equal(input.mobileMediaKey, "  affiche-smartphone  ");
});

test("editing keeps the smartphone poster and calendar until the dedicated poster is explicitly cleared", () => {
  const original = {
    _id: "campaign-test" as Id<"adCampaigns">,
    startsAt: Date.UTC(2026, 10, 5, 10, 15, 0, 123),
    endsAt: Date.UTC(2026, 10, 15, 17, 0, 0, 456),
    mobileMediaKey: "affiche-smartphone",
  };
  const editing = {
    ...form,
    mobileMediaKey: original.mobileMediaKey,
    startsAt: localDateInput(original.startsAt),
    endsAt: localDateInput(original.endsAt),
  };
  const kept = buildCampaignSubmission(editing, original);
  assert.equal(kept.mobileMediaKey, original.mobileMediaKey);
  for (const mobileMediaKey of ["", "   "]) {
    const cleared = buildCampaignSubmission(
      { ...editing, mobileMediaKey },
      original
    );
    assert.equal(cleared.mobileMediaKey, undefined);
    assert.equal(cleared.id, original._id);
    assert.equal(cleared.mediaKey, form.mediaKey);
    assert.equal(cleared.startsAt, original.startsAt);
    assert.equal(cleared.endsAt, original.endsAt);
    assert.equal(cleared.priority, 50);
    assert.equal(cleared.enabled, form.enabled);
  }
});

test("both occurrences of an ambiguous daylight-saving hour retain their exact instant", () => {
  const instants = [
    Date.UTC(2026, 9, 25, 0, 30, 0, 123),
    Date.UTC(2026, 9, 25, 1, 30, 0, 123),
  ];
  for (const startsAt of instants) {
    const payload = buildCampaignSubmission(
      {
        ...form,
        startsAt: localDateInput(startsAt),
      },
      { _id: "campaign-test" as Id<"adCampaigns">, startsAt }
    );
    assert.equal(payload.startsAt, startsAt);
  }
});

test("the payload only admits formats that can actually appear in their selected placements", () => {
  for (const placements of [
    ["article"],
    ["popup"],
    ["floating"],
    ["article", "popup", "floating"],
  ] as const) {
    assert.doesNotThrow(() =>
      buildCampaignSubmission(
        {
          ...form,
          format: "square",
          placements: [...placements],
        },
        null
      )
    );
  }
  assert.doesNotThrow(() =>
    buildCampaignSubmission(
      {
        ...form,
        placements: [
          "home-primary",
          "home-secondary",
          "listing",
          "article-inline",
          "article",
        ],
      },
      null
    )
  );
  for (const placement of [
    "home-primary",
    "home-secondary",
    "listing",
    "article-inline",
  ] as const) {
    assert.throws(() =>
      buildCampaignSubmission(
        {
          ...form,
          format: "square",
          placements: [placement],
        },
        null
      )
    );
  }
  for (const placement of ["popup", "floating"] as const) {
    assert.throws(() =>
      buildCampaignSubmission({ ...form, placements: [placement] }, null)
    );
  }
});

test("invalid schedules, priorities and missing placements stop before the save mutation", () => {
  const startsAt = localDateInput(Date.UTC(2026, 10, 5, 12));
  for (const patch of [
    { startsAt: "not-a-date" },
    { startsAt, endsAt: startsAt },
    { priority: "-1" },
    { priority: "101" },
    { priority: "1.5" },
    { priority: "no-number" },
    { priority: "" },
    { priority: "   " },
    { placements: [] },
  ]) {
    assert.throws(() => buildCampaignSubmission({ ...form, ...patch }, null));
  }
});
