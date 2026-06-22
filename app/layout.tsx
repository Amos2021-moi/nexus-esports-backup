import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "./providers/AuthProvider"
import { Toaster } from "react-hot-toast"
import { MaintenanceCheck } from "@/components/MaintenanceCheck"

export const metadata: Metadata = {
  title: "Nexus Esports League",
  description: "School Esports Platform for eFootball",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
        <meta name="theme-color" content="#0f0f1a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <AuthProvider>
          <MaintenanceCheck>
            {children}
          </MaintenanceCheck>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
