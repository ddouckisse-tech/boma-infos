/**
 * Identity of the publication, in one place.
 *
 * Everything that has to appear identically in the masthead, the metadata,
 * the RSS feed, the structured data and the legal pages is declared here.
 *
 * BOMA Infos is a general news outlet about Gabon — politics, the economy,
 * society, tourism, culture, sport. What the owner
 * has not communicated — publishing company, newsroom phone number, postal
 * address — is declared `null` below and is **not displayed** anywhere; the
 * legal notice lists it as still to be provided. Nothing is invented.
 */

/** Absolute origin, needed by canonicals, Open Graph and the sitemap. */
export const PUBLIC_SITE_URL = "https://www.boma-infos.com";

export const siteUrl = (): string => {
  if (process.env.VERCEL_ENV === "production") return PUBLIC_SITE_URL;
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "production"
      ? PUBLIC_SITE_URL
      : "http://localhost:3040")
  ).replace(/\/+$/, "");
};

export const absoluteUrl = (path: string): string =>
  `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;

type SiteIdentity = {
  readonly name: string;
  readonly alternateNames: readonly string[];
  /** Publishing company. `null` until the owner provides it. */
  readonly publisher: string | null;
  readonly locale: string;
  readonly tagline: string;
  readonly taglineEn: string;
  readonly title: string;
  readonly description: string;
  readonly descriptionEn: string;
  /** Public address without protocol. */
  readonly domain: string;
  readonly email: string;
  /** Newsroom phone. `null` until the owner provides it: nothing is shown. */
  readonly phone: string | null;
  readonly phoneHref: string | null;
  /** City of the newsroom. `null` until the owner provides it. */
  readonly address: string | null;
  /** ISO 3166-1 code of the country the outlet covers and publishes from. */
  readonly country: string;
};

export const SITE: SiteIdentity = {
  name: "BOMA Infos",
  alternateNames: [
    "Boma Info",
    "Boma-Infos",
    "Boma-Info",
    "Boma",
    "boma-infos.com",
  ],
  publisher: null,
  locale: "fr_GA",
  tagline: "Toute l'actualité du Gabon",
  taglineEn: "All the news from Gabon",
  title: "BOMA Infos — Actualités du Gabon",
  description:
    "Retrouvez les dernières infos du Gabon sur BOMA Infos, journal gabonais en ligne. Politique, économie, société, tourisme, culture et sport à Libreville et en province.",
  descriptionEn:
    "Politics, the economy, society, tourism, culture and sport: news from Gabon, followed and explained by the BOMA Infos newsroom.",
  domain: new URL(PUBLIC_SITE_URL).hostname,
  /**
   * Déduite du domaine de la charte, sur le modèle habituel d'une rédaction.
   * À confirmer par le propriétaire : la boîte doit exister avant la mise en
   * ligne, sinon chaque lien « écrire à la rédaction » est un courriel perdu.
   */
  email: "redaction@bomainfos.com",
  phone: null,
  phoneHref: null,
  address: null,
  country: "GA",
};

/** Who signs the publication: the publishing company once known, else the title itself. */
export const PUBLISHER_NAME: string = SITE.publisher ?? SITE.name;

/**
 * The demonstration corpus of `convex/seed/` is fictional — people, quotes
 * and figures are invented. The notice accompanies those articles and bylines.
 */
export const DEMO_CONTENT_NOTICE: {
  readonly fr: string;
  readonly en: string;
  /** The same warning, worded for the top of one article. */
  readonly articleFr: string;
  readonly articleEn: string;
  /** And for the places that introduce the bylines as people. */
  readonly teamFr: string;
  readonly teamEn: string;
  readonly authorFr: string;
  readonly authorEn: string;
} = {
  fr: "Site en préparation : les articles affichés sont un contenu de démonstration. Personnes, citations et chiffres y sont fictifs.",
  en: "Site in preparation: the articles shown are demonstration content. The people, quotes and figures in them are fictional.",
  articleFr:
    "Article de démonstration : les personnes, les citations et les chiffres sont fictifs.",
  articleEn:
    "Demonstration article: the people, quotes and figures are fictional.",
  teamFr:
    "Signatures de démonstration : ces journalistes sont fictifs, comme les articles qu'ils signent.",
  teamEn:
    "Demonstration bylines: these journalists are fictional, as are the articles they sign.",
  authorFr:
    "Signature de démonstration : cette personne est fictive, comme les articles qui portent son nom.",
  authorEn:
    "Demonstration byline: this person is fictional, as are the articles published under this name.",
};

/**
 * Index the canonical production edition. Previews and development have a
 * site-wide noindex; individual demo articles and authors have their own.
 */
export const SEARCH_INDEXABLE =
  process.env.NODE_ENV === "production" &&
  (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production") &&
  siteUrl() === PUBLIC_SITE_URL;

export const EDITORIAL_ROBOTS = {
  index: SEARCH_INDEXABLE,
  follow: SEARCH_INDEXABLE,
  googleBot: {
    index: SEARCH_INDEXABLE,
    follow: SEARCH_INDEXABLE,
    "max-image-preview": "large",
  },
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
