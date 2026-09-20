/**
 * Resumable developer CLI import; credentials stay in the authenticated Convex CLI.
 * bun scripts/import-wordpress.ts --prod --stage media|articles|verify|all
 * Deploy convex/wordpressImport.ts first. Archives and checkpoints stay ignored.
 */
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { Doc, Id } from "../convex/_generated/dataModel";

const execute = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, "..");
const BASE = path.join(ROOT, ".migration/le-corporate");
const prod = process.argv.includes("--prod");
const stageIndex = process.argv.indexOf("--stage");
const stage = stageIndex >= 0 ? process.argv[stageIndex + 1] : "all";
if (!["media", "documents", "articles", "verify", "all"].includes(stage))
  throw new Error("Stage invalide");
const target = prod ? "prod" : "dev";
const checkpoint = path.join(BASE, `uploads-${target}.jsonl`);
const cli = path.join(ROOT, "node_modules/convex/bin/main.js");
const credentialIndex = process.argv.indexOf("--credential-file");
let credential: string | undefined;
let deploymentUrl: string | undefined;
if (credentialIndex >= 0) {
  const content = await readFile(
    path.resolve(ROOT, process.argv[credentialIndex + 1]),
    "utf8"
  );
  credential = /^CONVEX_DEPLOY_KEY=(.+)$/m
    .exec(content)?.[1]
    ?.trim()
    .replace(/^['"]|['"]$/g, "");
  const identity = /^(prod|dev):([a-z0-9-]+)\|/.exec(credential ?? "");
  if (!identity || identity[1] !== target)
    throw new Error("La clé ne correspond pas au déploiement demandé");
  deploymentUrl = `https://${identity[2]}.convex.cloud`;
}

async function run<T>(name: string, args: unknown = {}): Promise<T> {
  if (credential && deploymentUrl) {
    const response = await fetch(`${deploymentUrl}/api/function`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Convex ${credential}`,
      },
      body: JSON.stringify({
        path: `wordpressImport:${name}`,
        args,
        format: "json",
      }),
      signal: AbortSignal.timeout(60_000),
    });
    const result = (await response.json()) as {
      status: string;
      value: T;
      errorMessage?: string;
    };
    if (!response.ok || result.status !== "success")
      throw new Error(result.errorMessage ?? `Convex HTTP ${response.status}`);
    return result.value;
  }
  const { stdout } = await execute(
    process.execPath,
    [
      cli,
      "run",
      `wordpressImport:${name}`,
      JSON.stringify(args),
      ...(prod ? ["--prod"] : []),
      "--codegen",
      "disable",
    ],
    {
      cwd: ROOT,
      maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, FORCE_COLOR: "0" },
    }
  );
  return JSON.parse(stdout) as T;
}
async function load<T>(name: string): Promise<T> {
  return JSON.parse(
    await readFile(path.join(BASE, name + ".json"), "utf8")
  ) as T;
}
type Inventory = {
  counts: Record<string, number>;
  media: {
    key: string;
    wordpressId?: number;
    originalStorageId?: Id<"_storage">;
    storage?: Doc<"media">["storage"];
  }[];
  articles: { slug: string; wordpressId?: number; status: string }[];
};
type PreparedMedia = Omit<Doc<"media">, "_id" | "_creationTime" | "storage"> & {
  originalPath: string;
  files: {
    format: "webp";
    w: number;
    h: number;
    bytes: number;
    path: string;
  }[];
};
const uploaded = new Map<string, Id<"_storage">>();
try {
  for (const line of (await readFile(checkpoint, "utf8")).trim().split("\n")) {
    if (!line) continue;
    const entry = JSON.parse(line) as {
      hash: string;
      storageId: Id<"_storage">;
    };
    uploaded.set(entry.hash, entry.storageId);
  }
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
let writeQueue = Promise.resolve();
const uploadUrls: string[] = [];
let gettingUrls: Promise<void> | undefined;
async function nextUploadUrl(): Promise<string> {
  while (uploadUrls.length === 0) {
    gettingUrls ??= run<string[]>("uploadUrls", { count: 20 })
      .then((urls) => {
        uploadUrls.push(...urls);
      })
      .finally(() => {
        gettingUrls = undefined;
      });
    await gettingUrls;
  }
  return uploadUrls.pop()!;
}
async function upload(file: string, mime: string): Promise<Id<"_storage">> {
  const data = await readFile(path.resolve(ROOT, file));
  const hash = createHash("sha256").update(mime).update(data).digest("hex");
  const existing = uploaded.get(hash);
  if (existing) return existing;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const url = await nextUploadUrl();
      const response = await fetch(url, {
        method: "POST",
        body: data,
        headers: { "Content-Type": mime },
        signal: AbortSignal.timeout(120_000),
      });
      if (!response.ok) throw new Error(`Upload HTTP ${response.status}`);
      const { storageId } = (await response.json()) as {
        storageId: Id<"_storage">;
      };
      uploaded.set(hash, storageId);
      writeQueue = writeQueue.then(() =>
        appendFile(checkpoint, JSON.stringify({ hash, storageId, file }) + "\n")
      );
      await writeQueue;
      return storageId;
    } catch (error) {
      if (attempt === 3) throw error;
    }
  }
  throw new Error("Upload incomplet");
}

console.log(`Import WordPress — ${target}, étape ${stage}`);
const inventory = await run<Inventory>("inventory");
console.log("Avant :", inventory.counts);

if (stage === "media" || stage === "all") {
  const media = await load<PreparedMedia[]>("prepared-media");
  const done = new Map(
    inventory.media
      .filter((m) => m.wordpressId && m.originalStorageId && m.storage?.length)
      .map((m) => [m.key, m])
  );
  let imported = 0;
  const pending: Omit<Doc<"media">, "_id" | "_creationTime">[] = [];
  for (let offset = 0; offset < media.length; offset += 8) {
    const batch = media.slice(offset, offset + 8).filter((m) => {
      const previous = done.get(m.key);
      return (
        !previous ||
        previous.storage?.length !== m.files.length ||
        m.files.some(
          (file) =>
            !previous.storage?.some(
              (stored) =>
                stored.w === file.w &&
                stored.h === file.h &&
                stored.bytes === file.bytes
            )
        )
      );
    });
    const items = await Promise.all(
      batch.map(async (m) => {
        const { files, originalPath, ...metadata } = m;
        const originalStorageId = await upload(
          originalPath,
          m.originalMimeType!
        );
        const storage = await Promise.all(
          files.map(async ({ path: file, ...variant }) => ({
            ...variant,
            storageId: await upload(file, "image/webp"),
          }))
        );
        return {
          ...metadata,
          originalStorageId,
          storage,
          uploadedAt: Date.now(),
        };
      })
    );
    pending.push(...items);
    while (
      pending.length >= 20 ||
      (pending.length && offset + 8 >= media.length)
    ) {
      await run("upsertMedia", { items: pending.splice(0, 20) });
    }
    imported += items.length;
    if (offset % 40 === 0 || offset + 8 >= media.length)
      console.log(
        `Médias ${Math.min(offset + 8, media.length)}/${media.length} (${imported} ajoutés)`
      );
  }
}

if (stage === "documents" || stage === "all") {
  const raw = await load<
    {
      id: number;
      slug: string;
      mime_type: string;
      source_url: string;
      title: { rendered: string };
      date_gmt: string;
    }[]
  >("raw/media");
  const documents = [];
  for (const pdf of raw.filter((m) => m.mime_type === "application/pdf")) {
    const file = path.join(BASE, "originals", `${pdf.id}.pdf`);
    const originalStorageId = await upload(file, "application/pdf");
    documents.push({
      title: pdf.title.rendered.replace(/[-_]/g, " "),
      slug: `wordpress-${pdf.id}`,
      description: "",
      kind: "Document",
      fileUrl: pdf.source_url,
      fileFormat: "PDF",
      fileBytes: (await readFile(file)).byteLength,
      publisher: "",
      publishedAt: new Date(pdf.date_gmt + "Z").getTime(),
      wordpressId: pdf.id,
      sourceUrl: pdf.source_url,
      originalStorageId,
      isActive: true,
    });
  }
  console.log(
    "Documents :",
    await run("upsertDocuments", { items: documents })
  );
}

if (stage === "articles" || stage === "all") {
  const report = await load<{
    emptyBodies: unknown[];
    duplicateSlugs: number;
    unknownImages: unknown[];
    textGaps: unknown[];
  }>("conversion-report");
  if (
    report.emptyBodies.length ||
    report.duplicateSlugs ||
    report.textGaps.length ||
    report.unknownImages.length
  ) {
    throw new Error(
      "La conversion comporte des écarts non résolus : conversion-report.json"
    );
  }
  const taxonomy = await load<unknown>("prepared-taxonomy");
  console.log("Taxonomie :", await run("upsertTaxonomy", taxonomy));
  const articles =
    await load<Omit<Doc<"articles">, "_id" | "_creationTime">[]>(
      "prepared-articles"
    );
  for (let offset = 0; offset < articles.length; offset += 10) {
    await run("upsertArticles", { items: articles.slice(offset, offset + 10) });
    if (offset % 100 === 0 || offset + 10 >= articles.length)
      console.log(
        `Articles ${Math.min(offset + 10, articles.length)}/${articles.length}`
      );
  }
}

if (stage === "verify" || stage === "all") {
  const final = await run<Inventory>("inventory");
  const articles =
    await load<{ slug: string; wordpressId: number }[]>("prepared-articles");
  const media = await load<PreparedMedia[]>("prepared-media");
  const articleIds = new Map(
    final.articles
      .filter((a) => a.wordpressId !== undefined)
      .map((a) => [a.wordpressId, a])
  );
  const mediaIds = new Map(
    final.media
      .filter((m) => m.wordpressId !== undefined)
      .map((m) => [m.wordpressId, m])
  );
  const missingArticles = articles.filter(
    (a) =>
      articleIds.get(a.wordpressId)?.slug !== a.slug ||
      articleIds.get(a.wordpressId)?.status !== "published"
  );
  const missingMedia = media.filter((m) => {
    const stored = mediaIds.get(m.wordpressId);
    return (
      !stored?.originalStorageId || stored.storage?.length !== m.files.length
    );
  });
  const report = {
    target,
    verifiedAt: new Date().toISOString(),
    counts: final.counts,
    expectedArticles: articles.length,
    expectedMedia: media.length,
    missingArticles: missingArticles.map((a) => a.wordpressId),
    missingMedia: missingMedia.map((m) => m.wordpressId),
  };
  await writeFile(
    path.join(BASE, `verification-${target}.json`),
    JSON.stringify(report, null, 2) + "\n"
  );
  console.log(report);
  if (missingArticles.length || missingMedia.length)
    throw new Error("Import incomplet");
}
