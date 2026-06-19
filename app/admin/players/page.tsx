"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Shield, User, MoreVertical, CheckCircle, XCircle, Eye, Star, Users, ChevronRight, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

interface Player {
  id: string
  name: string
  email: string
  role: string
  isVerified: boolean
  verifiedAt: string | null
  profile: { 
    username: string
    totalPoints: number
    trustScore: number
    verifiedBadge: boolean
    profilePicture: string | null
  } | null
}

export default function AdminPlayers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [updatingTrust, setUpdatingTrust] = useState<string | null>(null)

  // Role check - redirect if not admin
  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchPlayers()
    }
  }, [session])

  async function fetchPlayers() {
    const res = await fetch("/api/players")
    const data = await res.json()
    setPlayers(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function toggleVerification(playerId: string, currentStatus: boolean) {
    setVerifying(playerId)
    
    try {
      const res = await fetch("/api/admin/verify-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: playerId,
          verified: !currentStatus
        })
      })

      if (res.ok) {
        toast.success(!currentStatus ? "Player verified!" : "Player unverified!")
        fetchPlayers()
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to update verification")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to update verification")
    } finally {
      setVerifying(null)
    }
  }

  async function updateTrustScore(playerId: string) {
    setUpdatingTrust(playerId)
    
    try {
      const res = await fetch("/api/admin/update-trust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: playerId })
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`Trust score updated to ${data.trustScore}`)
        fetchPlayers()
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to update trust score")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to update trust score")
    } finally {
      setUpdatingTrust(null)
    }
  }

  async function updateAllTrustScores() {
    if (!confirm("Update trust scores for all players? This may take a moment.")) return
    
    toast.loading("Updating all trust scores...")
    
    try {
      const res = await fetch("/api/admin/update-trust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })

      if (res.ok) {
        toast.dismiss()
        toast.success("All trust scores updated!")
        fetchPlayers()
      } else {
        toast.dismiss()
        const error = await res.json()
        toast.error(error.error || "Failed to update trust scores")
      }
    } catch (error) {
      toast.dismiss()
      console.error("Error:", error)
      toast.error("Failed to update trust scores")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading players...</div>
      </div>
    )
  }

  if (session?.user?.role !== "ADMIN") {
    return null
  }

  const filteredPlayers = players.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.profile?.username?.toLowerCase().includes(search.toLowerCase())
  )

  const verifiedCount = players.filter(p => p.isVerified).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Players</h1>
          <p className="text-gray-400 mt-1">View, verify, and manage all registered players</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={updateAllTrustScores}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all text-sm"
          >
            <RefreshCw size={16} />
            Update All Trust Scores
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-white">{players.length}</p>
          <p className="text-sm text-gray-400">Total Players</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-white">{players.filter(p => p.role === "ADMIN").length}</p>
          <p className="text-sm text-gray-400">Admins</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
          <p className="text-2xl font-bold text-green-400">{verifiedCount}</p>
          <p className="text-sm text-gray-400">Verified Players</p>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
          <p className="text-2xl font-bold text-yellow-400">{players.filter(p => p.role === "PLAYER" && !p.isVerified).length}</p>
          <p className="text-sm text-gray-400">Pending Verification</p>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Player</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Points</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Trust Score</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredPlayers.map((player) => {
                const username = player.profile?.username || player.name || "Unknown"
                const initial = username.charAt(0).toUpperCase()
                const profilePic = player.profile?.profilePicture
                const trustScore = player.profile?.trustScore || 0

                return (
                  <tr key={player.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link 
                        href={`/players/${player.id}`}
                        className="flex items-center space-x-3 group"
                      >
                        {/* ✅ Profile Picture */}
                        <div className="flex-shrink-0">
                          {profilePic ? (
                            <img 
                              src={profilePic} 
                              alt={username}
                              className="h-10 w-10 rounded-full object-cover border-2 border-gray-600 group-hover:border-indigo-500 transition-all"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {initial}
                            </div>
                          )}
                          {player.isVerified && (
                            <div className="absolute -top-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border-2 border-gray-800">
                              <Shield className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                              {username}
                            </p>
                            {player.isVerified && (
                              <CheckCircle size={14} className="text-green-400" />
                            )}
                            {trustScore >= 80 && (
                              <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{player.email}</p>
                        </div>
                        <ChevronRight size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-all" />
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{player.email}</td>
                    <td className="px-6 py-4 text-sm text-white font-semibold">{player.profile?.totalPoints || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${trustScore >= 80 ? "text-green-400" : trustScore >= 50 ? "text-yellow-400" : "text-gray-400"}`}>
                          {trustScore}
                        </span>
                        {trustScore >= 80 && (
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        )}
                        <button
                          onClick={() => updateTrustScore(player.id)}
                          disabled={updatingTrust === player.id}
                          className="text-gray-400 hover:text-indigo-400 transition-all"
                          title="Recalculate trust score"
                        >
                          {updatingTrust === player.id ? (
                            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <RefreshCw size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          player.role === "ADMIN" 
                            ? "bg-red-500/20 text-red-400" 
                            : player.isVerified 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {player.role === "ADMIN" ? "Admin" : player.isVerified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {player.role !== "ADMIN" && (
                          <button
                            onClick={() => toggleVerification(player.id, player.isVerified)}
                            disabled={verifying === player.id}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-all ${
                              player.isVerified
                                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            }`}
                          >
                            {verifying === player.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : player.isVerified ? (
                              <>
                                <XCircle size={14} />
                                Unverify
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                Verify
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}