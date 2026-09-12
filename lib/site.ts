/**
 * Identity of the publication, in one place.
 *
 * Everything that has to appear identically in the masthead, the metadata,
 * the RSS feed, the structured data and the legal pages is declared here —
 * the legacy site published three different spellings of its own contact
 * address, one of them on a domain that was never registered.
 */

/** Absolute origin, needed by canonicals, Open Graph and the sitemap. */
export const siteUrl = (): string => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined) ??
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
};

export const absoluteUrl = (path: string): string =>
  `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;

export const SITE = {
  name: "Le Corporate",
  publisher: "Up Concept",
  locale: "fr_FR",
  tagline: "L'économie du Gabon et de la zone CEMAC",
  title: "Le Corporate — l'actualité économique et des entreprises au Gabon",
  description:
    "Enquêtes, portraits de dirigeants et intelligence économique sur le Gabon et la zone CEMAC. Un magazine édité par Up Concept, à Libreville.",
  /** Relevé dans l'audit du 11/09/2026 ; l'adresse sans tiret était erronée. */
  email: "redaction@le-corporate.com",
  phone: "+241 77 86 10 08",
  phoneHref: "tel:+24177861008",
  address: "Libreville, Gabon",
} as const;

/**
 * Social reach. WhatsApp first — it is the sharing channel of the audience
 * (CDC §2.2). The URLs are generic placeholders: the real accounts were not
 * communicated, and inventing them would reproduce the dead links the audit
 * found in the legacy footer.
 */
export const SOCIAL = [
  { label: "WhatsApp", href: "https://wa.me/", key: "whatsapp" },
  { label: "LinkedIn", href: "https://www.linkedin.com/", key: "linkedin" },
  { label: "Facebook", href: "https://www.facebook.com/", key: "facebook" },
] as const;

/**
 * Shown in the footer for as long as the site serves the fictional corpus of
 * `convex/seed/`. Delete this constant — and the seed — at go-live.
 */
export const DEMO_CONTENT_NOTICE =
  "Préproduction : les articles publiés ici sont un jeu de démonstration fictif, destiné à la recette du site.";

export const NAV_STATIC_PAGES = [
  { label: "À propos", href: "/a-propos" },
  { label: "Docuthèque", href: "/docutheque" },
  { label: "Contacts", href: "/contacts" },
] as const;

export const NAV_LEGAL_PAGES = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/confidentialite" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Design system", href: "/design-system" },
] as const;

/** Articles per page on a section list. */
export const ARTICLES_PER_PAGE = 9;
