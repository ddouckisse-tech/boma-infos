/**
 * Performance budget of the site AS SERVED — CAHIER-DES-CHARGES.md §5.4.
 *
 *   bun run scripts/check-live-budget.ts [https://lecorporate.com]
 *
 * `scripts/check-budget.ts` refuses a compilation that exceeds a ceiling. It
 * cannot see what happens next: the home page and the articles are
 * regenerated from Convex every five minutes (ISR), so a lead article with a
 * heavier photograph changes the weight of production without any build.
 * This script measures the pages actually served, with the same rules, and
 * `.github/workflows/budget-production.yml` runs it every morning.
 *
 * Same rules as the build check:
 *  - the document, the stylesheets and the scripts, gzipped;
 *  - the woff2 files and pictures the document preloads;
 *  - for each <picture>, the LARGEST rendition it may request (the worst
 *    case), AVIF source first, then WebP, then the <img>;
 *  - `nomodule` scripts left out (no browser of §5.5 downloads them);
 *  - every URL counted once.
 *
 * It measures the home page and the three most recent articles it links to,
 * and exits with code 1 as soon as a figure reaches 95 % of its ceiling — the
 * alert has to arrive before readers are affected, not after — or when a
 * resource of the page cannot be fetched.
 */

import { gzipSync } from "node:zlib";
import { appendFileSync } from "node:fs";

const BASE = (process.argv[2] ?? "https://lecorporate.com").replace(/\/+$/, "");
const VIGILANCE = 0.95;
const CAPS = {
  homeWeightKb: 600,
  articleWeightKb: 400,
  requests: 50,
  javascriptKb: 180,
} as const;
const ARTICLES = 3;
const USER_AGENT =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 le-corporate-budget";

type Asset = { url: string; bytes: number; kind: string };
type Measure = {
  path: string;
  weightKb: number;
  requests: number;
  javascriptKb: number;
  assets: Asset[];
  unresolved: string[];
};

const attr = (tag: string, name: string): string | null =>
  new RegExp(`\\s${name}="([^"]*)"`, "i").exec(tag)?.[1] ?? null;

const absolute = (raw: string): string =>
  new URL(raw.replace(/&amp;/g, "&"), `${BASE}/`).toString();

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

/** Largest candidate of a srcset: what the build check charges. */
function worstCase(srcset: string): string | null {
  const candidates = srcset
    .split(",")
    .map((entry) => entry.trim().split(/\s+/))
    .filter(([url]) => Boolean(url))
    .map(([url, descriptor]) => ({
      url,
      width: Number((descriptor ?? "0").replace("w", "")) || 0,
    }))
    .sort((a, b) => a.width - b.width);
  return candidates.at(-1)?.url ?? null;
}

async function measure(path: string): Promise<{ result: Measure; html: string }> {
  const html = (await download(`${BASE}${path}`)).toString("utf8");
  const seen = new Set<string>();
  const assets: Asset[] = [
    { url: path, bytes: gzipSync(Buffer.from(html)).byteLength, kind: "document" },
  ];
  const unresolved: string[] = [];

  const push = async (raw: string | null, kind: string) => {
    if (!raw || raw.startsWith("data:")) return;
    const url = absolute(raw);
    if (seen.has(url)) return;
    seen.add(url);
    try {
      const body = await download(url);
      const compressible = kind === "js" || kind === "css" || /\.svg(\?|$)/.test(url);
      assets.push({
        url,
        bytes: compressible ? gzipSync(body).byteLength : body.byteLength,
        kind,
      });
    } catch (error) {
      unresolved.push(error instanceof Error ? error.message : String(error));
    }
  };

  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = attr(tag, "rel") ?? "";
    const href = attr(tag, "href");
    if (rel.includes("stylesheet")) await push(href, "css");
    else if (rel.includes("preload")) {
      const as = attr(tag, "as");
      if (as === "font") await push(href, "font");
      else if (as === "image") await push(href, "image");
      else if (as === "script") await push(href, "js");
      else if (as === "style") await push(href, "css");
    }
  }
  for (const tag of html.match(/<script\b[^>]*\ssrc="[^"]+"[^>]*>/gi) ?? []) {
    if (/\snomodule/i.test(tag)) continue;
    await push(attr(tag, "src"), "js");
  }
  for (const picture of html.match(/<picture[\s\S]*?<\/picture>/gi) ?? []) {
    const source =
      /<source[^>]*type="image\/avif"[^>]*>/i.exec(picture)?.[0] ??
      /<source[^>]*type="image\/webp"[^>]*>/i.exec(picture)?.[0] ??
      /<img[^>]*>/i.exec(picture)?.[0];
    if (!source) continue;
    const srcset = attr(source, "srcset");
    await push(srcset ? worstCase(srcset) : attr(source, "src"), "image");
  }
  const outside = html.replace(/<picture[\s\S]*?<\/picture>/gi, "");
  for (const tag of outside.match(/<img\b[^>]*>/gi) ?? []) {
    await push(attr(tag, "src"), "image");
  }

  const sum = (kind?: string) =>
    assets
      .filter((asset) => !kind || asset.kind === kind)
      .reduce((total, asset) => total + asset.bytes, 0) / 1024;

  return {
    html,
    result: {
      path,
      weightKb: sum(),
      requests: assets.length,
      javascriptKb: sum("js"),
      assets,
      unresolved,
    },
  };
}

