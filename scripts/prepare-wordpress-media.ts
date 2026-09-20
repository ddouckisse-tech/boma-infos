/**
 * Prepare every archived WordPress image for import, without changing originals.
 *
 *   bun run scripts/prepare-wordpress-media.ts [--wait-seconds=900]
 *
 * Needs sharp (already installed) and Python 3's standard HTML parser. Results
 * and per-image checkpoints live in .migration/le-corporate. Rerunning validates
 * the input hash and existing variants before reusing them. At most four images
 * are processed concurrently; downloaded .part files are never read.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import sharp, { type Metadata } from "sharp";

type WordPressMedia = {
  id: number;
  source_url: string;
  mime_type: string;
  alt_text?: string;
  title?: { rendered?: string };
  caption?: { rendered?: string };
  media_details?: { image_meta?: { credit?: string; copyright?: string } };
};

type Variant = { format: "webp"; w: number; h: number; bytes: number };
type PreparedMedia = {
  key: string;
  wordpressId: number;
  alt: string;
  caption: string;
  credit: string;
  license: string;
  source: string;
  width: number;
  height: number;
  color: string;
  variants: Variant[];
  originalPath: string;
  originalMimeType: string;
  originalBytes: number;
  files: (Variant & { path: string })[];
};
type TextFields = {
  alt: string;
  title: string;
  caption: string;
  credit: string;
};
type Warning = {
  wordpressId: number;
  width: number;
  bytes: number;
  limit: number;
};
type Checkpoint = {
  recipe: string;
  fingerprint: string;
  inputFormat: string;
  pages: number;
  durationMs: number;
  loop: number;
  qualities: Record<string, number>;
  warnings: Warning[];
  media: PreparedMedia;
};

const args = process.argv.slice(2);
const rootOption = args.find((arg) => arg.startsWith("--root="))?.slice(7);
const waitSeconds = Number(
  args.find((arg) => arg.startsWith("--wait-seconds="))?.slice(15) ?? 0
);
if (!Number.isFinite(waitSeconds) || waitSeconds < 0) {
  throw new Error("--wait-seconds must be a nonnegative number");
}
const ROOT = path.resolve(import.meta.dirname, "..");
const WORK = rootOption
  ? path.resolve(rootOption)
  : path.join(ROOT, ".migration", "le-corporate");
const OUT = path.join(WORK, "encoded");
const ORIGINALS = path.join(WORK, "originals");
const SOURCE = path.join(WORK, "raw", "media.json");
const WIDTHS = [320, 640, 960, 1280];
const RECIPE = "webp-v1-widths320-640-960-1280-q65-45-effort6-auto-orient";
const deadline = Date.now() + waitSeconds * 1000;
sharp.concurrency(1);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const relative = (filename: string) => path.relative(ROOT, filename);
const limitForWidth = (width: number) =>
  (width <= 320 ? 14 : width <= 640 ? 35 : width <= 960 ? 65 : 100) * 1024;

function preservesAnimation(
  metadata: Metadata,
  expected: { pages: number; durationMs: number; loop: number }
): boolean {
  if (expected.pages === 1) return (metadata.pages ?? 1) === 1;
  // WebP coalesces identical consecutive frames. Their accumulated duration
  // and the loop setting must remain intact even when the frame count changes.
  return (
    (metadata.pages ?? 1) > 1 &&
    metadata.delay?.reduce((total, delay) => total + delay, 0) ===
      expected.durationMs &&
    (metadata.loop ?? 0) === expected.loop
  );
}

async function exists(filename: string): Promise<boolean> {
  try {
    return (await stat(filename)).isFile();
  } catch {
    return false;
  }
}

async function atomicJson(filename: string, data: unknown): Promise<void> {
  const temporary = `${filename}.tmp`;
  await writeFile(temporary, `${JSON.stringify(data, null, 2)}\n`);
  await rename(temporary, filename);
}

/** HTMLParser decodes named/numeric entities without adding a JS dependency. */
function plainTextFields(rows: WordPressMedia[]): Map<number, TextFields> {
  const fields = rows.map((row) => ({
    id: row.id,
    alt: row.alt_text ?? "",
    title: row.title?.rendered ?? "",
    caption: row.caption?.rendered ?? "",
    credit: [
      row.media_details?.image_meta?.credit,
      row.media_details?.image_meta?.copyright,
    ]
      .filter((value, index, all) => value && all.indexOf(value) === index)
      .join(" — "),
  }));
  const script = `
import json, re, sys
from html.parser import HTMLParser
class Plain(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts, self.hidden = [], 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.hidden += 1
        if tag in ('p', 'br', 'div', 'li', 'figure', 'figcaption'): self.parts.append(' ')
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.hidden = max(0, self.hidden - 1)
        if tag in ('p', 'br', 'div', 'li', 'figure', 'figcaption'): self.parts.append(' ')
    def handle_data(self, data):
        if not self.hidden: self.parts.append(data)
def clean(value):
    parser = Plain()
    parser.feed(value)
    parser.close()
    return re.sub(r'\\s+', ' ', ''.join(parser.parts)).strip()
rows = json.load(sys.stdin)
print(json.dumps([{k: clean(v) if k != 'id' else v for k, v in row.items()} for row in rows]))
`;
  const cleaned = JSON.parse(
    execFileSync("python3", ["-c", script], {
      input: JSON.stringify(fields),
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    })
  ) as (TextFields & { id: number })[];
  return new Map(cleaned.map(({ id, ...text }) => [id, text]));
}

