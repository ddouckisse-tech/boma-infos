import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getArticle } from "@/lib/content/server";
import {
  articleImageSources,
  socialImageSize,
} from "@/lib/content/article-images";
import { BRAND_LOGO } from "@/lib/brand";

const { width, height } = socialImageSize;

async function readRendition(source: string, signal: AbortSignal) {
  if (source.startsWith("/medias/")) {
    return readFile(path.join(process.cwd(), "public", source));
  }

  // Addresses here come from Convex's published-media lookup.
  const response = await fetch(source, { signal });
  if (!response.ok) throw new Error(`Image indisponible (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return new Response(null, { status: 404 });

  let jpeg: Buffer | undefined;
  const sources = articleImageSources(article);
  const signal = AbortSignal.timeout(3500);
  for (const { source } of sources.slice(0, 3)) {
    try {
      jpeg = await sharp(await readRendition(source, signal))
        .resize(width, height, { fit: "cover", position: "attention" })
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();
      break;
    } catch {
      // Essayez le prochain média éditorial si la couverture est indisponible.
    }
  }

  const hasPhoto = jpeg !== undefined;
  if (!jpeg) {
    const logo = await sharp(
      await readFile(path.join(process.cwd(), "public", BRAND_LOGO.social))
    )
      .resize({ width: 700 })
      .png()
      .toBuffer();
    jpeg = await sharp({
      create: { width, height, channels: 3, background: "#f7f8fa" },
    })
      .composite([{ input: logo, gravity: "center" }])
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
  }

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(jpeg.byteLength),
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Cache-Control":
        hasPhoto || sources.length === 0
          ? "public, max-age=3600, s-maxage=86400"
          : "public, max-age=60, s-maxage=300",
    },
  });
}
