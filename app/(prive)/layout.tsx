import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { ConvexClientProvider } from "@/components/providers/convex-provider";

/**
 * Shell of the private areas — CDC §4.3, §4.4.
 *
 * This is where `ConvexClientProvider` finally gets mounted (milestone 1
 * declared it and deliberately left it unused). Only here: the public
 * journal is prerendered and a reactive browser client would cost it tens
 * of kilobytes on every page, which the budget of §5.4 does not finance.
 * A back office, on the other hand, *wants* a live connection — a deposit
 * arriving has to appear without a refresh.
 *
 * `sonner` and the other application libraries are equally legitimate here
 * and equally forbidden on the journal side, for the same reason.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      {children}
      <Toaster
        position="bottom-right"
        mobileOffset={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
        closeButton
        richColors
      />
    </ConvexClientProvider>
  );
}
