import { NextResponse, type NextRequest } from "next/server";
import { PREFERENCES_SCRIPT } from "@/lib/preferences";

/**
 * Content-Security-Policy — CAHIER-DES-CHARGES.md §5.3.
 *
 * Built per request because it carries a nonce: Next.js reads the nonce back
 * from the request header and stamps it on the scripts it injects itself.
 * The one inline script this app owns (the anti-flash preferences script) is
 * authorised by its SHA-256 hash instead, so no 'unsafe-inline' is ever
 * needed in production.
 *
 * In development the policy is deliberately looser: Turbopack's HMR runtime
 * needs 'unsafe-eval' and inline scripts. It is still emitted, so the header
 * is never absent.
 */

const isProduction = process.env.NODE_ENV === "production";

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

const createNonce = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toBase64(bytes);
};

let cachedScriptHash: Promise<string> | null = null;
const preferencesScriptHash = () => {
  cachedScriptHash ??= crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(PREFERENCES_SCRIPT))
    .then((digest) => `'sha256-${toBase64(new Uint8Array(digest))}'`);
  return cachedScriptHash;
};

/** Convex endpoints the browser must be allowed to reach. */
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

const buildCsp = (nonce: string, scriptHash: string) => {
  const scriptSrc = isProduction
    ? `'self' 'nonce-${nonce}' ${scriptHash} 'strict-dynamic'`
    : `'self' 'unsafe-inline' 'unsafe-eval'`;

  const directives = [
    `default-src 'self'`,
    `base-uri 'none'`,
    `object-src 'none'`,
    `frame-ancestors 'none'`,
    `frame-src 'none'`,
    `form-action 'self'`,
    `script-src ${scriptSrc}`,
    // Next.js et next/font injectent des styles en ligne : 'unsafe-inline'
    // reste nécessaire côté styles, sans risque d'exécution de script.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `media-src 'self'`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `connect-src ${["'self'", ...convexOrigins()].join(" ")}`,
  ];

  if (isProduction) directives.push("upgrade-insecure-requests");

  return directives.join("; ");
};

export async function proxy(request: NextRequest) {
  const nonce = createNonce();
  const csp = buildCsp(nonce, await preferencesScriptHash());

  const requestHeaders = new Headers(request.headers);
  // Next.js lit cet en-tête de requête pour propager le nonce à ses scripts.
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Tout sauf les ressources statiques déjà servies avec leurs en-têtes.
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
