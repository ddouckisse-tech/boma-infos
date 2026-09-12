import type { NextConfig } from "next";
import { STATIC_SECURITY_HEADERS } from "./lib/security-headers";

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
        source: "/:path*",
        headers: [...STATIC_SECURITY_HEADERS],
      },
    ];
  },
};

export default nextConfig;
