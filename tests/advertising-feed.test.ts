import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { feedUrl, parseCampaignSelection, selectFeedCampaigns } from "../lib/ads/feed";

describe("approved campaign feed", () => {
  test("keeps the requested order but never introduces unknown campaigns", () => {
    const campaigns = [{ id: "a" }, { id: "b" }];
    const ids = parseCampaignSelection({ campaignIds: ["b", "missing", "b", "a"] });
    assert.deepEqual(selectFeedCampaigns(campaigns, ids), [{ id: "b" }, { id: "a" }]);
  });
  test("an empty response closes the inventory instead of inserting a house ad", () => {
    assert.deepEqual(selectFeedCampaigns([{ id: "a" }], parseCampaignSelection({ campaignIds: [] })), []);
  });
  test("rejects markup, oversized lists and invalid envelopes", () => {
    for (const value of [null, [], {}, { campaignIds: ["<script>"] }, { campaignIds: [1] }, { campaignIds: Array(25).fill("a") }]) {
      assert.throws(() => parseCampaignSelection(value));
    }
  });
  test("requires HTTPS without credentials for the configured scheduler", () => {
    assert.equal(feedUrl("https://ads.example.org/feed"), "https://ads.example.org/feed");
    for (const value of ["http://ads.example.org", "javascript:alert(1)", "https://user:pass@example.org"]) {
      assert.throws(() => feedUrl(value));
    }
  });
});
