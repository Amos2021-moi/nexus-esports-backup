"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Trophy, Calendar, Users, Crown, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import TournamentFlow from "@/components/tournament/TournamentFlow"
import { SkeletonTournamentBracket, Skeleton } from "@/components/ui/Skeleton"

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

export default function TournamentPage() {
  const { id } = useParams()
  const { data: session } = useSession()
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
      
      if (!res.ok) {
        if (res.status === 404) {
          setTournament(null)
          setLoading(false)
          return
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      setTournament(data.tournament)
      setMatches(data.matches || [])
    } catch (error) {
      console.error("Error fetching tournament:", error)
      toast.error("Failed to load tournament")
      setTournament(null)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Show header with tournament info
  if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Skeleton variant="card" className="h-40 mb-8" />
        <SkeletonTournamentBracket />
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
          <p className="text-gray-400">The tournament you're looking for doesn't exist or hasn't been created yet.</p>
          <Link href="/tournaments" className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 transition-all">
            View All Tournaments →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ✅ Header - Restored with View Stats */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-8 mb-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{tournament.name}</h1>
                </div>
                <p className="text-white/80 text-sm md:text-base max-w-2xl">{tournament.description}</p>
                <div className="flex flex-wrap gap-3 mt-3 text-xs md:text-sm">
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
              <Link
                href={`/tournaments/${id}/stats`}
                className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                View Stats →
              </Link>
            </div>
          </div>
        </div>

        {/* ✅ Tournament Flow - Contains Champion Section */}
        <TournamentFlow />
      </div>
    </div>
  )
}