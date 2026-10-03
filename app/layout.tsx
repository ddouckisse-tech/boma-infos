import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { headers } from "next/headers";
import { PreferencesScript } from "@/components/custom/preferences-script";
import { ServiceWorker } from "@/components/custom/service-worker";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { PUBLISHER_NAME, SITE, siteUrl } from "@/lib/site";
import { getAdSenseRuntimeConfig } from "@/lib/ads/adsense-config";
import "./globals.css";

/**
 * Two families only (CDC §3.2): the serif of the charter for headlines, a
 * sans for everything that is read at length or operated.
 *
 * `next/font/google` downloads the woff2 files at build time and serves them
 * from this origin: no request to fonts.googleapis.com, and a size-adjusted
 * fallback that avoids layout shift.
 *
 * Only the `latin` subset is requested. `latin-ext` doubles the number of
 * preloaded font files and French needs none of it — é, à, ç, œ, « » and the
 * euro sign all live in `latin`.
 *
 * **Source Serif 4** is the face of the charter: the « BOMA » of the logo and
 * the quotation set in white on navy. It is loaded as ONE static weight, 600
 * — the weight measured on the charter, a 22 Ko file, half of the variable
 * grotesque it replaces (45 Ko). Measured: asking for two weights makes
 * Google Fonts answer with the variable file instead (51 Ko), so every
 * headline is set in that one weight. Inter stays variable: one file covers
 * every weight of the interface.
 *
 * The charter's emphasis — bold italic, in gold — is a third file. It is
 * declared with `preload: false`: the browser only fetches it on a page that
 * actually sets text in it (`.boma-em`, the pull quote of an article), and
 * `scripts/check-budget.ts` charges that page for it. Preloading it
 * everywhere would spend 21 Ko of the §5.4 budget on pages that never use it.
 */
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: "600",
  display: "swap",
});

const sourceSerifItalic = Source_Serif_4({
  variable: "--font-source-serif-italic",
  subsets: ["latin"],
  weight: "700",
  style: "italic",
  display: "swap",
  preload: false,
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
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: PUBLISHER_NAME }],
  generator: undefined,
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
  icons: { apple: "/icons/apple-touch-icon.png?v=boma-1" },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [
        { url: "/rss.xml", title: `${SITE.name} — tous les articles` },
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
  // Le bandeau est marine dans les deux thèmes : la barre du navigateur le
  // prolonge au lieu de poser une bande blanche au-dessus de lui.
  themeColor: "#050d2b",
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
      className={`${sourceSerif.variable} ${sourceSerifItalic.variable} ${inter.variable} h-full`}
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
