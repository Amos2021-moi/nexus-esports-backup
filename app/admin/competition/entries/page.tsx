"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { 
  Users, Search, CheckCircle, XCircle, Clock, AlertCircle, 
  RefreshCw, DollarSign, Phone, Calendar, Filter, Eye,
  ArrowUp, ArrowDown
} from "lucide-react"
import toast from "react-hot-toast"

interface LeagueEntryWithPayment {
  id: string
  playerId: string
  played: number
  wins: number
  draws: number
  losses: number
  points: number
  seasonEntry: {
    id: string
    status: string
    entryFee: number
    phoneNumber: string
    mpesaReceipt: string | null
    paidAt: string | null
    createdAt: string
    checkoutRequestId: string | null
  } | null
  player: {
    id: string
    name: string
    email: string
    profile: {
      username: string
      profilePicture: string | null
    }
  }
  season: {
    id: string
    name: string
  }
}

interface Season {
  id: string
  name: string
  isActive: boolean
}

export default function AdminCompetitionEntries() {
  const { data: session } = useSession()
  const [entries, setEntries] = useState<LeagueEntryWithPayment[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState("")
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState<"points" | "paid" | "name">("points")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // ✅ Auto-refresh every 10 seconds
  useEffect(() => {
    fetchSeasons()
    const interval = setInterval(() => {
      if (selectedSeason) {
        fetchEntries()
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedSeason) {
      fetchEntries()
    }
  }, [selectedSeason, filter, sortBy, sortOrder])

  async function fetchSeasons() {
    try {
      const res = await fetch("/api/seasons")
      if (!res.ok) throw new Error("Failed to fetch seasons")
      const data = await res.json()
      setSeasons(data)
      
      const activeSeason = data.find((s: Season) => s.isActive)
      if (activeSeason) {
        setSelectedSeason(activeSeason.id)
      } else if (data.length > 0) {
        setSelectedSeason(data[0].id)
      }
    } catch (error) {
      console.error("Error fetching seasons:", error)
      toast.error("Failed to load seasons")
    }
  }

  async function fetchEntries() {
    setLoading(true)
    try {
      const url = new URL("/api/admin/competition/entries", window.location.origin)
      url.searchParams.set("seasonId", selectedSeason)
      if (filter !== "all") url.searchParams.set("status", filter)

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Failed to fetch entries")
      const data = await res.json()
      
      const sorted = sortEntries(data)
      setEntries(sorted)
    } catch (error) {
      console.error("Error fetching entries:", error)
      toast.error("Failed to load entries")
    } finally {
      setLoading(false)
    }
  }

  const sortEntries = (data: LeagueEntryWithPayment[]) => {
    const sorted = [...data]
    
    switch (sortBy) {
      case "points":
        sorted.sort((a, b) => sortOrder === "desc" ? b.points - a.points : a.points - b.points)
        break
      case "paid":
        sorted.sort((a, b) => {
          const aPaid = a.seasonEntry?.status === "ACTIVE" ? 1 : 0
          const bPaid = b.seasonEntry?.status === "ACTIVE" ? 1 : 0
          return sortOrder === "desc" ? bPaid - aPaid : aPaid - bPaid
        })
        break
      case "name":
        sorted.sort((a, b) => {
          const aName = (a.player.profile?.username || a.player.name || "").toLowerCase()
          const bName = (b.player.profile?.username || b.player.name || "").toLowerCase()
          return sortOrder === "desc" ? bName.localeCompare(aName) : aName.localeCompare(bName)
        })
        break
    }
    return sorted
  }

  const handleSort = (field: "points" | "paid" | "name") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return {
        icon: AlertCircle,
        label: "Unpaid",
        className: "bg-red-500/20 text-red-400 border-red-500/20",
      }
    }
    switch (status) {
      case "ACTIVE":
        return {
          icon: CheckCircle,
          label: "Paid ✅",
          className: "bg-green-500/20 text-green-400 border-green-500/20",
        }
      case "PAYMENT_PENDING":
        return {
          icon: Clock,
          label: "Pending ⏳",
          className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
        }
      default:
        return {
          icon: AlertCircle,
          label: "Unpaid",
          className: "bg-red-500/20 text-red-400 border-red-500/20",
        }
    }
  }

  const filteredEntries = entries.filter((entry) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      entry.player.name?.toLowerCase().includes(searchLower) ||
      entry.player.email?.toLowerCase().includes(searchLower) ||
      entry.player.profile?.username?.toLowerCase().includes(searchLower)
    )
  })

  const totalEntries = entries.length
  const paidEntries = entries.filter(e => e.seasonEntry?.status === "ACTIVE").length
  const pendingEntries = entries.filter(e => e.seasonEntry?.status === "PAYMENT_PENDING").length
  const unpaidEntries = entries.filter(e => !e.seasonEntry || e.seasonEntry?.status !== "ACTIVE").length

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading entries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Competition Entries</h1>
          <p className="text-gray-400 text-sm">Manage player registrations and payments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchEntries}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <span className="text-xs text-gray-500 self-center">
            Auto-refresh every 10s
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-2xl font-bold text-white">{totalEntries}</p>
          <p className="text-sm text-gray-400">Total Players</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-2xl font-bold text-green-400">{paidEntries}</p>
          <p className="text-sm text-gray-400">✅ Paid</p>
          <p className="text-xs text-gray-500">{totalEntries > 0 ? Math.round((paidEntries / totalEntries) * 100) : 0}%</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-2xl font-bold text-yellow-400">{pendingEntries}</p>
          <p className="text-sm text-gray-400">⏳ Pending</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <p className="text-2xl font-bold text-red-400">{unpaidEntries}</p>
          <p className="text-sm text-gray-400">❌ Unpaid</p>
        </div>
      </div>

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
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
        >
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name} {season.isActive ? "⭐" : ""}
            </option>
          ))}
        </select>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Paid ✅</option>
          <option value="PAYMENT_PENDING">Pending ⏳</option>
          <option value="NOT_ENROLLED">Unpaid</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                  <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-white">
                    Player
                    {sortBy === "name" && (sortOrder === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />)}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Season</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">
                  <button onClick={() => handleSort("paid")} className="flex items-center gap-1 hover:text-white">
                    Status
                    {sortBy === "paid" && (sortOrder === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />)}
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">Phone Number</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">Receipt</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">Paid At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No players found in this season
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const status = getStatusBadge(entry.seasonEntry?.status || null)
                  const StatusIcon = status.icon
                  
                  return (
                    <tr key={entry.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {entry.player.profile?.profilePicture ? (
                            <img
                              src={entry.player.profile.profilePicture}
                              alt={entry.player.name || "Player"}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                              {(entry.player.name || "P").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">
                              {entry.player.profile?.username || entry.player.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-400">{entry.player.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{entry.season.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-300 font-mono">
                        {entry.seasonEntry?.phoneNumber ? (
                          <span className="text-gray-300">
                            {entry.seasonEntry.phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-300">
                        {entry.seasonEntry?.mpesaReceipt ? (
                          <span className="font-mono text-green-400">{entry.seasonEntry.mpesaReceipt}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-400">
                        {entry.seasonEntry?.paidAt ? new Date(entry.seasonEntry.paidAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}