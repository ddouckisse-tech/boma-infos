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
        font-family="'Inter Tight', Inter, Helvetica, Arial, sans-serif" font-weight="800"
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

// Favicons : `app/icon.svg` pour que Next déclare `<link rel="icon">`, et
// `public/favicon.ico` pour les clients qui réclament ce chemin-là. Celui du lot 1 pesait 26,7 Ko et partait en
// priorité haute, dans le même tuyau que l'image de une — pour seize pixels
// de côté dans un onglet. Ici : un SVG de quelques centaines d'octets (net à
// toute densité) et, pour les navigateurs et lecteurs qui réclament
// `/favicon.ico` quoi qu'il arrive, un .ico d'un kilo-octet qui enveloppe un
// PNG de 32 px — sans lui, chaque chargement finissait par un 404.
const APP_DIR = path.resolve(import.meta.dirname, "..", "app");

const svg = icon(32, 1, false);
await writeFile(path.join(APP_DIR, "icon.svg"), svg);
console.log(`✓ ${"app/icon.svg".padEnd(26)} ${Buffer.byteLength(svg)} octets`);

// RGBA et non palette : le décodeur ICO de Next (qui lit `app/favicon.ico`)
// refuse un PNG indexé — la page entière rendait 500. Le fichier va dans
// `public/`, servi tel quel, sans décodage ; `app/icon.svg` porte le lien.
const png32 = await sharp(Buffer.from(svg))
  .ensureAlpha()
  .png({ compressionLevel: 9, palette: false })
  .toBuffer();
/** ICO container around a PNG entry (allowed since Windows Vista). */
function ico(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type : icône
  header.writeUInt16LE(1, 4); // nombre d'entrées
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0); // largeur
  entry.writeUInt8(size === 256 ? 0 : size, 1); // hauteur
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // réservé
  entry.writeUInt16LE(1, 4); // plans
  entry.writeUInt16LE(32, 6); // bits par pixel
  entry.writeUInt32LE(png.byteLength, 8); // taille des données
  entry.writeUInt32LE(6 + 16, 12); // décalage des données
  return Buffer.concat([header, entry, png]);
}
const favicon = ico(png32, 32);
// PNG 32 px en plus du SVG : Safari n'affiche pas de favicon SVG.
const pngIcon = await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9, palette: true })
  .toBuffer();
await writeFile(path.join(APP_DIR, "icon.png"), pngIcon);
console.log(`✓ ${"app/icon.png".padEnd(26)} ${pngIcon.byteLength} octets`);

const PUBLIC_DIR = path.resolve(import.meta.dirname, "..", "public");
await writeFile(path.join(PUBLIC_DIR, "favicon.ico"), favicon);
console.log(
  `✓ ${"public/favicon.ico".padEnd(26)} ${favicon.byteLength} octets`
);

for (const file of FILES) {
  const buffer = await sharp(
    Buffer.from(icon(file.size, file.safe, file.rounded))
  )
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
  await writeFile(path.join(OUT_DIR, file.name), buffer);
  console.log(`✓ ${file.name.padEnd(26)} ${buffer.byteLength} octets`);
}
