/**
 * Builds the photographic library of the demo dataset.
 *
 *   bun run scripts/fetch-media.ts [--force]
 *
 * For every entry of `scripts/media-sources.ts`:
 *   1. searches Wikimedia Commons for a real, freely-licensed photograph;
 *   2. downloads the largest reasonable rendition;
 *   3. re-encodes it to AVIF and WebP at four widths, cropped to 16:9 (or 1:1
 *      for portraits);
 *   4. writes `convex/mediaManifest.ts` with the exact byte size of every
 *      variant, the intrinsic dimensions, the dominant colour and the credit.
 *
 * Why precomputed files rather than `next/image`: the performance budget of
 * CAHIER-DES-CHARGES.md §5.4 has to be *checked at build time and fail the
 * build*. On-the-fly optimisation gives no byte count before a request is
 * served; a static manifest gives an exact one, and lets the service worker
 * precache what the reader will need offline.
 *
 * This script is run by hand when the demo library changes. Its output is
 * committed, so neither `bun run build` nor CI touches the network.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { MEDIA_SOURCES, type MediaSource } from "./media-sources";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "medias");
/**
 * Fonds des cartes Open Graph. En JPEG, et hors de `public/` : satori ne
 * sait décoder ni AVIF ni WebP (« Spread syntax requires ...iterable »
 * quand on lui en donne un), et ces fichiers ne sont jamais servis au
 * lecteur — seul `app/article/[slug]/opengraph-image.tsx` les lit sur le
 * disque, à la composition de la carte 1200×630.
 */
const OG_DIR = path.join(ROOT, "assets", "og");
const CACHE_DIR = path.join(ROOT, "node_modules", ".cache", "lecorporate-media");
const MANIFEST = path.join(ROOT, "convex", "mediaManifest.ts");

/** Wikimedia asks every automated client to identify itself. */
const USER_AGENT =
  "LeCorporateSeedBot/1.0 (https://le-corporate.com; contact iasted@me.com) node-fetch";

const WIDTHS_LANDSCAPE = [320, 480, 640, 768, 960, 1280] as const;
const WIDTHS_SQUARE = [96, 192] as const;

type CommonsHit = {
  title: string;
  url: string;
  width: number;
  height: number;
  credit: string;
  license: string;
  source: string;
};

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Fetches one precise Commons file — used when a search cannot be trusted. */
async function fetchCommonsFile(title: string): Promise<CommonsHit | null> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", title);
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size|extmetadata|mime");
  url.searchParams.set("iiurlwidth", "1600");
  url.searchParams.set("format", "json");

  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = (await response.json()) as any;
  const page = Object.values(payload?.query?.pages ?? {})[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const info = (page as any)?.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  return {
    title: title.replace(/^File:/, ""),
    url: String(info.thumburl ?? info.url),
    width: Number(info.width),
    height: Number(info.height),
    credit: stripHtml(String(meta.Artist?.value ?? "Wikimedia Commons")),
    license: String(meta.LicenseShortName?.value ?? "Wikimedia Commons"),
    source: String(info.descriptionurl ?? ""),
  };
}

