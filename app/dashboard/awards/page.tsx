"use client"

import { useEffect, useState } from "react"
import { Trophy, Award as AwardIcon, Star, Calendar, Crown, TrendingUp } from "lucide-react"

interface Award {
  id: string
  name: string
  description: string
  awardedAt: string
  winner: {
    name: string
    profile: { username: string }
  }
  season: {
    name: string
  }
}

const awardIcons: Record<string, JSX.Element> = {
  "Champion": <Crown className="h-8 w-8 text-yellow-500" />,
  "Golden Boot": <Trophy className="h-8 w-8 text-orange-500" />,
  "Golden Glove": <Star className="h-8 w-8 text-blue-500" />,
  "Best Newcomer": <Star className="h-8 w-8 text-green-500" />,
  "Most Improved": <TrendingUp className="h-8 w-8 text-purple-500" />,
  "Player of the Season": <AwardIcon className="h-8 w-8 text-indigo-500" />,
}

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAwards()
  }, [])

  async function fetchAwards() {
    const res = await fetch("/api/awards")
    const data = await res.json()
    setAwards(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading awards...</div>
      </div>
    )
  }

  const groupedAwards = awards.reduce((acc, award) => {
    const season = award.season.name
    if (!acc[season]) acc[season] = []
    acc[season].push(award)
    return acc
  }, {} as Record<string, Award[]>)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Awards & Trophies</h1>
        <p className="text-gray-400 mt-1">Celebrating the best players each season</p>
      </div>

      {/* Awards by Season */}
      {Object.keys(groupedAwards).length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Awards Yet</h3>
          <p className="text-gray-400">Awards will appear here after each season.</p>
        </div>
      ) : (
        Object.entries(groupedAwards).map(([seasonName, seasonAwards]) => (
          <div key={seasonName} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{seasonName}</h2>
            </div>
            <div className="divide-y divide-gray-700">
              {seasonAwards.map((award) => {
                const winnerName = award.winner.profile?.username || award.winner.name
                const Icon = awardIcons[award.name] || <AwardIcon className="h-8 w-8 text-gray-400" />
                
                return (
                  <div key={award.id} className="flex items-center gap-4 p-4 hover:bg-gray-700/50 transition-colors">
                    <div className="flex-shrink-0">
                      {Icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{award.name}</h3>
                      <p className="text-sm text-gray-400">Winner: {winnerName}</p>
                      {award.description && (
                        <p className="text-xs text-gray-500 mt-1">{award.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-indigo-400">{new Date(award.awardedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}