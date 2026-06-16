"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Trophy, Calendar, Users, ArrowLeft, CheckCircle, Camera, AlertCircle,  Clock, XCircle } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

interface Match {
  id: string
  round: number
  matchNumber: number
  homePlayer: { name: string; profile: { username: string; profilePicture: string } }
  awayPlayer: { name: string; profile: { username: string; profilePicture: string } }
  tournament: { id: string; name: string; type: string }
  result: { homeScore: number; awayScore: number; approved: boolean } | null
  status: string
}

export default function SubmitTournamentResultPage() {
  const { matchId } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [match, setMatch] = useState<Match | null>(null)
  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [evidence, setEvidence] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchMatch()
  }, [matchId])

  async function fetchMatch() {
    const res = await fetch(`/api/tournaments/matches/${matchId}`)
    const data = await res.json()
    setMatch(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!homeScore || !awayScore) {
      toast.error("Please enter both scores")
      return
    }
    
    if (!evidence) {
      toast.error("Please upload evidence screenshot")
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append("homeScore", homeScore)
    formData.append("awayScore", awayScore)
    formData.append("evidence", evidence)

    const res = await fetch(`/api/tournaments/matches/${matchId}/submit`, {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      toast.success("Result submitted! Waiting for admin approval.")
      router.push(`/tournaments/${match?.tournament?.id}`)
    } else {
      const error = await res.json()
      toast.error(error.error || "Failed to submit result")
    }
    setSubmitting(false)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setEvidence(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading match details...</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Match not found</p>
        <Link href="/tournaments" className="text-indigo-400 hover:underline mt-2 inline-block">
          Back to Tournaments
        </Link>
      </div>
    )
  }

  const homeName = match.homePlayer?.profile?.username || match.homePlayer?.name || "TBD"
  const awayName = match.awayPlayer?.profile?.username || match.awayPlayer?.name || "TBD"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/tournaments/${match.tournament?.id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
            <ArrowLeft size={18} />
            Back to Tournament
          </Link>
          
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={20} className="text-yellow-400" />
              <h1 className="text-2xl font-bold">Submit Match Result</h1>
            </div>
            <p className="text-white/80">{match.tournament?.name} - Round {match.round}</p>
          </div>
        </div>

        {/* Match Info Card */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 mb-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-right">
                <div className="flex justify-end mb-2">
                  {match.homePlayer?.profile?.profilePicture ? (
                    <img 
                      src={match.homePlayer.profile.profilePicture} 
                      alt={homeName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {homeName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="text-lg font-semibold text-white">{homeName}</p>
              </div>
              
              <div className="px-4">
                <div className="bg-gray-700 px-4 py-2 rounded-full">
                  <span className="text-sm font-bold text-gray-300">VS</span>
                </div>
              </div>
              
              <div className="flex-1 text-left">
                <div className="flex justify-start mb-2">
                  {match.awayPlayer?.profile?.profilePicture ? (
                    <img 
                      src={match.awayPlayer.profile.profilePicture} 
                      alt={awayName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                      {awayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="text-lg font-semibold text-white">{awayName}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700 text-center">
              <span className="text-sm text-gray-400">Match #{match.matchNumber}</span>
            </div>
          </div>
        </div>

        {/* Submit Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl border border-gray-700 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Match Score</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  placeholder={homeName}
                  required
                  min="0"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-2xl focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  placeholder={awayName}
                  required
                  min="0"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-2xl focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Evidence Screenshot</label>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer">
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setEvidence(null)
                        setPreview(null)
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <XCircle size={16} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">Click to upload screenshot</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-blue-400 font-medium">Result Submission Guidelines</p>
                <p className="text-xs text-gray-400 mt-1">
                  Upload a clear screenshot showing the final match score. Results will be reviewed by an admin before being finalized.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Submit Result
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}