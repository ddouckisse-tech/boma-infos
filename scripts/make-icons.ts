/**
 * Produces the PWA icons.
 *
 *   bun run scripts/make-icons.ts
 *
 * The icon is the capital B of the wordmark, in white on the navy of the
 * charter, underlined by its three dots — green, yellow, blue. The whole
 * name would be illegible in a browser tab; the B and the dots are what the
 * eye keeps of it. The B is the original vector path, with no font
 * dependency, rasterised by sharp — four PNG files committed to
 * `public/icons/`.
 *
 * The maskable variant keeps the artwork inside the 80 % safe area Android
 * crops to, so nothing is ever clipped by a circular mask.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import dimensions from "../assets/brand/dimensions.json";

const OUT_DIR = path.resolve(import.meta.dirname, "..", "public", "icons");

const NAVY = "#0B1848";
const artwork = await readFile(
  path.resolve(import.meta.dirname, "..", "assets", "brand", "boma-infos.svg"),
  "utf8"
);
const capitalB = artwork
  .match(/<path\b[^>]*\bid="capital-b"[^>]*>/)?.[0]
  .match(/\bd="([^"]+)"/)?.[1];
if (!capitalB) throw new Error("The logo master has no capital-b path.");

/** `safe` is the fraction of the canvas the artwork is allowed to occupy. */
function icon(size: number, safe: number, rounded: boolean): string {
  const bounds = dimensions.capitalB;
  const glyphHeight = size * safe * 0.5;
  const scale = glyphHeight / bounds.height;
  const glyphWidth = bounds.width * scale;
  // Trois pastilles sous la lettre, de la largeur du B.
  const dot = size * safe * 0.055;
  const step = (glyphWidth - dot * 2) / 2;
  const gap = size * safe * 0.09;
  const blockHeight = glyphHeight + gap + dot * 2;
  const left = (size - glyphWidth) / 2;
  const top = (size - blockHeight) / 2;
  const cy = top + glyphHeight + gap + dot;
  const radius = rounded ? Math.round(size * 0.18) : 0;
  const dots = dimensions.dots
    .map(
      (item, index) =>
        `<circle cx="${left + dot + step * index}" cy="${cy}" r="${dot}" fill="${item.color}"/>`
    )
    .join("\n  ");
  // Even the bounding rectangle fits inside the maskable 80 % safe circle.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${NAVY}"/>
  <path d="${capitalB}" fill="#FFFFFF" transform="translate(${left} ${top}) scale(${scale})"/>
  ${dots}
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
