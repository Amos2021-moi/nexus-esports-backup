"use client"

import { useState } from "react"
import Link from "next/link"
import { Clock, CheckCircle, ChevronRight, Trophy } from "lucide-react"
import { useSession } from "next-auth/react"

interface MatchCardProps {
  match: {
    id: string
    round: number
    matchNumber: number
    homePlayerId: string | null
    awayPlayerId: string | null
    winnerId: string | null
    status: string
    homePlayer: { name: string; profile: { username: string; profilePicture: string } } | null
    awayPlayer: { name: string; profile: { username: string; profilePicture: string } } | null
    winner: { name: string; profile: { username: string; profilePicture?: string | null } } | null
    result: { homeScore: number; awayScore: number; approved: boolean } | null
  }
  onClick?: () => void  // ✅ ADD THIS
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const { data: session } = useSession()
  const [isHovered, setIsHovered] = useState(false)

  const getPlayerName = (player: any) => {
    return player?.profile?.username || player?.name || "TBD"
  }

  const getPlayerInitial = (player: any) => {
    const name = getPlayerName(player)
    return name.charAt(0).toUpperCase()
  }

  const homeName = getPlayerName(match.homePlayer)
  const awayName = getPlayerName(match.awayPlayer)
  const homeInitial = getPlayerInitial(match.homePlayer)
  const awayInitial = getPlayerInitial(match.awayPlayer)
  const winnerName = match.winner?.profile?.username || match.winner?.name || null
  const hasResult = match.result !== null

  const isUserPartOfMatch = match.homePlayerId === session?.user?.id || 
                            match.awayPlayerId === session?.user?.id

  const canSubmit = match.status === "SCHEDULED" && 
                    match.homePlayerId && 
                    match.awayPlayerId && 
                    isUserPartOfMatch

  const isPending = match.status === "PENDING"
  const isCompleted = match.status === "COMPLETED"
  const isScheduled = match.status === "SCHEDULED"

  return (
    <div 
      className={`bg-gray-800 rounded-xl border overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer ${
        isHovered ? "border-indigo-500/50" : "border-gray-700"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Match Header */}
      <div className="flex justify-between items-center px-3 py-1.5 bg-gray-800/50 border-b border-gray-700">
        <span className="text-xs text-gray-500">Match {match.matchNumber}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          isCompleted ? "bg-green-500/20 text-green-400" :
          isPending ? "bg-yellow-500/20 text-yellow-400" :
          isScheduled ? "bg-blue-500/20 text-blue-400" :
          "bg-gray-600/20 text-gray-400"
        }`}>
          {isCompleted ? "Completed" : 
           isPending ? "Pending" : 
           isScheduled ? "Scheduled" : 
           "Unknown"}
        </span>
      </div>

      {/* Match Content */}
      <div className="p-3 space-y-2">
        {/* Home Player */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {match.homePlayer?.profile?.profilePicture ? (
              <img 
                src={match.homePlayer.profile.profilePicture} 
                alt={homeName}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-white text-xs font-bold">
                {homeInitial}
              </div>
            )}
            <span className={`text-sm font-medium ${
              winnerName === homeName ? "text-green-400 font-semibold" : "text-white"
            }`}>
              {homeName}
            </span>
          </div>
          {hasResult && (
            <span className="text-sm font-bold text-white">{match.result?.homeScore}</span>
          )}
        </div>

        {/* VS Separator */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="text-xs text-gray-500">vs</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        {/* Away Player */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {match.awayPlayer?.profile?.profilePicture ? (
              <img 
                src={match.awayPlayer.profile.profilePicture} 
                alt={awayName}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-white text-xs font-bold">
                {awayInitial}
              </div>
            )}
            <span className={`text-sm font-medium ${
              winnerName === awayName ? "text-green-400 font-semibold" : "text-white"
            }`}>
              {awayName}
            </span>
          </div>
          {hasResult && (
            <span className="text-sm font-bold text-white">{match.result?.awayScore}</span>
          )}
        </div>

        {/* Status Message and Submit Button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50 mt-1">
          {isPending && (
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <Clock size={12} />
              Pending approval
            </span>
          )}
          {isCompleted && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle size={12} />
              Completed
            </span>
          )}
          {isScheduled && !canSubmit && (
            <span className="text-xs text-gray-500">Waiting for players</span>
          )}

          {canSubmit && isScheduled ? (
            <Link
              href={`/tournaments/matches/${match.id}/submit`}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              Submit Result
            </Link>
          ) : isPending ? (
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <Clock size={12} />
              Pending
            </span>
          ) : isCompleted ? (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle size={12} />
              Done
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}