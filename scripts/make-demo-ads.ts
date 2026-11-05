/**
 * Original vector posters, rasterised offline. No network, photos or randomness.
 * Run: bun run scripts/make-demo-ads.ts (or --avif-only to preserve existing WebP files)
 * Regenerates only the ten demo posters and their separate server-side manifest.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { format } from "prettier";
import { DEMO_POSTERS } from "../lib/ads/demo";
import type { MediaAsset } from "../convex/mediaManifest";

const root = path.resolve(import.meta.dirname, "..");
const directory = path.join(root, "public/medias");
const MAX_BYTES = 16 * 1024;
const avifOnly = process.argv.includes("--avif-only");
const palettes = [
  ["#163d35", "#f7ecce", "#d29c62", "#96b99c"],
  ["#122f4b", "#fff2d7", "#edaa6d", "#73b9bf"],
  ["#f1e9d8", "#1d3d39", "#f06c46", "#9fbc8a"],
  ["#273e35", "#f5efd9", "#b8d474", "#e5a277"],
  ["#f8d763", "#263543", "#e56b3e", "#faf3d5"],
  ["#eae0d1", "#493a35", "#c56e50", "#9bafa4"],
  ["#233f68", "#f3eddc", "#eabd56", "#6e9bb3"],
  ["#f1e9c9", "#244939", "#e78345", "#a6b474"],
  ["#4a2f57", "#fff0d6", "#e88973", "#c2b4d8"],
  ["#172d45", "#e8f1e6", "#9ac69d", "#e7bf66"],
] as const;

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function linesOf(value: string, max = 24): string[] {
  const lines: string[] = [];
  for (const word of value.split(" ")) {
    const last = lines.length - 1;
    if (last >= 0 && `${lines[last]} ${word}`.length <= max)
      lines[last] += ` ${word}`;
    else lines.push(word);
  }
  return lines;
}

/** Each poster has its own illustrated mark, drawn in a shared 300 × 300 frame. */
function motif(index: number, accent: string, secondary: string): string {
  const open = `<g fill="${accent}" stroke="${accent}" stroke-width="4">`;
  const art = [
    `<path d="M35 250V100a115 115 0 0 1 230 0v150h-44V104a71 71 0 0 0-142 0v146z" stroke="none"/><path d="M107 249V116a43 43 0 0 1 86 0v133" fill="none" stroke="${secondary}" stroke-width="14"/><path d="M150 35v230" stroke="${secondary}"/>`,
    `<circle cx="150" cy="110" r="79" stroke="none"/><path d="M0 198q75-40 150 0t150 0M0 229q75-40 150 0t150 0M0 260q75-40 150 0t150 0" fill="none" stroke="${secondary}" stroke-width="9"/>`,
    `<path d="M35 250V100q0-65 70-65h75q85 0 85 70t-85 70h-75q-70 0-70 75" fill="none" stroke-width="28"/><circle cx="35" cy="250" r="22" fill="${secondary}" stroke="none"/><circle cx="265" cy="105" r="22" fill="${secondary}" stroke="none"/>`,
    `<path d="M150 278V92" fill="none" stroke-width="10"/><path d="M150 176C16 185 13 62 47 20c88 9 112 69 103 156M151 233c133 4 143-110 105-153-83 14-110 77-105 153" stroke="none"/><path d="M149 173 48 44M153 228 255 101" stroke="${secondary}" stroke-width="5"/>`,
    `<circle cx="150" cy="80" r="47" stroke="none"/><path d="M150 5v14M75 27l15 14M225 27l-15 14M62 80H43M238 80h19" fill="none" stroke-width="8"/><path d="m51 145-22 130h242l-22-130z" fill="${secondary}" stroke="none"/><path d="M47 189h207M39 231h223M109 145l-6 130M191 145l6 130" fill="none" stroke-width="5"/>`,
    `<path d="M42 282V112a108 108 0 0 1 216 0v170z" stroke="none"/><path d="M80 282V116a70 70 0 0 1 140 0v166" fill="none" stroke="${secondary}" stroke-width="14"/><circle cx="150" cy="135" r="36" fill="${secondary}" stroke="none"/>`,
    `<path d="M32 280v-64h57v-63h57V90h57V27h65v253z" stroke="none"/><path d="m33 172 68-65 50 15 98-99" fill="none" stroke="${secondary}" stroke-width="10"/><circle cx="33" cy="172" r="13" fill="${secondary}" stroke="none"/>`,
    `<circle cx="115" cy="179" r="99" stroke="none"/><circle cx="217" cy="206" r="64" fill="${secondary}" stroke="none"/><path d="M114 88c-15-48 6-73 36-78 17 44 6 70-36 78M118 90c32-43 64-45 92-24-29 35-58 45-92 24" fill="${secondary}" stroke="none"/>`,
    `<rect x="16" y="16" width="122" height="122" rx="61" stroke="none"/><path d="M163 16h121v121H163z" fill="${secondary}" stroke="none"/><path d="M16 163h121v121H16z" fill="${secondary}" stroke="none"/><path d="M163 284V163h121a121 121 0 0 1-121 121" stroke="none"/>`,
    `<path d="M150 150 49 49m101 101L251 49M150 150 49 251m101-101 101 101M150 150V16m0 134v134" fill="none" stroke="${secondary}" stroke-width="10"/><circle cx="150" cy="150" r="47" stroke="none"/><circle cx="49" cy="49" r="28" stroke="none"/><circle cx="251" cy="49" r="28" stroke="none"/><circle cx="49" cy="251" r="28" stroke="none"/><circle cx="251" cy="251" r="28" stroke="none"/>`,
  ];
  return `${open}${art[index]}</g>`;
}

