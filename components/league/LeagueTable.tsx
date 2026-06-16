"use client"

import { useEffect, useState } from "react"
import { Trophy, TrendingUp, TrendingDown, Minus, Medal } from "lucide-react"

interface LeagueEntry {
  id: string
  playerId: string
  playerName: string
  username: string
  profilePicture?: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export default function LeagueTable({ seasonId }: { seasonId: string }) {
  const [entries, setEntries] = useState<LeagueEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTable() {
      try {
        const response = await fetch(`/api/league/table?seasonId=${seasonId}`)
        const data = await response.json()
        setEntries(data)
      } catch (error) {
        console.error("Error fetching league table:", error)
      } finally {
        setLoading(false)
      }
    }

    if (seasonId) {
      fetchTable()
    }
  }, [seasonId])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-400">Loading league table...</div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No league data available yet.
      </div>
    )
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />
    return null
  }

  const generateForm = () => {
    return ["W", "D", "L", "W", "D"].map((r, i) => (
      <span 
        key={i} 
        className={`inline-block w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mx-0.5 ${
          r === "W" ? "bg-green-500/20 text-green-400" : 
          r === "D" ? "bg-yellow-500/20 text-yellow-400" : 
          "bg-red-500/20 text-red-400"
        }`}
      >
        {r}
      </span>
    ))
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-800/50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Player</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">P</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">W</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">D</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">L</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">GF</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">GA</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">GD</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-12">Pts</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider w-8">Form</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {entries.map((entry, index) => {
            const isTop3 = index < 3
            const isBottom3 = index >= entries.length - 3
            const rowBg = isTop3 ? "bg-gradient-to-r from-green-500/5 to-transparent" : isBottom3 ? "bg-gradient-to-r from-red-500/5 to-transparent" : ""
            
            return (
              <tr key={entry.id} className={`hover:bg-gray-700/30 transition-colors ${rowBg}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${index < 3 ? "text-yellow-500" : "text-gray-300"}`}>
                      {index + 1}
                    </span>
                    {getRankIcon(index)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {entry.profilePicture ? (
                      <img 
                        src={entry.profilePicture} 
                        alt={entry.username}
                        className="h-8 w-8 rounded-full object-cover border border-gray-600"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-white text-sm">{entry.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-gray-300 font-medium">{entry.played}</td>
                <td className="px-4 py-3 text-center text-green-400 font-semibold">{entry.wins}</td>
                <td className="px-4 py-3 text-center text-yellow-400 font-semibold">{entry.draws}</td>
                <td className="px-4 py-3 text-center text-red-400 font-semibold">{entry.losses}</td>
                <td className="px-4 py-3 text-center text-gray-300">{entry.goalsFor}</td>
                <td className="px-4 py-3 text-center text-gray-300">{entry.goalsAgainst}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-bold ${entry.goalDifference >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {entry.goalDifference}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-bold text-white text-lg">{entry.points}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-0.5">
                    {generateForm()}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      
      <div className="mt-4 pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
        Points: Win = 3, Draw = 1, Loss = 0
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="text-gray-400">Champions League</span>
        </div>
        <div className="flex items-center gap-2">
          <Medal className="h-4 w-4 text-gray-400" />
          <span className="text-gray-400">European Qualification</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500/20 rounded"></div>
          <span className="text-gray-400">W = Win</span>
          <div className="w-3 h-3 bg-yellow-500/20 rounded ml-2"></div>
          <span className="text-gray-400">D = Draw</span>
          <div className="w-3 h-3 bg-red-500/20 rounded ml-2"></div>
          <span className="text-gray-400">L = Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-gray-400">Rising</span>
          <TrendingDown className="h-4 w-4 text-red-500 ml-2" />
          <span className="text-gray-400">Dropping</span>
        </div>
      </div>
    </div>
  )
}