import type { MetadataRoute } from "next";
import { absoluteUrl, SEARCH_INDEXABLE } from "@/lib/site";

/**
 * robots.txt.
 *
 * The audit found the legacy file correct — one of the few things worth
 * keeping. Same posture here: everything editorial is crawlable, and only the
 * routes with nothing to index are closed. `/recherche` is excluded because
 * an infinite space of query strings dilutes a crawl budget for no gain;
 * `/design-system` is an internal reference.
 *
 * Crawling stays open so robots can read page-level noindex directives.
 */
export default function robots(): MetadataRoute.Robots {
  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/recherche", "/design-system", "/newsletter/"],
    },
  ];
  if (!SEARCH_INDEXABLE) return { rules };
  return {
    rules,
    sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/news-sitemap.xml")],
  };
}
