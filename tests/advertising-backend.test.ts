import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  list,
  loadExamples,
  loadExamplesInternal,
  publicFeed,
  refreshDelivery,
  save,
  setEnabled,
  useFiveExamples,
  upgradeResponsiveExamples,
} from "../convex/advertising";
import { AD_DEMO_MEDIA } from "../convex/adDemoManifest";
import {
  AD_ARTICLE_IMAGE_BUDGET,
  constrainAdMedia,
  validateCampaign,
  type CampaignInput,
} from "../convex/model/advertising";
import { DEMO_ADS, DEMO_POSTERS } from "../lib/ads/demo";
import { AD_PLACEMENTS, type AdCreative } from "../lib/ads/types";
import { getMediaAsset } from "../lib/media";
import { createFakeDb, handlerOf, signedIn } from "./support/fake-convex";

type ExampleResult = { created: number; existing: number; total: number };
type CampaignRow = CampaignInput & {
  _id: string;
  demoKey?: string;
  updatedAt: number;
  updatedBy: string;
};
const load = handlerOf<Record<string, never>, ExampleResult>(loadExamples);
const loadInternal = handlerOf<Record<string, never>, ExampleResult>(
  loadExamplesInternal
);
const useFive = handlerOf<
  Record<string, never>,
  { active: number; paused: number }
>(useFiveExamples);
const upgradeResponsive = handlerOf<
  Record<string, never>,
  { updated: number; existing: number; skipped: number }
>(upgradeResponsiveExamples);
const readList = handlerOf<Record<string, never>, CampaignRow[]>(list);
const readFeed = handlerOf<Record<string, never>, AdCreative[]>(publicFeed);
const writeCampaign = handlerOf<CampaignInput & { id?: string }, string>(save);
const enable = handlerOf<{ id: string; enabled: boolean }, null>(setEnabled);
const refresh = handlerOf<{ id: string; expectedUpdatedAt: number }, null>(
  refreshDelivery
);

const input = (patch: Partial<CampaignInput> = {}): CampaignInput => ({
  title: "Une campagne de test",
  advertiser: "Atelier fictif de test",
  kind: "house",
  format: "banner",
  href: "/publicite/demo/komo-atelier",
  mediaKey: DEMO_ADS[0].mediaKey,
  placements: ["home-primary"],
  enabled: true,
  priority: 50,
  ...patch,
});

function seedAsset(
  fake: ReturnType<typeof createFakeDb>,
  key: string,
  caption?: string
): string {
  const asset = AD_DEMO_MEDIA[key];
  return fake.seed("media", [
    {
      key: asset.id,
      alt: asset.alt,
      caption: caption ?? asset.caption,
      credit: asset.credit,
      license: asset.license,
      source: asset.source,
      color: asset.color,
      width: asset.width,
      height: asset.height,
      variants: [
        ...asset.webp.map((variant) => ({ format: "webp", ...variant })),
        ...asset.avif.map((variant) => ({ format: "avif", ...variant })),
      ],
    },
  ])[0];
}

test("advertising administration requires settingsManage before any write", async () => {
  const fake = createFakeDb();
  const admin = signedIn(fake);
  const anonymous = { ...admin, auth: { getUserIdentity: async () => null } };
  await assert.rejects(load(anonymous, {}));
  await assert.rejects(readList(anonymous, {}));
  await assert.rejects(writeCampaign(anonymous, input()));
  const profile = fake.all("users")[0];
  for (const roleSlug of ["editeur", "entreprise", "lecteur"]) {
    await fake.db.patch(profile._id, { roleSlug });
    await assert.rejects(load(admin, {}));
    await assert.rejects(writeCampaign(admin, input()));
    await assert.rejects(
      enable(admin, { id: "adCampaigns:999", enabled: true })
    );
  }
  assert.equal(fake.all("media").length, 0);
  assert.equal(fake.all("adCampaigns").length, 0);
});

