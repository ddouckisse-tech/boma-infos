import { convexAuthNextjs } from "@/lib/auth-server";

/**
 * Proxies Better Auth's HTTP routes, which are served by the Convex
 * deployment, under the site's own origin. Keeping them same-origin is what
 * lets the Content-Security-Policy stay at `connect-src 'self'` for auth.
 *
 * **Sign-up is not reachable from a browser.** CDC §5.3 forbids account
 * enumeration, and `POST /sign-up/email` is an oracle by construction: it
 * answers differently depending on whether the address already exists. The
 * two legitimate ways to create an account — an administrator creating a
 * nominative one, and a company registering under §4.4 — both go through
 * server actions that talk to the Convex deployment directly and always
 * answer the same sentence. So the public door is simply closed.
 */
const { GET: proxyGet, POST: proxyPost } = convexAuthNextjs.handler;

const CLOSED = new Set(["sign-up"]);

const isClosed = (request: Request): boolean => {
  const { pathname } = new URL(request.url);
  const segments = pathname.split("/").filter(Boolean);
  // /api/auth/<segment>/...
  return CLOSED.has(segments[2] ?? "");
};

/** Same body a genuinely unknown route would return: no signal either way. */
const notFound = () =>
  new Response(JSON.stringify({ message: "Not Found" }), {
    status: 404,
    headers: { "content-type": "application/json" },
  });

export async function GET(request: Request): Promise<Response> {
  return isClosed(request) ? notFound() : proxyGet(request);
}

export async function POST(request: Request): Promise<Response> {
  return isClosed(request) ? notFound() : proxyPost(request);
}
