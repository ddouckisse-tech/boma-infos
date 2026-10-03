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
 * While the demonstration corpus is online (`SEARCH_INDEXABLE` false) the
 * sitemaps are no longer advertised. Crawling itself stays open on purpose:
 * a robot has to fetch a page to read the `noindex` it carries, and a page
 * closed here could still be listed by its bare address.
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
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