async function searchCommons(
  query: string,
  minWidth: number
): Promise<CommonsHit[]> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", `filetype:bitmap ${query}`);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "20");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size|extmetadata|mime");
  url.searchParams.set("iiurlwidth", "1600");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) return [];

  // L'API renvoie un objet libre : on le parcourt défensivement.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = (await response.json()) as any;
  const pages: unknown[] = Object.values(payload?.query?.pages ?? {});

  const candidates = pages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((page: any) => {
      const info = page?.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      const license: string = meta.LicenseShortName?.value ?? "";
      // Ni domaine réservé, ni licence non commerciale.
      if (/fair use|non-?commercial|nd\b/i.test(license)) return null;
      if (!/^image\/(jpeg|png|webp)$/.test(info.mime ?? "")) return null;
      if ((info.width ?? 0) < minWidth) return null;
      // Les panoramas extrêmes recadrés en 16:9 perdent tout leur sujet.
      const ratio = info.width / info.height;
      if (ratio > 3.2 || ratio < 0.5) return null;

      const title = String(page.title ?? "").replace(/^File:/, "");
      // Commons indexe des millions de numérisations d'ouvrages anciens, qui
      // remontent en tête sur des requêtes génériques. Un magazine
      // économique illustre avec des photographies contemporaines : on exige
      // donc une date de prise de vue récente, et on écarte les gravures.
      const rawDate = String(
        meta.DateTimeOriginal?.value ?? meta.DateTime?.value ?? ""
      );
      const year = Number(stripHtml(rawDate).match(/\b(1[5-9]\d\d|20\d\d)\b/)?.[1]);
      if (!Number.isFinite(year) || year < 2004) return null;
      if (/\b(1[5-9]\d\d)\b/.test(title)) return null;
      if (
        /(encyclopa?edia|journal \(|magazine \(|NLGRF|DPLA|contact sheet|engraving|lithograph|woodcut|page \d+|plate \d+|\.tif|\bmap\b|extents|diagram|\bchart\b|\bgraph\b|\blogo\b|\bflag\b|coat of arms|\bseal\b)/i.test(
          title
        )
      ) {
        return null;
      }
      return {
        title,
        url: String(info.thumburl ?? info.url),
        width: Number(info.width),
        height: Number(info.height),
        credit: stripHtml(String(meta.Artist?.value ?? "Wikimedia Commons")),
        license: license || "Wikimedia Commons",
        source: String(info.descriptionurl ?? ""),
      } satisfies CommonsHit;
    })
    .filter((hit): hit is CommonsHit => hit !== null);

  return candidates;
}

async function download(url: string): Promise<Buffer> {
  const key = createHash("sha1").update(url).digest("hex");
  const cached = path.join(CACHE_DIR, `${key}.bin`);
  try {
    return await readFile(cached);
  } catch {
    // Pas encore en cache : on télécharge.
  }
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} sur ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(cached, buffer);
  return buffer;
}

type Variant = { w: number; h: number; bytes: number };
type Entry = {
  id: string;
  alt: string;
  caption: string;
  credit: string;
  license: string;
  source: string;
  color: string;
  width: number;
  height: number;
  avif: Variant[];
  webp: Variant[];
};

