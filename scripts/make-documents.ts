/**
 * Produces the PDF files of the docuthèque.
 *
 *   bun run scripts/make-documents.ts
 *
 * The audit of the legacy site found a footer publishing nine links of which
 * exactly one resolved. A download button that downloads nothing is worse than
 * no button, so every entry of `convex/seed/index.ts` gets a real, valid file:
 * a cover page carrying the title, the description and an explicit notice that
 * this is demonstration material.
 *
 * PDF is written by hand rather than with a library: the files are one page of
 * text, and a dependency for that would be a dependency to keep updated.
 * Output goes to `public/documents/` and is committed.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DOCUMENTS } from "../convex/seed/catalog";

const OUT_DIR = path.resolve(import.meta.dirname, "..", "public", "documents");

/** Escapes the three characters that are special inside a PDF string. */
const pdfString = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

/** Greedy wrap on an approximate character width for Helvetica at `size`. */
function wrap(text: string, size: number, maxWidth: number): string[] {
  const perChar = size * 0.5;
  const max = Math.floor(maxWidth / perChar);
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/)) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildContentStream(doc: (typeof DOCUMENTS)[number]): string {
  const left = 64;
  let y = 760;
  const ops: string[] = [];

  const text = (
    value: string,
    font: "F1" | "F2",
    size: number,
    lineHeight: number
  ) => {
    for (const line of wrap(value, size, 595 - left * 2)) {
      ops.push(
        `BT /${font} ${size} Tf ${left} ${y} Td (${pdfString(line)}) Tj ET`
      );
      y -= lineHeight;
    }
  };

  // Filet magenta de marque, en aplat : pas de texte dessus (CDC §3.5).
  ops.push(`0.784 0.278 0.580 rg ${left} 790 96 6 re f`);
  ops.push("0 0 0 rg");

  text("LE CORPORATE", "F1", 11, 26);
  y -= 6;
  text(doc.title, "F1", 20, 26);
  y -= 10;
  text(doc.kind.toUpperCase(), "F2", 10, 22);
  y -= 6;
  text(doc.description, "F2", 12, 18);
  y -= 16;
  text(`Éditeur : ${doc.publisher}`, "F2", 11, 16);
  text(`Pagination annoncée : ${doc.pages ?? "—"} pages`, "F2", 11, 16);
  y -= 20;
  text(
    "Document de démonstration. Le contenu de ce fichier est fictif et sert à valider la docuthèque du site avant la reprise du fonds documentaire réel.",
    "F2",
    10,
    14
  );

  return ops.join("\n");
}

function buildPdf(doc: (typeof DOCUMENTS)[number]): Buffer {
  const content = buildContentStream(doc);
  const contentBytes = Buffer.from(content, "latin1");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    `<< /Length ${contentBytes.byteLength} >>\nstream\n${content}\nendstream`,
    `<< /Title (${pdfString(doc.title)}) /Author (Le Corporate) /Creator (Le Corporate) >>`,
  ];

  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(out, "latin1"));
    out += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(out, "latin1");
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    out += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(out, "latin1");
}

await mkdir(OUT_DIR, { recursive: true });

const sizes: Record<string, number> = {};
for (const doc of DOCUMENTS) {
  const pdf = buildPdf(doc);
  const file = path.join(OUT_DIR, path.basename(doc.fileUrl));
  await writeFile(file, pdf);
  sizes[doc.slug] = pdf.byteLength;
  console.log(`✓ ${path.basename(file).padEnd(48)} ${pdf.byteLength} octets`);
}

// `fileBytes` est affiché au lecteur avant qu'il ne dépense sa data : il doit
// correspondre au fichier réel. On le réécrit dans le catalogue plutôt que de
// demander une recopie manuelle, qui dériverait à la première correction.
const catalogPath = path.resolve(
  import.meta.dirname,
  "..",
  "convex",
  "seed",
  "catalog.ts"
);
let catalog = await readFile(catalogPath, "utf8");
for (const [slug, bytes] of Object.entries(sizes)) {
  const pattern = new RegExp(
    `(slug: "${slug}",[\\s\\S]*?fileBytes: )\\d+(,)`,
    "m"
  );
  catalog = catalog.replace(pattern, `$1${bytes}$2`);
}
await writeFile(catalogPath, catalog, "utf8");
console.log("\n→ `fileBytes` mis à jour dans convex/seed/catalog.ts");