test("demo loading is idempotent and leaves editorial data untouched", async () => {
  const fake = createFakeDb();
  const ctx = signedIn(fake);
  fake.seed("articles", [
    { title: "Article existant", slug: "article-existant" },
  ]);
  const before = fake.all("articles");
  assert.deepEqual(await load(ctx, {}), {
    created: 5,
    existing: 0,
    total: 5,
  });
  assert.deepEqual(await load(ctx, {}), {
    created: 0,
    existing: 5,
    total: 5,
  });
  assert.deepEqual(await loadInternal(ctx, {}), {
    created: 0,
    existing: 5,
    total: 5,
  });
  assert.equal(fake.all("media").length, 10);
  assert.equal(fake.all("adCampaigns").length, 5);
  assert.deepEqual(fake.all("articles"), before);
  assert.equal(
    fake.all("auditLog").length,
    1,
    "an unchanged second load writes nothing"
  );
  const feed = await readFeed(ctx, {});
  assert.equal(feed.length, 5);
  assert.ok(feed.every((creative) => creative.demo === true));
  assert.ok(
    feed.every(
      (creative) =>
        creative.mobileMedia?.id ===
        DEMO_ADS.find((ad) => ad.mediaKey === creative.media.id)?.mobileMediaKey
    )
  );
  assert.deepEqual(
    new Set(feed.flatMap((creative) => creative.placements)),
    new Set(AD_PLACEMENTS)
  );
  assert.deepEqual(
    new Set(feed.map((creative) => creative.device)),
    new Set(["all", "desktop", "mobile"])
  );
  assert.ok(
    feed.every(
      (creative) =>
        creative.startsAt === undefined && creative.endsAt === undefined
    )
  );
});

test("saving an example preserves its marker and later loads preserve campaigns and media edits", async () => {
  const fake = createFakeDb();
  const ctx = signedIn(fake);
  await loadInternal(ctx, {});
  const first = (await readList(ctx, {})).find(
    (row) => row.demoKey === DEMO_ADS[0].slug
  )!;
  await writeCampaign(
    ctx,
    input({
      title: "Titre modifié",
      device: "mobile",
      enabled: false,
      href: "/contacts",
    })
  );
  await writeCampaign(ctx, {
    ...input({ title: "Démo ajustée", enabled: false, device: "desktop" }),
    id: first._id,
  });
  const media = fake
    .all("media")
    .find((row) => row.key === DEMO_ADS[0].mediaKey)!;
  await fake.db.patch(media._id, {
    alt: "Texte alternatif modifié par la rédaction",
    caption: "Légende conservée",
  });
  const campaignsBefore = fake.all("adCampaigns");
  const mediaBefore = fake.all("media");
  assert.deepEqual(await load(ctx, {}), {
    created: 0,
    existing: 5,
    total: 5,
  });
  assert.deepEqual(fake.all("adCampaigns"), campaignsBefore);
  assert.deepEqual(fake.all("media"), mediaBefore);
  const changed = (await readList(ctx, {})).find(
    (row) => row._id === first._id
  )!;
  assert.equal(changed.demoKey, DEMO_ADS[0].slug);
  assert.equal(changed.title, "Démo ajustée");
  assert.equal(changed.enabled, false);
  assert.equal(changed.device, "desktop");
});

test("CRUD fields, device default, activation and URLs are enforced by real handlers", async () => {
  const fake = createFakeDb();
  const ctx = signedIn(fake);
  await loadInternal(ctx, {});
  const id = await writeCampaign(ctx, input());
  let row = (await readList(ctx, {})).find(
    (candidate) => candidate._id === id
  )!;
  assert.equal(row.device, "all");
  assert.equal(row.demoKey, undefined);
  await writeCampaign(ctx, {
    ...input({
      device: "mobile",
      placements: ["article-inline"],
      href: "https://example.invalid/offer",
    }),
    id,
  });
  row = (await readList(ctx, {})).find((candidate) => candidate._id === id)!;
  assert.equal(row.device, "mobile");
  assert.deepEqual(row.placements, ["article-inline"]);
  assert.equal(
    (await readFeed(ctx, {})).find((creative) => creative.id === id)?.demo,
    undefined
  );
  await enable(ctx, { id, enabled: false });
  assert.ok(!(await readFeed(ctx, {})).some((creative) => creative.id === id));
  await enable(ctx, { id, enabled: true });
  assert.ok((await readFeed(ctx, {})).some((creative) => creative.id === id));
  for (const href of [
    "javascript:alert(1)",
    "//example.invalid",
    "https://user:pass@example.invalid",
    "/%2fexample.invalid",
  ]) {
    await assert.rejects(writeCampaign(ctx, { ...input({ href }), id }));
  }
  await assert.rejects(
    writeCampaign(ctx, input({ device: "tablet" as CampaignInput["device"] }))
  );
});

