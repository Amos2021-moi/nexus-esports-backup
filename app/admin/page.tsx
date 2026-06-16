"use client"

import { useEffect, useState } from "react"
import { Users, Trophy, Calendar, CheckCircle, TrendingUp, Award, Eye, Activity, Zap } from "lucide-react"
import Link from "next/link"

interface Stats {
  totalPlayers: number
  activeSeasons: number
  totalFixtures: number
  completedResults: number
  pendingResults: number
  totalAwards: number
}

interface ActivityItem {
  id: string
  action: string
  description: string
  user: string
  time: string
  type: string
  icon: string
}

interface HealthIndicators {
  pendingResults: number
  unscheduledFixtures: number
  missingSquadUploads: number
  inactivePlayers: number
  totalPlayers: number
  completionRate: number
  avgApprovalTime: number
  seasonName: string
  totalFixtures: number
  completedFixtures: number
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalPlayers: 0,
    activeSeasons: 0,
    totalFixtures: 0,
    completedResults: 0,
    pendingResults: 0,
    totalAwards: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [health, setHealth] = useState<HealthIndicators>({
    pendingResults: 0,
    unscheduledFixtures: 0,
    missingSquadUploads: 0,
    inactivePlayers: 0,
    totalPlayers: 0,
    completionRate: 0,
    avgApprovalTime: 0,
    seasonName: "No Active Season",
    totalFixtures: 0,
    completedFixtures: 0
  })

  useEffect(() => {
    fetchStats()
    fetchRecentActivity()
    fetchHealthIndicators()
  }, [])

  async function fetchStats() {
    const res = await fetch("/api/admin/stats")
    const data = await res.json()
    setStats(data)
  }

  async function fetchRecentActivity() {
    const res = await fetch("/api/admin/recent-activity")
    const data = await res.json()
    setRecentActivity(data)
  }

  async function fetchHealthIndicators() {
    const res = await fetch("/api/admin/health")
    const data = await res.json()
    setHealth(data)
    setLoading(false)
  }

  const statCards = [
    { name: "Total Players", value: stats.totalPlayers, icon: Users, color: "from-blue-500 to-cyan-500", change: "+12%", href: "/admin/players" },
    { name: "Active Seasons", value: stats.activeSeasons, icon: Trophy, color: "from-yellow-500 to-orange-500", change: "+2", href: "/admin/seasons" },
    { name: "Total Fixtures", value: stats.totalFixtures, icon: Calendar, color: "from-green-500 to-emerald-500", change: "+24", href: "/admin/league" },
    { name: "Completed", value: stats.completedResults, icon: CheckCircle, color: "from-purple-500 to-pink-500", change: "+8", href: "/admin/results" },
    { name: "Pending", value: stats.pendingResults, icon: Eye, color: "from-orange-500 to-red-500", change: "+3", href: "/admin/results" },
    { name: "Awards", value: stats.totalAwards, icon: Award, color: "from-indigo-500 to-purple-500", change: "+4", href: "/admin/awards" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-sm p-6 border border-white/10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Good morning, Admin! 👋</h1>
            <p className="text-gray-400 mt-1">Here's what's happening in Nexus Esports League.</p>
          </div>
          <div className="flex gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-xs text-gray-400">Live Updates</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.name} href={stat.href} className="block group">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-indigo-500/50 transition-all duration-200 group-hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className={`bg-gradient-to-r ${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-green-400">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.name}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Health Indicators */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-400" />
          League Health
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-yellow-500/20">
            <p className="text-2xl font-bold text-yellow-400">{health.pendingResults}</p>
            <p className="text-xs text-gray-400">Pending Results</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-blue-500/20">
            <p className="text-2xl font-bold text-blue-400">{health.unscheduledFixtures}</p>
            <p className="text-xs text-gray-400">Unscheduled</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-orange-500/20">
            <p className="text-2xl font-bold text-orange-400">{health.missingSquadUploads}</p>
            <p className="text-xs text-gray-400">Missing Squads</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-red-500/20">
            <p className="text-2xl font-bold text-red-400">{health.inactivePlayers}</p>
            <p className="text-xs text-gray-400">Inactive Players</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-green-500/20">
            <p className="text-2xl font-bold text-green-400">{health.completionRate}%</p>
            <p className="text-xs text-gray-400">Completion Rate</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-purple-500/20">
            <p className="text-2xl font-bold text-purple-400">{health.avgApprovalTime}h</p>
            <p className="text-xs text-gray-400">Avg Approval</p>
          </div>
        </div>
        <div className="mt-3 text-center text-xs text-gray-500">
          Season: {health.seasonName} • {health.completedFixtures}/{health.totalFixtures} matches completed
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-gray-800/30 rounded-xl border border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/admin/seasons" className="text-center p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all">
              <Trophy className="h-5 w-5 text-white mx-auto mb-1" />
              <span className="text-xs text-white">New Season</span>
            </Link>
            <Link href="/admin/league" className="text-center p-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all">
              <Calendar className="h-5 w-5 text-white mx-auto mb-1" />
              <span className="text-xs text-white">Gen Fixtures</span>
            </Link>
            <Link href="/admin/results" className="text-center p-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 transition-all">
              <CheckCircle className="h-5 w-5 text-white mx-auto mb-1" />
              <span className="text-xs text-white">Approve</span>
            </Link>
            <Link href="/admin/awards" className="text-center p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all">
              <Award className="h-5 w-5 text-white mx-auto mb-1" />
              <span className="text-xs text-white">New Award</span>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            System Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Database</span>
              <span className="text-sm text-green-400 flex items-center gap-1">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">API Status</span>
              <span className="text-sm text-green-400">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Last Backup</span>
              <span className="text-sm text-gray-400">Today, 02:00 AM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Uptime</span>
              <span className="text-sm text-gray-400">99.9%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-400" />
          Recent Activity
        </h2>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent activity
            </div>
          ) : (
            recentActivity.map((activity: ActivityItem) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                <div>
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                  <p className="text-xs text-gray-600 mt-0.5">by {activity.user}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(activity.time).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}