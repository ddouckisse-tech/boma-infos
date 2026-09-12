import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Footer } from "@/components/custom/footer";
import { Header } from "@/components/custom/header";
import { PreferencesScript } from "@/components/custom/preferences-script";
import { SkipLink } from "@/components/custom/skip-link";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import "./globals.css";

/**
 * Two families only (CAHIER-DES-CHARGES.md §3.2), down from six.
 * `next/font/google` downloads the woff2 files at build time and serves them
 * from the app's own origin: no runtime request to fonts.googleapis.com or
 * fonts.gstatic.com, and a size-adjusted fallback that avoids layout shift.
 */
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Le Corporate — magazine économique gabonais",
    template: "%s · Le Corporate",
  },
  description:
    "L'économie du Gabon et de la zone CEMAC : enquêtes, portraits de dirigeants, intelligence économique. Édité par Up Concept.",
  applicationName: "Le Corporate",
  authors: [{ name: "Up Concept" }],
  formatDetection: { telephone: false },
  robots: { index: true, follow: true },
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

export default function RootLayout({ children }: LayoutProps<"/">) {
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
        <PreferencesProvider>
          <ConvexClientProvider>
            <TooltipProvider delayDuration={200}>
              <SkipLink />
              <Header />
              {/* tabIndex={-1} : cible du lien d'évitement, focalisable par
                  programme mais hors de l'ordre de tabulation. */}
              <main
                id="contenu"
                tabIndex={-1}
                className="flex-1 focus-visible:outline-none"
              >
                {children}
              </main>
              <Footer />
              <Toaster
                position="bottom-right"
                closeButton
                toastOptions={{ className: "font-sans" }}
              />
            </TooltipProvider>
          </ConvexClientProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
