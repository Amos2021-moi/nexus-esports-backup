"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  LayoutDashboard, User, Shield, Calendar, Trophy, Users, Award, Newspaper,
  LogOut, Menu, X, ChevronRight, Bell, Search, Sun, Moon, Activity, Sparkles, TrendingUp, MessageCircle
} from "lucide-react"
import NotificationBell from "@/components/ui/NotificationBell"

const playerMenu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { name: "Profile", href: "/dashboard/profile", icon: User, color: "text-blue-400", bg: "bg-blue-500/10" },
  { name: "My Squads", href: "/dashboard/squads", icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { name: "Fixtures", href: "/dashboard/fixtures", icon: Calendar, color: "text-green-400", bg: "bg-green-500/10" },
  { name: "Standings", href: "/dashboard/standings", icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { name: "Statistics", href: "/dashboard/statistics", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
  { name: "Awards", href: "/dashboard/awards", icon: Award, color: "text-orange-400", bg: "bg-orange-500/10" },
  { name: "Community", href: "/dashboard/community", icon: MessageCircle, color: "text-pink-400", bg: "bg-pink-500/10" },
]

const adminMenu = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { name: "Players", href: "/admin/players", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
  { name: "Seasons", href: "/admin/seasons", icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { name: "League", href: "/admin/league", icon: Calendar, color: "text-green-400", bg: "bg-green-500/10" },
  { name: "Results", href: "/admin/results", icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10" },
  { name: "Tournaments", href: "/admin/tournaments", icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10" },
  { name: "News", href: "/admin/news", icon: Newspaper, color: "text-pink-400", bg: "bg-pink-500/10" },
  { name: "Awards", href: "/admin/awards", icon: Award, color: "text-orange-400", bg: "bg-orange-500/10" },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'light') {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    } else {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  if (!isClient || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isAdmin = session.user?.role === "ADMIN"
  const menuItems = isAdmin ? adminMenu : playerMenu
  const dashboardName = isAdmin ? "Admin Panel" : "Player Dashboard"
  const bgGradient = isAdmin 
    ? "bg-gradient-to-b from-gray-900 to-gray-800" 
    : "bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-800"

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-gray-800/80 backdrop-blur-sm p-3 text-white shadow-xl lg:hidden border border-white/10 hover:bg-gray-700 transition-all"
      >
        {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-80 transform bg-gray-900/95 backdrop-blur-md transition-transform duration-300 ease-in-out shadow-2xl border-r border-white/10 flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30" />
          <div className="relative flex h-24 items-center justify-center border-b border-white/10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Nexus Esports</h1>
              </div>
              <p className="text-xs text-gray-500 tracking-wide">{dashboardName}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Card */}
          <div className="mx-4 mt-5 p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/2 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">
                    {session.user?.name?.charAt(0) || "A"}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{session.user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
              </div>
              <div className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg shadow-md">
                <span className="text-xs font-bold text-white">{isAdmin ? "ADMIN" : "PLAYER"}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 px-4">
            <p className="text-xs font-semibold text-gray-500 mb-3 px-3 uppercase tracking-wider flex items-center gap-2">
              <span className="h-px w-4 bg-gray-600"></span>
              Main Menu
              <span className="h-px flex-1 bg-gray-600"></span>
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-gray-300 hover:bg-gradient-to-r hover:from-white/10 hover:to-transparent transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-lg ${item.bg} group-hover:scale-110 transition-transform`}>
                      <item.icon size={16} className={item.color} />
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-gray-500 group-hover:translate-x-1" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="h-8" />
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-white/10 bg-gray-900/95">
          <div className="p-4">
            <button
              onClick={() => router.push("/api/auth/signout")}
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 px-3 py-2.5 text-gray-400 hover:from-red-500/20 hover:to-pink-500/20 hover:text-red-400 transition-all duration-200 border border-red-500/20"
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-80 min-h-screen">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-gray-900/80 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-white">{dashboardName}</h2>
              <p className="text-xs text-gray-400">Welcome back, {session.user?.name}</p>
            </div>
            <div className="lg:hidden">
              <h2 className="text-lg font-semibold text-white">Nexus Hub</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all"
                />
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-400" />}
              </button>
              
              {/* Notification Bell */}
              <NotificationBell />
              
              <div className="h-6 w-px bg-white/10 hidden md:block"></div>
              <span className="text-xs text-gray-400 hidden md:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}