type Line = { label: string; value: number; cap: number; unit: string };

function status({ value, cap }: Line): "ok" | "vigilance" | "dépassé" {
  if (value > cap) return "dépassé";
  if (value >= cap * VIGILANCE) return "vigilance";
  return "ok";
}

const home = await measure("/");
const articlePaths = [
  ...new Set(
    [...home.html.matchAll(/href="(\/article\/[^"#?]+)"/g)].map((m) => m[1])
  ),
].slice(0, ARTICLES);
const articles: Measure[] = [];
for (const path of articlePaths) articles.push((await measure(path)).result);

const lines: Line[] = [
  { label: "Poids accueil", value: home.result.weightKb, cap: CAPS.homeWeightKb, unit: "Ko" },
  { label: "Requêtes accueil", value: home.result.requests, cap: CAPS.requests, unit: "" },
  { label: "JavaScript accueil", value: home.result.javascriptKb, cap: CAPS.javascriptKb, unit: "Ko" },
];
for (const article of articles) {
  const name = article.path.replace("/article/", "").slice(0, 48);
  lines.push(
    { label: `Poids article ${name}`, value: article.weightKb, cap: CAPS.articleWeightKb, unit: "Ko" },
    { label: `Requêtes article ${name}`, value: article.requests, cap: CAPS.requests, unit: "" },
    { label: `JavaScript article ${name}`, value: article.javascriptKb, cap: CAPS.javascriptKb, unit: "Ko" }
  );
}

const format = (line: Line) =>
  line.unit ? `${line.value.toFixed(1)} ${line.unit}` : String(Math.round(line.value));
const icon = { ok: "✓", vigilance: "!", dépassé: "✗" } as const;

console.log(`Budget §5.4 en production — ${BASE} (${new Date().toISOString()})\n`);
for (const line of lines) {
  const state = status(line);
  const ratio = Math.round((line.value / line.cap) * 100);
  console.log(
    `  ${icon[state]} ${line.label.padEnd(64)} ${format(line).padStart(9)}  (${ratio} % de ${line.cap}${line.unit ? ` ${line.unit}` : ""})`
  );
}

const heaviest = [...home.result.assets].sort((a, b) => b.bytes - a.bytes).slice(0, 8);
console.log("\n  Accueil — ressources les plus lourdes :");
for (const asset of heaviest) {
  console.log(
    `    ${(asset.bytes / 1024).toFixed(1).padStart(6)} Ko  ${asset.kind.padEnd(8)} ${asset.url.replace(BASE, "").slice(0, 90)}`
  );
}

const unresolved = [home.result, ...articles].flatMap((m) => m.unresolved);
for (const failure of unresolved) console.log(`  ✗ non résolu : ${failure}`);

const alerts = lines.filter((line) => status(line) !== "ok");
const inGitHub = Boolean(process.env.GITHUB_ACTIONS);
if (inGitHub) {
  for (const line of alerts) {
    const level = status(line) === "dépassé" ? "error" : "warning";
    console.log(`::${level} title=Budget §5.4::${line.label} : ${format(line)} pour un plafond de ${line.cap}${line.unit ? ` ${line.unit}` : ""}`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    const rows = lines
      .map((line) => `| ${icon[status(line)]} ${line.label} | ${format(line)} | ${line.cap}${line.unit ? ` ${line.unit}` : ""} | ${Math.round((line.value / line.cap) * 100)} % |`)
      .join("\n");
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## Budget §5.4 — ${BASE}\n\n| Indicateur | Mesuré | Plafond | Part |\n|---|---|---|---|\n${rows}\n\nAlerte à ${VIGILANCE * 100} % d'un plafond.\n`
    );
  }
}

if (alerts.length > 0 || unresolved.length > 0) {
  console.log(
    `\n✗ ${alerts.length} indicateur(s) à ${VIGILANCE * 100} % ou plus d'un plafond, ${unresolved.length} ressource(s) non résolue(s).`
  );
  process.exit(1);
}
console.log(`\n✓ Tous les indicateurs sont sous ${VIGILANCE * 100} % de leur plafond.`);
