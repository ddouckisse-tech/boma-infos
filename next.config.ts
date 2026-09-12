import type { NextConfig } from "next";
import { legacyRedirects } from "./lib/legacy-redirects";
import { securityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Nothing gained by advertising the framework version.
  poweredByHeader: false,
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
        // Toutes les réponses, y compris les pages prérendues statiquement.
        source: "/:path*",
        headers: securityHeaders(),
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
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/documents/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
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
  // Plan de reprise des URL WordPress (CAHIER-DES-CHARGES.md §5.6).
  async redirects() {
    return legacyRedirects();
  },
};

export default nextConfig;
