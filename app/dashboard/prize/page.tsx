"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { 
  Trophy, Crown, Medal, Award, Users, DollarSign, 
  TrendingUp, Star, Target, ArrowLeft, RefreshCw,
  Info, Sparkles, ChevronRight, BarChart3
} from "lucide-react"
import PrizeDisplay from "@/components/competition/PrizeDisplay"
import toast from "react-hot-toast"

export default function PrizePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [seasonName, setSeasonName] = useState("")

  useEffect(() => {
    fetchSeasonInfo()
  }, [])

  async function fetchSeasonInfo() {
    try {
      const res = await fetch("/api/seasons")
      if (!res.ok) throw new Error("Failed to fetch season")
      const data = await res.json()
      const activeSeason = data.find((s: any) => s.isActive)
      if (activeSeason) {
        setSeasonName(activeSeason.name)
      }
    } catch (error) {
      console.error("Error fetching season:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-7 w-7 text-yellow-400" />
            Prize Pool
          </h1>
          <p className="text-gray-400 text-sm">
            {seasonName || "Current Season"} • See what you're playing for
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-400 font-medium">How Prize Pool Works</p>
          <p className="text-xs text-gray-400">
            The prize pool is calculated from entry fees paid by all registered players.
            The higher you finish, the bigger your reward!
          </p>
        </div>
      </div>

      {/* Prize Display */}
      <PrizeDisplay compact={false} showDetails={true} />

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Why This Matters</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              Every player contributes to the prize pool
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              Top 3 players win cash prizes
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              Top scorer wins a bonus prize
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              Higher rank = bigger reward
            </li>
          </ul>
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-white">Tips to Win</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">🏆</span>
              Win more matches to climb the rankings
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">⚽</span>
              Score goals to win the top scorer bonus
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">📈</span>
              Stay consistent with your performance
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">🎯</span>
              Focus on both winning and scoring
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Link
          href="/dashboard/standings"
          className="bg-gray-800/50 hover:bg-gray-700 rounded-xl p-3 border border-gray-700 transition-all group text-center"
        >
          <TrendingUp className="h-5 w-5 text-blue-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-medium text-white">View Standings</p>
          <p className="text-[10px] text-gray-500">See your current rank</p>
        </Link>
        <Link
          href="/dashboard/fixtures"
          className="bg-gray-800/50 hover:bg-gray-700 rounded-xl p-3 border border-gray-700 transition-all group text-center"
        >
          <Trophy className="h-5 w-5 text-yellow-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-medium text-white">My Fixtures</p>
          <p className="text-[10px] text-gray-500">Upcoming matches</p>
        </Link>
        <Link
          href="/dashboard/statistics"
          className="bg-gray-800/50 hover:bg-gray-700 rounded-xl p-3 border border-gray-700 transition-all group text-center"
        >
          <BarChart3 className="h-5 w-5 text-green-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-medium text-white">Statistics</p>
          <p className="text-[10px] text-gray-500">Your performance</p>
        </Link>
      </div>
    </div>
  )
}