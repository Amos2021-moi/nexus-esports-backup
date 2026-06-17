"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { 
  Trophy, Users, Calendar, Award, Shield, TrendingUp, 
  Target, Activity, CheckCircle, XCircle, MinusCircle,
  Star, Crown, Sparkles, ChevronDown, BarChart3,
  LineChart, PieChart
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

// Register ChartJS components
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

interface PlayerStats {
  profile: {
    username: string
    profilePicture: string
    trustScore: number
    verifiedBadge: boolean
  }
  seasonStats: {
    played: number
    wins: number
    draws: number
    losses: number
    points: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
    winRate: number
    season: {
      id: string
      name: string
      status: string
    }
  } | null
  careerStats: {
    matches: number
    wins: number
    draws: number
    losses: number
    points: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
    winRate: number
  }
  awards: {
    id: string
    name: string
    category: string
    icon: string
    description: string
    awardedAt: string
    season: { name: string }
  }[]
  seasons: {
    id: string
    name: string
    status: string
    points: number
    played: number
    wins: number
    draws: number
    losses: number
  }[]
  totalSeasons: number
}

interface MatchHistory {
  matches: {
    id: string
    opponentName: string
    opponentId: string
    isHome: boolean
    scheduledDate: string
    status: string
    result: string
    score: string
    myScore: number
    opponentScore: number
    seasonName: string
    approved: boolean
  }[]
  summary: {
    total: number
    completed: number
    wins: number
    draws: number
    losses: number
    pending: number
    winRate: number
  }
  form: string
}

interface H2HStats {
  opponentId: string
  opponentName: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  lastMatch: string | null
  winRate: number
}

