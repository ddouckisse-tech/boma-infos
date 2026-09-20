/**
 * Security headers — CAHIER-DES-CHARGES.md §5.3.
 *
 * The legacy site ships none of these. They are applied to every response by
 * `next.config.ts`, so no request can slip through without them.
 */

import { getAdSenseRuntimeConfig, isAdSenseNonce } from "./ads/adsense-config";

const isProduction = process.env.NODE_ENV === "production";

/** Convex endpoints the browser must be allowed to reach (WebSocket + HTTP). */
const convexOrigins = (): string[] => {
  const origins = new Set<string>();
  for (const raw of [
    process.env.NEXT_PUBLIC_CONVEX_URL,
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  ]) {
    if (!raw) continue;
    try {
      const url = new URL(raw);
      origins.add(url.origin);
      origins.add(`${url.protocol === "https:" ? "wss:" : "ws:"}//${url.host}`);
    } catch {
      // Une URL malformée est ignorée plutôt que de casser la politique.
    }
  }
  return [...origins];
};

/** The deployment's HTTP origin(s) only — where uploaded pictures are served from. */
const convexHttpOrigins = (): string[] =>
  convexOrigins().filter((origin) => origin.startsWith("http"));

/**
 * Content-Security-Policy.
 *
 * `script-src` garde `'unsafe-inline'` : Next.js sérialise la charge utile
 * React Server Components dans des <script> en ligne dont le contenu change
 * à chaque rendu. Les autoriser autrement demanderait un nonce par requête,
 * ce qui désactiverait le rendu statique de toutes les pages éditoriales —
 * inacceptable au regard du budget de performance du §5.4. Tout le reste
 * reste verrouillé : aucune origine tierce, pas d'eval en production, pas
 * de gestionnaire d'événement en ligne (`script-src-attr 'none'`), pas
 * d'objet, pas de cadre, `base-uri` et `form-action` fermés.
 *
 * À revoir au lot 2 : une fois le périmètre des pages connu, les routes
 * réellement dynamiques (espaces privés) pourront passer à un nonce.
 */
export const contentSecurityPolicy = (nonce?: string): string => {
  const advertising = isAdSenseNonce(nonce) ? getAdSenseRuntimeConfig() : null;
  if (advertising) {
    // Google supports nonce/strict-dynamic, not a fixed list of ad domains.
    // HTTPS resource schemes accommodate its changing hosts only in this mode.
    const sources = advertising.cmp.allowedOrigins.join(" ");
    return [
      "default-src 'self'",
      "base-uri 'none'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "frame-src https:",
      "form-action 'self'",
      `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'unsafe-eval' https:`,
      "script-src-attr 'none'",
      `style-src 'self' 'unsafe-inline' ${sources}`,
      "img-src 'self' data: blob: https:",
      `font-src 'self' ${sources}`,
      "media-src 'self' https:",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      `connect-src 'self' https: ${convexOrigins().join(" ")}`,
      ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ].join("; ");
  }
  const scriptSrc = isProduction
    ? "'self' 'unsafe-inline'"
    : // Le rechargement à chaud de Turbopack évalue du code à la volée.
      "'self' 'unsafe-inline' 'unsafe-eval'";

  const directives = [
    "default-src 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "form-action 'self'",
    `script-src ${scriptSrc}`,
    // Aucun gestionnaire d'événement en ligne (onclick="…") : React n'en
    // produit pas, une injection en produirait.
    "script-src-attr 'none'",
    // next/font et Next.js injectent des styles en ligne ; aucun risque
    // d'exécution de script.
    "style-src 'self' 'unsafe-inline'",
    // Les photographies ajoutées depuis la médiathèque sont servies par le
    // stockage de fichiers du déploiement Convex (12/09/2026).
    `img-src ${["'self'", "data:", "blob:", ...convexHttpOrigins()].join(" ")}`,
    "font-src 'self'",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    `connect-src ${["'self'", ...convexOrigins()].join(" ")}`,
  ];

  if (isProduction) directives.push("upgrade-insecure-requests");

  return directives.join("; ");
};

export const securityHeaders = () => [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy(),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "display-capture=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "usb=()",
      "xr-spatial-tracking=()",
    ].join(", "),
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Origin-Agent-Cluster", value: "?1" },
];
