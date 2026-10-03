import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getArticle } from "@/lib/content/server";
import { SITE } from "@/lib/site";

/**
 * Open Graph image, 1200 × 630, one per article (CDC §2.2).
 *
 * WhatsApp is the sharing channel of this audience: what a shared link shows
 * there is this card. It is composed as the charter is — the navy ground, the
 * white wordmark with its three dots, the headline in white serif, the
 * tricolour rule under it, the address of the site at the bottom — over the
 * article's own photograph, at the exact ratio every platform crops to.
 *
 * Rendered on demand and then cached for a day at the CDN: an image route
 * cannot declare its own `generateStaticParams` (Next fails the export), and
 * only crawlers ever request it — never a reader — so it costs nothing to
 * the page budget of §5.4.
 */

export const alt = "Aperçu de l'article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The ground of the charter, and its colours (app/globals.css). */
const NIGHT = "#050D2B";
const GOLD = "#F7C755";
const FLAG = ["#38AA75", "#FCC546", "#1765E6"] as const;
/** Width of the wordmark on the card; its frame is 5194 × 1194. */
const LOGO_WIDTH = 300;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 1194) / 5194);

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  const headline = article?.title ?? SITE.name;
  const kicker = article?.categoryName ?? SITE.tagline;
  const byline = article ? `Par ${article.authorName}` : SITE.tagline;

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
      // Média absent : la carte reste lisible sur l'aplat marine.
    }
  }

  // Source Serif 4 est la serif des titres du site et de la charte. Elle est
  // chargée ici depuis `assets/` — hors de `public/`, donc jamais servie au
  // navigateur : ces deux fichiers ne coûtent rien au budget du §5.4, ils
  // ne servent qu'au rendu de la carte.
  const [semibold, bold, logo] = await Promise.all([
    readFile(
      path.join(process.cwd(), "assets", "fonts", "SourceSerif4-600.ttf")
    ),
    readFile(
      path.join(process.cwd(), "assets", "fonts", "SourceSerif4-700.ttf")
    ),
    readFile(
      path.join(process.cwd(), "assets", "brand", "boma-infos-dark.png")
    ),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: NIGHT,
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
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.85,
          }}
        />
      )}

      {/* Le voile marine de la charte : opaque sous le texte, il laisse la
          photo apparaître vers la droite. `top`/`left`/`width`/`height` et
          non `inset` : satori ignore ce raccourci, et le voile n'avait alors
          aucune dimension — il n'était pas dessiné. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage:
            "linear-gradient(90deg, rgba(5,13,43,0.97) 0%, rgba(5,13,43,0.9) 50%, rgba(5,13,43,0.35) 100%)",
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
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <img
            src={`data:image/png;base64,${logo.toString("base64")}`}
            alt={SITE.name}
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            style={{ objectFit: "contain" }}
          />
          <div
            style={{
              color: GOLD,
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#FFFFFF",
              fontSize: headline.length > 90 ? 52 : 64,
              fontWeight: 600,
              lineHeight: 1.14,
              letterSpacing: -1,
              maxWidth: 1000,
            }}
          >
            {headline.length > 150 ? `${headline.slice(0, 147)}…` : headline}
          </div>
          {/* Le filet de la charte : vert, jaune, bleu — 24 / 37 / 39 %. */}
          <div
            style={{ display: "flex", width: 420, height: 6, marginTop: 28 }}
          >
            <div style={{ width: "24%", backgroundColor: FLAG[0] }} />
            <div style={{ width: "37%", backgroundColor: FLAG[1] }} />
            <div style={{ width: "39%", backgroundColor: FLAG[2] }} />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#ACB7D2",
            fontSize: 26,
          }}
        >
          <div style={{ display: "flex" }}>{byline}</div>
          <div style={{ display: "flex", color: "#FFFFFF", fontWeight: 700 }}>
            {SITE.domain}
          </div>
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
