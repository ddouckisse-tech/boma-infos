/** Export the vector master of the wordmark. No fonts or image service are required. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import dimensions from "../assets/brand/dimensions.json";
import { BRAND_LOGO } from "../lib/brand";

const root = path.resolve(import.meta.dirname, "..");
const master = await readFile(
  path.join(root, "assets/brand/boma-infos.svg"),
  "utf8"
);
const wordmark = /<path id="wordmark"[^>]*\sd="([^"]+)"/.exec(master)?.[1];
if (!wordmark) throw new Error("Missing logo path: wordmark");
if (
  dimensions.width !== BRAND_LOGO.width ||
  dimensions.height !== BRAND_LOGO.height
) {
  throw new Error(
    "lib/brand.ts and assets/brand/dimensions.json disagree on the logo frame."
  );
}

/** The navy of the charter; the wordmark turns white on a navy ground. */
const NAVY = "#0B1848";
/** The three dots keep the colours of the charter on every ground. */
const dots = dimensions.dots
  .map(
    (dot) =>
      `<circle cx="${dot.cx}" cy="${dot.cy}" r="${dot.r}" fill="${dot.color}"/>`
  )
  .join("");

const frame = `width="${BRAND_LOGO.width}" height="${BRAND_LOGO.height}" viewBox="0 0 ${BRAND_LOGO.width} ${BRAND_LOGO.height}"`;
const open = `<svg xmlns="http://www.w3.org/2000/svg" ${frame}><title>BOMA Infos</title>`;
const artwork = (ink: string) =>
  `${open}<path fill="${ink}" d="${wordmark}"/>${dots}</svg>\n`;
// The interface references the uncoloured wordmark using <use>: its colour
// comes from the page's theme, including an explicit choice overriding the
// system. The dots are a group that carries its own three fills.
const sprite = `${open}<defs><path id="wordmark" d="${wordmark}"/><g id="dots">${dots}</g></defs><use href="#wordmark" fill="${NAVY}"/><use href="#dots"/></svg>\n`;
const light = artwork(NAVY);
const dark = artwork("#FFFFFF");

await mkdir(path.join(root, "public/brand"), { recursive: true });
for (const [file, svg] of [
  [BRAND_LOGO.sprite, sprite],
  [BRAND_LOGO.light, light],
  [BRAND_LOGO.dark, dark],
] as const) {
  await writeFile(path.join(root, "public", file), svg);
  console.log(`${file}: ${Buffer.byteLength(svg)} bytes`);
}
// Navy wordmark on white, for the structured data of search engines.
await sharp(Buffer.from(light))
  .resize(BRAND_LOGO.socialWidth, BRAND_LOGO.socialHeight)
  .flatten({ background: "#FFFFFF" })
  .png({ palette: true })
  .toFile(path.join(root, "public", BRAND_LOGO.social));
// Transparent white wordmark for the navy Open Graph card, outside public.
await sharp(Buffer.from(dark))
  .resize(800)
  .png({ palette: true })
  .toFile(path.join(root, "assets/brand/boma-infos-dark.png"));
