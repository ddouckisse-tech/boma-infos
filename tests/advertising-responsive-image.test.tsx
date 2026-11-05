import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ResponsiveImage } from "../components/custom/responsive-image";
import { AD_DEMO_MEDIA } from "../convex/adDemoManifest";

test("responsive advertising emits one image with mobile-first sources and the original desktop fallback", () => {
  const desktop = AD_DEMO_MEDIA["demo-ad-komo-atelier"];
  const mobile = AD_DEMO_MEDIA["demo-ad-komo-atelier-mobile"];
  assert.ok(mobile);
  const html = renderToStaticMarkup(<ResponsiveImage media={desktop} mobileMedia={mobile} sizes="640px" mobileSizes="92vw" maxWidth={640} />);
  assert.equal((html.match(/<img\b/g) ?? []).length, 1);
  assert.match(html, /media="\(max-width: 1023px\)" type="image\/avif"/);
  assert.match(html, /komo-atelier-mobile-640\.avif/);
  assert.match(html, /src="\/medias\/demo-ad-komo-atelier-640\.webp"/);
  assert.ok(html.indexOf("komo-atelier-mobile-320.avif") < html.indexOf("komo-atelier-320.avif"));
  assert.doesNotMatch(html, /mobile-1280/);
  assert.match(html, /loading="lazy"/);
});

test("legacy campaign images preserve the standard picture and eager preload behaviour", () => {
  const media = AD_DEMO_MEDIA["demo-ad-komo-atelier"];
  const html = renderToStaticMarkup(<ResponsiveImage media={media} sizes="640px" maxWidth={640} priority />);
  assert.equal((html.match(/<img\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /max-width: 1023px/);
  assert.doesNotMatch(html, /komo-atelier-mobile/);
  assert.match(html, /rel="preload"/);
  assert.match(html, /loading="eager"/);
});
