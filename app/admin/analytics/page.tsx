"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Users, Trophy, Calendar, Award, Shield, Activity,
  TrendingUp, TrendingDown, BarChart3, LineChart,
  CheckCircle, Clock, Zap, Sparkles, Crown,
  UserPlus, Eye, RefreshCw
} from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import toast from "react-hot-toast"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  Filler
)

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    newUsersThisWeek: number
    totalFixtures: number
    completedFixtures: number
    pendingResults: number
    totalTournaments: number
    activeTournaments: number
    totalAwards: number
    totalSeasons: number
    completionRate: number
  }
  userGrowth: { date: string; count: number }[]
  recentActivity: {
    id: string
    action: string
    targetType: string
    targetId: string
    details: any
    createdAt: string
    user: { name: string; email: string } | null
  }[]
  recentMatches: {
    id: string
    homePlayer: string
    awayPlayer: string
    score: string | null
    status: string
    date: string
  }[]
  topPlayers: {
    id: string
    name: string
    points: number
    wins: number
    draws: number
    losses: number
  }[]
}

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchAnalytics()
    }
  }, [session])

  async function fetchAnalytics() {
    try {
      const res = await fetch("/api/admin/analytics")
      const analyticsData = await res.json()
      setData(analyticsData)
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast.error("Failed to load analytics")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalytics()
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== "ADMIN") {
    return null
  }

  // ✅ Safe check for data before rendering stats
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  // ✅ Safe stats with optional chaining
  const stats = [
    { name: "Total Users", value: data?.overview?.totalUsers || 0, icon: Users, color: "from-blue-500 to-cyan-500" },
    { name: "Active Users (30d)", value: data?.overview?.activeUsers || 0, icon: Activity, color: "from-green-500 to-emerald-500" },
    { name: "New Users (7d)", value: data?.overview?.newUsersThisWeek || 0, icon: UserPlus, color: "from-purple-500 to-pink-500" },
    { name: "Total Matches", value: data?.overview?.totalFixtures || 0, icon: Calendar, color: "from-indigo-500 to-blue-500" },
    { name: "Completion Rate", value: `${data?.overview?.completionRate || 0}%`, icon: CheckCircle, color: "from-green-500 to-teal-500" },
    { name: "Pending Results", value: data?.overview?.pendingResults || 0, icon: Clock, color: "from-yellow-500 to-orange-500" },
    { name: "Tournaments", value: data?.overview?.totalTournaments || 0, icon: Trophy, color: "from-amber-500 to-yellow-500" },
    { name: "Awards Given", value: data?.overview?.totalAwards || 0, icon: Award, color: "from-rose-500 to-red-500" },
  ]

  // ✅ Safe chart data
  const growthData = {
    labels: data?.userGrowth?.map((item: any) => new Date(item.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'New Users',
        data: data?.userGrowth?.map((item: any) => item.count) || [],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  }

  // ✅ Safe match status data
  const matchStatusData = {
    labels: ['Completed', 'Pending', 'Scheduled'],
    datasets: [
      {
        data: [
          data?.overview?.completedFixtures || 0,
          data?.overview?.pendingResults || 0,
          (data?.overview?.totalFixtures || 0) - (data?.overview?.completedFixtures || 0) - (data?.overview?.pendingResults || 0)
        ],
        backgroundColor: ['#22C55E', '#EAB308', '#6B7280'],
        borderWidth: 0,
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Platform overview and performance metrics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className={`bg-gradient-to-r ${stat.color} p-2 rounded-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <LineChart className="h-4 w-4 text-indigo-400" />
            User Growth (Last 30 Days)
          </h3>
          <div className="h-[250px]">
            <Line 
              data={growthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: '#9CA3AF',
                      font: { size: 10 }
                    }
                  }
                },
                scales: {
                  x: {
                    grid: { color: '#374151' },
                    ticks: { color: '#9CA3AF', font: { size: 8 } }
                  },
                  y: {
                    grid: { color: '#374151' },
                    ticks: { color: '#9CA3AF', font: { size: 10 } }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Match Status Chart */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            Match Status Distribution
          </h3>
          <div className="h-[250px] flex items-center justify-center">
            <div className="w-[200px] h-[200px]">
              <Doughnut 
                data={matchStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#9CA3AF',
                        font: { size: 10 },
                        padding: 10
                      }
                    }
                  },
                  cutout: '60%'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Players */}
      {data?.topPlayers && data.topPlayers.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-400" />
            Top Players
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2 font-medium">#</th>
                  <th className="pb-2 font-medium">Player</th>
                  <th className="pb-2 font-medium text-center">Points</th>
                  <th className="pb-2 font-medium text-center">W</th>
                  <th className="pb-2 font-medium text-center">D</th>
                  <th className="pb-2 font-medium text-center">L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.topPlayers.map((player, index) => (
                  <tr key={player.id} className="text-gray-300">
                    <td className="py-2">
                      <span className={`font-bold ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : index === 2 ? "text-amber-600" : "text-gray-500"}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-2 text-white">{player.name}</td>
                    <td className="py-2 text-center font-bold text-white">{player.points}</td>
                    <td className="py-2 text-center text-green-400">{player.wins}</td>
                    <td className="py-2 text-center text-yellow-400">{player.draws}</td>
                    <td className="py-2 text-center text-red-400">{player.losses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {data?.recentActivity && data.recentActivity.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {data.recentActivity.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{activity.action.replace(/_/g, " ")}</span>
                  <span className="text-sm text-gray-300">
                    {activity.user?.name || "System"}
                  </span>
                  <span className="text-xs text-gray-500">{activity.targetType}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(activity.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Matches */}
      {data?.recentMatches && data.recentMatches.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-400" />
            Recent Matches
          </h3>
          <div className="space-y-2">
            {data.recentMatches.map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white">{match.homePlayer}</span>
                  <span className="text-sm text-gray-500">vs</span>
                  <span className="text-sm text-white">{match.awayPlayer}</span>
                  {match.score && (
                    <span className="text-sm font-bold text-white">{match.score}</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(match.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}