test("calendar boundaries are scheduled and stale callbacks cannot overwrite edits", async () => {
  const fake = createFakeDb();
  const scheduled: number[] = [];
  const ctx = {
    ...signedIn(fake),
    scheduler: {
      ...fake.scheduler,
      // The shared fake models runAfter; capture this module's absolute boundary.
      runAt: async (at: number) => {
        scheduled.push(at);
        return `scheduled:${scheduled.length}`;
      },
    },
  };
  await loadInternal(ctx, {});
  const startsAt = Date.now() + 60_000;
  const endsAt = startsAt + 60_000;
  const id = await writeCampaign(ctx, input({ startsAt, endsAt }));
  assert.ok(!(await readFeed(ctx, {})).some((creative) => creative.id === id));
  assert.equal(scheduled.at(-1), startsAt);
  const previous = (await readList(ctx, {})).find((row) => row._id === id)!;
  await fake.db.patch(id, { updatedAt: previous.updatedAt + 1 });
  await refresh(ctx, { id, expectedUpdatedAt: previous.updatedAt });
  assert.equal((await fake.db.get(id))?.updatedAt, previous.updatedAt + 1);
  await writeCampaign(ctx, { ...input({ endsAt: Date.now() - 1 }), id });
  assert.ok(!(await readFeed(ctx, {})).some((creative) => creative.id === id));
  await writeCampaign(ctx, { ...input(), id });
  assert.equal(
    (await fake.db.get(id))?.endsAt,
    undefined,
    "removed dates are cleared"
  );
  assert.ok((await readFeed(ctx, {})).some((creative) => creative.id === id));
  await assert.rejects(
    writeCampaign(ctx, { ...input({ startsAt: 2000, endsAt: 1000 }), id })
  );
});

test("every new placement has explicit format and device validation", () => {
  for (const placement of ["article", "popup", "floating"] as const) {
    assert.doesNotThrow(() =>
      validateCampaign(
        input({ format: "square", placements: [placement], device: "mobile" })
      )
    );
  }
  for (const placement of [
    "home-primary",
    "home-secondary",
    "listing",
    "article-inline",
  ] as const) {
    assert.throws(() =>
      validateCampaign(input({ format: "square", placements: [placement] }))
    );
  }
  for (const placement of ["popup", "floating"] as const) {
    assert.throws(() => validateCampaign(input({ placements: [placement] })));
  }
});

test("original demo posters exist at every declared size, with data-saver support and real budgets", async () => {
  assert.equal(DEMO_ADS.length, 5);
  assert.equal(DEMO_POSTERS.length, 10);
  assert.equal(new Set(DEMO_POSTERS.map((ad) => ad.slug)).size, 10);
  for (const ad of DEMO_POSTERS) {
    const asset = AD_DEMO_MEDIA[ad.mediaKey];
    assert.ok(asset);
    assert.equal(getMediaAsset(ad.mediaKey), asset);
    assert.match(asset.alt, /fictif/);
    const constrained = constrainAdMedia(asset, ad.format, ad.placements);
    for (const format of ["webp", "avif"] as const) {
      assert.deepEqual(constrained[format], asset[format]);
      for (const width of [320, 480, 640]) {
        assert.ok(asset[format].some((variant) => variant.w === width));
      }
      for (const variant of asset[format]) {
        const file = await readFile(
          path.resolve(
            import.meta.dirname,
            "../public/medias",
            `${ad.mediaKey}-${variant.w}.${format}`
          )
        );
        const metadata = await sharp(file).metadata();
        assert.equal(file.length, variant.bytes);
        assert.equal(metadata.width, variant.w);
        assert.equal(metadata.height, variant.h);
        assert.equal(metadata.format, format === "avif" ? "heif" : "webp");
        if (format === "avif")
          assert.equal(file.toString("ascii", 4, 12), "ftypavif");
        assert.ok(file.length <= AD_ARTICLE_IMAGE_BUDGET);
      }
    }
    const avif640 = asset.avif.find((variant) => variant.w === 640)!;
    assert.ok(
      avif640.bytes < asset.webp.find((variant) => variant.w === 640)!.bytes
    );
    if (ad.format === "banner") {
      assert.ok(avif640.bytes <= 4 * 1024);
    }
  }
});

