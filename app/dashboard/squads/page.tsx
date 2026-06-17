"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Shield, Plus, Trash2, Calendar, Trophy, X, Eye } from "lucide-react"
import toast from "react-hot-toast"

interface Squad {
  id: string
  type: string
  screenshot: string
  formation: string
  teamStrength: number
  playstyle: string
  description: string
  isActive: boolean
  createdAt: string
}

const squadTypes = [
  { value: "MAIN", label: "Main Squad", icon: Shield, color: "bg-yellow-500" },
  { value: "SEASONAL", label: "Seasonal Squad", icon: Calendar, color: "bg-green-500" },
  { value: "TOURNAMENT", label: "Tournament Squad", icon: Trophy, color: "bg-purple-500" },
]

// Formation options
const formations = [
  "4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "3-4-3", "5-3-2", "5-4-1",
  "4-1-2-1-2", "4-5-1", "3-6-1", "4-3-2-1", "3-4-1-2", "4-4-1-1"
]

// Playstyle options
const playstyles = [
  "Possession", "Counter Attack", "Long Ball", "Wing Play", 
  "Tiki-Taka", "Quick Counter", "Out Wide", "Long Ball Counter", "Control"
]

export default function SquadsPage() {
  const { data: session } = useSession()
  const [squads, setSquads] = useState<Squad[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: "MAIN",
    screenshot: "",
    formation: "",
    teamStrength: "",
    playstyle: "",
    description: "",
  })

  useEffect(() => {
    fetchSquads()
  }, [])

  async function fetchSquads() {
    const res = await fetch("/api/squads")
    const data = await res.json()
    setSquads(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.screenshot) {
      toast.error("Please upload your squad screenshot")
      return
    }
    if (!formData.formation) {
      toast.error("Please select a formation")
      return
    }

    setSubmitting(true)
    const res = await fetch("/api/squads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      toast.success("Squad uploaded successfully!")
      setShowForm(false)
      setFormData({ type: "MAIN", screenshot: "", formation: "", teamStrength: "", playstyle: "", description: "" })
      fetchSquads()
    } else {
      const error = await res.json()
      toast.error(error.error || "Failed to upload squad")
    }
    setSubmitting(false)
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to remove this squad?")) {
      const res = await fetch(`/api/squads?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Squad removed")
        fetchSquads()
      } else {
        toast.error("Failed to remove")
      }
    }
  }

  // ✅ FULLY FIXED - No TypeScript errors
 const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image must be less than 5MB")
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX_WIDTH = 800
      const MAX_HEIGHT = 800
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = height * (MAX_WIDTH / width)
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = width * (MAX_HEIGHT / height)
          height = MAX_HEIGHT
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      
      // ✅ FIX: Check if ctx exists
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7)
        setFormData((prev) => ({ ...prev, screenshot: compressedDataUrl }))
      }
    }
    // ✅ FIX: Check if event and event.target exist
    if (event?.target?.result) {
      img.src = event.target.result as string
    }
  }
  reader.readAsDataURL(file)
}

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading squads...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Squads</h1>
          <p className="text-gray-400 mt-1">Upload and showcase your eFootball squads</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} />
          Upload Squad
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 rounded-xl border border-blue-500/20 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-blue-400 font-semibold">Showcase Your Squad</h3>
            <p className="text-gray-300 text-sm">
              Upload screenshots of your eFootball squad. Other players can view your team formation, 
              playstyle, and team strength. Share your best Main, Seasonal, or Tournament squads!
            </p>
          </div>
        </div>
      </div>

      {/* Squad Grid */}
      {squads.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Squads Uploaded Yet</h3>
          <p className="text-gray-400">Click "Upload Squad" to share your eFootball squad with the community.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {squads.map((squad) => {
            const SquadIcon = squadTypes.find(t => t.value === squad.type)?.icon || Shield
            const iconColor = squadTypes.find(t => t.value === squad.type)?.color || "bg-gray-500"
            
            return (
              <div key={squad.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all group">
                {/* Image Preview */}
                <div 
                  className="relative h-52 bg-gray-900 cursor-pointer overflow-hidden" 
                  onClick={() => setSelectedImage(squad.screenshot)}
                >
                  <img
                    src={squad.screenshot}
                    alt="Squad"
                    className="w-full h-full object-contain transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="text-white h-8 w-8" />
                  </div>
                </div>
                
                {/* Squad Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${iconColor}`}>
                        <SquadIcon size={14} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {squadTypes.find(t => t.value === squad.type)?.label}
                      </span>
                      {squad.isActive && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Active</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(squad.id)}
                      className="text-gray-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">FORMATION</span>
                      <p className="text-white font-semibold">{squad.formation || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">TEAM STRENGTH</span>
                      <p className="text-white font-semibold">{squad.teamStrength || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 text-xs">PLAYSTYLE</span>
                      <p className="text-white font-semibold">{squad.playstyle || "—"}</p>
                    </div>
                    {squad.description && (
                      <div className="col-span-2">
                        <span className="text-gray-500 text-xs">NOTES</span>
                        <p className="text-gray-300 text-sm mt-1">{squad.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                    Uploaded: {new Date(squad.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-all"
            >
              <X size={24} />
            </button>
            <img src={selectedImage} alt="Squad Full View" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Upload Your Squad</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Squad Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  {squadTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Squad Screenshot</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-2 file:px-3 file:py-1 file:bg-indigo-600 file:text-white file:rounded file:border-0 file:cursor-pointer hover:file:bg-indigo-700"
                />
                {formData.screenshot && (
                  <div className="mt-2 relative">
                    <img src={formData.screenshot} alt="Preview" className="h-32 w-full object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, screenshot: "" })}
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Formation</label>
                <select
                  value={formData.formation}
                  onChange={(e) => setFormData({ ...formData, formation: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Formation</option>
                  {formations.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Team Strength <span className="text-xs text-gray-500">(1000 - 4000)</span>
                </label>
                <input
                  type="number"
                  value={formData.teamStrength}
                  onChange={(e) => {
                    let val = parseInt(e.target.value)
                    if (val < 1000) val = 1000
                    if (val > 4000) val = 4000
                    setFormData({ ...formData, teamStrength: val.toString() })
                  }}
                  min="1000"
                  max="4000"
                  step="10"
                  placeholder="e.g., 2800"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Team strength rating from 1000 to 4000</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Playstyle</label>
                <select
                  value={formData.playstyle}
                  onChange={(e) => setFormData({ ...formData, playstyle: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Playstyle</option>
                  {playstyles.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Any additional info about your squad..."
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {submitting ? "Uploading..." : "Upload Squad"}
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