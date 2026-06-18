"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import MatchCard from "./MatchCard"
import ChampionSection from "./ChampionSection"

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
  winner: { name: string; profile: { username: string; profilePicture?: string | null } } | null
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

export default function TournamentFlow() {
  const { id } = useParams()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchTournament()
    }
  }, [id])

  async function fetchTournament() {
    try {
      const res = await fetch(`/api/tournaments/${id}`)
      const data = await res.json()
      setTournament(data.tournament)
      setMatches(data.matches || [])
    } catch (error) {
      console.error("Error fetching tournament:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium mt-2">Loading bracket...</p>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-center">
          <svg
            className="h-16 w-16 text-gray-600 mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 4h10v3a5 5 0 0 1-5 5h0a5 5 0 0 1-5-5V4Z" />
            <path d="M8 7h8" />
            <path d="M4 7a3 3 0 0 0 3 3h0" />
            <path d="M20 7a3 3 0 0 1-3 3h0" />
            <path d="M8 16h8" />
            <path d="M12 11v9" />
            <path d="M7 20h10" />
          </svg>
          <p className="text-gray-400 font-medium mt-2">Tournament not found</p>
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

  const roundNames: { [key: number]: string } = {
    1: "Quarter Finals",
    2: "Semi Finals",
    3: "Final",
    4: "Champion",
  }

  // ✅ Get the champion from the final match with id
  const getChampion = () => {
    const finalRound = Math.max(...Object.keys(rounds).map(Number))
    const finalMatches = rounds[finalRound] || []
    const finalMatch = finalMatches[0]
    
    if (finalMatch?.winner && finalMatch.winnerId) {
      return {
        id: finalMatch.winnerId,
        name: finalMatch.winner.name,
        profile: {
          username: finalMatch.winner.profile.username,
          // ensure profilePicture is always a string to satisfy ChampionSection prop types
          profilePicture: finalMatch.winner.profile.profilePicture || "",
        },
      }
    }
    return null
  }

  const champion = getChampion()
  const isCompleted = tournament.status === "COMPLETED"

  return (
    <div className="space-y-8">
      {/* ✅ Champion Section - Only show if tournament is COMPLETED */}
      {isCompleted && champion && (
        <ChampionSection 
          champion={champion} 
          tournamentName={tournament.name}
          tournamentId={tournament.id}
        />
      )}

      {/* Bracket */}
      <div className="bg-gray-800/30 rounded-2xl border border-gray-700 p-6 overflow-x-auto">
        <div className="flex flex-col lg:flex-row gap-8 min-w-[800px]">
          {Object.keys(rounds)
            .sort((a, b) => Number(a) - Number(b))
            .map((roundKey) => {
              const round = Number(roundKey)
              const roundMatches = rounds[round]
              const roundName = roundNames[round] || `Round ${round}`

              return (
                <div key={round} className="flex-1 min-w-[200px]">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-4 border-b border-gray-700 pb-2">
                    {roundName}
                  </h3>
                  <div className="flex flex-col gap-6">
                    {roundMatches.map((match, index) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}