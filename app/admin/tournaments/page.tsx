"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trophy, Plus, Calendar, Users, Trash2, Edit, Play, Eye } from "lucide-react"
import toast from "react-hot-toast"

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

export default function AdminTournamentsPage() {
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "SINGLE_ELIM",
    startDate: "",
    endDate: "",
    maxPlayers: "8"
  })

  useEffect(() => {
    fetchTournaments()
  }, [])

  async function fetchTournaments() {
    const res = await fetch("/api/tournaments")
    const data = await res.json()
    setTournaments(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })

    if (res.ok) {
      toast.success("Tournament created!")
      setShowForm(false)
      setFormData({ name: "", description: "", type: "SINGLE_ELIM", startDate: "", endDate: "", maxPlayers: "8" })
      fetchTournaments()
    } else {
      toast.error("Failed to create tournament")
    }
  }

  async function deleteTournament(id: string) {
    if (!confirm("Are you sure you want to delete this tournament?")) return
    const res = await fetch(`/api/tournaments/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Tournament deleted")
      fetchTournaments()
    } else {
      toast.error("Failed to delete")
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8 text-gray-400">Loading tournaments...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Tournaments</h1>
          <p className="text-gray-400 mt-1">Create and manage knockout tournaments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={18} />
          Create Tournament
        </button>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Tournaments Yet</h3>
          <p className="text-gray-400">Click "Create Tournament" to start your first knockout competition.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-all">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-white">{tournament.name}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tournament.status === "ACTIVE" ? "bg-green-500/20 text-green-400" :
                      tournament.status === "COMPLETED" ? "bg-blue-500/20 text-blue-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {tournament.status}
                    </span>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                      {tournament.type === "SINGLE_ELIM" ? "Single Elimination" : "Double Elimination"}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{tournament.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Users size={14} />
                      {tournament.participants?.length || 0} / {tournament.maxPlayers} players
                    </span>
                    <span className="text-gray-500 flex items-center gap-1">
                      <Trophy size={14} />
                      {tournament.matches?.length || 0} matches
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 p-2 transition-all"
                    title="View Bracket"
                  >
                    <Eye size={18} />
                  </Link>
                  <button
                    onClick={() => router.push(`/admin/tournaments/${tournament.id}/manage`)}
                    className="text-indigo-400 hover:text-indigo-300 p-2 transition-all"
                  >
                    <Users size={18} />
                  </button>
                  <button
                    onClick={() => deleteTournament(tournament.id)}
                    className="text-red-400 hover:text-red-300 p-2 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Tournament Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Create Tournament</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tournament Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., Spring Knockout Cup"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Tournament description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="SINGLE_ELIM">Single Elimination</option>
                    <option value="DOUBLE_ELIM">Double Elimination</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Players</label>
                  <select
                    value={formData.maxPlayers}
                    onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="4">4 Players</option>
                    <option value="8">8 Players</option>
                    <option value="16">16 Players</option>
                    <option value="32">32 Players</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  Create Tournament
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}