async function encodeVariants(
  source: MediaSource,
  hit: CommonsHit
): Promise<Entry> {
  const original = await download(hit.url);
  const square = source.ratio === "1:1";
  const widths = square ? WIDTHS_SQUARE : WIDTHS_LANDSCAPE;
  const aspect = square ? 1 : 16 / 9;

  const stats = await sharp(original).stats();
  const { r, g, b } = stats.dominant;
  const color = `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;

  const avif: Variant[] = [];
  const webp: Variant[] = [];

  for (const w of widths) {
    const h = Math.round(w / aspect);
    const base = sharp(original)
      .resize(w, h, { fit: "cover", position: "attention" })
      .sharpen({ sigma: 0.5 });

    // AVIF : le format principal. La qualité baisse avec la taille : à
    // 768 px et au-delà, l'image est vue de loin dans la page et le grain
    // supplémentaire est invisible, alors que les octets, eux, se paient.
    // Mesuré : 42 contre 48 retire un cinquième du poids des grandes
    // variantes sans différence perceptible à l'écran.
    const avifBuffer = await base
      .clone()
      .avif({
        quality: w >= 640 ? 42 : 48,
        effort: 6,
        chromaSubsampling: "4:2:0",
      })
      .toBuffer();
    await writeFile(path.join(OUT_DIR, `${source.id}-${w}.avif`), avifBuffer);
    avif.push({ w, h, bytes: avifBuffer.byteLength });

    // WebP : repli pour Safari 15 et les navigateurs sans AVIF.
    const webpBuffer = await base
      .clone()
      .webp({ quality: w >= 640 ? 60 : 68, effort: 6 })
      .toBuffer();
    await writeFile(path.join(OUT_DIR, `${source.id}-${w}.webp`), webpBuffer);
    webp.push({ w, h, bytes: webpBuffer.byteLength });
  }

  if (!square) {
    const og = await sharp(original)
      .resize(1200, 630, { fit: "cover", position: "attention" })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer();
    await writeFile(path.join(OG_DIR, `${source.id}.jpg`), og);
  }

  const largest = widths[widths.length - 1];
  return {
    id: source.id,
    alt: source.alt,
    caption: source.caption,
    credit: hit.credit.slice(0, 120),
    license: hit.license,
    source: hit.source,
    color,
    width: largest,
    height: Math.round(largest / aspect),
    avif,
    webp,
  };
}

async function resolve(
  source: MediaSource,
  used: Set<string>
): Promise<CommonsHit | null> {
  if (source.query.startsWith("File:")) {
    return fetchCommonsFile(source.query);
  }
  const minWidth = source.ratio === "1:1" ? 400 : 900;
  for (const query of [source.query, ...(source.fallbacks ?? [])]) {
    const hits = await searchCommons(query, minWidth);
    const fresh = hits.find((hit) => !used.has(hit.title));
    if (fresh) return fresh;
  }
  return null;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(OG_DIR, { recursive: true });
  await mkdir(path.dirname(MANIFEST), { recursive: true });

  const entries: Entry[] = [];
  const used = new Set<string>();
  let missing = 0;

  for (const source of MEDIA_SOURCES) {
    const hit = await resolve(source, used);
    if (!hit) {
      console.error(`✗ ${source.id} — aucune photographie trouvée`);
      missing += 1;
      continue;
    }
    used.add(hit.title);
    const entry = await encodeVariants(source, hit);
    entries.push(entry);
    const heaviest = Math.max(...entry.avif.map((v) => v.bytes));
    console.log(
      `✓ ${source.id.padEnd(22)} ${hit.title.slice(0, 46).padEnd(48)} avif max ${(heaviest / 1024).toFixed(1)} Ko`
    );
  }

  const body = `/**
 * Photographic library of the demo dataset — GENERATED FILE.
 *
 * Produced by \`bun run scripts/fetch-media.ts\`. Do not edit by hand: change
 * \`scripts/media-sources.ts\` and run the script again.
 *
 * Every byte count below is the real size on disk of the encoded file under
 * \`public/medias/\`, which is what \`scripts/check-budget.ts\` adds up to
 * decide whether the build passes the budget of CAHIER-DES-CHARGES.md §5.4.
 */

export type MediaVariant = {
  /** Rendition width in pixels, as written in the srcset descriptor. */
  readonly w: number;
  readonly h: number;
  /** Exact size on disk, in bytes. */
  readonly bytes: number;
};

export type MediaAsset = {
  readonly id: string;
  readonly alt: string;
  readonly caption: string;
  /** Photographer, as published by Wikimedia Commons. */
  readonly credit: string;
  readonly license: string;
  readonly source: string;
  /** Dominant colour, painted under the picture while it loads (no CLS). */
  readonly color: string;
  readonly width: number;
  readonly height: number;
  readonly avif: readonly MediaVariant[];
  readonly webp: readonly MediaVariant[];
};

export const MEDIA: Record<string, MediaAsset> = ${JSON.stringify(
    Object.fromEntries(entries.map((entry) => [entry.id, entry])),
    null,
    2
  )};

export const getMedia = (id: string): MediaAsset | undefined => MEDIA[id];
`;

  await writeFile(MANIFEST, body, "utf8");

  const total = entries.reduce(
    (sum, entry) =>
      sum +
      entry.avif.reduce((a, v) => a + v.bytes, 0) +
      entry.webp.reduce((a, v) => a + v.bytes, 0),
    0
  );
  console.log(
    `\n${entries.length} photographies · ${(total / 1024 / 1024).toFixed(2)} Mo sur disque · manifeste écrit dans convex/mediaManifest.ts`
  );
  if (missing > 0) process.exitCode = 1;
}

await main();
