import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import sharp from "sharp";
import manifest from "../app/manifest";

test("the standalone manifest preserves the existing application identity and public scope", () => {
  const value = manifest();
  assert.equal(value.id, "/?source=pwa");
  assert.equal(value.start_url, value.id);
  assert.equal(value.scope, "/");
  assert.equal(value.display, "standalone");
  assert.equal(value.short_name, "BOMA Infos");
  assert.equal(value.lang, "fr-FR");
  const base = "https://pwa.example.invalid/manifest.webmanifest";
  assert.equal(
    new URL(value.id!, base).href,
    "https://pwa.example.invalid/?source=pwa"
  );
  assert.ok(value.shortcuts?.every((shortcut) => shortcut.url.startsWith("/")));
});

test("existing Android, maskable and Apple icons have their declared PNG dimensions", async () => {
  const icons = manifest().icons ?? [];
  assert.ok(
    icons.some((icon) => icon.sizes === "192x192" && icon.purpose === "any")
  );
  assert.ok(
    icons.some((icon) => icon.sizes === "512x512" && icon.purpose === "any")
  );
  assert.ok(
    icons.some(
      (icon) => icon.sizes === "512x512" && icon.purpose === "maskable"
    )
  );
  for (const icon of icons) {
    const url = new URL(icon.src, "https://pwa.example.invalid");
    assert.equal(url.origin, "https://pwa.example.invalid");
    assert.ok(url.pathname.startsWith("/icons/"));
    const bytes = await readFile(
      new URL(`../public${url.pathname}`, import.meta.url)
    );
    const metadata = await sharp(bytes).metadata();
    assert.equal(icon.type, "image/png");
    assert.equal(metadata.format, "png");
    assert.equal(`${metadata.width}x${metadata.height}`, icon.sizes);
  }
  const apple = await sharp(
    await readFile(
      new URL("../public/icons/apple-touch-icon.png", import.meta.url)
    )
  ).metadata();
  assert.equal(apple.format, "png");
  assert.equal(apple.width, 180);
  assert.equal(apple.height, 180);
});

test("manifest generation works in an isolated process without environment files or browser globals", () => {
  const child = spawnSync(
    process.execPath,
    [
      "--no-env-file",
      "-e",
      'import manifest from "./app/manifest.ts"; console.log(JSON.stringify(manifest()));',
    ],
    {
      cwd: fileURLToPath(new URL("../", import.meta.url)),
      env: { NODE_ENV: "test" },
      encoding: "utf8",
      timeout: 10_000,
    }
  );
  assert.equal(child.status, 0, child.stderr);
  assert.deepEqual(JSON.parse(child.stdout.trim()), manifest());
});
