import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { headers } from "next/headers";
import { PreferencesScript } from "@/components/custom/preferences-script";
import { ServiceWorker } from "@/components/custom/service-worker";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { SITE, siteUrl } from "@/lib/site";
import { getAdSenseRuntimeConfig } from "@/lib/ads/adsense-config";
import "./globals.css";

/**
 * Two families only (CDC §3.2), down from six.
 *
 * `next/font/google` downloads the woff2 files at build time and serves them
 * from this origin: no request to fonts.googleapis.com, and a size-adjusted
 * fallback that avoids layout shift.
 *
 * Only the `latin` subset is requested. `latin-ext` doubles the number of
 * preloaded font files and French needs none of it — é, à, ç, œ, « » and the
 * euro sign all live in `latin`. Both families are loaded as variable fonts,
 * so one file covers every weight the design uses.
 *
 * No italic face either. A second display-face file costs 47 Ko on *every*
 * page — eight per cent of the whole 600 Ko budget of §5.4 — for pull quotes
 * and the occasional emphasis. The pull quote is set upright instead (its
 * rule, its quote mark and its size already set it apart), and the rare
 * `<em>` falls back to a synthesised oblique. Two font requests for the
 * whole site, against the six families the legacy site loaded.
 */
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE.title,
    template: "%s · Le Corporate",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.publisher }],
  generator: undefined,
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
  icons: { apple: "/icons/apple-touch-icon.png?v=editorial-1" },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        { url: "/rss.xml", title: "Le Corporate — tous les articles" },
      ],
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: SITE.title,
    description: SITE.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

/**
 * Root layout — document shell only.
 *
 * The masthead and the footer moved to `app/(journal)/layout.tsx` at
 * milestone 3: the back office and the company portal are applications, not
 * pages of the newspaper, and they need their own chrome. What stays here is
 * what every route shares — the language, the two typefaces, the reader
 * preferences and the service worker — and **nothing that would grow the
 * shared JavaScript chunk**, since the public journal pays for it on every
 * page (CDC §5.4).
 */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  // A complete AdSense setup opts into per-request rendering for unique nonces.
  const nonce = getAdSenseRuntimeConfig()
    ? ((await headers()).get("x-nonce") ?? undefined)
    : undefined;
  return (
    <html
      lang="fr-FR"
      suppressHydrationWarning
      className={`${interTight.variable} ${inter.variable} h-full`}
    >
      <head>
        <PreferencesScript nonce={nonce} />
      </head>
      <body className="flex min-h-full flex-col">
        {/* Ni Toaster ni TooltipProvider ici : `sonner` et le survol Radix
            pèsent une trentaine de kilo-octets de JavaScript sur *chaque*
            page pour des retours que le journal public rend en ligne, dans
            le contrôle lui-même. Le budget du §5.4 ne les finance pas. La
            galerie /design-system monte son propre TooltipProvider. */}
        <PreferencesProvider>{children}</PreferencesProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
