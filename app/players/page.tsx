"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { 
  Search, Users, Trophy, Shield, Star, ChevronRight, 
  Crown, Award, TrendingUp, Target, Flame, Zap,
  Filter, Grid3x3, List, UserPlus, CheckCircle, Clock
} from "lucide-react"

interface Player {
  id: string
  name: string
  email: string
  isVerified: boolean
  profile: {
    username: string
    profilePicture: string
    trustScore: number
    verifiedBadge: boolean
  } | null
}

export default function PlayersPage() {
  const { data: session } = useSession()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "verified" | "top" | "rising">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isDarkMode, setIsDarkMode] = useState(true)

  // ✅ Force dark mode on mount
  useEffect(() => {
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('theme') === 'dark'
    setIsDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    fetchPlayers()
  }, [])

  async function fetchPlayers() {
    try {
      const res = await fetch("/api/public/players")
      const data = await res.json()
      setPlayers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching players:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlayers = players.filter(player => {
    const username = player.profile?.username || player.name || ""
    const matchesSearch = username.toLowerCase().includes(search.toLowerCase())
    
    if (filter === "verified") {
      return matchesSearch && player.isVerified
    }
    if (filter === "top") {
      return matchesSearch && (player.profile?.trustScore || 0) >= 80
    }
    if (filter === "rising") {
      return matchesSearch && (player.profile?.trustScore || 0) >= 60 && (player.profile?.trustScore || 0) < 80
    }
    return matchesSearch
  })

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (a.isVerified && !b.isVerified) return -1
    if (!a.isVerified && b.isVerified) return 1
    return (b.profile?.trustScore || 0) - (a.profile?.trustScore || 0)
  })

  const totalPlayers = players.length
  const verifiedCount = players.filter(p => p.isVerified).length
  const topCount = players.filter(p => (p.profile?.trustScore || 0) >= 80).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
            <Users className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-400 h-5 w-5" />
          </div>
          <p className="text-gray-400 text-sm">Loading players...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-green-400" />
          Players
        </h1>
        <p className="text-gray-400 text-sm">Discover and connect with players in the league</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{totalPlayers}</p>
              <p className="text-[10px] text-gray-400">Total Players</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-green-500/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{verifiedCount}</p>
              <p className="text-[10px] text-gray-400">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-yellow-500/20 rounded-lg">
              <Star className="h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{topCount}</p>
              <p className="text-[10px] text-gray-400">Top Players</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-purple-500/20 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{players.filter(p => (p.profile?.trustScore || 0) >= 60 && (p.profile?.trustScore || 0) < 80).length}</p>
              <p className="text-[10px] text-gray-400">Rising</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-800/30 rounded-xl p-3 border border-gray-700">
        <div className="flex-1 min-w-[180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-gray-700/30 rounded-lg p-0.5">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === "all"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-600/30"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("verified")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              filter === "verified"
                ? "bg-green-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-600/30"
            }`}
          >
            <CheckCircle size={11} />
            Verified
          </button>
          <button
            onClick={() => setFilter("top")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              filter === "top"
                ? "bg-yellow-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-600/30"
            }`}
          >
            <Star size={11} />
            Top
          </button>
          <button
            onClick={() => setFilter("rising")}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              filter === "rising"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-600/30"
            }`}
          >
            <TrendingUp size={11} />
            Rising
          </button>
        </div>

        <div className="flex items-center gap-0.5 bg-gray-700/30 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "grid"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-600/30"
            }`}
          >
            <Grid3x3 size={15} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "list"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-600/30"
            }`}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Players Grid */}
      {sortedPlayers.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
          <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No Players Found</h3>
          <p className="text-sm text-gray-400">Try adjusting your search or filter.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sortedPlayers.map((player) => {
            const username = player.profile?.username || player.name || "Unknown"
            const initial = username.charAt(0).toUpperCase()
            const trustScore = player.profile?.trustScore || 0
            const isVerified = player.isVerified

            return (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="group bg-gray-800/50 rounded-xl border border-gray-700 p-4 hover:border-indigo-500/40 transition-all hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    {player.profile?.profilePicture ? (
                      <img 
                        src={player.profile.profilePicture} 
                        alt={username}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-600 group-hover:border-indigo-500 transition-all"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold border-2 border-gray-600 group-hover:border-indigo-500 transition-all">
                        {initial}
                      </div>
                    )}
                    {isVerified && (
                      <div className="absolute -top-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border-2 border-gray-800">
                        <Shield className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <p className="font-semibold text-sm text-white group-hover:text-indigo-400 transition-colors">
                        {username}
                      </p>
                      {trustScore >= 80 && (
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-1 text-xs text-gray-400">
                      <span>Trust: {trustScore}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Users size={10} />
                        {trustScore >= 80 ? "Elite" : trustScore >= 50 ? "Pro" : "Player"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedPlayers.map((player) => {
            const username = player.profile?.username || player.name || "Unknown"
            const initial = username.charAt(0).toUpperCase()
            const trustScore = player.profile?.trustScore || 0
            const isVerified = player.isVerified

            return (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="flex items-center gap-3 bg-gray-800/30 rounded-xl p-3 border border-gray-700 hover:border-indigo-500/40 transition-all group"
              >
                <div className="relative flex-shrink-0">
                  {player.profile?.profilePicture ? (
                    <img 
                      src={player.profile.profilePicture} 
                      alt={username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 group-hover:border-indigo-500 transition-all"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {initial}
                    </div>
                  )}
                  {isVerified && (
                    <div className="absolute -top-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border-2 border-gray-800">
                      <Shield className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-white group-hover:text-indigo-400 transition-colors">
                      {username}
                    </p>
                    {trustScore >= 80 && (
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    )}
                    {isVerified && (
                      <span className="text-[10px] text-green-400 flex items-center gap-0.5">
                        <CheckCircle size={10} />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Trust: {trustScore}</span>
                    <span>•</span>
                    <span>{trustScore >= 80 ? "Elite" : trustScore >= 50 ? "Pro" : "Player"}</span>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-indigo-400 transition-all" />
              </Link>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-3 border-t border-gray-800">
        Showing {sortedPlayers.length} of {players.length} players
      </div>
    </div>
  )
}