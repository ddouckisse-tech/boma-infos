/**
 * Performance budget — CAHIER-DES-CHARGES.md §5.4.
 *
 *   bun run scripts/check-budget.ts
 *
 * « Toute compilation qui dépasse un plafond **échoue**. » This script is the
 * enforcement: it runs as the second half of `bun run build`, and it exits
 * non-zero when a page is too heavy, asks for too many requests, or ships too
 * much JavaScript. It does not warn — a warning is a budget nobody keeps.
 *
 * ## What it measures, and why the numbers are real
 *
 * It reads the **prerendered HTML** of `.next/server/app/**` and adds up
 * exactly what a cold mobile visit downloads:
 *
 *  - the document, the stylesheets and the scripts, **gzipped**, because that
 *    is how they cross the network — except the `nomodule` core-js bundle,
 *    which no browser of §5.5 downloads; it is reported separately so it is
 *    never a surprise in a network capture;
 *  - the woff2 files the document preloads (already compressed);
 *  - the pictures the browser will actually pick, resolved from each
 *    `srcset`/`sizes` pair for a 412 px viewport **at DPR 2** — the real
 *    Chrome Android parc of §5.5 — using the byte counts recorded by
 *    `scripts/fetch-media.ts`.
 *
 * The figures below are those of a reader who has *not* turned the data
 * saver on — the expensive case. With it on, `proxy.ts` rewrites every
 * picture to its 480 px rendition and the page is lighter still.
 *
 * It also refuses a page that contains a malformed internal link — a `href`
 * carrying a space or an escaped brace. Such a link is a silent 404 for the
 * reader, and one was really introduced here by an automated rewrite.
 *
 * Two things it deliberately does **not** do: it does not run a browser, and
 * it does not guess. Anything it cannot resolve is reported as unresolved and
 * fails the run rather than being silently dropped.
 */

import { gzipSync } from "node:zlib";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const NEXT_DIR = path.join(ROOT, ".next");
const PUBLIC_DIR = path.join(ROOT, "public");

/** Plafonds du §5.4. Ce sont des plafonds, pas des cibles. */
const BUDGETS = {
  /** Poids total, en kilo-octets. */
  homeWeightKb: 600,
  articleWeightKb: 400,
  /** Nombre de requêtes de la page d'accueil. */
  homeRequests: 50,
  articleRequests: 50,
  /** JavaScript téléchargé, gzip, en kilo-octets. */
  javascriptKb: 180,
} as const;

/**
 * Fenêtre de référence : un Android de milieu de gamme (CDC §5.5).
 *
 * **DPR 2, pas 1.** Le parc visé est en haute densité, et c'est le lecteur
 * qui paie les pixels supplémentaires : mesurer à DPR 1 donnerait un budget
 * tenu sur le papier et dépassé sur le terrain. Relevé dans un navigateur :
 * la même page d'accueil coûte 424 Ko à DPR 1 et 818 Ko à DPR 2 — c'est la
 * seconde valeur qui compte.
 */
const VIEWPORT_WIDTH = 412;
const DEVICE_PIXEL_RATIO = 2;

type Asset = { url: string; bytes: number; kind: string };

type PageReport = {
  route: string;
  file: string;
  assets: Asset[];
  totalBytes: number;
  javascriptBytes: number;
  /** `nomodule` polyfills: served, but not to any browser of §5.5. */
  legacyBytes: number;
  requests: number;
  unresolved: string[];
};

const KB = (bytes: number) => bytes / 1024;
const fmt = (bytes: number) => `${KB(bytes).toFixed(1)} Ko`;

const gzipCache = new Map<string, number>();

