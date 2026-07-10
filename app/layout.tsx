import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";
import MaintenanceOverlay from "@/components/MaintenanceOverlay";
import { ClientProviders } from "./providers/ClientProviders";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

// ✅ Optimize font loading - no layout shift
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "Nexus Esports League",
    template: "%s | Nexus Esports League",
  },
  description: "School Esports Platform for eFootball",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nexus Esports",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  // ✅ Add Open Graph for better sharing
  openGraph: {
    title: "Nexus Esports League",
    description: "School Esports Platform for eFootball",
    url: "https://nexus-esports.vercel.app",
    siteName: "Nexus Esports League",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // ✅ Add Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Nexus Esports League",
    description: "School Esports Platform for eFootball",
    images: ["/icons/icon-512.png"],
  },
  // ✅ Robots for SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // ✅ Viewport - moved from head for better performance
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: true,
  },
  // ✅ Theme color for PWA
  themeColor: "#4F46E5",
  // ✅ Verification
  verification: {
    google: "your-google-verification-code", // Add your code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* ✅ Preconnect to critical domains */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://api.example.com"
          crossOrigin="anonymous"
        />

        {/* ✅ DNS Prefetch */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* ✅ Preload critical assets */}
        <link rel="preload" href="/icons/icon-192.png" as="image" />
        <link rel="preload" href="/icons/icon-512.png" as="image" />

        {/* ✅ Security Headers via meta tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta name="referrer" content="origin-when-cross-origin" />

        {/* ✅ PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nexus Esports" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#4F46E5" />

        {/* ✅ PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* ✅ Microsoft Tile (optional) */}
        <meta name="msapplication-TileColor" content="#4F46E5" />
        <meta name="msapplication-TileImage" content="/icons/icon-192.png" />
      </head>
      <body>
        <AuthProvider>
          <MaintenanceOverlay>
            <ClientProviders>
              {children}
              {/* ✅ Vercel Analytics (only in production) */}
              {process.env.NODE_ENV === "production" && (
                <>
                  <SpeedInsights />
                  <Analytics />
                </>
              )}
            </ClientProviders>
          </MaintenanceOverlay>
        </AuthProvider>
      </body>
    </html>
  );
}