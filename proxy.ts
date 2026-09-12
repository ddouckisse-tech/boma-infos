import { NextResponse, type NextRequest } from "next/server";
import {
  DATA_SAVER_COOKIE,
  DATA_SAVER_MAX_WIDTH,
  downgradeMediaPath,
} from "@/lib/data-saver";

/**
 * Data saver, applied at the edge — CAHIER-DES-CHARGES.md §2.2.
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
 */
export function proxy(request: NextRequest) {
  if (request.cookies.get(DATA_SAVER_COOKIE)?.value !== "1") {
    return NextResponse.next();
  }

  const downgraded = downgradeMediaPath(
    request.nextUrl.pathname,
    DATA_SAVER_MAX_WIDTH
  );
  if (!downgraded) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = downgraded;
  return NextResponse.rewrite(url);
}

export const config = {
  // Rien d'autre que les photographies ne passe par ici : le proxy ne doit
  // pas s'interposer sur le rendu des pages, ni sur les fichiers versionnés
  // de `_next/static`.
  matcher: "/medias/:path*",
};