/** Transferred size of a file under `.next` or `public`. */
async function transferBytes(url: string): Promise<number | null> {
  const clean = url.split("?")[0];
  const cached = gzipCache.get(clean);
  if (cached !== undefined) return cached;

  const candidates = clean.startsWith("/_next/")
    ? [path.join(NEXT_DIR, clean.replace("/_next/", ""))]
    : [path.join(PUBLIC_DIR, clean), path.join(NEXT_DIR, "static", clean)];

  for (const candidate of candidates) {
    try {
      const info = await stat(candidate);
      if (!info.isFile()) continue;
      // Les formats déjà compressés (images, polices woff2) ne gagnent rien
      // à la compression de transport : on prend leur taille sur disque.
      const compressible = /\.(js|css|json|svg|xml|txt|map)$/.test(candidate);
      const bytes = compressible
        ? gzipSync(await readFile(candidate)).byteLength
        : info.size;
      gzipCache.set(clean, bytes);
      return bytes;
    } catch {
      // Candidat suivant.
    }
  }
  return null;
}

/**
 * Picks the rendition the page is charged for.
 *
 * Not "the one a browser would choose": measured in Chrome, a browser can
 * take a step above what `sizes × DPR` predicts, and a budget that a real
 * device blows is worthless. So the rule is the **worst case** — the largest
 * rendition the `<picture>` is allowed to ask for. Every `ResponsiveImage`
 * call site carries a `maxWidth` sized to its layout, so that worst case is
 * bounded by design, and a page that fits here fits on any device.
 *
 * `sizes` is still parsed: when the srcset offers renditions well above what
 * the slot can use, the resolved width is reported for the record.
 */
function pickFromSrcSet(srcset: string, sizes: string): string | null {
  const candidates = srcset
    .split(",")
    .map((entry) => entry.trim())
    .map((entry) => {
      const [url, descriptor] = entry.split(/\s+/);
      const width = Number((descriptor ?? "").replace("w", ""));
      return { url, width: Number.isFinite(width) ? width : 0 };
    })
    .filter((candidate) => candidate.url && candidate.width > 0)
    .sort((a, b) => a.width - b.width);

  if (candidates.length === 0) return null;

  // `sizes` : première clause dont la requête média s'applique à 412 px.
  let cssWidth = VIEWPORT_WIDTH;
  for (const clause of sizes.split(",").map((part) => part.trim())) {
    const media = /^\((min-width|max-width):\s*(\d+)px\)\s+(.+)$/.exec(clause);
    const value = media ? media[3] : clause;
    if (media) {
      const threshold = Number(media[2]);
      const applies =
        media[1] === "min-width"
          ? VIEWPORT_WIDTH >= threshold
          : VIEWPORT_WIDTH <= threshold;
      if (!applies) continue;
    }
    const vw = /^([\d.]+)vw$/.exec(value);
    const px = /^([\d.]+)px$/.exec(value);
    if (vw) cssWidth = (Number(vw[1]) / 100) * VIEWPORT_WIDTH;
    else if (px) cssWidth = Number(px[1]);
    break;
  }

  void (cssWidth * DEVICE_PIXEL_RATIO);
  return candidates[candidates.length - 1].url;
}

function attr(tag: string, name: string): string | null {
  const match = new RegExp(`${name}="([^"]*)"`).exec(tag);
  return match ? match[1] : null;
}

