"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Calendar, Trophy, X, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"

interface Season {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  status: string
  createdAt: string
}

const statusOptions = [
  { value: "PRESEASON", label: "Preseason", color: "bg-gray-500/20 text-gray-400" },
  { value: "REGISTRATION", label: "Registration Open", color: "bg-blue-500/20 text-blue-400" },
  { value: "FIXTURE_LOCK", label: "Fixtures Locked", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "LIVE", label: "Live", color: "bg-green-500/20 text-green-400" },
  { value: "ENDED", label: "Ended", color: "bg-orange-500/20 text-orange-400" },
  { value: "ARCHIVED", label: "Archived", color: "bg-gray-500/20 text-gray-400" },
]

export default function AdminSeasonsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSeason, setEditingSeason] = useState<Season | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isActive: false,
    status: "PRESEASON"
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchSeasons()
    }
  }, [session])

  async function fetchSeasons() {
    const res = await fetch("/api/seasons", { credentials: "include" })
    const data = await res.json()
    setSeasons(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error("Please fill all fields")
      return
    }

    setSubmitting(true)
    
    const url = editingSeason ? `/api/seasons/${editingSeason.id}` : "/api/seasons"
    const method = editingSeason ? "PUT" : "POST"
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData)
    })

    if (res.ok) {
      toast.success(editingSeason ? "Season updated!" : "Season created!")
      setShowForm(false)
      setEditingSeason(null)
      setFormData({ name: "", startDate: "", endDate: "", isActive: false, status: "PRESEASON" })
      fetchSeasons()
    } else {
      const error = await res.json()
      toast.error(error.error || "Failed to save season")
    }
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure? This will delete all fixtures and results for this season.")) return
    
    const res = await fetch(`/api/seasons/${id}`, { 
      method: "DELETE",
      credentials: "include"
    })
    
    if (res.ok) {
      toast.success("Season deleted")
      fetchSeasons()
    } else {
      toast.error("Failed to delete")
    }
  }

  async function handleUpdateStatus(id: string, newStatus: string) {
    const res = await fetch(`/api/seasons/${id}/status`, { 
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: newStatus })
    })
    
    if (res.ok) {
      toast.success(`Season status updated to ${newStatus}`)
      fetchSeasons()
    } else {
      const error = await res.json()
      toast.error(error.error || "Failed to update status")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (session?.user?.role !== "ADMIN") {
    return null
  }

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(s => s.value === status) || statusOptions[0]
    return <span className={`px-2 py-1 rounded-full text-xs ${option.color}`}>{option.label}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Seasons</h1>
          <p className="text-gray-400 mt-1">Create and manage league seasons with lifecycle tracking</p>
        </div>
        <button
          onClick={() => {
            setEditingSeason(null)
            setFormData({ name: "", startDate: "", endDate: "", isActive: false, status: "PRESEASON" })
            setShowForm(true)
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} />
          Create Season
        </button>
      </div>

      {seasons.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Seasons Yet</h3>
          <p className="text-gray-400">Click "Create Season" to start your first league season.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {seasons.map((season) => (
            <div key={season.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-all">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-xl font-semibold text-white">{season.name}</h2>
                    {getStatusBadge(season.status)}
                    {season.isActive && (
                      <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        <CheckCircle size={12} />
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-gray-400">
                      <Calendar size={14} className="inline mr-1" />
                      Start: {new Date(season.startDate).toLocaleDateString()}
                    </span>
                    <span className="text-gray-400">
                      <Calendar size={14} className="inline mr-1" />
                      End: {new Date(season.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Status Update Buttons */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleUpdateStatus(season.id, opt.value)}
                        disabled={season.status === opt.value}
                        className={`px-2 py-1 rounded-lg text-xs transition-all ${
                          season.status === opt.value
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-gray-700 text-gray-300 hover:bg-indigo-600 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingSeason(season)
                      setFormData({
                        name: season.name,
                        startDate: season.startDate.split('T')[0],
                        endDate: season.endDate.split('T')[0],
                        isActive: season.isActive,
                        status: season.status
                      })
                      setShowForm(true)
                    }}
                    className="text-blue-400 hover:text-blue-300 p-2 transition-all"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(season.id)}
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

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                {editingSeason ? "Edit Season" : "Create New Season"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Season Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Spring 2025 Season"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-indigo-600"
                />
                <label htmlFor="isActive" className="text-sm text-gray-300">
                  Activate this season immediately
                </label>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingSeason ? "Update Season" : "Create Season"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-all"
                >
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