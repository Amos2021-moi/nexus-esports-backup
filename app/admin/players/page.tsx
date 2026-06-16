"use client"

import { useEffect, useState } from "react"
import { Search, Shield, User, MoreVertical } from "lucide-react"

interface Player {
  id: string
  name: string
  email: string
  role: string
  profile: { username: string; totalPoints: number } | null
}

export default function AdminPlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlayers()
  }, [])

  async function fetchPlayers() {
    const res = await fetch("/api/players")
    const data = await res.json()
    setPlayers(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const filteredPlayers = players.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.profile?.username?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading players...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Players</h1>
          <p className="text-gray-400 mt-1">View and manage all registered players</p>
        </div>
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-white">{players.length}</p>
          <p className="text-sm text-gray-400">Total Players</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-white">{players.filter(p => p.role === "ADMIN").length}</p>
          <p className="text-sm text-gray-400">Admins</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-white">{players.filter(p => p.role === "PLAYER").length}</p>
          <p className="text-sm text-gray-400">Players</p>
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
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{player.name || "-"}</p>
                        <p className="text-xs text-gray-400">{player.profile?.username || "No username"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{player.email}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{player.profile?.totalPoints || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      player.role === "ADMIN" 
                        ? "bg-red-500/20 text-red-400" 
                        : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {player.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-xs text-gray-400">Active</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}