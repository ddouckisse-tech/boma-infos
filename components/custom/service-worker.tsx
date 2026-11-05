"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (CDC §2.2 — power cuts and dead spots are
 * routine, an article already read must stay readable).
 *
 * Registration is deferred to the `load` event so it never competes with the
 * first paint. In development it is not only skipped: any worker already
 * controlling BOMA is **unregistered and its own caches dropped**. A
 * worker installed by a production run on the same `localhost` port would
 * otherwise outlive it and keep serving Turbopack's chunks from cache, so
 * that every edit shows up as "module factory is not available" — measured,
 * not hypothetical.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations
              .filter((registration) =>
                [
                  registration.active,
                  registration.waiting,
                  registration.installing,
                ].some((worker) => {
                  if (!worker) return false;
                  const script = new URL(worker.scriptURL);
                  return (
                    script.origin === window.location.origin &&
                    script.pathname === "/sw.js"
                  );
                })
              )
              .map((registration) => registration.unregister())
          )
        )
        .then(() => ("caches" in window ? caches.keys() : []))
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("bomainfos-"))
              .map((key) => caches.delete(key))
          )
        )
        .catch(() => {
          // Sans accès au stockage (navigation privée), rien à nettoyer.
        });
      return;
    }

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          // Navigation privée ou service worker refusé : le site fonctionne,
          // simplement sans lecture hors-ligne.
        });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