test("the operator transition keeps ten originals, activates five and pauses five without touching real campaigns", async () => {
  const fake = createFakeDb();
  const ctx = signedIn(fake);
  for (const poster of DEMO_POSTERS) {
    seedAsset(fake, poster.mediaKey, "Légende personnalisée conservée");
    fake.seed("adCampaigns", [
      {
        ...input({
          title: `Titre conservé : ${poster.title}`,
          advertiser: poster.advertiser,
          format: poster.format,
          mediaKey: poster.mediaKey,
          placements: [...poster.placements],
          device: poster.device,
          href: `/publicite/demo/${poster.slug}`,
          priority: 31,
        }),
        demoKey: poster.slug,
        updatedAt: 1,
        updatedBy: "Version précédente",
      },
    ]);
  }
  for (const ad of DEMO_ADS) seedAsset(fake, ad.mobileMediaKey!);
  const realId = await writeCampaign(
    ctx,
    input({ title: "Campagne réelle à conserver" })
  );
  const [unknownId] = fake.seed("adCampaigns", [
    {
      ...input({ title: "Autre marqueur à conserver" }),
      demoKey: "unknown-example",
      updatedAt: 1,
      updatedBy: "Autre opérateur",
    },
  ]);
  const realBefore = await fake.db.get(realId);
  const unknownBefore = await fake.db.get(unknownId);
  const originals = await readList(ctx, {});
  const mediaBefore = fake.all("media");
  assert.equal((await readFeed(ctx, {})).length, 12);
  assert.deepEqual(await useFive(ctx, {}), { active: 5, paused: 5 });
  const rows = await readList(ctx, {});
  assert.equal(rows.length, 12, "no campaign is deleted");
  assert.deepEqual(await fake.db.get(realId), realBefore);
  assert.deepEqual(await fake.db.get(unknownId), unknownBefore);
  assert.deepEqual(fake.all("media"), mediaBefore);
  for (const poster of DEMO_POSTERS) {
    const row = rows.find((candidate) => candidate.demoKey === poster.slug)!;
    const before = originals.find((candidate) => candidate._id === row._id)!;
    const selected = DEMO_ADS.find((ad) => ad.slug === poster.slug);
    assert.equal(row.enabled, Boolean(selected));
    assert.equal(row.title, before.title);
    assert.equal(row.mediaKey, before.mediaKey);
    assert.equal(row.href, before.href);
    assert.equal(row.priority, before.priority);
    if (selected) {
      assert.deepEqual(row.placements, selected.placements);
      assert.equal(row.device, selected.device);
    }
  }
  const knownIds = new Set(
    originals
      .filter((row) => DEMO_POSTERS.some((ad) => ad.slug === row.demoKey))
      .map((row) => row._id)
  );
  assert.equal(
    (await readFeed(ctx, {})).filter((creative) => knownIds.has(creative.id))
      .length,
    5
  );
  const writesBeforeRepeat = fake.writes.length;
  assert.deepEqual(await useFive(ctx, {}), { active: 5, paused: 5 });
  assert.equal(
    fake.writes.length,
    writesBeforeRepeat,
    "the transition is idempotent"
  );
  assert.ok(
    fake
      .all("auditLog")
      .some((row) => String(row.summary).includes("aucune suppression"))
  );
});

test("the operator transition only creates the selected five on an empty database", async () => {
  const fake = createFakeDb();
  const ctx = signedIn(fake);
  assert.deepEqual(await useFive(ctx, {}), { active: 5, paused: 0 });
  assert.equal(fake.all("adCampaigns").length, 5);
  assert.equal(fake.all("media").length, 10);
  assert.equal((await readFeed(ctx, {})).length, 5);
});

