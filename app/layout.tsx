import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";
import MaintenanceOverlay from "@/components/MaintenanceOverlay";
import { ClientProviders } from "./providers/ClientProviders";

export const metadata: Metadata = {
  title: "Nexus Esports League",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nexus Esports" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <AuthProvider>
          <MaintenanceOverlay>
            <ClientProviders>
              {children}
            </ClientProviders>
          </MaintenanceOverlay>
        </AuthProvider>
      </body>
    </html>
  );
}