"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Trophy, Users, Calendar, Award, TrendingUp, Clock, CheckCircle, Target, Shield, EyeOff } from "lucide-react"
import Link from "next/link"
import TrustBadge from "@/components/ui/TrustBadge"
import { SkeletonStats, Skeleton } from "@/components/ui/Skeleton"

interface DashboardData {
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  winRate: number
  currentRank: number
  totalPlayers: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  nextFixture: {
    id: string
    opponent: string
    date: string
    isHome: boolean
  } | null
  recentResult: {
    opponent: string
    score: string
    result: string
  } | null
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLastSeen, setShowLastSeen] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchPrivacySettings()
  }, [])

  async function fetchDashboardData() {
    try {
      const res = await fetch("/api/dashboard/stats")
      const dashboardData = await res.json()
      setData(dashboardData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchPrivacySettings() {
    try {
      const res = await fetch("/api/settings?category=privacy&key=showLastSeen")
      if (res.ok) {
        const data = await res.json()
        setShowLastSeen(data.showLastSeen !== undefined ? data.showLastSeen : true)
      }
    } catch (error) {
      console.error("Error fetching privacy:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Welcome Section Skeleton */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/30 backdrop-blur-sm p-6 border border-white/10">
          <Skeleton variant="text" className="w-64 h-8" />
          <Skeleton variant="text" className="w-48 h-4 mt-2" />
          <Skeleton variant="text" className="w-32 h-5 mt-2" />
        </div>
        
        {/* Stats Grid Skeleton */}
        <SkeletonStats />
        
        {/* Goal Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton variant="avatar" className="h-4 w-4" />
                <Skeleton variant="text" className="w-20 h-3" />
              </div>
              <Skeleton variant="text" className="w-16 h-7" />
            </div>
          ))}
        </div>
        
        {/* Fixture & Result Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-48" />
        </div>
        
        {/* Standings Preview Skeleton */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
            <Skeleton variant="text" className="w-40 h-6" />
            <Skeleton variant="text" className="w-16 h-4" />
          </div>
          <div className="p-5 text-center">
            <Skeleton variant="text" className="w-48 h-6 mx-auto" />
            <Skeleton variant="text" className="w-32 h-4 mx-auto mt-4" />
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    { name: "Matches Played", value: data?.matchesPlayed || 0, icon: Calendar, color: "from-blue-500 to-cyan-500", change: "This season" },
    { name: "Win Rate", value: `${data?.winRate || 0}%`, icon: TrendingUp, color: "from-green-500 to-emerald-500", change: `${data?.wins || 0}W ${data?.draws || 0}D ${data?.losses || 0}L` },
    { name: "Current Rank", value: data?.currentRank ? `#${data.currentRank}` : "-", icon: Trophy, color: "from-yellow-500 to-orange-500", change: `of ${data?.totalPlayers || 0} players` },
    { name: "Total Points", value: data?.points || 0, icon: Award, color: "from-purple-500 to-pink-500", change: `${data?.wins || 0}W ${data?.draws || 0}D ${data?.losses || 0}L` },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/30 backdrop-blur-sm p-6 border border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {session?.user?.name}! 👋</h1>
          <p className="text-gray-300 mt-1">Ready for your next match? Check your fixtures below.</p>
          
          {/* ✅ Last Active Trust Badge - Check privacy setting */}
          <div className="mt-2">
            {showLastSeen ? (
              <TrustBadge type="last-active" value={(session?.user as any)?.lastActive} userId={session?.user?.id} />
            ) : (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-500/10 text-gray-500 rounded-full text-xs">
                <EyeOff size={10} />
                <span>Last seen hidden</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Privacy Warning - Show if last seen is hidden */}
      {!showLastSeen && (
        <div className="bg-yellow-500/10 rounded-xl border border-yellow-500/20 p-3">
          <div className="flex items-start gap-2">
            <EyeOff className="h-4 w-4 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-xs text-yellow-400">
                Your "last seen" status is currently hidden. 
                <a href="/dashboard/settings/privacy" className="text-indigo-400 hover:underline ml-1">
                  Change privacy settings →
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div className={`bg-gradient-to-r ${stat.color} p-2.5 rounded-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-300 mt-3">{stat.name}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Goal Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-400" />
            <span className="text-xs text-gray-400">Goals For</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.goalsFor || 0}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-red-400" />
            <span className="text-xs text-gray-400">Goals Against</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.goalsAgainst || 0}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-xs text-gray-400">Goal Difference</span>
          </div>
          <p className={`text-2xl font-bold ${(data?.goalDifference || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
            {(data?.goalDifference || 0) >= 0 ? `+${data?.goalDifference}` : data?.goalDifference}
          </p>
        </div>
      </div>

      {/* Upcoming Fixture & Recent Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Fixture */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Next Fixture
            </h2>
            <Clock size={16} className="text-gray-500" />
          </div>
          {data?.nextFixture ? (
            <div className="p-5 text-center">
              <p className="text-white font-semibold mb-1">
                vs {data.nextFixture.opponent}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {data.nextFixture.isHome ? "🏠 Home" : "✈️ Away"}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {new Date(data.nextFixture.date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <Link
                href={`/dashboard/fixtures`}
                className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all"
              >
                View Match
              </Link>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-400">No upcoming fixtures</p>
            </div>
          )}
        </div>

        {/* Recent Result */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Recent Result
            </h2>
            <Trophy size={16} className="text-gray-500" />
          </div>
          {data?.recentResult ? (
            <div className="p-5 text-center">
              <p className="text-white font-semibold mb-1">
                vs {data.recentResult.opponent}
              </p>
              <p className="text-2xl font-bold text-white mb-2">{data.recentResult.score}</p>
              <p className={`text-sm font-medium ${data.recentResult.result === "W" ? "text-green-400" : data.recentResult.result === "D" ? "text-yellow-400" : "text-red-400"}`}>
                {data.recentResult.result === "W" ? "Victory! 🎉" : data.recentResult.result === "D" ? "Draw 🤝" : "Loss 😔"}
              </p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-400">No recent results</p>
            </div>
          )}
        </div>
      </div>

      {/* League Table Preview */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            League Standings
          </h2>
          <Users size={16} className="text-gray-500" />
        </div>
        <div className="p-5 text-center">
          <p className="text-gray-300">
            Current Rank: <span className="font-bold text-white text-xl">#{data?.currentRank || "-"}</span>
            <span className="text-gray-500"> of {data?.totalPlayers || 0} players</span>
          </p>
          <Link
            href="/dashboard/standings"
            className="inline-block mt-4 text-indigo-400 text-sm hover:text-indigo-300 transition-all"
          >
            View Full Standings →
          </Link>
        </div>
      </div>
    </div>
  )
}