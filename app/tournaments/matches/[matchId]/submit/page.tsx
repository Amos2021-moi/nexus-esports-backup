"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, Camera, AlertCircle, CheckCircle, Clock, XCircle, Trophy } from "lucide-react"
import toast from "react-hot-toast"

interface Match {
  id: string
  round: number
  matchNumber: number
  homePlayerId: string | null
  awayPlayerId: string | null
  status: string
  homePlayer: { name: string; profile: { username: string; profilePicture: string } } | null
  awayPlayer: { name: string; profile: { username: string; profilePicture: string } } | null
  tournament: { id: string; name: string; type: string }
  scheduledDate: string
}

export default function SubmitTournamentResultPage() {
  const { matchId } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [evidence, setEvidence] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [matchStatus, setMatchStatus] = useState<string>("")
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (matchId) {
      fetchMatch()
    }
  }, [matchId])

  async function fetchMatch() {
    try {
      setLoading(true)
      const res = await fetch(`/api/tournaments/matches/${matchId}`)
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      console.log("🔍 Match Data:", data)
      
      setMatch(data)
      setMatchStatus(data.status)

      // ✅ If match is already pending or completed, redirect
      if (data.status === "PENDING" || data.status === "COMPLETED") {
        toast.error("This match already has a result submitted")
        setRedirecting(true)
        setTimeout(() => {
          router.push(`/tournaments/${data.tournamentId}`)
        }, 1500)
      }
    } catch (error) {
      console.error("Error fetching match:", error)
      toast.error("Failed to load match data")
    } finally {
      setLoading(false)
    }
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

  try {
    const res = await fetch(`/api/tournaments/matches/${matchId}/submit`, {
      method: "POST",
      body: formData,
    })

    // ✅ Check if response has content before parsing JSON
    const text = await res.text()
    let data = {}
    try {
      data = JSON.parse(text)
    } catch (parseError) {
      console.error("Failed to parse JSON:", text)
      data = { error: "Server returned invalid response" }
    }

    if (res.ok) {
      toast.success("Result submitted successfully!")
      router.push(`/tournaments/${match?.tournament.id}`)
    } else {
      toast.error((data as any).error || "Failed to submit")
    }
  } catch (error) {
    console.error("Submit error:", error)
    toast.error("Network error. Please try again.")
  } finally {
    setSubmitting(false)
  }
}

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB")
        return
      }
      setEvidence(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // ✅ If redirecting, show a message
  if (redirecting) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-12 w-12 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white font-medium">Result already submitted...</p>
          <p className="text-gray-400 text-sm mt-1">Redirecting to tournament</p>
        </div>
      </div>
    )
  }

  // ✅ If match is already pending or completed
  if (matchStatus === "PENDING") {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gray-800 rounded-xl border border-yellow-500/30 p-8 text-center">
          <Clock className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Result Already Submitted</h2>
          <p className="text-gray-400 mb-4">
            This match already has a result waiting for admin approval.
          </p>
          <Link
            href={`/tournaments/${match?.tournament.id || ''}`}
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all"
          >
            Back to Tournament
          </Link>
        </div>
      </div>
    )
  }

  if (matchStatus === "COMPLETED") {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gray-800 rounded-xl border border-green-500/30 p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Match Completed</h2>
          <p className="text-gray-400 mb-4">
            This match has already been completed and approved.
          </p>
          <Link
            href={`/tournaments/${match?.tournament.id || ''}`}
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all"
          >
            Back to Tournament
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading match...</div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="text-center py-8 text-gray-400">Match not found</div>
    )
  }

  const homeName = match.homePlayer?.profile?.username || match.homePlayer?.name || "Home"
  const awayName = match.awayPlayer?.profile?.username || match.awayPlayer?.name || "Away"

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <Link 
        href={`/tournaments/${match.tournament.id}`} 
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Tournament
      </Link>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <h1 className="text-2xl font-bold text-white">Submit Tournament Result</h1>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          {match.tournament.name} • Round {match.round} • Match {match.matchNumber}
        </p>

        {/* Match Info */}
        <div className="flex items-center justify-center gap-6 py-6">
          <div className="text-center">
            {match.homePlayer?.profile?.profilePicture ? (
              <img 
                src={match.homePlayer.profile.profilePicture} 
                alt={homeName}
                className="h-16 w-16 rounded-full object-cover border-2 border-indigo-500 mx-auto"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto">
                {homeName.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-white font-medium mt-2">{homeName}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                min="0"
                className="w-20 p-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-3xl focus:outline-none focus:border-indigo-500"
              />
              <span className="text-gray-500 text-xl">vs</span>
              <input
                type="number"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                min="0"
                className="w-20 p-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-3xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="text-center">
            {match.awayPlayer?.profile?.profilePicture ? (
              <img 
                src={match.awayPlayer.profile.profilePicture} 
                alt={awayName}
                className="h-16 w-16 rounded-full object-cover border-2 border-purple-500 mx-auto"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold mx-auto">
                {awayName.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-white font-medium mt-2">{awayName}</p>
          </div>
        </div>

        {/* Evidence Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Evidence Screenshot <span className="text-red-400">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors cursor-pointer">
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="evidence-upload" />
            <label htmlFor="evidence-upload" className="cursor-pointer block">
              {preview ? (
                <div className="relative inline-block">
                  <img src={preview} alt="Preview" className="max-h-48 rounded-lg" />
                  <button
                    type="button"
                    onClick={() => { setEvidence(null); setPreview(null) }}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <XCircle size={16} className="text-white" />
                  </button>
                </div>
              ) : (
                <div>
                  <Camera className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">Click to upload screenshot</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
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
      </div>
    </div>
  )
}