/** Export the approved vector master. No fonts or image service are required. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { BRAND_LOGO } from "../lib/brand";

const root = path.resolve(import.meta.dirname, "..");
const master = await readFile(
  path.join(root, "assets/brand/le-corporate.svg"),
  "utf8"
);
const extract = (id: string) => {
  const match = new RegExp(`<path id="${id}" d="([^"]+)"`).exec(master);
  if (!match) throw new Error(`Missing logo path: ${id}`);
  return match[1];
};
const corporate = extract("corporate");
const accent = extract("accent");
const dimensions = `width="${BRAND_LOGO.width}" height="${BRAND_LOGO.height}" viewBox="0 0 ${BRAND_LOGO.width} ${BRAND_LOGO.height}"`;
const open = `<svg xmlns="http://www.w3.org/2000/svg" ${dimensions}><title>Le Corporate.</title>`;
const artwork = (ink: string, pink: string) =>
  `${open}<path fill-rule="evenodd" fill="${ink}" d="${corporate}"/><path fill-rule="evenodd" fill="${pink}" d="${accent}"/></svg>\n`;
// The interface references these uncoloured paths using <use>. Colours come
// from the page's theme, including an explicit choice overriding the system.
const sprite = `${open}<defs><path id="corporate" fill-rule="evenodd" d="${corporate}"/><path id="accent" fill-rule="evenodd" d="${accent}"/></defs><use href="#corporate" fill="#002060"/><use href="#accent" fill="#C74794"/></svg>\n`;
const light = artwork("#002060", "#C74794");
const dark = artwork("#FFFFFF", "#E06BAD");

await mkdir(path.join(root, "public/brand"), { recursive: true });
for (const [file, svg] of [
  [BRAND_LOGO.sprite, sprite],
  [BRAND_LOGO.light, light],
  [BRAND_LOGO.dark, dark],
] as const) {
  await writeFile(path.join(root, "public", file), svg);
  console.log(`${file}: ${Buffer.byteLength(svg)} bytes`);
}
await sharp(Buffer.from(light))
  .resize(BRAND_LOGO.socialWidth, BRAND_LOGO.socialHeight)
  .flatten({ background: "#FFFFFF" })
  .png({ palette: true })
  .toFile(path.join(root, "public", BRAND_LOGO.social));
// Transparent white/pink artwork for the navy Open Graph card, outside public.
await sharp(Buffer.from(dark))
  .resize(800)
  .png({ palette: true })
  .toFile(path.join(root, "assets/brand/le-corporate-dark.png"));
