/**
 * Adds a 240 px WebP rendition to every picture held in Convex storage that
 * lacks one — the list thumbnails of the journal (13/09/2026).
 *
 *   bun run scripts/media-thumbnails.ts                 # déploiement de dev (.env.local)
 *   bun run scripts/media-thumbnails.ts --prod          # production
 *   bun run scripts/media-thumbnails.ts --prod --simulation   # compter sans rien écrire
 *
 * For each picture: the smallest stored rendition wider than 240 px is
 * downloaded, resized here with sharp (the Convex runtime has no image
 * library), uploaded to Convex storage, then attached by
 * `mediaRenditions:attach`, which records its size like every other
 * rendition so `scripts/check-budget.ts` keeps weighing pages exactly.
 * Additive and idempotent: run it again after an import, it only handles
 * what is still missing. Uploads from the back office already carry the
 * rendition (`components/custom/media-uploader.tsx`).
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const WIDTH = 240;
const QUALITY = 76;
const PAGE = 100;
const PARALLEL = 8;
const PROD = process.argv.includes("--prod");
const DRY_RUN = process.argv.includes("--simulation");

type Pending = {
  page: { id: string; key: string; sourceUrl: string; sourceWidth: number }[];
  isDone: boolean;
  continueCursor: string;
};

type Rendition = {
  format: "webp";
  w: number;
  h: number;
  bytes: number;
  storageId: string;
};

function convex<T>(fn: string, args: Record<string, unknown>): T {
  const result = spawnSync(
    "bunx",
    ["convex", "run", ...(PROD ? ["--prod"] : []), fn, JSON.stringify(args)],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  return JSON.parse(result.stdout) as T;
}

async function render(
  sourceUrl: string,
  uploadUrl: string
): Promise<Rendition> {
  const response = await fetch(sourceUrl, {
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`source ${response.status}`);
  const { data, info } = await sharp(Buffer.from(await response.arrayBuffer()))
    .resize({ width: WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toBuffer({ resolveWithObject: true });
  const upload = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/webp" },
    body: new Uint8Array(data),
    signal: AbortSignal.timeout(60_000),
  });
  if (!upload.ok) throw new Error(`envoi ${upload.status}`);
  const { storageId } = (await upload.json()) as { storageId: string };
  return {
    format: "webp",
    w: info.width,
    h: info.height,
    bytes: data.byteLength,
    storageId,
  };
}

console.log(
  `Vignettes ${WIDTH} px — déploiement ${PROD ? "de PRODUCTION" : "de développement"}${DRY_RUN ? " (simulation)" : ""}`
);

let cursor: string | null = null;
let done = false;
let found = 0;
let attached = 0;
let skipped = 0;
let bytesBefore = 0;
let bytesAfter = 0;
const failures: string[] = [];

while (!done) {
  const pending: Pending = convex<Pending>("mediaRenditions:pending", {
    paginationOpts: { numItems: PAGE, cursor },
    width: WIDTH,
  });
  cursor = pending.continueCursor;
  done = pending.isDone;
  found += pending.page.length;
  if (pending.page.length === 0 || DRY_RUN) continue;

  const urls = convex<string[]>("mediaRenditions:uploadUrls", {
    count: pending.page.length,
  });
  const ready: { id: string; rendition: Rendition }[] = [];
  for (let start = 0; start < pending.page.length; start += PARALLEL) {
    const slice = pending.page.slice(start, start + PARALLEL);
    await Promise.all(
      slice.map(async (item, offset) => {
        try {
          const rendition = await render(item.sourceUrl, urls[start + offset]);
          ready.push({ id: item.id, rendition });
          bytesAfter += rendition.bytes;
          const head = await fetch(item.sourceUrl, { method: "HEAD" });
          bytesBefore += Number(head.headers.get("content-length") ?? 0);
        } catch (error) {
          failures.push(
            `${item.key} : ${error instanceof Error ? error.message : error}`
          );
        }
      })
    );
  }
  if (ready.length > 0) {
    const outcome = convex<{ attached: number; skipped: number }>(
      "mediaRenditions:attach",
      { items: ready }
    );
    attached += outcome.attached;
    skipped += outcome.skipped;
  }
  process.stdout.write(`  … ${found} à traiter, ${attached} rattachées\n`);
}

console.log(
  DRY_RUN
    ? `\n${found} image(s) sans vignette de ${WIDTH} px.`
    : `\n${attached} vignette(s) rattachée(s), ${skipped} déjà présente(s), ${failures.length} échec(s).` +
        (attached > 0
          ? ` Source plus petite : ${(bytesBefore / 1024).toFixed(0)} Ko → vignettes : ${(bytesAfter / 1024).toFixed(0)} Ko.`
          : "")
);
for (const failure of failures) console.log(`  ✗ ${failure}`);
if (failures.length > 0) process.exit(1);
