"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { CheckCircle, XCircle, Clock, Eye, Trophy, Users, Calendar, Image as ImageIcon, ChevronRight, Filter } from "lucide-react"
import toast from "react-hot-toast"

interface PendingResult {
  id: string
  homeScore: number
  awayScore: number
  evidenceImage: string
  submittedBy: string
  approved: boolean
  createdAt: string
  fixture: {
    id: string
    homePlayer: { name: string; email: string; profile: { username: string; profilePicture: string } }
    awayPlayer: { name: string; email: string; profile: { username: string; profilePicture: string } }
    scheduledDate: string
  }
  user: { name: string; email: string; profile: { username: string } }
}

export default function AdminResultsPage() {
  const { data: session } = useSession()
  const [results, setResults] = useState<PendingResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending")

  useEffect(() => {
    fetchResults()
  }, [])

  async function fetchResults() {
    const res = await fetch("/api/admin/results")
    const data = await res.json()
    setResults(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function approveResult(resultId: string) {
    try {
      const res = await fetch("/api/admin/results/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success("Result approved! League table updated.")
        fetchResults()
      } else {
        toast.error(data.error || "Failed to approve")
      }
    } catch (err) {
      toast.error("Network error. Please try again.")
    }
  }

  async function rejectResult(resultId: string) {
    if (confirm("Are you sure you want to reject this result?")) {
      const res = await fetch("/api/admin/results/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultId })
      })
      
      if (res.ok) {
        toast.success("Result rejected")
        fetchResults()
      } else {
        toast.error("Failed to reject")
      }
    }
  }

  const pendingResults = results.filter(r => !r.approved)
  const approvedResults = results.filter(r => r.approved)
  
  const displayResults = filter === "all" ? results : filter === "pending" ? pendingResults : approvedResults

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Result Approvals</h1>
          <p className="text-gray-400 mt-1">Review and manage match results</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-xl p-1 border border-gray-700">
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === "pending" 
                  ? "bg-yellow-500/20 text-yellow-400" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Clock size={14} />
              Pending ({pendingResults.length})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === "approved" 
                  ? "bg-green-500/20 text-green-400" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <CheckCircle size={14} />
              Approved ({approvedResults.length})
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === "all" 
                  ? "bg-indigo-500/20 text-indigo-400" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All ({results.length})
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-500/10 to-transparent rounded-xl p-4 border border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{pendingResults.length}</p>
              <p className="text-xs text-gray-400">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-xl p-4 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{approvedResults.length}</p>
              <p className="text-xs text-gray-400">Approved Results</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-500/10 to-transparent rounded-xl p-4 border border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Trophy className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{results.length}</p>
              <p className="text-xs text-gray-400">Total Submissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results List */}
      {displayResults.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
          <CheckCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
          <p className="text-gray-400">
            {filter === "pending" ? "No pending results waiting for approval." : "No approved results yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayResults.map((result) => {
            const isPending = !result.approved
            const homeName = result.fixture.homePlayer.profile?.username || result.fixture.homePlayer.name
            const awayName = result.fixture.awayPlayer.profile?.username || result.fixture.awayPlayer.name
            
            return (
              <div key={result.id} className={`bg-gray-800 rounded-xl border overflow-hidden transition-all ${
                isPending ? "border-yellow-500/30 hover:border-yellow-500/50" : "border-gray-700 hover:border-gray-600"
              }`}>
                <div className={`h-1 ${isPending ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-green-500 to-emerald-500"}`} />
                
                <div className="p-5">
                  {/* Match Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {homeName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-semibold">{homeName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">{result.homeScore}</span>
                        <span className="text-gray-500">-</span>
                        <span className="text-xl font-bold text-white">{result.awayScore}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{awayName}</span>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {awayName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isPending ? (
                        <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                          <Clock size={14} className="text-yellow-400" />
                          <span className="text-xs text-yellow-400">Pending</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full">
                          <CheckCircle size={14} className="text-green-400" />
                          <span className="text-xs text-green-400">Approved</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={14} />
                      <span>{new Date(result.fixture.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users size={14} />
                      <span>Submitted by: {result.user.profile?.username || result.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={14} />
                      <span>Submitted: {new Date(result.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Evidence */}
                  {result.evidenceImage && (
                    <div className="mb-4">
                      <button
                        onClick={() => setSelectedImage(result.evidenceImage)}
                        className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <ImageIcon size={16} />
                        <span className="text-sm">View Evidence Screenshot</span>
                        <Eye size={14} />
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isPending && (
                    <div className="flex gap-3 pt-2 border-t border-gray-700">
                      <button
                        onClick={() => approveResult(result.id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-all"
                      >
                        <CheckCircle size={16} />
                        Approve Result
                      </button>
                      <button
                        onClick={() => rejectResult(result.id)}
                        className="flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-all border border-red-500/30"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  )}
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
              <XCircle size={24} />
            </button>
            <img src={`data:image/png;base64,${selectedImage}`} alt="Evidence" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  )
}