import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * Conventional addresses that are not the ones of this site — 301.
 *
 * BOMA Infos is a new site: it has no earlier addresses of its own to
 * preserve. What remains worth answering are the paths readers, feed
 * readers and search engines try on *any* news site — `/feed`, `/about`,
 * `/category/<slug>`, `/author/<slug>` — and the endpoints of a CMS that
 * robots probe on every domain. Each of them leads somewhere useful instead
 * of a 404.
 *
 * The code this site was built from carried the redirection plan of another
 * publication's WordPress archive (a table of its section slugs and of its
 * pages). That table described addresses BOMA Infos never served and
 * sections it does not have: it is gone. If an archive is imported one day,
 * its own plan goes here, generated from that archive.
 *
 * A single-segment path that matches the slug of an article is handled
 * dynamically by `app/(journal)/[slug]/page.tsx`, which sends the reader to
 * `/article/<slug>`.
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

/** Standing pages and feeds, under the names other sites give them. */
const STATIC_MAPPINGS: readonly Mapping[] = [
  { from: "/actualite", to: "/" },
  { from: "/actualites", to: "/" },
  // `/a-propos/` et `/contacts/` avec la barre oblique finale sont déjà
  // ramenés à leur forme sans barre par Next (`trailingSlash: false`) : les
  // redéclarer produirait une boucle.
  { from: "/about", to: "/a-propos" },
  { from: "/contact", to: "/contacts" },
  { from: "/equipe", to: "/a-propos" },

  { from: "/politique-de-confidentialite", to: "/confidentialite" },
  { from: "/privacy-policy", to: "/confidentialite" },
  { from: "/cookies", to: "/confidentialite" },
  { from: "/cgu", to: "/mentions-legales" },
  { from: "/conditions-generales", to: "/mentions-legales" },

  // Flux et plans de site
  { from: "/feed", to: "/rss.xml" },
  { from: "/rss", to: "/rss.xml" },
  { from: "/sitemap_index.xml", to: "/sitemap.xml" },
  { from: "/wp-sitemap.xml", to: "/sitemap.xml" },

  { from: "/search", to: "/recherche" },
];

/**
 * Endpoints of a CMS this site does not run. Robots request them on every
 * domain; they get the home page rather than a trace of what is installed.
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

  // Rubriques : `/category/<slug>` est le chemin que beaucoup de sites leur
  // donnent ; ici elles vivent sous `/rubrique/<slug>`.
  redirects.push({
    source: "/category/:slug",
    destination: "/rubrique/:slug",
    statusCode: PERMANENT,
  });
  redirects.push({
    source: "/category/:parent/:slug",
    destination: "/rubrique/:parent/:slug",
    statusCode: PERMANENT,
  });

  for (const { from, to } of STATIC_MAPPINGS) {
    redirects.push({ source: from, destination: to, statusCode: PERMANENT });
  }

  redirects.push({
    source: "/author/:slug",
    destination: "/auteur/:slug",
    statusCode: PERMANENT,
  });

  // Étiquettes : pas de page de tag, la recherche les couvre et conserve
  // l'intention du lien.
  redirects.push({
    source: "/tag/:slug",
    destination: "/recherche?q=:slug",
    statusCode: PERMANENT,
  });

  for (const source of CLOSED_ENDPOINTS) {
    redirects.push({ source, destination: "/", statusCode: PERMANENT });
  }

  return redirects;
}
