"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { 
  Settings, Trophy, Server, Shield, Bell, 
  ChevronRight, Home, Users, Award, Calendar, 
  HardDrive, Database, FileArchive  // ✅ Add Backup icons
} from "lucide-react"

const tabs = [
  { name: "League", href: "/admin/settings/league", icon: Trophy },
  { name: "System", href: "/admin/settings/system", icon: Server },
  { name: "Moderation", href: "/admin/settings/moderation", icon: Shield },
  { name: "Notifications", href: "/admin/settings/notifications", icon: Bell },
  // ✅ ADD BACKUP TAB
  { name: "Backup", href: "/admin/settings/backup", icon: HardDrive },
]

export default function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link href="/admin" className="hover:text-white transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Admin Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-400" />
          Admin Settings
        </h1>
        <p className="text-gray-400 mt-1">Control platform behavior and league rules</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-800 pb-0">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </Link>
          )
        })}
      </div>

      {/* Content */}
      <div className="pt-4">
        {children}
      </div>
    </div>
  )
}