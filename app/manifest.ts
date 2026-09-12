import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Web app manifest — CDC §1.3: « Application mobile native (une PWA
 * installable couvre le besoin) ».
 *
 * `display: standalone` and a maskable icon are what Android needs to offer
 * the install prompt; the two shortcuts land on the pages readers open most
 * from a home-screen icon.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — magazine économique gabonais`,
    short_name: SITE.name,
    description: SITE.description,
    lang: "fr-FR",
    dir: "ltr",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#002060",
    categories: ["news", "business", "magazines"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Rechercher un article",
        short_name: "Rechercher",
        url: "/recherche",
      },
      {
        name: "Docuthèque",
        short_name: "Documents",
        url: "/docutheque",
      },
    ],
  };
}
