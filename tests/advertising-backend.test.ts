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
} from "../convex/advertising";
import { AD_DEMO_MEDIA } from "../convex/adDemoManifest";
import {
  AD_ARTICLE_IMAGE_BUDGET,
  validateCampaign,
  type CampaignInput,
} from "../convex/model/advertising";
import { DEMO_ADS } from "../lib/ads/demo";
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
    created: 10,
    existing: 0,
    total: 10,
  });
  assert.deepEqual(await load(ctx, {}), {
    created: 0,
    existing: 10,
    total: 10,
  });
  assert.deepEqual(await loadInternal(ctx, {}), {
    created: 0,
    existing: 10,
    total: 10,
  });
  assert.equal(fake.all("media").length, 10);
  assert.equal(fake.all("adCampaigns").length, 10);
  assert.deepEqual(fake.all("articles"), before);
  assert.equal(
    fake.all("auditLog").length,
    1,
    "an unchanged second load writes nothing"
  );
  const feed = await readFeed(ctx, {});
  assert.equal(feed.length, 10);
  assert.ok(feed.every((creative) => creative.demo === true));
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
    existing: 10,
    total: 10,
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
  assert.equal(DEMO_ADS.length, 10);
  assert.equal(new Set(DEMO_ADS.map((ad) => ad.slug)).size, 10);
  for (const ad of DEMO_ADS) {
    const asset = AD_DEMO_MEDIA[ad.mediaKey];
    assert.ok(asset);
    assert.equal(getMediaAsset(ad.mediaKey), asset);
    assert.match(asset.alt, /fictif/);
    assert.ok(asset.webp.some((variant) => variant.w === 320));
    assert.ok(asset.webp.some((variant) => variant.w === 480));
    assert.ok(asset.webp.some((variant) => variant.w === 640));
    for (const variant of asset.webp) {
      const file = await readFile(
        path.resolve(
          import.meta.dirname,
          "../public/medias",
          `${ad.mediaKey}-${variant.w}.webp`
        )
      );
      const metadata = await sharp(file).metadata();
      assert.equal(file.length, variant.bytes);
      assert.equal(metadata.width, variant.w);
      assert.equal(metadata.height, variant.h);
      assert.equal(metadata.format, "webp");
      assert.ok(file.length <= AD_ARTICLE_IMAGE_BUDGET);
    }
  }
});
