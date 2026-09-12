"use client";

import { useEffect } from "react";

/**
 * Audience measurement, without a third-party tracker — CDC §4.4, §5.4.
 *
 * Views are counted server-side by `proxy.ts` as the request goes past: no
 * cookie, no identifier, no JavaScript at all. What a server cannot know is
 * how long someone read and whether they shared — so this sends two numbers
 * and nothing else:
 *
 *  - the seconds the tab stayed visible, once, when it is hidden;
 *  - the channel of a share, when a control carrying `data-partage` is
 *    clicked (the controls of `ShareBar`).
 *
 * No library, no state, no render: one effect and two listeners. Nothing
 * here can identify a reader, and no row it writes describes one. The legacy
 * site loads MonsterInsights and Google Analytics for a worse answer.
 *
 * **It is a client component on purpose.** The first version was an inline
 * `<script>` rendered by the server — lighter, and it worked on a cold load.
 * It did not work at all on a navigation inside the site: React never
 * executes a `<script>` tag it renders on the client, and says so in the
 * console. A reader arriving from the home page was therefore never
 * measured. Measured, not assumed.
 *
 * `fetch(..., { keepalive: true })` rather than `navigator.sendBeacon`: a
 * beacon carrying `application/json` needs a CORS preflight it cannot
 * perform, so it would fail silently.
 */
export function AudienceBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const endpoint = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!endpoint) return;

    const url = `${endpoint}/api/mutation`;
    const openedAt = Date.now();
    let sent = false;

    const post = (path: string, args: Record<string, unknown>) => {
      try {
        void fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ path, args, format: "json" }),
          keepalive: true,
        }).catch(() => undefined);
      } catch {
        // Une mesure d'audience ne casse jamais une page de lecture.
      }
    };

    const onHidden = () => {
      if (document.visibilityState !== "hidden" || sent) return;
      sent = true;
      const seconds = Math.round((Date.now() - openedAt) / 1000);
      if (seconds >= 5) post("stats:recordReading", { slug, seconds });
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest("[data-partage]");
      if (!control) return;
      post("stats:recordShare", {
        slug,
        channel: control.getAttribute("data-partage") ?? "autre",
      });
    };

    document.addEventListener("visibilitychange", onHidden);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      document.removeEventListener("click", onClick, true);
    };
  }, [slug]);

  return null;
}
