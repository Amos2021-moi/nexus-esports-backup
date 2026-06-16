"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Camera, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

interface Fixture {
  id: string
  homePlayer: { 
    name: string
    email: string
    profile: { username: string; profilePicture: string } | null 
  }
  awayPlayer: { 
    name: string
    email: string
    profile: { username: string; profilePicture: string } | null 
  }
  scheduledDate: string
}

export default function SubmitResultPage() {
  const { fixtureId } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [fixture, setFixture] = useState<Fixture | null>(null)
  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [evidence, setEvidence] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (fixtureId) {
      fetchFixture()
    }
  }, [fixtureId])

  async function fetchFixture() {
    try {
      setLoading(true)
      const res = await fetch(`/api/fixtures/${fixtureId}`)
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setFixture(data)
    } catch (err) {
      console.error("Fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to load fixture")
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
    
    // Evidence is always required for now
    if (!evidence) {
      toast.error("Evidence screenshot is required. Please upload a screenshot.")
      return
    }

    setSubmitting(true)
    setError("")

    const formData = new FormData()
    formData.append("homeScore", homeScore)
    formData.append("awayScore", awayScore)
    if (evidence) formData.append("evidence", evidence)

    try {
      const res = await fetch(`/api/results/submit/${fixtureId}`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Result submitted! Waiting for admin approval.")
        router.push("/dashboard/fixtures")
      } else {
        toast.error(data.error || "Failed to submit result")
      }
    } catch (err) {
      console.error("Submit error:", err)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading fixture...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-400">{error}</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!fixture) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-gray-400">Fixture not found</div>
        <button
          onClick={() => router.push("/dashboard/fixtures")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          View All Fixtures
        </button>
      </div>
    )
  }

  const homeName = fixture.homePlayer?.profile?.username || 
                   fixture.homePlayer?.name || 
                   "Home Player"
  
  const awayName = fixture.awayPlayer?.profile?.username || 
                   fixture.awayPlayer?.name || 
                   "Away Player"

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/dashboard/fixtures" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
          Back to Fixtures
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-white mb-6">Submit Match Result</h1>
      
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-right">
              <div className="flex justify-end mb-2">
                {fixture.homePlayer?.profile?.profilePicture ? (
                  <img 
                    src={fixture.homePlayer.profile.profilePicture} 
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
                {fixture.awayPlayer?.profile?.profilePicture ? (
                  <img 
                    src={fixture.awayPlayer.profile.profilePicture} 
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
            <p className="text-sm text-gray-400">
              {new Date(fixture.scheduledDate).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {homeName} Score
              </label>
              <input
                type="number"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                required
                min="0"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-2xl focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {awayName} Score
              </label>
              <input
                type="number"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                required
                min="0"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-center text-2xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Evidence Screenshot <span className="text-red-400">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="evidence-upload"
                required
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

          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-400 font-medium">Evidence Required</p>
                <p className="text-xs text-gray-400 mt-1">
                  A screenshot of the match result is required for approval.
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