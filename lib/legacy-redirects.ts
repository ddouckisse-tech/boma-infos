import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * 301 plan for the WordPress URLs — CAHIER-DES-CHARGES.md §5.6.
 *
 * « Les URL actuelles sont préservées ou redirigées en 301 — la valeur SEO
 * acquise ne doit pas être perdue. » The legacy site has 1 019 articles, a
 * Yoast sitemap covering articles, pages, categories, tags and authors, and
 * an audit that rates its SEO foundations as sound: losing that inbound
 * value at the switchover would cost more than the refonte saves.
 *
 * Three families are handled here, statically:
 *
 *  1. **Sections.** WordPress serves them under `/category/<slug>/`; the new
 *     site uses `/rubrique/<slug>`. The legacy slugs also carry the
 *     misspellings the audit listed — `sucess-story`, `succes-story`,
 *     `reglementions` — which are mapped onto the corrected ones.
 *  2. **Standing pages**, including the four legal URLs that returned 404 on
 *     the old site and now exist.
 *  3. **WordPress plumbing**: feeds, sitemaps, author archives, and the
 *     endpoints that should never have been public (`/wp-json/wp/v2/users`
 *     exposed the `admin` account name).
 *
 * **Article permalinks** are handled dynamically instead, by the catch-all
 * route `app/[slug]/page.tsx`: the legacy permalink is `/<slug>/` at the
 * root, so a static list would need 1 019 entries and would have to be
 * regenerated at every migration. That route sends any unknown
 * single-segment path to `/article/<slug>` when an article with that slug
 * exists, and lets the 404 stand otherwise.
 */

/**
 * 301 et non 308.
 *
 * `permanent: true` produit un 308, que Google traite à l'identique — mais
 * le §5.6 demande un 301, et une partie de l'outillage de recette (crawlers,
 * vérificateurs de liens, anciens proxys) ne reconnaît que celui-là. Le
 * code est donc posé explicitement.
 */
const PERMANENT = 301;

type Mapping = { from: string; to: string };

/** Legacy section slug → new section path. Both spellings are accepted. */
export const LEGACY_CATEGORY_SLUGS: Record<string, string> = {
  // Business & Lifestyle
  "business-lifestyle": "/rubrique/business-lifestyle",
  "business-life-style": "/rubrique/business-lifestyle",
  "business-and-lifestyle": "/rubrique/business-lifestyle",
  "big-deal": "/rubrique/business-lifestyle/big-deal",
  entreprendre: "/rubrique/business-lifestyle/entreprendre",
  innovation: "/rubrique/business-lifestyle/innovation",
  technologie: "/rubrique/business-lifestyle/technologie",

  // Éditorial
  editorial: "/rubrique/editorial",
  edito: "/rubrique/editorial",

  // Succès story — « Sucess story » et « Succes story » étaient tous deux
  // en production (audit §09).
  "succes-story": "/rubrique/succes-story",
  "sucess-story": "/rubrique/succes-story",
  "success-story": "/rubrique/succes-story",
  "femme-dirigeante": "/rubrique/succes-story/femme-dirigeante",
  "graine-de-manager": "/rubrique/succes-story/graine-de-manager",
  leader: "/rubrique/succes-story/leader",
  startup: "/rubrique/succes-story/startup",

  // Espace pro
  "espace-pro": "/rubrique/espace-pro",
  docutheques: "/rubrique/espace-pro/docutheques",
  docutheque: "/docutheque",
  formation: "/rubrique/espace-pro/formation",
  opportunites: "/rubrique/espace-pro/opportunites",
  reglementations: "/rubrique/espace-pro/reglementations",
  // Orthographe fautive relevée en production : « Reglémentations ».
  reglementions: "/rubrique/espace-pro/reglementations",
  reglementation: "/rubrique/espace-pro/reglementations",
  seminaires: "/rubrique/espace-pro/seminaires",

  tribune: "/rubrique/tribune",
  tribunes: "/rubrique/tribune",
  "dossier-special": "/rubrique/dossier-special",
  "gabon-infini-pfp": "/rubrique/dossier-special/gabon-infini-pfp",
  dossiers: "/rubrique/dossier-special",
  "intelligence-economique": "/rubrique/intelligence-economique",
  "intelligence-economique-fortune-dafrique":
    "/rubrique/intelligence-economique",
  "fortune-dafrique": "/rubrique/intelligence-economique",
  interview: "/rubrique/interview",
  interviews: "/rubrique/interview",

  // « Non classé » : 15 articles y étaient rangés par défaut. Ils repartent
  // vers l'accueil plutôt que vers une rubrique qui n'existe plus.
  "non-classe": "/rubrique/non-classe",
  uncategorized: "/rubrique/non-classe",
};

