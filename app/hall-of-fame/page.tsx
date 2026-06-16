"use client"

import { useEffect, useState } from "react"
import { Trophy, Star, Crown, Medal, Calendar, User, Shield } from "lucide-react"
import Link from "next/link"

interface HallEntry {
  id: string
  category: string
  reason: string
  imageUrl: string | null
  inductedAt: string
  player: {
    name: string
    profile: { username: string; profilePicture: string }
  }
  season: {
    name: string
  }
}

const categoryIcons: Record<string, JSX.Element> = {
  "Champion": <Crown className="h-8 w-8 text-yellow-500" />,
  "Legend": <Star className="h-8 w-8 text-purple-500" />,
  "Golden Boot": <Trophy className="h-8 w-8 text-orange-500" />,
  "Golden Glove": <Shield className="h-8 w-8 text-blue-500" />,
  "MVP": <Medal className="h-8 w-8 text-indigo-500" />,
}

export default function HallOfFamePage() {
  const [entries, setEntries] = useState<HallEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    const res = await fetch("/api/hall-of-fame")
    const data = await res.json()
    setEntries(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const categories = ["all", ...new Set(entries.map(e => e.category))]
  const filteredEntries = selectedCategory === "all" ? entries : entries.filter(e => e.category === selectedCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading Hall of Fame...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-block p-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-2xl mb-4">
          <Trophy className="h-12 w-12 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-white">Hall of Fame</h1>
        <p className="text-gray-400 mt-2">Celebrating the legends and champions of Nexus Esports</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {cat === "all" ? "All Legends" : cat}
          </button>
        ))}
      </div>

      {/* Entries Grid */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
          <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Hall of Fame Entries Yet</h3>
          <p className="text-gray-400">Legends will appear here after each season.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => {
            const Icon = categoryIcons[entry.category] || <Trophy className="h-8 w-8 text-gray-400" />
            const playerName = entry.player.profile?.username || entry.player.name
            const profilePic = entry.player.profile?.profilePicture
            
            return (
              <div key={entry.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-yellow-500/50 transition-all group">
                <div className="h-1 bg-gradient-to-r from-yellow-500 to-amber-500" />
                <div className="p-6 text-center">
                  {/* Icon */}
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-gray-700/50 rounded-full group-hover:scale-110 transition-transform">
                      {Icon}
                    </div>
                  </div>
                  
                  {/* Player Avatar */}
                  <div className="relative inline-block mb-3">
                    {profilePic ? (
                      <img src={profilePic} alt={playerName} className="h-20 w-20 rounded-full object-cover border-2 border-yellow-500" />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-yellow-500">
                        {playerName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <h2 className="text-xl font-bold text-white">{playerName}</h2>
                  <p className="text-yellow-400 text-sm font-semibold mt-1">{entry.category}</p>
                  <p className="text-gray-400 text-sm mt-2">{entry.reason}</p>
                  
                  <div className="mt-4 pt-3 border-t border-gray-700 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>Inducted: {new Date(entry.inductedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}