import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Footer } from "@/components/custom/footer";
import { Header } from "@/components/custom/header";
import { PreferencesScript } from "@/components/custom/preferences-script";
import { ServiceWorker } from "@/components/custom/service-worker";
import { SkipLink } from "@/components/custom/skip-link";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { getNavigation } from "@/lib/content/server";
import { buildSections } from "@/lib/navigation";
import { SITE, siteUrl } from "@/lib/site";
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
 * No italic face either. A second Source Serif file costs 47 Ko on *every*
 * page — eight per cent of the whole 600 Ko budget of §5.4 — for pull quotes
 * and the occasional emphasis. The pull quote is set upright instead (its
 * rule, its quote mark and its size already set it apart), and the rare
 * `<em>` falls back to a synthesised oblique. Two font requests for the
 * whole site, against the six families the legacy site loaded.
 */
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const sections = buildSections(await getNavigation());

  return (
    <html
      lang="fr-FR"
      suppressHydrationWarning
      className={`${sourceSerif.variable} ${inter.variable} h-full`}
    >
      <head>
        <PreferencesScript />
      </head>
      <body className="flex min-h-full flex-col">
        {/* Ni Toaster ni TooltipProvider ici : `sonner` et le survol Radix
            pèsent une trentaine de kilo-octets de JavaScript sur *chaque*
            page pour des retours que le journal public rend en ligne, dans
            le contrôle lui-même. Le budget du §5.4 ne les finance pas. La
            galerie /design-system monte son propre TooltipProvider. */}
        <PreferencesProvider>
          <SkipLink />
          <Header sections={sections} />
          {/* tabIndex={-1} : cible du lien d'évitement, focalisable par
              programme mais hors de l'ordre de tabulation. */}
          <main
            id="contenu"
            tabIndex={-1}
            className="flex-1 focus-visible:outline-none"
          >
            {children}
          </main>
          <Footer sections={sections} />
        </PreferencesProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
