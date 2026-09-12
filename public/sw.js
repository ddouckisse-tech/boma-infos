/*
 * Service worker — Le Corporate.
 * CAHIER-DES-CHARGES.md §2.2 : « Coupures fréquentes. PWA avec service
 * worker : les articles consultés restent lisibles hors-ligne, une page
 * hors-ligne soignée remplace l'erreur. »
 *
 * Écrit à la main, sans Workbox : la logique tient en trois stratégies et une
 * dépendance de plus serait un poste de maintenance pour rien.
 *
 *  - Navigations (documents HTML) : réseau d'abord, avec un délai de garde.
 *    Le journal doit afficher la dernière version quand le réseau répond, et
 *    la version en cache quand il ne répond pas. En dernier recours, la page
 *    /hors-ligne.
 *  - Ressources versionnées (/_next/static, polices, images de /medias) :
 *    cache d'abord. Leur URL change quand leur contenu change.
 *  - Le reste : réseau seul. Rien n'est mis en cache par accident.
 */

const VERSION = "v2";
const SHELL_CACHE = `lecorporate-shell-${VERSION}`;
const PAGES_CACHE = `lecorporate-pages-${VERSION}`;
const ASSETS_CACHE = `lecorporate-assets-${VERSION}`;

const OFFLINE_URL = "/hors-ligne";

/** Pages précachées à l'installation : le strict nécessaire. */
const SHELL = [OFFLINE_URL];

/** Au-delà, le cache des pages est purgé de ses entrées les plus anciennes. */
const MAX_PAGES = 40;
/** Délai au-delà duquel on sert le cache plutôt que d'attendre le réseau. */
const NETWORK_TIMEOUT_MS = 3500;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => Promise.all(SHELL.map(async (url) => {
        const response = await fetch(url);
        if (canCacheDocument(response)) await cache.put(url, response);
      })))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.endsWith(VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/** Supprime les entrées les plus anciennes d'un cache au-delà de `limit`. */
async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  for (const key of keys.slice(0, keys.length - limit)) {
    await cache.delete(key);
  }
}

function isVersionedAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/medias/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  );
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  // Seules les réponses que le serveur déclare IMMUABLES entrent en cache.
  // En production, /_next/static, /medias et /icons le sont (nom porteur
  // d'empreinte). En développement, /_next/static ne l'est pas : ses
  // fichiers gardent le même nom et changent à chaque modification. Un
  // worker posé lors d'un essai en production sur le même localhost servait
  // alors des chunks périmés au serveur de dev — constaté, d'où cette règle.
  const cacheControl = response.headers.get("cache-control") || "";
  if (
    response.ok &&
    response.type === "basic" &&
    /\bimmutable\b/.test(cacheControl)
  ) {
    const cache = await caches.open(ASSETS_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

/** A request nonce must never be replayed by the offline document cache. */
function canCacheDocument(response) {
  return response.ok &&
    !/\bno-store\b/i.test(response.headers.get("cache-control") || "") &&
    !(response.headers.get("content-security-policy") || "").includes("'nonce-");
}

async function networkFirstDocument(request) {
  const cache = await caches.open(PAGES_CACHE);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timer);

    if (canCacheDocument(response)) {
      // On ne conserve que le HTML : les charges utiles RSC des navigations
      // clientes changent de nom à chaque déploiement.
      cache.put(request, response.clone());
      trim(PAGES_CACHE, MAX_PAGES);
    } else {
      // A page which has switched to nonce rendering supersedes its old copy.
      await cache.delete(request);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached && canCacheDocument(cached)) return cached;

    const offline = await caches.match(OFFLINE_URL);
    if (offline && canCacheDocument(offline)) return offline;

    return new Response(
      "<!doctype html><meta charset=utf-8><title>Hors ligne</title><p>Vous êtes hors ligne.",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

/*
 * Purge des photographies, demandée par la page quand le lecteur bascule le
 * mode économie de données.
 *
 * Sans cela, la bascule resterait sans effet : `proxy.ts` sert bien la
 * variante 480 px, mais le service worker répondait d'abord depuis son cache
 * avec la version pleine définition enregistrée avant la bascule. L'en-tête
 * `Vary: Cookie` ne suffit pas ici — l'API Cache ne voit pas l'en-tête
 * `Cookie`, ajouté plus tard par la couche réseau.
 */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "purge-medias") {
    event.waitUntil(caches.delete(ASSETS_CACHE));
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // La recherche et les flux ne sont jamais servis depuis le cache : une
  // liste d'articles périmée est pire qu'une erreur franche.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstDocument(request));
    return;
  }

  if (isVersionedAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
