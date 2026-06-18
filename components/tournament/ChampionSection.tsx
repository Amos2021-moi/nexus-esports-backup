"use client"

import { useEffect, useState } from "react"
import { Trophy, Crown, Star, Award, TrendingUp, Shield, Target, Sparkles } from "lucide-react"

interface ChampionSectionProps {
  champion: {
    id: string
    name: string
    profile: { username: string; profilePicture: string }
  } | null
  tournamentName: string
  tournamentId?: string
}

interface ChampionStats {
  wins: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  winRate: number
  matchesPlayed: number
  awards: string[]
}

export default function ChampionSection({ champion, tournamentName, tournamentId }: ChampionSectionProps) {
  const [stats, setStats] = useState<ChampionStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (champion?.id && tournamentId) {
      fetchChampionStats()
    } else {
      setLoading(false)
    }
  }, [champion, tournamentId])

  async function fetchChampionStats() {
    try {
      setLoading(true)
      const res = await fetch(`/api/tournaments/${tournamentId}/champion-stats?playerId=${champion?.id}`)
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching champion stats:', error)
      setStats({
        wins: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        winRate: 0,
        matchesPlayed: 0,
        awards: ['Champion']
      })
    } finally {
      setLoading(false)
    }
  }

  if (!champion) {
    return null
  }

  const championName = champion.profile?.username || champion.name || "Champion"

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-xl p-6 text-center mb-6 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 border border-yellow-500/30">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/10 animate-pulse"></div>
        <div className="relative z-10">
          <div className="w-10 h-10 border-3 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-gray-400">Loading champion stats...</p>
        </div>
      </div>
    )
  }

  const displayStats = stats || {
    wins: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    winRate: 0,
    matchesPlayed: 0,
    awards: ['Champion']
  }

  const awardIcons: Record<string, React.ReactNode> = {
    "Champion": <Crown className="h-3 w-3 text-yellow-500" />,
    "Golden Boot": <Trophy className="h-3 w-3 text-orange-500" />,
    "Golden Glove": <Shield className="h-3 w-3 text-blue-500" />,
    "Player of the Season": <Star className="h-3 w-3 text-purple-500" />,
    "Most Improved": <TrendingUp className="h-3 w-3 text-green-500" />,
    "Best Newcomer": <Sparkles className="h-3 w-3 text-pink-500" />,
    "Top Playmaker": <Target className="h-3 w-3 text-red-500" />,
  }

  return (
    <div className="relative overflow-hidden rounded-xl p-5 text-center mb-6 bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
      {/* Animated Background - Simplified */}
      <div className="absolute inset-0">
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating particles - Fewer and smaller */}
        <div className="absolute top-5 left-5 w-2 h-2 bg-yellow-400/40 rounded-full animate-float"></div>
        <div className="absolute top-10 right-10 w-2 h-2 bg-amber-400/40 rounded-full animate-float delay-1000"></div>
        <div className="absolute bottom-5 left-1/4 w-1.5 h-1.5 bg-yellow-300/40 rounded-full animate-float delay-500"></div>
        <div className="absolute bottom-10 right-1/3 w-2 h-2 bg-amber-300/40 rounded-full animate-float delay-1500"></div>
      </div>

      <div className="relative z-10">
        {/* Champion Badge - Smaller */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/30 mb-2">
          <Crown className="h-3.5 w-3.5 text-yellow-500" />
          <span className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider">Champion</span>
        </div>

        {/* Champion Profile - Compact */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
            <div className="relative">
              {champion.profile?.profilePicture ? (
                <img 
                  src={champion.profile.profilePicture} 
                  alt={championName}
                  className="w-14 h-14 rounded-full border-2 border-yellow-500 object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-yellow-500/20">
                  {championName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Small crown badge */}
            <div className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full p-0.5 shadow-lg shadow-yellow-500/20">
              <Crown className="h-3 w-3 text-white" />
            </div>
          </div>
          
          <div className="text-left">
            <h2 className="text-xl font-bold text-white bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
              {championName}
            </h2>
            <p className="text-[10px] text-gray-500">{tournamentName}</p>
          </div>
        </div>

        {/* Stats Grid - Compact */}
        <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
          <div className="bg-white/5 rounded-lg p-2 border border-white/5">
            <p className="text-lg font-bold text-yellow-400">{displayStats.wins}</p>
            <p className="text-[8px] text-gray-400 uppercase tracking-wider">Wins</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 border border-white/5">
            <p className="text-lg font-bold text-green-400">{displayStats.winRate}%</p>
            <p className="text-[8px] text-gray-400 uppercase tracking-wider">Win Rate</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 border border-white/5">
            <p className="text-lg font-bold text-blue-400">{displayStats.goalsFor}</p>
            <p className="text-[8px] text-gray-400 uppercase tracking-wider">Goals</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 border border-white/5">
            <p className="text-lg font-bold text-white">{displayStats.matchesPlayed}</p>
            <p className="text-[8px] text-gray-400 uppercase tracking-wider">Matches</p>
          </div>
        </div>

        {/* Goal Difference - Compact */}
        {displayStats.goalDifference !== 0 && (
          <div className="mt-1.5 flex items-center justify-center gap-2 text-xs">
            <span className="text-gray-500">GD:</span>
            <span className={`font-bold ${displayStats.goalDifference >= 0 ? "text-green-400" : "text-red-400"}`}>
              {displayStats.goalDifference >= 0 ? "+" : ""}{displayStats.goalDifference}
            </span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">GA:</span>
            <span className="font-bold text-red-400">{displayStats.goalsAgainst}</span>
          </div>
        )}

        {/* Awards - Compact */}
        {displayStats.awards && displayStats.awards.length > 0 && (
          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="flex flex-wrap justify-center gap-1.5">
              {displayStats.awards.slice(0, 4).map((award, index) => {
                const Icon = awardIcons[award] || <Award className="h-3 w-3 text-gray-400" />
                return (
                  <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[10px] text-yellow-400">
                    {Icon}
                    {award}
                  </span>
                )
              })}
              {displayStats.awards.length > 4 && (
                <span className="inline-flex items-center px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[10px] text-yellow-400">
                  +{displayStats.awards.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-12px) scale(1.2); opacity: 0.6; }
        }
        .animate-float {
          animation: float 2.5s ease-in-out infinite;
        }
        .delay-1000 { animation-delay: 1s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-1500 { animation-delay: 1.5s; }
        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  )
}