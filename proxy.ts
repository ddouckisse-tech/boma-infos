import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
import {
  DATA_SAVER_COOKIE,
  DATA_SAVER_MAX_WIDTH,
  downgradeMediaPath,
} from "@/lib/data-saver";
import { getAdSenseRuntimeConfig } from "@/lib/ads/adsense-config";
import { contentSecurityPolicy } from "@/lib/security-headers";

/**
 * Two jobs at the edge, both invisible to the reader.
 *
 * ## 1. Data saver — CAHIER-DES-CHARGES.md §2.2
 *
 * The reader's choice lives in `localStorage` *and* in a cookie. The pages
 * stay fully static (no `cookies()` call anywhere, so nothing is rendered per
 * request); only the picture requests are intercepted here and rewritten to
 * the 480 px rendition of the same photograph.
 *
 * Why not two `<picture>` elements toggled by CSS, which is the usual trick:
 * **it does not work.** Measured in Chrome — an `<img loading="lazy">` inside
 * a `display: none` element is downloaded anyway, so the page paid for both
 * renditions. Rewriting the request costs nothing, halves the DOM, and covers
 * the one picture CSS could never have covered: the eagerly loaded lead
 * image.
 *
 * `Vary: Cookie` is declared in `next.config.ts` for `/medias/*`, so a cache
 * never serves a downgraded picture to a reader who did not ask for one.
 *
 * ## 2. Audience — §4.4 point 6, §5.4
 *
 * An article view is counted **here**, as the request passes, and nowhere
 * else. No third-party tracker (the legacy site loads MonsterInsights and
 * Google Analytics), no cookie, no identifier, and — the point for §5.4 —
 * **no JavaScript and no extra request**: the count happens on a page that
 * is served from the ISR cache either way.
 *
 * The call is handed to `event.waitUntil` so the response is never delayed
 * by it, and a failure is swallowed: a counter is not worth a 500.
 */

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

/** `/article/<slug>` and nothing else — no query, no trailing segment. */
const ARTICLE = /^\/article\/([a-z0-9-]{3,120})$/;

function countView(pathname: string): Promise<unknown> | null {
  if (!convexUrl || process.env.AUDIENCE_DISABLED === "1") return null;
  const slug = ARTICLE.exec(pathname)?.[1];
  if (!slug) return null;
  return fetch(`${convexUrl}/api/mutation`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      path: "stats:recordView",
      args: { slug },
      format: "json",
    }),
  }).catch(() => undefined);
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  const counted = countView(pathname);
  if (counted) event.waitUntil(counted);

  const advertising = getAdSenseRuntimeConfig();
  const requestHeaders = new Headers(request.headers);
  // Never trust a nonce or CSP supplied by the visitor.
  requestHeaders.delete("x-nonce");
  requestHeaders.delete("content-security-policy");
  const nonce = advertising
    ? Buffer.from(crypto.randomUUID()).toString("base64")
    : undefined;
  const policy = nonce ? contentSecurityPolicy(nonce) : undefined;
  if (nonce && policy) {
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("content-security-policy", policy);
  }
  const options = { request: { headers: requestHeaders } };
  const downgraded =
    request.cookies.get(DATA_SAVER_COOKIE)?.value === "1"
      ? downgradeMediaPath(pathname, DATA_SAVER_MAX_WIDTH)
      : null;
  let response: NextResponse;
  if (downgraded) {
    const url = request.nextUrl.clone();
    url.pathname = downgraded;
    response = NextResponse.rewrite(url, options);
  } else {
    response = NextResponse.next(options);
  }
  if (policy) response.headers.set("Content-Security-Policy", policy);
  return response;
}

export const config = {
  // Nonces cover rendered pages; media keeps its existing data-saver rewrite.
  matcher: [
    "/((?!api|_next/static|_next/image|icons/|documents/|favicon.ico).*)",
  ],
};
