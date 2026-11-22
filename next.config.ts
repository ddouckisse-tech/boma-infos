import type { NextConfig } from "next";
import { legacyRedirects } from "./lib/legacy-redirects";
import { securityHeaders } from "./lib/security-headers";
import { SEARCH_INDEXABLE } from "./lib/site";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Nothing gained by advertising the framework version.
  poweredByHeader: false,
  // Link previews need metadata in the initial HTML, including chat apps
  // that send a generic browser user agent.
  htmlLimitedBots: /.*/,
  experimental: {
    /**
     * Découpage des lots JavaScript de production (Turbopack).
     *
     * Le lot partagé « socle » — tailwind-merge, noyau lucide, `next/link`,
     * ≈ 14 Ko compressés — est chargé par toutes les pages. Avec les seuils
     * par défaut (`minChunkSize` 50 000 octets non minifiés), le découpeur
     * fondait le petit lot « boutons et champs shadcn » dans le socle pour
     * les écrans du back-office, produisant un second lot « socle + boutons »
     * sans retirer le premier de la liste des pages du journal : celles-ci
     * chargeaient le socle DEUX fois, et l'article dépassait le plafond de
     * JavaScript du §5.4 (187 Ko pour 180, relevé le 12/09/2026, budget
     * 162/172 Ko avant le back-office). Un `minChunkSize` plus bas laisse le
     * petit lot vivre seul (trois requêtes de plus par page, sous le plafond
     * de cinquante) ; `maxMergeChunkSize` interdit de surcroît toute fusion
     * d'un lot de la taille du socle. Relevé après réglage : accueil 169 Ko
     * et 33 requêtes, article 174 Ko et 25 requêtes.
     */
    turbopackChunking: {
      minChunkSize: 30_000,
      maxMergeChunkSize: 60_000,
    },
  },
  images: {
    // AVIF first, WebP as fallback (CAHIER-DES-CHARGES.md §5.4).
    //
    // The journal does not actually use `next/image`: every picture is
    // pre-encoded at four widths by `scripts/fetch-media.ts` and served as a
    // static file, so the weight of a page is known at build time and
    // `scripts/check-budget.ts` can refuse a build that exceeds §5.4. These
    // settings stand for the milestone-3 back office, which will upload
    // media and needs on-the-fly optimisation.
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // L'en-tête couvre toutes les réponses des éditions de recette.
        source: "/:path*",
        headers: SEARCH_INDEXABLE
          ? securityHeaders()
          : [
              ...securityHeaders(),
              { key: "X-Robots-Tag", value: "noindex, nofollow" },
            ],
      },
      {
        // Les fichiers de `public/medias` sont immuables : leur nom porte la
        // largeur et le format, une modification produit un autre nom. Un an
        // de cache évite au lecteur gabonais de les retélécharger — l'audit
        // relevait l'absence totale de `Cache-Control` sur les images du
        // site actuel, soit une cinquantaine d'allers-retours vers l'Europe
        // à chaque visite.
        source: "/medias/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            // `proxy.ts` sert la variante 480 px quand le cookie du mode
            // économie est posé : sans `Vary`, un cache partagé servirait
            // une image dégradée à un lecteur qui ne l'a pas demandée.
            key: "Vary",
            value: "Cookie",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/documents/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        // Le service worker ne doit jamais être servi depuis le cache HTTP,
        // sinon une version corrigée n'atteint jamais les navigateurs.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  outputFileTracingIncludes: {
    "/article/*/opengraph-image": [
      "./public/medias/*.webp",
      "./public/brand/boma-infos-light.v1.png",
    ],
  },
  // Plan de reprise des URL WordPress (CAHIER-DES-CHARGES.md §5.6).
  async redirects() {
    return legacyRedirects();
  },
};

export default nextConfig;
