import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCampaignSubmission, localDateInput } from "../components/custom/advertising-manager";
import { loadExamplesInternal, publicFeed, save, setEnabled } from "../convex/advertising";
import { DEMO_ADS } from "../lib/ads/demo";
import { dismissAd, emptyDismissals, selectOverlay } from "../lib/ads/policy";
import type { AdCreative } from "../lib/ads/types";
import { createFakeDb, handlerOf, signedIn } from "./support/fake-convex";

test("admin form → persisted campaign → mobile delivery → close → pause and resume", async () => {
  const fake = createFakeDb();
  const base = signedIn(fake);
  const scheduled: number[] = [];
  const ctx = {
    ...base,
    scheduler: {
      ...base.scheduler,
      runAt: async (at: number) => {
        scheduled.push(at);
        return `scheduled:${scheduled.length}`;
      },
    },
  };
  await handlerOf<Record<string, never>, unknown>(loadExamplesInternal)(ctx, {});
  const write = handlerOf<ReturnType<typeof buildCampaignSubmission>, string>(save);
  const feed = handlerOf<Record<string, never>, AdCreative[]>(publicFeed);
  const enable = handlerOf<{ id: string; enabled: boolean }, null>(setEnabled);
  const demo = DEMO_ADS.find((item) => item.slug === "rivage-marche")!;
  const now = Date.now();
  const form: Parameters<typeof buildCampaignSubmission>[0] = {
    title: "  Campagne fictive du parcours  ",
    advertiser: "Annonceur de recette",
    kind: "house",
    format: "square",
    device: "mobile",
    href: `/publicite/demo/${demo.slug}`,
    mediaKey: demo.mediaKey,
    placements: ["floating"],
    startsAt: localDateInput(now - 60_000),
    endsAt: localDateInput(now + 86_400_000),
    priority: "90",
    enabled: true,
  };
  const id = await write(ctx, buildCampaignSubmission(form, null));
  const creative = (await feed(ctx, {})).find((item) => item.id === id)!;
  assert.ok(creative, "the real public feed contains the saved form");
  assert.equal(creative.title, "Campagne fictive du parcours");
  assert.equal(creative.href, form.href);
  assert.equal(creative.device, "mobile");
  assert.equal(scheduled[0], creative.endsAt, "the form's deadline schedules delivery refresh");
  assert.ok(creative.media.webp.length > 0, "delivery resolves the selected library poster");
  assert.equal(selectOverlay([creative], emptyDismissals(), "mobile", now)?.creative.id, id);
  assert.equal(selectOverlay([creative], emptyDismissals(), "desktop", now), undefined);
  const closed = dismissAd(emptyDismissals(), "floating", id, now);
  assert.equal(selectOverlay([creative], closed, "mobile", now), undefined);
  await enable(ctx, { id, enabled: false });
  assert.ok(!(await feed(ctx, {})).some((item) => item.id === id));
  await enable(ctx, { id, enabled: true });
  assert.ok((await feed(ctx, {})).some((item) => item.id === id));
  assert.equal(fake.all("adCampaigns").length, DEMO_ADS.length + 1, "resuming does not duplicate the campaign");
});