await mkdir(directory, { recursive: true });
const manifest: Record<string, MediaAsset> = {};
for (const [index, ad] of DEMO_POSTERS.entries()) {
  const [background, ink, accent, secondary] = palettes[index];
  const square = ad.format === "square";
  const width = square ? 640 : 1440;
  const height = square ? 640 : 480;
  const left = square ? 36 : 64;
  const titleY = square ? 393 : 190;
  const titleSize = square ? 43 : 56;
  const illustration = square
    ? "translate(172 80) scale(0.98)"
    : "translate(1060 90) scale(0.95)";
  const headline = linesOf(ad.title, square ? 23 : 27)
    .map(
      (line, position) =>
        `<tspan x="${left}" dy="${position ? titleSize * 1.14 : 0}">${escape(line)}</tspan>`
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="${background}"/>
    <rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="10" fill="none" stroke="${ink}" stroke-opacity=".22"/>
    <g font-family="Arial, sans-serif" fill="${ink}">
      <text x="${left}" y="${square ? 52 : 80}" font-size="${square ? 22 : 25}" font-weight="700" letter-spacing="1">${escape(ad.advertiser)}</text>
      <g transform="${illustration}">${motif(index, accent, secondary)}</g>
      <text x="${left}" y="${titleY}" font-size="${titleSize}" font-weight="700" letter-spacing="-1">${headline}</text>
      <rect x="${left}" y="${square ? 520 : 352}" width="${square ? 226 : 258}" height="44" rx="22" fill="${ink}"/>
      <text x="${left + 20}" y="${square ? 548 : 381}" font-size="${square ? 17 : 19}" font-weight="700" fill="${background}">Découvrir l’exemple →</text>
      <text x="${left}" y="${height - 38}" font-size="${square ? 14 : 16}" letter-spacing="1.2">DÉMONSTRATION · ANNONCEUR FICTIF</text>
    </g>
  </svg>`;
  const webp: { w: number; h: number; bytes: number }[] = [];
  for (const target of square ? [320, 480, 640] : [320, 480, 640, 1280]) {
    const file = `${ad.mediaKey}-${target}.webp`;
    let encoded: Buffer | undefined = avifOnly
      ? await readFile(path.join(directory, file))
      : undefined;
    for (const quality of avifOnly ? [] : [78, 68, 58, 48, 38]) {
      encoded = await sharp(Buffer.from(svg))
        .resize(target)
        .webp({ quality, effort: 6 })
        .toBuffer();
      if (encoded.length <= MAX_BYTES) break;
    }
    if (!encoded || encoded.length > MAX_BYTES)
      throw new Error(`Poster exceeds 16 KiB: ${ad.slug}-${target}`);
    if (!avifOnly) await writeFile(path.join(directory, file), encoded);
    webp.push({
      w: target,
      h: Math.round((height * target) / width),
      bytes: encoded.length,
    });
    console.log(`${file}: ${encoded.length} bytes`);
  }
  const avif: { w: number; h: number; bytes: number }[] = [];
  for (const target of [320, 480, 640]) {
    const budget = !square && target === 640 ? 4 * 1024 : MAX_BYTES;
    let encoded: Buffer | undefined;
    for (const quality of !square && target === 640 ? [50, 45, 40] : [50]) {
      encoded = await sharp(Buffer.from(svg))
        .resize(target)
        .avif({ quality, effort: 4, chromaSubsampling: "4:4:4" })
        .toBuffer();
      if (encoded.length <= budget) break;
    }
    if (!encoded || encoded.length > budget)
      throw new Error(`AVIF poster exceeds its budget: ${ad.slug}-${target}`);
    const file = `${ad.mediaKey}-${target}.avif`;
    await writeFile(path.join(directory, file), encoded);
    avif.push({
      w: target,
      h: Math.round((height * target) / width),
      bytes: encoded.length,
    });
    console.log(`${file}: ${encoded.length} bytes`);
  }
  manifest[ad.mediaKey] = {
    id: ad.mediaKey,
    alt: `Affiche de démonstration de ${ad.advertiser} : ${ad.title} Annonceur fictif.`,
    caption: `${ad.advertiser} — exemple publicitaire fictif, sans offre commerciale réelle.`,
    credit: "BOMA Infos — création graphique originale",
    license: "Création originale de démonstration",
    source:
      "Illustration vectorielle originale, générée localement sans photographie",
    color: background,
    width,
    height,
    avif,
    webp,
  };
}
await writeFile(
  path.join(root, "convex/adDemoManifest.ts"),
  await format(
    `/** Generated by scripts/make-demo-ads.ts. Do not edit by hand. */\nimport type { MediaAsset } from "./mediaManifest";\n\nexport const AD_DEMO_MEDIA: Record<string, MediaAsset> = ${JSON.stringify(manifest, null, 2)};\n`,
    { parser: "typescript" }
  )
);
console.log(`Generated ${DEMO_POSTERS.length} original demonstration posters.`);