test("mobile posters can be selected, cleared and left absent on legacy campaigns", async () => {
  const fake = createFakeDb();
  const ctx = signedIn(fake);
  await loadInternal(ctx, {});
  const legacyId = await writeCampaign(ctx, input());
  assert.equal(
    (await readFeed(ctx, {})).find((creative) => creative.id === legacyId)
      ?.mobileMedia,
    undefined
  );
  const row = (await readList(ctx, {})).find(
    (campaign) => campaign.demoKey === DEMO_ADS[0].slug
  )!;
  const mobileMediaKey = DEMO_ADS[0].mobileMediaKey!;
  await writeCampaign(ctx, {
    ...input({ mobileMediaKey: ` ${mobileMediaKey} ` }),
    id: row._id,
  });
  assert.equal(
    (await readList(ctx, {})).find((campaign) => campaign._id === row._id)
      ?.mobileMediaKey,
    mobileMediaKey
  );
  let creative = (await readFeed(ctx, {})).find(
    (campaign) => campaign.id === row._id
  )!;
  assert.equal(creative.mobileMedia?.id, mobileMediaKey);
  assert.equal(creative.media.id, row.mediaKey);
  await writeCampaign(ctx, { ...input({ mobileMediaKey: "  " }), id: row._id });
  assert.equal((await fake.db.get(row._id))?.mobileMediaKey, undefined);
  await load(ctx, {});
  assert.equal(
    (await fake.db.get(row._id))?.mobileMediaKey,
    undefined,
    "the loader never changes an existing campaign"
  );
  creative = (await readFeed(ctx, {})).find(
    (campaign) => campaign.id === row._id
  )!;
  assert.equal(creative.mobileMedia, undefined);
  assert.equal(creative.media.id, row.mediaKey);
});

test("unavailable or invalid mobile files fall back publicly but block save and activation", async () => {
  for (const failure of ["missing", "empty-alt", "over-budget"] as const) {
    const fake = createFakeDb();
    const ctx = signedIn(fake);
    await loadInternal(ctx, {});
    const mobileMediaKey = DEMO_ADS[0].mobileMediaKey!;
    const id = await writeCampaign(
      ctx,
      input({ mobileMediaKey, placements: ["article-inline"] })
    );
    const mobile = fake.all("media").find((row) => row.key === mobileMediaKey)!;
    if (failure === "missing") await fake.db.delete(mobile._id);
    else if (failure === "empty-alt")
      await fake.db.patch(mobile._id, { alt: "" });
    else {
      fake.files.set("storage:mobile-budget", {
        size: AD_ARTICLE_IMAGE_BUDGET + 1,
        contentType: "image/webp",
      });
      await fake.db.patch(mobile._id, {
        storage: [
          { w: 640, h: 360, bytes: 1, storageId: "storage:mobile-budget" },
        ],
      });
    }
    const creative = (await readFeed(ctx, {})).find(
      (campaign) => campaign.id === id
    );
    assert.ok(creative, failure);
    assert.equal(creative.mobileMedia, undefined, failure);
    assert.equal(creative.media.id, DEMO_ADS[0].mediaKey, failure);
    await assert.rejects(
      writeCampaign(ctx, {
        ...input({ mobileMediaKey, placements: ["article-inline"] }),
        id,
      })
    );
    await enable(ctx, { id, enabled: false });
    await assert.rejects(enable(ctx, { id, enabled: true }));
    assert.equal((await fake.db.get(id))?.enabled, false);
  }
});