async function encode(
  row: WordPressMedia,
  text: TextFields,
  originalPath: string
): Promise<{ checkpoint: Checkpoint; reused: boolean }> {
  const input = await readFile(originalPath);
  const fingerprint = createHash("sha256").update(input).digest("hex");
  const key = `wp-media-${row.id}`;
  const checkpointPath = path.join(OUT, `${key}.json`);
  let checkpoint: Checkpoint | undefined;
  try {
    const prior = JSON.parse(
      await readFile(checkpointPath, "utf8")
    ) as Checkpoint;
    if (
      prior.recipe === RECIPE &&
      prior.fingerprint === fingerprint &&
      prior.media.files.length &&
      (
        await Promise.all(
          prior.media.files.map(async (file) => {
            const filename = path.resolve(ROOT, file.path);
            const metadata = await sharp(filename, {
              animated: true,
            }).metadata();
            return (
              (await stat(filename)).size === file.bytes &&
              metadata.format === "webp" &&
              metadata.width === file.w &&
              (metadata.pageHeight ?? metadata.height) === file.h &&
              file.h ===
                Math.max(
                  1,
                  Math.round((prior.media.height * file.w) / prior.media.width)
                ) &&
              preservesAnimation(metadata, prior)
            );
          })
        )
      ).every(Boolean)
    ) {
      checkpoint = prior;
    }
  } catch {
    // Missing or incomplete checkpoint: rebuild this image only.
  }

  const fields = {
    alt: text.alt || text.title,
    caption: text.caption,
    credit: text.credit,
    source: row.source_url,
    originalPath: relative(originalPath),
    originalMimeType: row.mime_type,
  };
  if (checkpoint) {
    checkpoint.media = { ...checkpoint.media, ...fields };
    await atomicJson(checkpointPath, checkpoint);
    return { checkpoint, reused: true };
  }

  const metadata = await sharp(input, { animated: true }).metadata();
  const pages = metadata.pages ?? 1;
  const durationMs =
    metadata.delay?.reduce((total, delay) => total + delay, 0) ?? 0;
  const loop = metadata.loop ?? 0;
  const sideways = (metadata.orientation ?? 1) >= 5;
  const frameHeight = metadata.pageHeight ?? metadata.height;
  const width = sideways ? frameHeight : metadata.width;
  const height = sideways ? metadata.width : frameHeight;
  if (!width || !height) throw new Error("Image dimensions are missing");

  // Compute the mean sRGB colour on the first frame. Alpha is composited onto
  // white so a transparent logo does not produce a misleading black backdrop.
  const pixels = await sharp(input, { page: 0, pages: 1 })
    .autoOrient()
    .flatten({ background: "#ffffff" })
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const stats = await sharp(pixels.data, { raw: pixels.info }).stats();
  const color = `#${stats.channels
    .slice(0, 3)
    .map((channel) => Math.round(channel.mean))
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
  const files: PreparedMedia["files"] = [];
  const warnings: Warning[] = [];
  const qualities: Record<string, number> = {};
  for (const w of [
    ...new Set(WIDTHS.map((target) => Math.min(width, target))),
  ]) {
    const h = Math.max(1, Math.round((height * w) / width));
    const render = (quality: number) =>
      sharp(input, { animated: true })
        .autoOrient()
        .resize({ width: w, height: h, fit: "fill", withoutEnlargement: true })
        .webp({ quality, effort: 6, smartSubsample: true })
        .toBuffer();
    let quality = 65;
    let output = await render(quality);
    if (output.byteLength > limitForWidth(w)) {
      const smallest = await render(45);
      quality = 45;
      if (smallest.byteLength <= limitForWidth(w)) {
        for (const candidate of [60, 55, 50]) {
          const rendered = await render(candidate);
          if (rendered.byteLength <= limitForWidth(w)) {
            quality = candidate;
            output = rendered;
            break;
          }
        }
      }
      if (quality === 45) output = smallest;
    }
    const actual = await sharp(output, { animated: true }).metadata();
    const actualHeight = actual.pageHeight ?? actual.height;
    if (
      actual.format !== "webp" ||
      actual.width !== w ||
      !preservesAnimation(actual, { pages, durationMs, loop }) ||
      actualHeight !== h
    ) {
      throw new Error(
        `Variant ${w}px mismatch: ${actual.width}x${actualHeight} (${actual.pages ?? 1} frames, ${actual.delay?.reduce((total, delay) => total + delay, 0) ?? 0}ms); expected ${w}x${h}, ${durationMs}ms`
      );
    }
    const filename = path.join(OUT, `${key}-${w}.webp`);
    await writeFile(`${filename}.tmp`, output);
    await rename(`${filename}.tmp`, filename);
    const bytes = output.byteLength;
    qualities[String(w)] = quality;
    files.push({
      format: "webp",
      w,
      h: actualHeight,
      bytes,
      path: relative(filename),
    });
    if (bytes > limitForWidth(w)) {
      warnings.push({
        wordpressId: row.id,
        width: w,
        bytes,
        limit: limitForWidth(w),
      });
    }
  }

  checkpoint = {
    recipe: RECIPE,
    fingerprint,
    inputFormat: metadata.format,
    pages,
    durationMs,
    loop,
    qualities,
    warnings,
    media: {
      key,
      wordpressId: row.id,
      ...fields,
      license: "",
      width,
      height,
      color,
      variants: files.map(({ format, w, h, bytes }) => ({
        format,
        w,
        h,
        bytes,
      })),
      originalBytes: input.byteLength,
      files,
    },
  };
  await atomicJson(checkpointPath, checkpoint);
  return { checkpoint, reused: false };
}

async function main(): Promise<void> {
  await mkdir(OUT, { recursive: true });
  while (!(await exists(SOURCE)) && Date.now() < deadline) await sleep(2000);
  if (!(await exists(SOURCE))) throw new Error(`Waiting for ${SOURCE}`);
  const apiRows = JSON.parse(
    await readFile(SOURCE, "utf8")
  ) as WordPressMedia[];
  if (
    !Array.isArray(apiRows) ||
    apiRows.some((row) => !Number.isSafeInteger(row.id))
  ) {
    throw new Error("raw/media.json must contain WordPress media objects");
  }
  if (new Set(apiRows.map((row) => row.id)).size !== apiRows.length) {
    throw new Error("Duplicate WordPress media IDs");
  }
  const supplementalPath = path.join(WORK, "raw", "media-supplemental.json");
  const supplemental = (await exists(supplementalPath))
    ? (JSON.parse(await readFile(supplementalPath, "utf8")) as WordPressMedia[])
    : [];
  if (
    !Array.isArray(supplemental) ||
    supplemental.some((row) => !Number.isSafeInteger(row.id))
  ) {
    throw new Error(
      "raw/media-supplemental.json must contain WordPress media objects"
    );
  }
  // An API object takes precedence over a public-HTML reconstruction of an ID.
  const rows = [
    ...new Map(
      [...supplemental, ...apiRows].map((row) => [row.id, row])
    ).values(),
  ];
  const text = plainTextFields(rows);
  const images = rows.filter((row) => row.mime_type.startsWith("image/"));
  const nonImages = rows.filter((row) => !row.mime_type.startsWith("image/"));
  const results = new Map<number, Checkpoint>();
  const errors: { wordpressId: number; source: string; error: string }[] = [];
  const pending = new Map(images.map((row) => [row.id, row]));
  let reused = 0;
  let lastLog = 0;
  let saving = Promise.resolve();

  async function save(): Promise<void> {
    const prepared = [...results.values()]
      .map((entry) => entry.media)
      .sort((a, b) => a.wordpressId - b.wordpressId);
    await atomicJson(path.join(WORK, "prepared-media.json"), prepared);
  }

  while (pending.size) {
    const filenames = await readdir(ORIGINALS).catch(() => [] as string[]);
    const originals = new Map(
      filenames.flatMap((filename) => {
        const match = /^(\d+)\.[a-z0-9]{1,8}$/.exec(filename);
        return match
          ? [[Number(match[1]), path.join(ORIGINALS, filename)] as const]
          : [];
      })
    );
    const ready = [...pending.values()].filter((row) => originals.has(row.id));
    let next = 0;
    await Promise.all(
      Array.from({ length: Math.min(4, ready.length) }, async () => {
        while (next < ready.length) {
          const row = ready[next++];
          try {
            const result = await encode(
              row,
              text.get(row.id)!,
              originals.get(row.id)!
            );
            results.set(row.id, result.checkpoint);
            if (result.reused) reused++;
          } catch (error) {
            console.error(`Media ${row.id}: ${String(error)}`);
            errors.push({
              wordpressId: row.id,
              source: row.source_url,
              error: String(error),
            });
          }
          pending.delete(row.id);
          if ((results.size + errors.length) % 20 === 0) {
            saving = saving.then(save);
            await saving;
          }
          if (Date.now() - lastLog > 5000) {
            console.log(
              `Prepared ${results.size}/${images.length}; reused ${reused}; errors ${errors.length}`
            );
            lastLog = Date.now();
          }
        }
      })
    );
    await saving;
    await save();
    if (!pending.size || Date.now() >= deadline) break;
    console.log(
      `Waiting for ${pending.size} originals; ${results.size} images prepared`
    );
    await sleep(5000);
  }

  const nonImageReport = await Promise.all(
    nonImages.map(async (row) => {
      const filenames = await readdir(ORIGINALS).catch(() => [] as string[]);
      const filename = filenames.find(
        (name) => name.startsWith(`${row.id}.`) && !name.endsWith(".part")
      );
      const originalPath = filename
        ? path.join(ORIGINALS, filename)
        : undefined;
      return {
        wordpressId: row.id,
        source: row.source_url,
        mimeType: row.mime_type,
        title: text.get(row.id)!.title,
        originalPath: originalPath ? relative(originalPath) : null,
        originalBytes: originalPath ? (await stat(originalPath)).size : null,
      };
    })
  );
  await atomicJson(path.join(WORK, "non-image-media.json"), nonImageReport);
  await save();
  const checkpoints = [...results.values()];
  const formats: Record<string, number> = {};
  for (const entry of checkpoints)
    formats[entry.inputFormat] = (formats[entry.inputFormat] ?? 0) + 1;
  const warnings = checkpoints.flatMap((entry) => entry.warnings);
  const widths = checkpoints.map((entry) => entry.media.width);
  const heights = checkpoints.map((entry) => entry.media.height);
  const report = {
    generatedAt: new Date().toISOString(),
    totalMedia: rows.length,
    supplementalMedia: rows.length - apiRows.length,
    expectedImages: images.length,
    preparedImages: results.size,
    nonImages: nonImages.length,
    reused,
    originalFormats: formats,
    animatedImages: checkpoints.filter((entry) => entry.pages > 1).length,
    dimensions: widths.length
      ? {
          minWidth: Math.min(...widths),
          maxWidth: Math.max(...widths),
          minHeight: Math.min(...heights),
          maxHeight: Math.max(...heights),
        }
      : null,
    originalBytes: checkpoints.reduce(
      (sum, entry) => sum + entry.media.originalBytes,
      0
    ),
    variantCount: checkpoints.reduce(
      (sum, entry) => sum + entry.media.files.length,
      0
    ),
    encodedBytes: checkpoints.reduce(
      (sum, entry) =>
        sum + entry.media.files.reduce((total, file) => total + file.bytes, 0),
      0
    ),
    missingOriginalIds: [...pending.keys()],
    errors,
    overBudgetVariants: warnings,
  };
  await atomicJson(path.join(OUT, "report.json"), report);
  console.log(
    JSON.stringify({ ...report, overBudgetVariants: warnings.length }, null, 2)
  );
  if (errors.length || pending.size || warnings.length) process.exitCode = 2;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
