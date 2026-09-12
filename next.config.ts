import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Nothing gained by advertising the framework version.
  poweredByHeader: false,
  images: {
    // AVIF first, WebP as fallback (CAHIER-DES-CHARGES.md §5.4).
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Toutes les réponses, y compris les pages prérendues statiquement.
        source: "/:path*",
        headers: securityHeaders(),
      },
    ];
  },
};

export default nextConfig;