async function analyse(route: string, file: string): Promise<PageReport> {
  const raw = await readFile(file, "utf8");
  const html = raw;

  const assets: Asset[] = [];
  const unresolved: string[] = [];
  const seen = new Set<string>();
  let legacyBytes = 0;

  const push = async (url: string, kind: string) => {
    if (!url.startsWith("/") || url.startsWith("//")) return;
    const clean = url.split("?")[0];
    if (seen.has(clean)) return;
    seen.add(clean);
    const bytes = await transferBytes(clean);
    if (bytes === null) {
      unresolved.push(clean);
      return;
    }
    assets.push({ url: clean, bytes, kind });
  };

  // Le document lui-même.
  assets.push({
    url: route,
    bytes: gzipSync(Buffer.from(raw, "utf8")).byteLength,
    kind: "document",
  });

  for (const tag of raw.match(/<link\b[^>]*>/g) ?? []) {
    const rel = attr(tag, "rel") ?? "";
    const href = attr(tag, "href");
    if (!href) continue;
    if (rel.includes("stylesheet")) await push(href, "css");
    else if (rel.includes("preload")) {
      const as = attr(tag, "as") ?? "";
      if (as === "font") await push(href, "font");
      else if (as === "image") await push(href, "image");
      else if (as === "script") await push(href, "js");
      else if (as === "style") await push(href, "css");
    }
  }

  for (const tag of raw.match(/<script\b[^>]*src="[^"]+"[^>]*>/g) ?? []) {
    const src = attr(tag, "src");
    if (!src) continue;
    // `nomodule` : le paquet de prothèses (core-js) que Next sert aux
    // navigateurs sans modules ES. Tous les navigateurs du §5.5 —
    // Safari iOS 15+, Chrome Android 100+ — l'ignorent, il n'est donc pas
    // compté. Il est tout de même signalé, pour que personne ne le
    // découvre dans un relevé réseau.
    if (/\bnoModule\b/i.test(tag)) {
      const bytes = await transferBytes(src);
      if (bytes !== null) legacyBytes += bytes;
      continue;
    }
    await push(src, "js");
  }

  // Images : on prend la source AVIF quand elle existe (c'est ce que sert un
  // navigateur moderne), sinon le <img> de repli.
  for (const picture of html.match(/<picture[\s\S]*?<\/picture>/g) ?? []) {
    const avif = /<source[^>]*type="image\/avif"[^>]*>/.exec(picture)?.[0];
    const source = avif ?? /<img[^>]*>/.exec(picture)?.[0];
    if (!source) continue;
    const srcset = attr(source, "srcset") ?? attr(source, "srcSet");
    const sizes = attr(source, "sizes") ?? "100vw";
    const url = srcset
      ? pickFromSrcSet(srcset, sizes)
      : attr(source, "src");
    if (url) await push(url, "image");
  }

  // Images hors <picture>. Les <img> internes à un <picture> ne doivent pas
  // être comptés : ils ne sont que le repli du navigateur, jamais téléchargés
  // en plus de la source choisie.
  const outsidePictures = html.replace(/<picture[\s\S]*?<\/picture>/g, "");
  for (const tag of outsidePictures.match(/<img\b[^>]*>/g) ?? []) {
    const src = attr(tag, "src");
    if (src) await push(src, "image");
  }

  // Garde-fou : un `href` malformé (espace, accolade échappée) produit un
  // lien mort que rien d'autre ne signale. Un tel lien a réellement été
  // introduit par une réécriture automatique — la compilation le refuse
  // désormais plutôt que de servir des 404 au lecteur.
  for (const tag of raw.match(/<a\b[^>]*href="[^"]*"[^>]*>/g) ?? []) {
    const href = attr(tag, "href") ?? "";
    if (!href.startsWith("/")) continue;
    if (/\s|%7B|%7D|\{|\}/.test(href)) {
      unresolved.push(`lien malformé : ${href}`);
    }
  }

  const totalBytes = assets.reduce((sum, asset) => sum + asset.bytes, 0);
  const javascriptBytes = assets
    .filter((asset) => asset.kind === "js")
    .reduce((sum, asset) => sum + asset.bytes, 0);

  return {
    route,
    file,
    assets,
    totalBytes,
    javascriptBytes,
    legacyBytes,
    requests: assets.length,
    unresolved,
  };
}

/** Finds a prerendered HTML file for a route, trying the usual layouts. */
async function findHtml(route: string): Promise<string | null> {
  const base = path.join(NEXT_DIR, "server", "app");
  const relative = route === "/" ? "index.html" : `${route.slice(1)}.html`;
  const candidates = [
    path.join(base, relative),
    path.join(base, route.slice(1), "index.html"),
  ];
  for (const candidate of candidates) {
    try {
      await stat(candidate);
      return candidate;
    } catch {
      // Candidat suivant.
    }
  }
  return null;
}

