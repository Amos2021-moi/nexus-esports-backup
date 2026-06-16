"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Trophy, Calendar, Users, ChevronRight, Crown, Star, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface Match {
  id: string
  round: number
  matchNumber: number
  homePlayerId: string | null
  awayPlayerId: string | null
  winnerId: string | null
  status: string
  homePlayer: { name: string; profile: { username: string; profilePicture: string } } | null
  awayPlayer: { name: string; profile: { username: string; profilePicture: string } } | null
  winner: { name: string; profile: { username: string } } | null
  result: { homeScore: number; awayScore: number; approved: boolean } | null
}

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
}

export default function TournamentBracketPage() {
  const { id } = useParams()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBracket()
  }, [id])

  async function fetchBracket() {
    const res = await fetch(`/api/tournaments/${id}/bracket`)
    const data = await res.json()
    setTournament(data.tournament)
    setMatches(data.matches || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <Trophy className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-400 h-6 w-6" />
          </div>
          <p className="text-gray-400 font-medium mt-2">Loading bracket...</p>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Tournament Not Found</h2>
          <p className="text-gray-400">The tournament you're looking for doesn't exist.</p>
          <Link href="/" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 transition-all">
            Go Home →
          </Link>
        </div>
      </div>
    )
  }

  // Group matches by round
  const rounds: { [key: number]: Match[] } = {}
  matches.forEach(match => {
    if (!rounds[match.round]) rounds[match.round] = []
    rounds[match.round].push(match)
  })
  const totalRounds = Object.keys(rounds).length

  // Helper to get player display name
  const getPlayerName = (player: any) => {
    return player?.profile?.username || player?.name || "TBD"
  }

  // Helper to get winner indicator
  const isWinner = (match: Match, playerId: string | null) => {
    return match.winnerId === playerId && match.status === "COMPLETED"
  }

  // Round names
  const roundNames: { [key: number]: string } = {
    1: "Round of 16",
    2: "Quarter Finals",
    3: "Semi Finals",
    4: "Final",
    5: "Champion"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Tournament Header - Modern Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{tournament.name}</h1>
                </div>
                <p className="text-white/80 text-lg max-w-2xl">{tournament.description}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
                    <Calendar size={14} className="text-white/70" />
                    <span className="text-white/80">
                      {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
                    <Users size={14} className="text-white/70" />
                    <span className="text-white/80">
                      {tournament.participants?.length || 0} / {tournament.maxPlayers} Players
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm ${
                    tournament.status === "ACTIVE" ? "bg-green-500/30" :
                    tournament.status === "COMPLETED" ? "bg-blue-500/30" :
                    "bg-yellow-500/30"
                  }`}>
                    <div className={`h-2 w-2 rounded-full ${
                      tournament.status === "ACTIVE" ? "bg-green-400 animate-pulse" :
                      tournament.status === "COMPLETED" ? "bg-blue-400" :
                      "bg-yellow-400"
                    }`} />
                    <span className="text-white/90 font-medium">
                      {tournament.status === "ACTIVE" ? "Live" : tournament.status === "COMPLETED" ? "Completed" : "Upcoming"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Champion Section (if completed) */}
        {tournament.status === "COMPLETED" && matches.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-2xl p-8 border border-yellow-500/30 text-center">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Tournament Champion</h2>
            {(() => {
              const finalMatch = matches.find(m => m.round === totalRounds)
              const champion = finalMatch?.winner
              return (
                <div className="flex items-center justify-center gap-4">
                  {champion?.profile?.profilePicture ? (
                    <img 
                      src={champion.profile.profilePicture} 
                      alt={getPlayerName(champion)}
                      className="w-16 h-16 rounded-full border-2 border-yellow-500 object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold">
                      {getPlayerName(champion).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="text-3xl font-bold text-yellow-400">
                    {champion ? getPlayerName(champion) : "TBD"}
                  </p>
                </div>
              )
            })()}
          </div>
        )}

        {/* Bracket Display - Modern Scrollable */}
        <div className="overflow-x-auto pb-8">
          <div className="flex gap-8 min-w-max">
            {Object.entries(rounds).map(([roundNum, roundMatches], roundIndex) => (
              <div key={roundNum} className="flex-shrink-0">
                {/* Round Header */}
                <div className="text-center mb-6">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                      {roundNames[parseInt(roundNum)] || `Round ${roundNum}`}
                    </h3>
                  </div>
                  {parseInt(roundNum) === totalRounds && (
                    <p className="text-xs text-yellow-500 mt-2 font-semibold">🏆 CHAMPIONSHIP</p>
                  )}
                </div>
                
                <div className="space-y-6">
                  {roundMatches.map((match, matchIndex) => (
                    <div key={match.id} className="relative">
                      {/* Connector lines */}
                      {parseInt(roundNum) < totalRounds && (
                        <>
                          <div className="absolute -right-8 top-1/2 w-8 h-px bg-gradient-to-r from-gray-600 to-transparent"></div>
                          <div className="absolute -right-8 top-1/4 w-8 h-px bg-gray-600/30"></div>
                          <div className="absolute -right-8 bottom-1/4 w-8 h-px bg-gray-600/30"></div>
                        </>
                      )}
                      
                      {/* Modern Match Card */}
                      <div className="bg-gray-800 rounded-xl border border-gray-700 w-80 overflow-hidden shadow-lg hover:shadow-xl transition-all hover:border-indigo-500/50 group">
                        {/* Match Header */}
                        <div className="bg-gray-800/80 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-500">Match {match.matchNumber}</span>
                          {match.status === "COMPLETED" && match.result?.approved ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle size={12} className="text-green-400" />
                              <span className="text-xs text-green-400">Completed</span>
                            </div>
                          ) : match.status === "COMPLETED" ? (
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-yellow-400" />
                              <span className="text-xs text-yellow-400">Pending</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-blue-400" />
                              <span className="text-xs text-blue-400">Upcoming</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Home Player */}
                        <div className={`px-4 py-3 flex items-center justify-between border-b border-gray-700 transition-colors ${
                          isWinner(match, match.homePlayerId) ? "bg-gradient-to-r from-green-500/10 to-transparent" : ""
                        }`}>
                          <div className="flex items-center gap-3">
                            {match.homePlayer?.profile?.profilePicture ? (
                              <img 
                                src={match.homePlayer.profile.profilePicture} 
                                alt={getPlayerName(match.homePlayer)}
                                className="w-8 h-8 rounded-full object-cover border border-gray-600"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                                {getPlayerName(match.homePlayer).charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className={`text-sm font-medium ${
                              isWinner(match, match.homePlayerId) ? "text-green-400" : "text-white"
                            }`}>
                              {getPlayerName(match.homePlayer)}
                            </span>
                          </div>
                          {match.result && (
                            <span className={`text-sm font-bold ${
                              isWinner(match, match.homePlayerId) ? "text-green-400" : "text-white"
                            }`}>
                              {match.result.homeScore}
                            </span>
                          )}
                          {isWinner(match, match.homePlayerId) && (
                            <Trophy size={12} className="text-yellow-500 ml-1" />
                          )}
                        </div>
                        
                        {/* Away Player */}
                        <div className={`px-4 py-3 flex items-center justify-between transition-colors ${
                          isWinner(match, match.awayPlayerId) ? "bg-gradient-to-r from-green-500/10 to-transparent" : ""
                        }`}>
                          <div className="flex items-center gap-3">
                            {match.awayPlayer?.profile?.profilePicture ? (
                              <img 
                                src={match.awayPlayer.profile.profilePicture} 
                                alt={getPlayerName(match.awayPlayer)}
                                className="w-8 h-8 rounded-full object-cover border border-gray-600"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                                {getPlayerName(match.awayPlayer).charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className={`text-sm font-medium ${
                              isWinner(match, match.awayPlayerId) ? "text-green-400" : "text-white"
                            }`}>
                              {getPlayerName(match.awayPlayer)}
                            </span>
                          </div>
                          {match.result && (
                            <span className={`text-sm font-bold ${
                              isWinner(match, match.awayPlayerId) ? "text-green-400" : "text-white"
                            }`}>
                              {match.result.awayScore}
                            </span>
                          )}
                          {isWinner(match, match.awayPlayerId) && (
                            <Trophy size={12} className="text-yellow-500 ml-1" />
                          )}
                        </div>
                        
                        {/* Submit Result Button */}
                        {match.homePlayerId && match.awayPlayerId && match.status !== "COMPLETED" && (
                          <div className="px-4 py-3 bg-gray-800/50 border-t border-gray-700">
                            <Link
                              href={`/tournaments/matches/${match.id}/submit`}
                              className="block text-center text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                            >
                              Submit Result
                            </Link>
                          </div>
                        )}
                        
                        {/* Match Status Bar */}
                        {(!match.homePlayerId || !match.awayPlayerId) && (
                          <div className="px-4 py-2 bg-gray-800/50 text-center">
                            <span className="text-xs text-yellow-500 flex items-center justify-center gap-1">
                              <Clock size={12} />
                              Waiting for opponent
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-800/30 rounded-xl p-5 border border-gray-700 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-indigo-400" />
            Bracket Legend
          </h3>
          <div className="flex flex-wrap gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500/20 rounded"></div>
              <span className="text-gray-400">Winner Advance</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={12} className="text-yellow-500" />
              <span className="text-gray-400">Match Winner</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={12} className="text-green-400" />
              <span className="text-gray-400">Result Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-yellow-400" />
              <span className="text-gray-400">Pending Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500/20 rounded animate-pulse"></div>
              <span className="text-gray-400">Upcoming Match</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}