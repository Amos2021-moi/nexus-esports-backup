import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "./providers/AuthProvider"
import { Toaster } from "react-hot-toast"
import MaintenanceOverlay from "@/components/MaintenanceOverlay"

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
      </head>
      <body>
        <AuthProvider>
          <MaintenanceOverlay>
            {children}
          </MaintenanceOverlay>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}