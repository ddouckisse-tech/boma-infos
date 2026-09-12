/**
 * Produces the PWA icons.
 *
 *   bun run scripts/make-icons.ts
 *
 * The wordmark is typographic, so the icon is too: "LC" in Source Serif over
 * the brand navy, with the magenta point of the lock-up. Drawn as SVG and
 * rasterised by sharp — four PNG files, none above 12 Ko, committed to
 * `public/icons/`.
 *
 * The maskable variant keeps the glyph inside the 80 % safe area Android
 * crops to, so the letters are never clipped by a circular mask.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.resolve(import.meta.dirname, "..", "public", "icons");

const NAVY = "#002060";
const MAGENTA = "#C74794";

/** `safe` is the fraction of the canvas the glyph is allowed to occupy. */
function icon(size: number, safe: number, rounded: boolean): string {
  const glyph = Math.round(size * safe * 0.46);
  const radius = rounded ? Math.round(size * 0.18) : 0;
  const dot = Math.round(size * safe * 0.055);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${NAVY}"/>
  <text x="50%" y="50%" dy="0.34em" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-weight="700"
        font-size="${glyph}" fill="#FFFFFF" letter-spacing="${-glyph * 0.05}">LC</text>
  <circle cx="${size / 2 + glyph * 0.74}" cy="${size / 2 + glyph * 0.33}" r="${dot}" fill="${MAGENTA}"/>
</svg>`;
}

const FILES = [
  { name: "icon-192.png", size: 192, safe: 1, rounded: true },
  { name: "icon-512.png", size: 512, safe: 1, rounded: true },
  { name: "icon-maskable-512.png", size: 512, safe: 0.8, rounded: false },
  { name: "apple-touch-icon.png", size: 180, safe: 1, rounded: false },
] as const;

await mkdir(OUT_DIR, { recursive: true });

for (const file of FILES) {
  const buffer = await sharp(
    Buffer.from(icon(file.size, file.safe, file.rounded))
  )
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  await writeFile(path.join(OUT_DIR, file.name), buffer);
  console.log(`✓ ${file.name.padEnd(26)} ${buffer.byteLength} octets`);
}
