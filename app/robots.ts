import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * robots.txt.
 *
 * The audit found the legacy file correct — one of the few things worth
 * keeping. Same posture here: everything editorial is crawlable, and only the
 * routes with nothing to index are closed. `/recherche` is excluded because
 * an infinite space of query strings dilutes a crawl budget for no gain;
 * `/design-system` is an internal reference.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/recherche", "/design-system", "/newsletter/"],
      },
    ],
    sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/news-sitemap.xml")],
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
