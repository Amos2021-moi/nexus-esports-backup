import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "./providers/AuthProvider"
import { Toaster } from "react-hot-toast"

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
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}