"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { 
  Users, Search, CheckCircle, XCircle, Clock, AlertCircle, 
  RefreshCw, DollarSign, Phone, Calendar, Filter, Eye,
  ArrowUp, ArrowDown, CreditCard
} from "lucide-react"
import toast from "react-hot-toast"

interface PlayerData {
  id: string
  playerId: string
  name: string
  username: string
  profilePicture: string | null
  points: number
  played: number
  wins: number
  draws: number
  losses: number
  hasPaid: boolean
  paidAt: string | null
  paymentReceipt: string | null
  paymentMethod: string | null
  paymentPhone: string | null
  paymentRequired: boolean
  entryFee: number
  status: string
}

interface CompetitionData {
  players: PlayerData[]
  stats: {
    total: number
    paid: number
    unpaid: number
    free: number
  }
  settings: {
    paymentRequired: boolean
    entryFee: number
  }
}

export default function AdminCompetitionPlayersPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const seasonIdParam = searchParams.get("seasonId")
  
  const [data, setData] = useState<CompetitionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [selectedSeasonId, setSelectedSeasonId] = useState(seasonIdParam || "")
  const [seasons, setSeasons] = useState<any[]>([])

  useEffect(() => {
    fetchSeasons()
  }, [])

  useEffect(() => {
    if (selectedSeasonId) {
      fetchData()
    }
  }, [selectedSeasonId, filter])

  async function fetchSeasons() {
    try {
      const res = await fetch("/api/seasons")
      if (!res.ok) throw new Error("Failed to fetch seasons")
      const data = await res.json()
      setSeasons(data)
      if (!selectedSeasonId && data.length > 0) {
        setSelectedSeasonId(data[0].id)
      }
    } catch (error) {
      console.error("Error fetching seasons:", error)
      toast.error("Failed to load seasons")
    }
  }

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/competition/players?seasonId=${selectedSeasonId}`)
      if (!res.ok) throw new Error("Failed to fetch competition data")
      const data = await res.json()
      setData(data)
    } catch (error) {
      console.error("Error fetching competition data:", error)
      toast.error("Failed to load competition data")
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkPaid(playerId: string) {
    try {
      const res = await fetch("/api/admin/competition/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: playerId,
          seasonId: selectedSeasonId,
          method: "ADMIN",
        }),
      })

      if (!res.ok) throw new Error("Failed to mark as paid")
      
      toast.success("Player marked as paid!")
      fetchData()
    } catch (error) {
      console.error("Error marking as paid:", error)
      toast.error("Failed to mark as paid")
    }
  }

  async function handleMarkUnpaid(playerId: string) {
    try {
      const res = await fetch(`/api/admin/competition/players?userId=${playerId}&seasonId=${selectedSeasonId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to mark as unpaid")
      
      toast.success("Player marked as unpaid")
      fetchData()
    } catch (error) {
      console.error("Error marking as unpaid:", error)
      toast.error("Failed to mark as unpaid")
    }
  }

  const filteredPlayers = data?.players.filter((player) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      player.name?.toLowerCase().includes(searchLower) ||
      player.username?.toLowerCase().includes(searchLower)
    )
  }) || []

  const paymentRequired = data?.settings?.paymentRequired || false
  const entryFee = data?.settings?.entryFee || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading players...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">👥 Competition Players</h1>
          <p className="text-gray-400 text-sm">Manage players and their payment status</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedSeasonId}
            onChange={(e) => setSelectedSeasonId(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name} {season.isActive ? "⭐" : ""}
              </option>
            ))}
          </select>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-white">{data.stats.total}</p>
            <p className="text-sm text-gray-400">Total Players</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-green-400">{data.stats.paid}</p>
            <p className="text-sm text-gray-400">✅ Paid</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-red-400">{data.stats.unpaid}</p>
            <p className="text-sm text-gray-400">❌ Unpaid</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-blue-400">{data.stats.free}</p>
            <p className="text-sm text-gray-400">🎯 Free</p>
          </div>
        </div>
      )}

      {/* Payment Summary */}
      {paymentRequired && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-sm text-yellow-400">
            💰 Payment Required: KES {entryFee} per player • 
            Prize Pool: KES {(data?.stats.paid || 0) * entryFee}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="paid">✅ Paid</option>
          <option value="unpaid">❌ Unpaid</option>
          <option value="free">🎯 Free</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Player</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">Points</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">P</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">W</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">D</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">L</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">Receipt</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                    No players found
                  </td>
                </tr>
              ) : (
                filteredPlayers.filter(p => {
                  if (filter === "paid") return p.hasPaid
                  if (filter === "unpaid") return !p.hasPaid && p.paymentRequired
                  if (filter === "free") return !p.paymentRequired
                  return true
                }).map((player) => (
                  <tr key={player.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {player.profilePicture ? (
                          <img
                            src={player.profilePicture}
                            alt={player.username || "Player"}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {(player.username || "P").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">
                            {player.username || player.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {player.paymentRequired ? (
                        player.hasPaid ? (
                          <span className="text-xs text-green-400 flex items-center justify-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Paid
                          </span>
                        ) : (
                          <span className="text-xs text-red-400 flex items-center justify-center gap-1">
                            <XCircle className="h-3 w-3" /> Unpaid
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-blue-400 flex items-center justify-center gap-1">
                          🎯 Free
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-white font-bold">{player.points}</td>
                    <td className="px-4 py-3 text-center text-gray-300">{player.played}</td>
                    <td className="px-4 py-3 text-center text-green-400">{player.wins}</td>
                    <td className="px-4 py-3 text-center text-yellow-400">{player.draws}</td>
                    <td className="px-4 py-3 text-center text-red-400">{player.losses}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-300">
                      {player.paymentReceipt || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {player.paymentRequired && (
                        player.hasPaid ? (
                          <button
                            onClick={() => handleMarkUnpaid(player.playerId)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-all"
                          >
                            Unmark
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkPaid(player.playerId)}
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-all"
                          >
                            Mark Paid
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}