/** Standing pages, feeds and WordPress endpoints. */
const STATIC_MAPPINGS: readonly Mapping[] = [
  { from: "/actualite", to: "/" },
  // Pages éditoriales existantes. `/a-propos/` et `/contacts/` avec la barre
  // oblique finale sont déjà ramenés à leur forme sans barre par Next
  // (`trailingSlash: false`) : les redéclarer produirait une boucle.
  { from: "/about", to: "/a-propos" },
  { from: "/contact", to: "/contacts" },
  { from: "/equipe", to: "/a-propos" },
  { from: "/editeur", to: "/a-propos" },
  { from: "/notre-equipe", to: "/a-propos" },

  // Les URL légales qui répondaient 404 (audit §08) existent enfin.
  { from: "/politique-de-confidentialite", to: "/confidentialite" },
  { from: "/privacy-policy", to: "/confidentialite" },
  { from: "/politique-de-cookies", to: "/confidentialite" },
  { from: "/cookies", to: "/confidentialite" },
  { from: "/cgu", to: "/mentions-legales" },
  { from: "/conditions-generales", to: "/mentions-legales" },

  // Flux et plans de site
  { from: "/feed", to: "/rss.xml" },
  { from: "/comments/feed", to: "/rss.xml" },
  { from: "/sitemap_index.xml", to: "/sitemap.xml" },
  { from: "/wp-sitemap.xml", to: "/sitemap.xml" },
  { from: "/post-sitemap.xml", to: "/sitemap.xml" },
  { from: "/post-sitemap1.xml", to: "/sitemap.xml" },
  { from: "/post-sitemap2.xml", to: "/sitemap.xml" },
  { from: "/page-sitemap.xml", to: "/sitemap.xml" },
  { from: "/category-sitemap.xml", to: "/sitemap.xml" },
  { from: "/author-sitemap.xml", to: "/sitemap.xml" },
  // Les deux plans de pièces jointes proposaient à l'indexation des pages
  // sans contenu : ils sont renvoyés sur le plan principal.
  { from: "/attachment-sitemap.xml", to: "/sitemap.xml" },
  { from: "/attachment-sitemap1.xml", to: "/sitemap.xml" },

  // Recherche WordPress
  { from: "/search", to: "/recherche" },

  // Boutique jamais utilisée (WooCommerce actif sans boutique, audit §02)
  { from: "/boutique", to: "/" },
  { from: "/shop", to: "/" },
  { from: "/panier", to: "/" },
  { from: "/cart", to: "/" },
  { from: "/mon-compte", to: "/" },
  { from: "/checkout", to: "/" },
];

/**
 * Endpoints that exposed data or attack surface and now lead nowhere.
 * `/wp-json/wp/v2/users` published the administrator's login name.
 */
const CLOSED_ENDPOINTS = [
  "/wp-json/:path*",
  "/wp-admin/:path*",
  "/wp-login.php",
  "/xmlrpc.php",
  "/wp-content/:path*",
  "/wp-includes/:path*",
] as const;

export function legacyRedirects(): Redirect[] {
  const redirects: Redirect[] = [];

  // Rubriques : /category/<slug> et /category/<slug>/page/<n>.
  for (const [slug, destination] of Object.entries(LEGACY_CATEGORY_SLUGS)) {
    redirects.push({
      source: `/category/${slug}`,
      destination,
      statusCode: PERMANENT,
    });
    redirects.push({
      source: `/category/${slug}/page/:page`,
      destination,
      statusCode: PERMANENT,
    });
    const segments = destination.split("/").filter(Boolean);
    if (segments.length === 3 && segments[0] === "rubrique") {
      const parents =
        segments[1] === "business-lifestyle"
          ? ["business-life-style", "business-lifestyle"]
          : [segments[1]];
      for (const parent of parents) {
        redirects.push({
          source: `/category/${parent}/${slug}`,
          destination,
          statusCode: PERMANENT,
        });
        redirects.push({
          source: `/category/${parent}/${slug}/page/:page`,
          destination,
          statusCode: PERMANENT,
        });
      }
    }
  }

  for (const { from, to } of STATIC_MAPPINGS) {
    redirects.push({ source: from, destination: to, statusCode: PERMANENT });
  }

  // Archives d'auteur : le fonds est signé « admin », qui n'existe plus.
  redirects.push({
    source: "/author/admin",
    destination: "/auteur/le-corporate",
    statusCode: PERMANENT,
  });
  redirects.push({
    source: "/author/:slug",
    destination: "/auteur/:slug",
    statusCode: PERMANENT,
  });

  // Étiquettes : pas de page de tag dans le nouveau site, la recherche les
  // couvre et conserve l'intention du lien entrant.
  redirects.push({
    source: "/tag/:slug",
    destination: "/recherche?q=:slug",
    statusCode: PERMANENT,
  });

  // Archives par date : elles n'existent plus, l'accueil les remplace.
  redirects.push({
    source: "/:year(\\d{4})",
    destination: "/",
    statusCode: PERMANENT,
  });
  redirects.push({
    source: "/:year(\\d{4})/:month(\\d{2})",
    destination: "/",
    statusCode: PERMANENT,
  });

  for (const source of CLOSED_ENDPOINTS) {
    redirects.push({ source, destination: "/", statusCode: PERMANENT });
  }

  return redirects;
}
