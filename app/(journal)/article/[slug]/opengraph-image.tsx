import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getArticle } from "@/lib/content/server";
import { SITE } from "@/lib/site";

/**
 * Open Graph image, 1200 × 630, one per article (CDC §2.2).
 *
 * WhatsApp is the sharing channel of this audience, and the audit found the
 * legacy site serving its 118 × 153 portrait logo as `og:image` — shared, the
 * link showed a tiny distorted thumbnail. This renders the real headline over
 * the article's own photograph, at the exact ratio every platform crops to.
 *
 * Rendered on demand and then cached for a day at the CDN: an image route
 * cannot declare its own `generateStaticParams` (Next fails the export), and
 * only crawlers ever request it — never a reader — so it costs nothing to
 * the page budget of §5.4.
 */

export const alt = "Aperçu de l'article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#002060";
const MAGENTA = "#C74794";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  const headline = article?.title ?? SITE.name;
  const kicker = article?.categoryName ?? SITE.tagline;
  const byline = article ? `Par ${article.authorName}` : SITE.publisher;

  // La photo est lue sur le disque, en **JPEG** : satori ne décode ni AVIF
  // ni WebP — lui en donner un fait échouer tout le rendu. Les fonds
  // dédiés 1200×630 sont produits par `scripts/fetch-media.ts` dans
  // `assets/og/`, hors de `public/` : ils ne sont jamais servis au lecteur.
  let background: string | undefined;
  if (article?.heroMediaKey) {
    try {
      const file = await readFile(
        path.join(process.cwd(), "assets", "og", `${article.heroMediaKey}.jpg`)
      );
      background = `data:image/jpeg;base64,${file.toString("base64")}`;
    } catch {
      // Média absent : la carte reste lisible sur aplat navy.
    }
  }

  // Source Serif 4 est chargée depuis `assets/` — hors de `public/`, donc
  // jamais servie au navigateur : ces deux fichiers ne coûtent rien au
  // budget du §5.4, ils ne servent qu'au rendu de la carte à la compilation.
  const [semibold, bold] = await Promise.all([
    readFile(
      path.join(process.cwd(), "assets", "fonts", "SourceSerif4-600.ttf")
    ),
    readFile(
      path.join(process.cwd(), "assets", "fonts", "SourceSerif4-700.ttf")
    ),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: NAVY,
        position: "relative",
        fontFamily: "Source Serif 4",
      }}
    >
      {background && (
        // satori ne connaît que <img>, jamais next/image.
        <img
          src={background}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.28,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(0,32,96,0.97) 0%, rgba(0,32,96,0.88) 55%, rgba(0,32,96,0.62) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 72, height: 6, backgroundColor: MAGENTA }} />
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            {SITE.name}
          </div>
          <div style={{ color: "#A2BFF1", fontSize: 24 }}>{kicker}</div>
        </div>

        <div
          style={{
            display: "flex",
            color: "#FFFFFF",
            fontSize: headline.length > 90 ? 52 : 64,
            fontWeight: 700,
            lineHeight: 1.14,
            letterSpacing: -1.5,
            maxWidth: 1000,
          }}
        >
          {headline.length > 150 ? `${headline.slice(0, 147)}…` : headline}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#C5D8F9",
            fontSize: 26,
          }}
        >
          <div style={{ display: "flex" }}>{byline}</div>
          <div style={{ display: "flex" }}>le-corporate.com</div>
        </div>
      </div>
    </div>,
    {
      ...size,
      headers: {
        // Une carte ne change que si l'article change ; un jour de cache
        // partagé évite de la recomposer à chaque partage WhatsApp.
        "Cache-Control":
          "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
      fonts: [
        {
          name: "Source Serif 4",
          data: new Uint8Array(semibold).buffer as ArrayBuffer,
          weight: 600,
          style: "normal",
        },
        {
          name: "Source Serif 4",
          data: new Uint8Array(bold).buffer as ArrayBuffer,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
