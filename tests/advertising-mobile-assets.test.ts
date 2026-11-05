import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { DEMO_ADS, DEMO_POSTERS } from "@/lib/ads/demo";
import { AD_DEMO_MEDIA } from "@/convex/adDemoManifest";

const directory = path.resolve(import.meta.dirname, "../public/medias");

describe("art-directed mobile advertisement files", () => {
  it("keeps five active examples with independent 16:9 artwork and all ten archived originals", () => {
    assert.equal(DEMO_ADS.length, 5);
    assert.equal(DEMO_POSTERS.length, 10);
    for (const ad of DEMO_POSTERS) assert.ok(AD_DEMO_MEDIA[ad.mediaKey]);
    for (const ad of DEMO_ADS) {
      assert.equal(ad.mobileMediaKey, `${ad.mediaKey}-mobile`);
      const mobile = AD_DEMO_MEDIA[ad.mobileMediaKey!];
      assert.ok(mobile, ad.slug);
      assert.notEqual(mobile.id, ad.mediaKey);
      assert.equal(mobile.width / mobile.height, 16 / 9);
      assert.match(mobile.alt, /fictif/);
      assert.deepEqual(
        mobile.avif.map((variant) => variant.w),
        [320, 480, 640]
      );
      assert.deepEqual(
        mobile.webp.map((variant) => variant.w),
        [320, 480, 640]
      );
    }
  });

  it("matches every on-disk rendition to its advertised dimensions, format, byte count and budget", async () => {
    for (const ad of DEMO_ADS) {
      const asset = AD_DEMO_MEDIA[ad.mobileMediaKey!];
      for (const format of ["avif", "webp"] as const) {
        for (const variant of asset[format]) {
          const file = path.join(
            directory,
            `${asset.id}-${variant.w}.${format}`
          );
          const bytes = await readFile(file);
          const metadata = await sharp(bytes).metadata();
          assert.equal(bytes.length, variant.bytes, file);
          assert.equal(metadata.width, variant.w, file);
          assert.equal(metadata.height, variant.h, file);
          assert.equal(metadata.width! / metadata.height!, 16 / 9, file);
          assert.equal(
            metadata.format,
            format === "avif" ? "heif" : "webp",
            file
          );
          assert.ok(bytes.length <= (format === "avif" ? 4096 : 16384), file);
        }
      }
    }
  });
});
