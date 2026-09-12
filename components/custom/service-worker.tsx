"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (CDC §2.2 — power cuts and dead spots are
 * routine, an article already read must stay readable).
 *
 * Registration is deferred to the `load` event so it never competes with the
 * first paint, and it is skipped in development where the worker would cache
 * Turbopack's output and make every edit invisible.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
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
