"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Trophy, Calendar, Users, ChevronRight, Crown, Sparkles, Clock, Flame, Award } from "lucide-react"

interface Tournament {
  id: string
  name: string
  description: string
  type: string
  status: string
  startDate: string
  endDate: string
  maxPlayers: number
  participants: any[]
  matches: any[]
}

export default function TournamentsListPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTournaments()
  }, [])

  async function fetchTournaments() {
    const res = await fetch("/api/tournaments")
    const data = await res.json()
    setTournaments(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <Trophy className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-400 h-6 w-6" />
          </div>
          <p className="text-gray-400 font-medium mt-2">Loading tournaments...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return { bg: "bg-green-500/20", text: "text-green-400", label: "LIVE", icon: Flame }
      case "COMPLETED": return { bg: "bg-blue-500/20", text: "text-blue-400", label: "ENDED", icon: Crown }
      default: return { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "UPCOMING", icon: Clock }
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "SINGLE_ELIM" ? "🏆" : "🥇"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">Tournaments</h1>
            </div>
            <p className="text-white/80 text-lg max-w-2xl">
              Compete in knockout competitions and prove you're the champion
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
                <Sparkles size={14} className="text-yellow-400" />
                <span className="text-white/80 text-sm">Single Elimination</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
                <Crown size={14} className="text-yellow-400" />
                <span className="text-white/80 text-sm">Win to Advance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tournaments Grid */}
        {tournaments.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/30 rounded-2xl border border-gray-700 backdrop-blur-sm">
            <Trophy className="h-20 w-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No Tournaments Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Check back later for upcoming tournaments and competitions.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tournaments.map((tournament, index) => {
              const statusConfig = getStatusColor(tournament.status)
              const StatusIcon = statusConfig.icon
              const totalParticipants = tournament.participants?.length || 0
              const totalMatches = tournament.matches?.length || 0
              const completedMatches = tournament.matches?.filter(m => m.status === "COMPLETED").length || 0
              const progress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0

              return (
                <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
                  <div className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer">
                    {/* Progress bar */}
                    {tournament.status === "ACTIVE" && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                        <div className="h-full bg-white/30 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <div className="text-2xl">{getTypeIcon(tournament.type)}</div>
                            <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                              {tournament.name}
                            </h2>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${statusConfig.bg} backdrop-blur-sm`}>
                              <StatusIcon size={12} className={statusConfig.text} />
                              <span className={`text-xs font-semibold ${statusConfig.text}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {tournament.description || "Compete in this exciting knockout tournament!"}
                          </p>

                          {/* Stats */}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Calendar size={14} className="text-indigo-400" />
                              <span>
                                {new Date(tournament.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                {tournament.endDate && ` - ${new Date(tournament.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              <Users size={14} className="text-indigo-400" />
                              <span>{totalParticipants} / {tournament.maxPlayers} Players</span>
                            </div>
                            {tournament.status === "ACTIVE" && totalMatches > 0 && (
                              <div className="flex items-center gap-2 text-gray-400">
                                <Trophy size={14} className="text-yellow-500" />
                                <span>{completedMatches} / {totalMatches} Matches</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Arrow & CTA */}
                        <div className="flex items-center gap-4">
                          {tournament.status === "ACTIVE" && (
                            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-green-500/20 rounded-full">
                              <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-400 font-medium">LIVE</span>
                            </div>
                          )}
                          <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300 group-hover:scale-110">
                            <ChevronRight size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>

                      {/* Progress indicator for active tournaments */}
                      {tournament.status === "ACTIVE" && totalMatches > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Tournament Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700 backdrop-blur-sm text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-green-400" />
              <span className="text-gray-400">Live Tournament</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown size={14} className="text-yellow-400" />
              <span className="text-gray-400">Winner Takes All</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-blue-400" />
              <span className="text-gray-400">Single Elimination</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}