test("responsive upgrading is idempotent and preserves five active and five paused legacy demos", async () => {
  const fake = createFakeDb();
  const ctx = {
    ...signedIn(fake),
    scheduler: {
      ...fake.scheduler,
      runAt: async () => "scheduled:mobile-upgrade",
    },
  };
  const startsAt = Date.now() - 60_000;
  const endsAt = Date.now() + 86_400_000;
  for (const poster of DEMO_POSTERS) {
    seedAsset(fake, poster.mediaKey, "Légende ancienne à conserver");
    const selected = DEMO_ADS.find((ad) => ad.slug === poster.slug);
    fake.seed("adCampaigns", [
      {
        ...input({
          title: `Titre ancien : ${poster.title}`,
          advertiser: poster.advertiser,
          format: poster.format,
          mediaKey: poster.mediaKey,
          placements: [...(selected?.placements ?? poster.placements)],
          device: selected?.device ?? poster.device,
          enabled: Boolean(selected),
          href: `/publicite/demo/${poster.slug}`,
          startsAt,
          endsAt,
        }),
        demoKey: poster.slug,
        updatedAt: 1,
        updatedBy: "Avant migration mobile",
      },
    ]);
  }
  const before = await readList(ctx, {});
  const mediaBefore = fake.all("media");
  assert.deepEqual(await load(ctx, {}), { created: 0, existing: 5, total: 5 });
  assert.ok(
    (await readList(ctx, {})).every((row) => row.mobileMediaKey === undefined),
    "loading remains insert-only"
  );
  // Simulate a legacy deployment without the new media rows as well.
  for (const media of fake.all("media")) {
    if (DEMO_ADS.some((ad) => ad.mobileMediaKey === media.key))
      await fake.db.delete(media._id);
  }
  assert.deepEqual(await upgradeResponsive(ctx, {}), {
    updated: 5,
    existing: 0,
    skipped: 0,
  });
  const after = await readList(ctx, {});
  assert.equal(after.filter((row) => row.enabled).length, 5);
  assert.equal(after.filter((row) => !row.enabled).length, 5);
  assert.equal(fake.all("media").length, 15);
  for (const oldMedia of mediaBefore)
    assert.deepEqual(await fake.db.get(oldMedia._id), oldMedia);
  for (const old of before) {
    const row = after.find((candidate) => candidate._id === old._id)!;
    const selected = DEMO_ADS.find((ad) => ad.slug === old.demoKey);
    if (selected) assert.equal(row.mobileMediaKey, selected.mobileMediaKey);
    else assert.deepEqual(row, old);
    assert.deepEqual(
      {
        ...row,
        mobileMediaKey: undefined,
        updatedAt: old.updatedAt,
        updatedBy: old.updatedBy,
      },
      { ...old, mobileMediaKey: undefined }
    );
  }
  assert.equal((await readFeed(ctx, {})).length, 5);
  const writesBeforeRepeat = fake.writes.length;
  assert.deepEqual(await upgradeResponsive(ctx, {}), {
    updated: 0,
    existing: 5,
    skipped: 0,
  });
  assert.equal(fake.writes.length, writesBeforeRepeat);
});

test("responsive upgrading preserves custom posters, missing demos and real campaigns", async () => {
  const fake = createFakeDb();
  const ctx = signedIn(fake);
  await loadInternal(ctx, {});
  const rows = await readList(ctx, {});
  for (const row of rows)
    await fake.db.patch(row._id, { mobileMediaKey: undefined });
  const bySlug = (slug: string) => rows.find((row) => row.demoKey === slug)!;
  const customMain = bySlug(DEMO_ADS[0].slug);
  await fake.db.patch(customMain._id, { mediaKey: "custom-main-poster" });
  const customMobile = bySlug(DEMO_ADS[1].slug);
  await fake.db.patch(customMobile._id, {
    mobileMediaKey: DEMO_ADS[0].mobileMediaKey,
  });
  const missing = bySlug(DEMO_ADS[2].slug);
  await fake.db.delete(missing._id);
  const paused = bySlug(DEMO_ADS[3].slug);
  const startsAt = Date.now() + 60_000;
  await fake.db.patch(paused._id, {
    enabled: false,
    placements: ["floating"],
    device: "mobile",
    startsAt,
  });
  const realId = await writeCampaign(
    ctx,
    input({ title: "Annonceur fictif hors démonstration" })
  );
  const realBefore = await fake.db.get(realId);
  const mediaBefore = fake.all("media");
  assert.deepEqual(await upgradeResponsive(ctx, {}), {
    updated: 2,
    existing: 1,
    skipped: 2,
  });
  assert.equal((await fake.db.get(customMain._id))?.mobileMediaKey, undefined);
  assert.equal(
    (await fake.db.get(customMobile._id))?.mobileMediaKey,
    DEMO_ADS[0].mobileMediaKey
  );
  assert.equal(await fake.db.get(missing._id), null);
  const pausedAfter = await fake.db.get(paused._id);
  assert.equal(pausedAfter?.enabled, false);
  assert.deepEqual(pausedAfter?.placements, ["floating"]);
  assert.equal(pausedAfter?.device, "mobile");
  assert.equal(pausedAfter?.startsAt, startsAt);
  assert.deepEqual(await fake.db.get(realId), realBefore);
  assert.deepEqual(fake.all("media"), mediaBefore);
});
