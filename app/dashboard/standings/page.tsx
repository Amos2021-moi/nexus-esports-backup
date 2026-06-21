"use client"

import { useEffect, useState } from "react"
import LeagueTable from "@/components/league/LeagueTable"
import Link from "next/link"
import { Trophy, Calendar, TrendingUp, Archive, EyeOff } from "lucide-react"
import { SkeletonLeagueTable, Skeleton } from "@/components/ui/Skeleton"

interface Season {
  id: string
  name: string
  isActive: boolean
  status: string
}

export default function StandingsPage() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [privacySettings, setPrivacySettings] = useState<{ showStats: boolean }>({ showStats: true })

  useEffect(() => {
    async function fetchSeasons() {
      try {
        const response = await fetch("/api/seasons")
        const data = await response.json()
        const seasonsArray = Array.isArray(data) ? data : []
        setSeasons(seasonsArray)
        const activeSeason = seasonsArray.find((s: Season) => s.isActive)
        if (activeSeason) {
          setSelectedSeason(activeSeason.id)
        } else if (seasonsArray.length > 0) {
          setSelectedSeason(seasonsArray[0].id)
        }
      } catch (error) {
        console.error("Error fetching seasons:", error)
        setSeasons([])
      } finally {
        setLoading(false)
      }
    }

    fetchSeasons()
    fetchPrivacySettings()
  }, [])

  async function fetchPrivacySettings() {
    try {
      const res = await fetch("/api/settings?category=privacy")
      if (res.ok) {
        const data = await res.json()
        setPrivacySettings({
          showStats: data.showStats !== undefined ? data.showStats : true
        })
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="text" className="w-64 h-4 mt-1" />
        </div>
        <SkeletonLeagueTable />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Trophy className="h-7 w-7 text-yellow-500" />
          League Standings
        </h1>
        <p className="text-gray-400 mt-1">Premier League style rankings</p>
      </div>

      {/* ✅ Privacy Warning - Show if stats are hidden */}
      {!privacySettings.showStats && (
        <div className="bg-yellow-500/10 rounded-xl border border-yellow-500/20 p-4">
          <div className="flex items-start gap-3">
            <EyeOff className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <h3 className="text-yellow-400 font-semibold">Your Stats are Hidden</h3>
              <p className="text-gray-300 text-sm">
                Your player statistics are currently private. You can change this in your 
                <a href="/dashboard/settings/privacy" className="text-indigo-400 hover:underline ml-1">Privacy Settings</a>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Season Selector */}
      {seasons.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Season:
          </label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name} {season.isActive && "⭐ (Active)"}
              </option>
            ))}
          </select>
          <div className="flex-1"></div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <TrendingUp className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* League Table - ✅ Show or hide based on privacy */}
      {selectedSeason ? (
        privacySettings.showStats ? (
          <div className="bg-gray-800/30 rounded-xl overflow-hidden border border-gray-700">
            <LeagueTable seasonId={selectedSeason} />
          </div>
        ) : (
          <div className="bg-gray-800/30 rounded-xl p-12 text-center border border-gray-700">
            <EyeOff className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Stats are Private</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Your player statistics are currently hidden. You can change this in your privacy settings.
            </p>
            <Link
              href="/dashboard/settings/privacy"
              className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 transition-all"
            >
              Go to Privacy Settings →
            </Link>
          </div>
        )
      ) : (
        <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400 border border-gray-700">
          No seasons available.
        </div>
      )}

      {/* Season Archive Link */}
      {selectedSeason && (
        <div className="flex justify-end">
          <Link
            href={`/seasons/${selectedSeason}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors text-sm border border-gray-700"
          >
            <Archive size={16} />
            View Season Archive →
          </Link>
        </div>
      )}

      {/* Rules Card */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Trophy className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-400">League Rules</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm text-gray-300">
              <div>✓ Win = <span className="font-bold text-green-400">3 points</span></div>
              <div>✓ Draw = <span className="font-bold text-yellow-400">1 point</span></div>
              <div>✓ Loss = <span className="font-bold text-red-400">0 points</span></div>
              <div>✓ Ranking: Points → Goal Difference → Goals Scored</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}