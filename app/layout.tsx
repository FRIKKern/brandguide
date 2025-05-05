import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/features/unorganized-utils/utils";
import { ThemeProvider } from "@/features/theme/theme-provider";
import { Toaster } from "@/features/unorganized-components/ui/sonner";
import { GlobalContextProvider } from "@/features/context/global-context";
import { PageOverlay } from "@/features/context/page-overlay";
import { NextgenContextStatusPanel } from "@/features/context/nextgen-context-panel";


const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === "production";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: {
    template: "%s | Veitrygghet",
    default: "Veitrygghet",
  },
  openGraph: {
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: "index, follow",
};

// Import Aker Brygge Display font for headings
const akerBryggeFont = localFont({
  src: [
    {
      path: '../public/fonts/akerbryggedisplay-webfont.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/akerbryggedisplay-webfont.woff',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-aker-brygge',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="icon" href="/favicon.ico" />
      <GlobalContextProvider>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased overscroll-none",
            akerBryggeFont.variable
          )}
        >
          {/* Render the main page content */}
          {children}

          {/* Render the global overlay component here */}
          <PageOverlay />

          {/* Other global elements */}
          <Toaster position="top-center" richColors />
          <NextgenContextStatusPanel />

        </body>
      </GlobalContextProvider>
    </html>
  );
}