"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  User, Bell, Shield, Palette, Trophy, Settings as SettingsIcon,
  ChevronRight, Home
} from "lucide-react"

const tabs = [
  { name: "Account", href: "/dashboard/settings/account", icon: User },
  { name: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  { name: "Privacy", href: "/dashboard/settings/privacy", icon: Shield },
  { name: "Appearance", href: "/dashboard/settings/appearance", icon: Palette },
  { name: "Competition", href: "/dashboard/settings/competition", icon: Trophy },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-indigo-400" />
          Settings
        </h1>
        <p className="text-gray-400 mt-1">Manage your account, preferences, and privacy</p>
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