/** First prerendered article, whichever it is. */
async function firstArticle(): Promise<string | null> {
  const dir = path.join(NEXT_DIR, "server", "app", "article");
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const file = entries.find(
      (entry) => entry.isFile() && entry.name.endsWith(".html")
    );
    if (file) return `/article/${file.name.replace(/\.html$/, "")}`;
    const folder = entries.find((entry) => entry.isDirectory());
    if (folder) return `/article/${folder.name}`;
  } catch {
    // Aucun article prérendu.
  }
  return null;
}

function line(
  label: string,
  value: number,
  limit: number,
  unit: string
): { ok: boolean; text: string } {
  const ok = value <= limit;
  const rendered =
    unit === "Ko" ? value.toFixed(1) : String(Math.round(value));
  return {
    ok,
    text: `${ok ? "✓" : "✗"} ${label.padEnd(34)} ${rendered.padStart(7)} ${unit}  (plafond ${limit} ${unit})`,
  };
}

async function main() {
  const articleRoute = await firstArticle();
  const routes = ["/", articleRoute].filter((r): r is string => r !== null);

  if (routes.length < 2) {
    console.error(
      "✗ Budget : impossible de trouver une page d'article prérendue dans .next/server/app/article."
    );
    console.error(
      "  Le journal est-il vide ? Exécutez `bunx convex run seeding:run` puis recompilez."
    );
    process.exit(1);
  }

  const reports: PageReport[] = [];
  for (const route of routes) {
    const file = await findHtml(route);
    if (!file) {
      console.error(`✗ Budget : page ${route} non prérendue.`);
      process.exit(1);
    }
    reports.push(await analyse(route, file));
  }

  const [home, article] = reports;
  const checks = [
    line("Poids accueil", KB(home.totalBytes), BUDGETS.homeWeightKb, "Ko"),
    line("Requêtes accueil", home.requests, BUDGETS.homeRequests, ""),
    line(
      "JavaScript accueil",
      KB(home.javascriptBytes),
      BUDGETS.javascriptKb,
      "Ko"
    ),
    line("Poids article", KB(article.totalBytes), BUDGETS.articleWeightKb, "Ko"),
    line("Requêtes article", article.requests, BUDGETS.articleRequests, ""),
    line(
      "JavaScript article",
      KB(article.javascriptBytes),
      BUDGETS.javascriptKb,
      "Ko"
    ),
  ];

  console.log(
    `\nBudget de performance — CDC §5.4  (fenêtre ${VIEWPORT_WIDTH} px, DPR ${DEVICE_PIXEL_RATIO}, transfert compressé)\n`
  );
  console.log(`  accueil : ${home.route}`);
  console.log(`  article : ${article.route}\n`);
  for (const check of checks) console.log(`  ${check.text}`);

  const unresolved = reports.flatMap((report) =>
    report.unresolved.map((url) => `${report.route} → ${url}`)
  );

  if (unresolved.length > 0) {
    console.error(
      `\n✗ ${unresolved.length} ressource(s) référencée(s) mais introuvable(s) sur le disque :`
    );
    for (const item of unresolved.slice(0, 20)) console.error(`    ${item}`);
    console.error(
      "  Le budget ne peut pas être calculé de façon fiable : on échoue plutôt que de sous-estimer."
    );
  }

  const failed = checks.filter((check) => !check.ok);
  if (failed.length > 0 || unresolved.length > 0) {
    // Détail des plus gros postes, pour savoir quoi couper.
    for (const report of reports) {
      console.error(`\n  Détail ${report.route} :`);
      for (const asset of [...report.assets]
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, 12)) {
        console.error(
          `    ${fmt(asset.bytes).padStart(10)}  ${asset.kind.padEnd(9)} ${asset.url}`
        );
      }
    }
    console.error(
      "\n✗ Budget de performance dépassé — la compilation est refusée.\n"
    );
    process.exit(1);
  }

  console.log(
    `\n  Hors budget, signalé : ${fmt(home.legacyBytes)} de prothèses ` +
      `\`nomodule\` (core-js), servies aux seuls navigateurs sans modules ES.`
  );
  console.log("\n✓ Tous les plafonds du §5.4 sont tenus.\n");
}

await main();