export default function StatisticsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState<string>("all")
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [matchHistory, setMatchHistory] = useState<MatchHistory | null>(null)
  const [h2hStats, setH2hStats] = useState<H2HStats[]>([])
  const [seasons, setSeasons] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetchAllData()
  }, [selectedSeason])

  async function fetchAllData() {
    setLoading(true)
    try {
      const seasonParam = selectedSeason !== "all" ? `?seasonId=${selectedSeason}` : ""

      // Fetch player stats
      const statsRes = await fetch(`/api/statistics/player${seasonParam}`)
      const statsData = await statsRes.json()
      setStats(statsData)

      // Extract seasons from stats
      if (statsData.seasons) {
        setSeasons(statsData.seasons.map((s: any) => ({ id: s.id, name: s.name })))
      }

      // Fetch match history
      const matchesRes = await fetch(`/api/statistics/matches${seasonParam}`)
      const matchesData = await matchesRes.json()
      setMatchHistory(matchesData)

      // Fetch head-to-head stats
      const h2hRes = await fetch(`/api/statistics/h2h${seasonParam}`)
      const h2hData = await h2hRes.json()
      setH2hStats(h2hData)

    } catch (error) {
      console.error("Error fetching statistics:", error)
      toast.error("Failed to load statistics")
    } finally {
      setLoading(false)
    }
  }

  // Get current season stats
  const currentSeasonStats = stats?.seasonStats

  // Chart data for performance over time
  const performanceData = {
    labels: matchHistory?.matches.slice(0, 10).map(m => 
      new Date(m.scheduledDate).toLocaleDateString()
    ).reverse() || [],
    datasets: [
      {
        label: 'Goals Scored',
        data: matchHistory?.matches.slice(0, 10).map(m => m.myScore || 0).reverse() || [],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Goals Conceded',
        data: matchHistory?.matches.slice(0, 10).map(m => m.opponentScore || 0).reverse() || [],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  }

  // Chart data for win/loss/draw distribution
  const resultData = {
    labels: ['Wins', 'Draws', 'Losses'],
    datasets: [
      {
        data: [
          matchHistory?.summary.wins || 0,
          matchHistory?.summary.draws || 0,
          matchHistory?.summary.losses || 0
        ],
        backgroundColor: ['#22C55E', '#EAB308', '#EF4444'],
        borderWidth: 0,
      }
    ]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading statistics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
            Player Statistics
          </h1>
          <p className="text-gray-400 mt-1">Track your performance and progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Seasons</option>
            {seasons.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
          <Activity className="h-5 w-5 text-blue-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{currentSeasonStats?.played || stats?.careerStats.matches || 0}</p>
          <p className="text-xs text-gray-400">Matches</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
          <CheckCircle className="h-5 w-5 text-green-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{currentSeasonStats?.wins || stats?.careerStats.wins || 0}</p>
          <p className="text-xs text-gray-400">Wins</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
          <MinusCircle className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{currentSeasonStats?.draws || stats?.careerStats.draws || 0}</p>
          <p className="text-xs text-gray-400">Draws</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
          <XCircle className="h-5 w-5 text-red-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{currentSeasonStats?.losses || stats?.careerStats.losses || 0}</p>
          <p className="text-xs text-gray-400">Losses</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
          <Trophy className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{currentSeasonStats?.points || stats?.careerStats.points || 0}</p>
          <p className="text-xs text-gray-400">Points</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
          <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{currentSeasonStats?.winRate || stats?.careerStats.winRate || 0}%</p>
          <p className="text-xs text-gray-400">Win Rate</p>
        </div>
      </div>

      {/* Goals Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20 text-center">
          <Target className="h-5 w-5 text-blue-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-blue-400">{currentSeasonStats?.goalsFor || stats?.careerStats.goalsFor || 0}</p>
          <p className="text-xs text-gray-400">Goals For</p>
        </div>
        <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20 text-center">
          <Shield className="h-5 w-5 text-red-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-red-400">{currentSeasonStats?.goalsAgainst || stats?.careerStats.goalsAgainst || 0}</p>
          <p className="text-xs text-gray-400">Goals Against</p>
        </div>
        <div className={`${(currentSeasonStats?.goalDifference || stats?.careerStats.goalDifference || 0) >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"} rounded-xl p-4 border text-center`}>
          <Target className={`h-5 w-5 ${(currentSeasonStats?.goalDifference || stats?.careerStats.goalDifference || 0) >= 0 ? "text-green-400" : "text-red-400"} mx-auto mb-1`} />
          <p className={`text-xl font-bold ${(currentSeasonStats?.goalDifference || stats?.careerStats.goalDifference || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
            {(currentSeasonStats?.goalDifference || stats?.careerStats.goalDifference || 0) >= 0 ? "+" : ""}
            {currentSeasonStats?.goalDifference || stats?.careerStats.goalDifference || 0}
          </p>
          <p className="text-xs text-gray-400">Goal Difference</p>
        </div>
        <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20 text-center">
          <Activity className="h-5 w-5 text-purple-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-purple-400">
            {currentSeasonStats?.played || stats?.careerStats.matches || 0 > 0 
              ? ((currentSeasonStats?.goalsFor || stats?.careerStats.goalsFor || 0) / (currentSeasonStats?.played || stats?.careerStats.matches || 1)).toFixed(2)
              : "0.00"}
          </p>
          <p className="text-xs text-gray-400">Goals Per Match</p>
        </div>
      </div>

      {/* Form Indicator */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 font-medium">Form (Last 5):</span>
          <div className="flex gap-1">
            {matchHistory?.form.split("").map((letter, i) => (
              <span 
                key={i} 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  letter === "W" ? "bg-green-500/20 text-green-400" :
                  letter === "D" ? "bg-yellow-500/20 text-yellow-400" :
                  letter === "L" ? "bg-red-500/20 text-red-400" :
                  "bg-gray-600/20 text-gray-400"
                }`}
              >
                {letter}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">{matchHistory?.summary.wins || 0}W - {matchHistory?.summary.draws || 0}D - {matchHistory?.summary.losses || 0}L</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <LineChart className="h-4 w-4 text-indigo-400" />
            Performance Trend
          </h3>
          <div className="h-[200px]">
            <Line 
              data={performanceData} 
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

        {/* Result Distribution */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-indigo-400" />
            Result Distribution
          </h3>
          <div className="h-[200px] flex items-center justify-center">
            <div className="w-[180px] h-[180px]">
              <Doughnut 
                data={resultData} 
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

      {/* Awards Section */}
      {stats?.awards && stats.awards.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-400" />
            Awards & Achievements
          </h3>
          <div className="flex flex-wrap gap-3">
            {stats.awards.map((award) => (
              <div key={award.id} className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-white">{award.name}</span>
                <span className="text-xs text-gray-400">• {award.season.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Head-to-Head Section */}
      {h2hStats.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            Head-to-Head Records
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2 font-medium">Opponent</th>
                  <th className="pb-2 font-medium text-center">Played</th>
                  <th className="pb-2 font-medium text-center">W</th>
                  <th className="pb-2 font-medium text-center">D</th>
                  <th className="pb-2 font-medium text-center">L</th>
                  <th className="pb-2 font-medium text-center">GF</th>
                  <th className="pb-2 font-medium text-center">GA</th>
                  <th className="pb-2 font-medium text-center">GD</th>
                  <th className="pb-2 font-medium text-center">Win %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {h2hStats.slice(0, 10).map((stat) => (
                  <tr key={stat.opponentId} className="text-gray-300">
                    <td className="py-2 text-white">{stat.opponentName}</td>
                    <td className="py-2 text-center">{stat.played}</td>
                    <td className="py-2 text-center text-green-400">{stat.wins}</td>
                    <td className="py-2 text-center text-yellow-400">{stat.draws}</td>
                    <td className="py-2 text-center text-red-400">{stat.losses}</td>
                    <td className="py-2 text-center">{stat.goalsFor}</td>
                    <td className="py-2 text-center">{stat.goalsAgainst}</td>
                    <td className={`py-2 text-center ${stat.goalDifference >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {stat.goalDifference >= 0 ? "+" : ""}{stat.goalDifference}
                    </td>
                    <td className="py-2 text-center text-blue-400">{stat.winRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Career Stats Summary */}
      {stats?.totalSeasons && stats.totalSeasons > 1 && selectedSeason === "all" && (
        <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-xl p-6 border border-indigo-500/20">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            Career Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{stats.careerStats.matches}</p>
              <p className="text-xs text-gray-400">Total Matches</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.careerStats.wins}</p>
              <p className="text-xs text-gray-400">Total Wins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.careerStats.points}</p>
              <p className="text-xs text-gray-400">Total Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalSeasons}</p>
              <p className="text-xs text-gray-400">Seasons Played</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Matches */}
      {matchHistory?.matches && matchHistory.matches.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-400" />
            Recent Matches
          </h3>
          <div className="space-y-2">
            {matchHistory.matches.slice(0, 10).map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    match.result === "WIN" ? "bg-green-500/20 text-green-400" :
                    match.result === "DRAW" ? "bg-yellow-500/20 text-yellow-400" :
                    match.result === "LOSS" ? "bg-red-500/20 text-red-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>
                    {match.result}
                  </span>
                  <span className="text-sm text-white">
                    vs {match.opponentName}
                  </span>
                  {match.score && (
                    <span className="text-sm font-bold text-white">
                      {match.score}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {match.isHome ? "🏠 Home" : "✈️ Away"}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(match.scheduledDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}