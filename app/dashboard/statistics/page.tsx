"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Trophy, Target, Shield, Activity, TrendingUp, Award } from "lucide-react"

interface PlayerStats {
  goals: number
  assists: number
  cleanSheets: number
  manOfTheMatch: number
  matchesPlayed: number
  winRate: number
}

interface LeagueStats {
  rank: number
  totalPlayers: number
  topScorer: { name: string; goals: number }
  mostAssists: { name: string; assists: number }
}

export default function StatisticsPage() {
  const { data: session } = useSession()
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null)
  const [leagueStats, setLeagueStats] = useState<LeagueStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const [statsRes, leagueRes] = await Promise.all([
      fetch("/api/statistics/player"),
      fetch("/api/statistics/league")
    ])
    const statsData = await statsRes.json()
    const leagueData = await leagueRes.json()
    setPlayerStats(statsData)
    setLeagueStats(leagueData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading statistics...</div>
      </div>
    )
  }

  const statCards = [
    { name: "Matches Played", value: playerStats?.matchesPlayed || 0, icon: Activity, color: "bg-blue-500" },
    { name: "Goals", value: playerStats?.goals || 0, icon: Target, color: "bg-green-500" },
    { name: "Assists", value: playerStats?.assists || 0, icon: Trophy, color: "bg-yellow-500" },
    { name: "Clean Sheets", value: playerStats?.cleanSheets || 0, icon: Shield, color: "bg-purple-500" },
    { name: "Man of the Match", value: playerStats?.manOfTheMatch || 0, icon: Award, color: "bg-pink-500" },
    { name: "Win Rate", value: `${playerStats?.winRate || 0}%`, icon: TrendingUp, color: "bg-indigo-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Statistics</h1>
        <p className="text-gray-400 mt-1">Your performance metrics and league leaders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">{stat.name}</span>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* League Leaders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" />
            League Leaders
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
              <span className="text-gray-400">Top Scorer</span>
              <span className="text-white font-semibold">
                {leagueStats?.topScorer?.name || "—"} ({leagueStats?.topScorer?.goals || 0} goals)
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
              <span className="text-gray-400">Most Assists</span>
              <span className="text-white font-semibold">
                {leagueStats?.mostAssists?.name || "—"} ({leagueStats?.mostAssists?.assists || 0} assists)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Your Rank</span>
              <span className="text-white font-semibold">
                #{leagueStats?.rank || "—"} of {leagueStats?.totalPlayers || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award size={20} className="text-purple-500" />
            Recent Achievements
          </h2>
          <div className="text-center py-8 text-gray-400">
            <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No achievements yet</p>
            <p className="text-sm mt-1">Complete matches to earn achievements!</p>
          </div>
        </div>
      </div>

      {/* Season Progress */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Season Progress</h2>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Matches Completed</span>
              <span className="text-white">{playerStats?.matchesPlayed || 0}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min((playerStats?.matchesPlayed || 0) * 10, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}