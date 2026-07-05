"use client";

import VersionBadge from "@/components/ui/VersionBadge";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  Shield,
  Calendar,
  Trophy,
  Users,
  Award,
  CheckCircle,
  Newspaper,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
  Activity,
  TrendingUp,
  MessageCircle,
  Settings,
  FileText,
  Sparkles,
  Crown,
  Zap,
  Home,
  BarChart3,
  Bell,
  Search,
  CreditCard,
  Gift,
  GitBranch,
  Brain,
  Star,
  Flame,
} from "lucide-react";
import SearchBar from "@/components/admin/SearchBar";
import SmartNotificationBell from "@/components/ui/SmartNotificationBell";

const playerMenu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell, color: "text-indigo-400", bg: "bg-indigo-500/10" }, 
  { name: "Profile", href: "/dashboard/profile", icon: User, color: "text-blue-400", bg: "bg-blue-500/10" },
  { name: "My Squads", href: "/dashboard/squads", icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { name: "Players", href: "/players", icon: Users, color: "text-green-400", bg: "bg-green-500/10" },
  { name: "Fixtures", href: "/dashboard/fixtures", icon: Calendar, color: "text-green-400", bg: "bg-green-500/10" },
  { name: "Standings", href: "/dashboard/standings", icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { name: "Prize Pool", href: "/dashboard/prize", icon: Gift, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { name: "Statistics", href: "/dashboard/statistics", icon: BarChart3, color: "text-purple-400", bg: "bg-purple-500/10" },
  { name: "Awards", href: "/dashboard/awards", icon: Award, color: "text-orange-400", bg: "bg-orange-500/10" },
  { name: "Community", href: "/dashboard/community", icon: MessageCircle, color: "text-pink-400", bg: "bg-pink-500/10" },
  { name: "Tournaments", href: "/tournaments", icon: Crown, color: "text-amber-400", bg: "bg-amber-500/10" },
  { name: "Settings", href: "/dashboard/settings/account", icon: Settings, color: "text-gray-400", bg: "bg-gray-500/10" },
];

const adminMenu = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { name: "Competition", href: "/admin/competition", icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { name: "Payment Analytics", href: "/admin/payments", icon: BarChart3, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { name: "Players", href: "/players", icon: Users, color: "text-green-400", bg: "bg-green-500/10" },
  { name: "Seasons", href: "/admin/seasons", icon: Calendar, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { name: "League", href: "/admin/league", icon: Trophy, color: "text-green-400", bg: "bg-green-500/10" },
  { name: "Results", href: "/admin/results", icon: CheckCircle, color: "text-purple-400", bg: "bg-purple-500/10" },
  { name: "Tournaments", href: "/admin/tournaments", icon: Crown, color: "text-amber-400", bg: "bg-amber-500/10" },
  { name: "News", href: "/admin/news", icon: Newspaper, color: "text-pink-400", bg: "bg-pink-500/10" },
  { name: "Awards", href: "/admin/awards", icon: Award, color: "text-orange-400", bg: "bg-orange-500/10" },
  { name: "Analytics", href: "/admin/analytics", icon: Activity, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { name: "Audit Logs", href: "/admin/audit", icon: FileText, color: "text-red-400", bg: "bg-red-500/10" },
  { name: "Admin Management", href: "/admin/admins", icon: Shield, color: "text-slate-400", bg: "bg-slate-500/10" },
  { name: "Communication", href: "/admin/communication", icon: MessageCircle, color: "text-indigo-400", bg: "bg-indigo-500/10" }, // ADD THIS
  { name: "Settings", href: "/admin/settings/league", icon: Settings, color: "text-gray-400", bg: "bg-gray-500/10" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [version, setVersion] = useState<{
    version?: string;
    build?: string;
    hash?: string;
    environment?: string;
    date?: string;
  } | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{ latest?: string } | null>(null);
  const [appearanceSettings, setAppearanceSettings] = useState({
    sidebarStyle: "default" as "default" | "compact" | "icon",
    compactMode: false,
  });

  useEffect(() => {
  setIsClient(true);

  // ✅ Load saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    setIsDarkMode(true);
    document.documentElement.classList.add("dark");
  } else {
    // ✅ Default to light
    setIsDarkMode(false);
    document.documentElement.classList.remove("dark");
  }

  loadAppearanceSettings();
}, []);

  const loadAppearanceSettings = () => {
    const savedAppearance = localStorage.getItem("appearance");
    if (savedAppearance) {
      try {
        const parsed = JSON.parse(savedAppearance);
        setAppearanceSettings({
          sidebarStyle: parsed.sidebarStyle || "default",
          compactMode: parsed.compactMode || false,
        });
        return;
      } catch (e) {}
    }

    fetch("/api/settings?category=appearance")
      .then((res) => res.json())
      .then((data) => {
        setAppearanceSettings({
          sidebarStyle: data.sidebarStyle || "default",
          compactMode: data.compactMode || false,
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  if (!isClient || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <Shield className="absolute inset-0 m-auto h-7 w-7 text-indigo-400" />
          </div>
          <p className="mt-2 font-medium text-gray-400">Loading...</p>
          <div className="mt-1 flex items-center justify-center gap-1 text-xs text-gray-500">
            <Sparkles className="h-3 w-3 text-yellow-400" />
            <span>Preparing your dashboard</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = session.user?.role || "PLAYER";
  const isAdmin = userRole === "ADMIN";
  const menuItems = isAdmin ? adminMenu : playerMenu;
  const dashboardName = isAdmin ? "Admin Panel" : "Player Dashboard";

  const isIconOnly = appearanceSettings.sidebarStyle === "icon";

  const getSidebarWidth = () => {
    switch (appearanceSettings.sidebarStyle) {
      case "icon":
        return "w-20";
      case "compact":
        return "w-56";
      default:
        return "w-80";
    }
  };

  const getMainMargin = () => {
    switch (appearanceSettings.sidebarStyle) {
      case "icon":
        return "lg:ml-20";
      case "compact":
        return "lg:ml-56";
      default:
        return "lg:ml-80";
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard" || href === "/admin") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 ${
        appearanceSettings.compactMode ? "compact-mode" : ""
      }`}
    >
      {/* Static Background Orbs - No Animation */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed, No Animation */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen max-w-[85vw] ${getSidebarWidth()} transform flex-col border-r border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-in-out lg:max-w-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Decorative orb behind brand */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-indigo-600/20 blur-[80px]" />

        {/* Brand */}
        <div className="relative flex-shrink-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20" />
          <div className="relative flex h-24 items-center justify-center border-b border-white/10 px-4">
            <div className={`flex items-center gap-2.5 ${isIconOnly ? "flex-col" : ""}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/40">
                <Shield className="h-6 w-6 text-white" />
              </div>
              {!isIconOnly && (
                <div className="text-left">
                  <h1 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-lg font-bold leading-tight text-transparent">
                    Nexus Esports
                  </h1>
                  <p className="text-[11px] font-medium tracking-wide text-indigo-300/80">
                    {dashboardName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* User card */}
          {!isIconOnly && (
            <div className="mx-4 mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg ring-2 ring-white/10">
                    <span className="text-xl font-bold text-white">
                      {session.user?.name?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-900 bg-green-500">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/80" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {session.user?.name}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {session.user?.email}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white shadow-md ${
                    isAdmin
                      ? "bg-gradient-to-r from-red-500 to-pink-500"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500"
                  }`}
                >
                  <Shield className="h-3 w-3" />
                  {isAdmin ? "ADMIN" : "PLAYER"}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          )}

          {/* Nav */}
          <div className={`mt-6 ${isIconOnly ? "px-2.5" : "px-4"}`}>
            {!isIconOnly && (
              <p className="mb-3 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <span className="h-px w-4 bg-gray-600" />
                Main Menu
                <span className="h-px flex-1 bg-gray-600" />
              </p>
            )}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const active = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    title={isIconOnly ? item.name : undefined}
                    className={`group relative flex items-center rounded-xl px-3 py-2.5 transition-all duration-200 ${
                      isIconOnly ? "justify-center" : "justify-between"
                    } ${
                      active
                        ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white shadow-sm"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-500" />
                    )}
                    <div
                      className={`flex items-center ${
                        isIconOnly ? "space-x-0" : "space-x-3"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${
                          active ? "ring-1 ring-white/10" : ""
                        } ${item.bg}`}
                      >
                        <item.icon size={16} className={item.color} />
                      </div>
                      {!isIconOnly && (
                        <span className="text-sm font-medium">{item.name}</span>
                      )}
                    </div>
                    {!isIconOnly && (
                      <ChevronRight
                        size={14}
                        className={`text-gray-500 transition-all ${
                          active
                            ? "translate-x-0 text-indigo-300 opacity-100"
                            : "opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
                        }`}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="h-8" />
        </div>

        {/* Logout & Version */}
<div className="flex-shrink-0 border-t border-white/10 bg-gray-900/95">
  {/* Logout Button */}
  <div className={`p-4 ${isIconOnly ? "flex justify-center" : ""}`}>
    <button
      onClick={() => router.push("/api/auth/signout")}
      title={isIconOnly ? "Logout" : undefined}
      className={`group relative w-full overflow-hidden rounded-xl border border-red-500/20 bg-gradient-to-r from-red-500/10 to-pink-500/10 px-3 py-2.5 text-gray-400 transition-all duration-300 hover:from-red-500/20 hover:to-pink-500/20 hover:text-red-400 hover:shadow-lg hover:shadow-red-500/10 ${
        isIconOnly ? "px-2" : ""
      }`}
    >
      {/* Glow effect on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-pink-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <span className="relative flex items-center justify-center gap-2">
        <LogOut size={16} className="transition-transform duration-300 group-hover:scale-110" />
        {!isIconOnly && (
          <span className="text-sm font-medium">Logout</span>
        )}
      </span>
    </button>
  </div>

  {/* Version Badge - Premium Styling */}
  <div className="border-t border-white/5 px-4 py-3">
    <div className="flex items-center justify-center gap-2">
      {/* Version Divider */}
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/5" />
      
      {/* Version Badge - Clickable */}
      <div
        onClick={() => {
          if (window.location.pathname.includes('/admin')) {
            window.location.href = '/admin/system/version';
          }
        }}
        className="group relative cursor-pointer rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition-all duration-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/5"
      >
        {/* Premium shimmer effect */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="relative flex items-center gap-2 text-[11px] font-medium text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
          <GitBranch size={11} className="text-indigo-400/60 transition-colors duration-300 group-hover:text-indigo-400" />
          <span className="font-mono">
            v{version?.version || "1.0.0"}
          </span>
          <span className="h-1 w-1 rounded-full bg-gray-600" />
          <span className="text-[10px] text-gray-500">
            {version?.hash || "dev"}
          </span>
          {version?.environment && (
            <>
              <span className="h-1 w-1 rounded-full bg-gray-600" />
              <span className="text-[10px] text-indigo-400/70">
                {version.environment === 'production' ? '🚀' : version.environment === 'staging' ? '🧪' : '🔧'}
              </span>
            </>
          )}
          <Sparkles size={10} className="text-yellow-400/40 transition-opacity duration-300 group-hover:text-yellow-400/70" />
          
          {/* Update indicator */}
          {hasUpdate && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-yellow-400" />
            </span>
          )}
        </div>

        {/* Tooltip on hover */}
        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 scale-95 rounded-xl border border-white/10 bg-gray-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
          <div className="space-y-1.5 text-xs whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Version</span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-indigo-300">
                v{version?.version || "1.0.0"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span>Build:</span>
              <span className="font-mono text-white">#{version?.build || "0"}</span>
            </div>
            {version?.hash && (
              <div className="flex items-center gap-2 text-gray-400">
                <span>Commit:</span>
                <span className="font-mono text-white">{version.hash}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-400">
              <span>Env:</span>
              <span className={`font-medium ${
                version?.environment === 'production' ? 'text-emerald-400' :
                version?.environment === 'staging' ? 'text-yellow-400' :
                version?.environment === 'preview' ? 'text-purple-400' :
                'text-blue-400'
              }`}>
                {version?.environment || 'development'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span>Deployed:</span>
              <span className="text-white">
                {version?.date ? new Date(version.date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            {hasUpdate && (
              <div className="mt-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-2 text-yellow-400">
                <span className="text-xs font-medium">🔄 Update Available!</span>
                <span className="ml-1 text-[10px] opacity-70">{updateStatus?.latest}</span>
              </div>
            )}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-white/10 bg-gray-900/95" />
        </div>
      </div>

      {/* Right Divider */}
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/5" />
    </div>

    {/* Click hint */}
    <p className="mt-1.5 text-center text-[9px] text-gray-600">
      Click version to manage • Auto-updates enabled
    </p>
  </div>
</div>
      </aside>

      {/* Main */}
      <main className={`${getMainMargin()} min-h-screen`}>
        <header className="sticky top-0 z-30 border-b border-white/10 bg-gray-900/70 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle menu"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gray-800/80 text-white transition-all hover:bg-gray-700 lg:hidden"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div className="hidden min-w-0 lg:block">
                <h2 className="truncate text-lg font-semibold text-white">
                  {dashboardName}
                </h2>
                <p className="truncate text-xs text-gray-400">
                  Welcome back, {session.user?.name}
                </p>
              </div>
              <div className="min-w-0 lg:hidden">
                <h2 className="truncate text-base font-semibold text-white sm:text-lg">
                  Nexus Hub
                </h2>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-3">
              <div className="min-w-0 max-w-[44vw] sm:max-w-none">
                <SearchBar />
              </div>

              <button
  onClick={toggleTheme}
  aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
>
  {isDarkMode ? (
    <Sun size={18} className="text-yellow-400" />
  ) : (
    <Moon size={18} className="text-gray-600" />
  )}
</button>

              {/* ✅ Smart Notification Bell */}
              <SmartNotificationBell />

              <div className="hidden h-6 w-px bg-white/10 md:block" />
              <span className="hidden text-xs text-gray-400 md:block">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>
        <div
          className={
            appearanceSettings.compactMode ? "p-3" : "p-4 sm:p-5 lg:p-6"
          }
        >
          <div
            className={`mx-auto max-w-7xl ${
              appearanceSettings.compactMode ? "space-y-3" : "space-y-5 lg:space-y-6"
            }`}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}