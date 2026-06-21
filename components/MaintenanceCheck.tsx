"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Shield, Clock } from "lucide-react"

export function MaintenanceCheck({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(false)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    async function checkMaintenance() {
      try {
        const res = await fetch("/api/settings?category=system&key=maintenanceMode")
        if (res.ok) {
          const data = await res.json()
          setIsMaintenance(data.maintenanceMode || false)
        }
      } catch (error) {
        console.error("Error checking maintenance:", error)
      } finally {
        setLoading(false)
      }
    }

    // Skip check on auth pages
    if (pathname === "/auth/signin" || pathname === "/auth/signup") {
      setLoading(false)
      return
    }

    checkMaintenance()
  }, [pathname])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (isMaintenance) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/20 mb-6">
            <Shield className="h-10 w-10 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Under Maintenance</h1>
          <p className="text-gray-400 mb-6">
            We're currently performing scheduled maintenance. The platform will be back online shortly.
          </p>
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-gray-300">Please check back soon</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return children
}