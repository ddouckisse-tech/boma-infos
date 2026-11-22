import { absoluteUrl, SITE } from "@/lib/site";
import { BRAND_LOGO } from "@/lib/brand";
import { headers } from "next/headers";
import { getAdSenseRuntimeConfig } from "@/lib/ads/adsense-config";

/**
 * schema.org payloads (CDC §4.2 / audit §07).
 *
 * The legacy site typed its articles as `Article`; Google Actualités and
 * Discover expect **`NewsArticle`** from a press outlet, so that is what is
 * emitted here — with `BreadcrumbList` including the "Accueil" level the
 * audit found missing, and a proper `Organization` for the publisher.
 *
 * `JSON.stringify` is what writes the payload: no string concatenation, and
 * `<` is escaped so a headline containing markup cannot close the script tag.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- un graphe JSON-LD n'a pas de forme fixe ; il est sérialisé, jamais parcouru
type JsonLd = Record<string, any>;

async function Script({ data }: { data: JsonLd }) {
  const nonce = getAdSenseRuntimeConfig()
    ? ((await headers()).get("x-nonce") ?? undefined)
    : undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * What `lib/site.ts` declares `null` (phone, locality, publishing company)
 * is left out of the graph: a structured-data field is never filled with a
 * guess.
 */
export const organizationNode = (): JsonLd => ({
  "@type": "NewsMediaOrganization",
  "@id": absoluteUrl("/#organisation"),
  name: SITE.name,
  url: absoluteUrl("/"),
  description: SITE.description,
  logo: {
    "@type": "ImageObject",
    url: absoluteUrl(BRAND_LOGO.social),
    width: BRAND_LOGO.socialWidth,
    height: BRAND_LOGO.socialHeight,
  },
  email: SITE.email,
  ...(SITE.phone ? { telephone: SITE.phone } : {}),
  address: {
    "@type": "PostalAddress",
    ...(SITE.address ? { addressLocality: SITE.address } : {}),
    addressCountry: SITE.country,
  },
  ...(SITE.publisher
    ? {
        parentOrganization: { "@type": "Organization", name: SITE.publisher },
      }
    : {}),
  inLanguage: "fr-GA",
});

export function SiteStructuredData() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@graph": [
          organizationNode(),
          {
            "@type": "WebSite",
            "@id": absoluteUrl("/#site"),
            name: SITE.name,
            url: absoluteUrl("/"),
            inLanguage: "fr-GA",
            publisher: { "@id": absoluteUrl("/#organisation") },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: absoluteUrl("/recherche?q={search_term_string}"),
              },
              "query-input": "required name=search_term_string",
            },
          },
        ],
      }}
    />
  );
}

export function BreadcrumbStructuredData({
  trail,
}: {
  trail: readonly { name: string; href: string }[];
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.href),
        })),
      }}
    />
  );
}

export function NewsArticleStructuredData({
  headline,
  description,
  slug,
  imageUrls,
  publishedAt,
  updatedAt,
  authorName,
  authorSlug,
  sectionName,
  keywords,
  wordCount,
}: {
  headline: string;
  description: string;
  slug: string;
  imageUrls: readonly string[];
  publishedAt: number;
  updatedAt: number;
  authorName: string;
  authorSlug: string;
  sectionName: string;
  keywords: readonly string[];
  wordCount: number;
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": absoluteUrl(`/article/${slug}`),
        },
        headline,
        description,
        ...(imageUrls.length > 0 ? { image: imageUrls } : {}),
        datePublished: new Date(publishedAt).toISOString(),
        dateModified: new Date(updatedAt).toISOString(),
        author: {
          "@type": "Person",
          name: authorName,
          url: absoluteUrl(`/auteur/${authorSlug}`),
        },
        publisher: organizationNode(),
        articleSection: sectionName,
        keywords: keywords.join(", "),
        wordCount,
        inLanguage: "fr-GA",
        isAccessibleForFree: true,
      }}
    />
  );
}
