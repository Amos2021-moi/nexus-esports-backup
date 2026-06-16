"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Calendar, CheckCircle, Clock, Trophy, AlertCircle, Lock, Eye, MessageCircle, Send, Calendar as CalendarIcon, ArrowRight } from "lucide-react"
import WhatsAppButton from "@/components/ui/WhatsAppButton"
import EvidenceViewer from "@/components/ui/EvidenceViewer"
import TrustBadge from "@/components/ui/TrustBadge"
import toast from "react-hot-toast"

interface Fixture {
  id: string
  status: string
  homePlayer: { 
    name: string
    email: string
    profile: { 
      username: string
      profilePicture: string
      whatsappNumber: string
      whatsappVisible: boolean
    } | null 
  }
  awayPlayer: { 
    name: string
    email: string
    profile: { 
      username: string
      profilePicture: string
      whatsappNumber: string
      whatsappVisible: boolean
    } | null 
  }
  homeScore: number | null
  awayScore: number | null
  scheduledDate: string
  result: { approved: boolean; evidenceImage: string } | null
  season: { 
    id: string
    name: string
    status: string
    endDate: string
  } | null
}

// Time Suggestion Modal Component
function TimeSuggestionModal({ fixture, onClose }: { fixture: Fixture; onClose: () => void }) {
  const [proposedTime, setProposedTime] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSuggest = async () => {
    if (!proposedTime) {
      toast.error("Please select a date and time")
      return
    }

    setLoading(true)
    const res = await fetch(`/api/fixtures/${fixture.id}/suggest-time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposedTime, message })
    })

    if (res.ok) {
      const { whatsappUrl } = await res.json()
      window.open(whatsappUrl, "_blank")
      onClose()
      toast.success("Opening WhatsApp with your suggestion...")
    } else {
      const error = await res.json()
      toast.error(error.error || "Failed to suggest time")
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Suggest Match Time</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={proposedTime}
              onChange={(e) => setProposedTime(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Add a personal message..."
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSuggest}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send via WhatsApp"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getStatusBadge(status: string) {
  switch (status) {
    case "SCHEDULED":
      return { text: "Upcoming", color: "text-blue-400", bg: "bg-blue-500/10", icon: Calendar }
    case "PENDING":
      return { text: "Pending Approval", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Clock }
    case "COMPLETED":
      return { text: "Completed", color: "text-green-400", bg: "bg-green-500/10", icon: CheckCircle }
    default:
      return { text: status || "Unknown", color: "text-gray-400", bg: "bg-gray-500/10", icon: AlertCircle }
  }
}

function getSeasonDisplayStatus(status: string) {
  switch (status) {
    case "PRESEASON":
      return { showFixtures: false, canSubmit: false, canWhatsApp: false, message: "Season hasn't started yet", icon: Calendar }
    case "REGISTRATION":
      return { showFixtures: false, canSubmit: false, canWhatsApp: false, message: "Registration open - Fixtures coming soon", icon: Calendar }
    case "FIXTURE_LOCK":
      return { showFixtures: true, canSubmit: false, canWhatsApp: true, message: "Fixtures locked - Contact your opponent", icon: Lock }
    case "LIVE":
      return { showFixtures: true, canSubmit: true, canWhatsApp: true, message: "Season is LIVE - Submit your results", icon: Trophy }
    case "ENDED":
      return { showFixtures: true, canSubmit: false, canWhatsApp: false, message: "Season ended - View history", icon: Eye }
    case "ARCHIVED":
      return { showFixtures: true, canSubmit: false, canWhatsApp: false, message: "Season archived - Read only", icon: Eye }
    default:
      return { showFixtures: true, canSubmit: false, canWhatsApp: false, message: "Season status unknown", icon: AlertCircle }
  }
}

export default function FixturesPage() {
  const { data: session } = useSession()
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [loading, setLoading] = useState(true)
  const [showTimeModal, setShowTimeModal] = useState<string | null>(null)

  useEffect(() => {
    fetchFixtures()
  }, [])

  async function fetchFixtures() {
    try {
      const response = await fetch("/api/fixtures", { credentials: "include" })
      if (!response.ok) throw new Error("Failed to fetch fixtures")
      const data = await response.json()
      setFixtures(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching fixtures:", error)
      toast.error("Failed to load fixtures")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Fixtures</h1>
          <p className="text-gray-400 mt-1">Loading your matches...</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-6 animate-pulse">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center">
                  <div className="h-12 w-12 bg-gray-700 rounded-full mx-auto mb-2"></div>
                  <div className="h-5 w-24 bg-gray-700 rounded mx-auto"></div>
                </div>
                <div className="px-4">
                  <div className="h-8 w-16 bg-gray-700 rounded"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="h-12 w-12 bg-gray-700 rounded-full mx-auto mb-2"></div>
                  <div className="h-5 w-24 bg-gray-700 rounded mx-auto"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const seasonStatus = fixtures[0]?.season?.status || "UNKNOWN"
  const seasonDisplay = getSeasonDisplayStatus(seasonStatus)

  const myFixtures = fixtures.filter(f => 
    f.homePlayer?.name === session?.user?.name || 
    f.awayPlayer?.name === session?.user?.name
  )

  if (!seasonDisplay.showFixtures) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Fixtures</h1>
          <p className="text-gray-400 mt-1">Your upcoming matches</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
          <seasonDisplay.icon size={48} className="text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Fixtures Available</h2>
          <p className="text-gray-400">{seasonDisplay.message}</p>
        </div>
      </div>
    )
  }

  if (myFixtures.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Fixtures</h1>
          <p className="text-gray-400 mt-1">Your upcoming matches</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
          <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Fixtures Yet</h2>
          <p className="text-gray-400">Fixtures will appear here once the admin generates them.</p>
        </div>
      </div>
    )
  }

  const getOpponent = (fixture: Fixture) => {
    const isHome = fixture.homePlayer?.name === session?.user?.name
    const opponent = isHome ? fixture.awayPlayer : fixture.homePlayer
    const opponentName = opponent?.profile?.username || opponent?.name || "Opponent"
    const opponentWhatsApp = opponent?.profile?.whatsappNumber || null
    const opponentWhatsAppVisible = opponent?.profile?.whatsappVisible || false
    return { opponentName, opponentWhatsApp, opponentWhatsAppVisible, isHome }
  }

  const getWinner = (fixture: Fixture) => {
    if (!fixture.homeScore || !fixture.awayScore) return null
    if (fixture.homeScore > fixture.awayScore) return fixture.homePlayer?.profile?.username || fixture.homePlayer?.name
    if (fixture.awayScore > fixture.homeScore) return fixture.awayPlayer?.profile?.username || fixture.awayPlayer?.name
    return "Draw"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Fixtures</h1>
        <p className="text-gray-400 mt-1">Your upcoming and past matches</p>
      </div>

      {/* Season Banner */}
      <div className={`rounded-xl p-4 ${
        seasonStatus === "LIVE" ? "bg-green-500/20 border border-green-500/30" : 
        seasonStatus === "FIXTURE_LOCK" ? "bg-blue-500/20 border border-blue-500/30" : 
        "bg-gray-700/50 border border-gray-600"
      }`}>
        <div className="flex items-center gap-3">
          {seasonStatus === "LIVE" && <Trophy size={20} className="text-green-400" />}
          {seasonStatus === "FIXTURE_LOCK" && <Lock size={20} className="text-blue-400" />}
          {seasonStatus !== "LIVE" && seasonStatus !== "FIXTURE_LOCK" && <Calendar size={20} className="text-gray-400" />}
          <div>
            <p className="text-white font-medium">Season Status: {seasonStatus}</p>
            <p className={`text-sm ${
              seasonStatus === "LIVE" ? "text-green-400" : 
              seasonStatus === "FIXTURE_LOCK" ? "text-blue-400" : 
              "text-gray-400"
            }`}>
              {seasonDisplay.message}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {myFixtures.map((fixture) => {
          const homeName = fixture.homePlayer?.profile?.username || fixture.homePlayer?.name || "Home"
          const awayName = fixture.awayPlayer?.profile?.username || fixture.awayPlayer?.name || "Away"
          const hasResult = fixture.homeScore !== null
          const isPending = fixture.status === "PENDING"
          const isCompleted = fixture.status === "COMPLETED"
          const statusBadge = getStatusBadge(fixture.status)
          const StatusIcon = statusBadge.icon
          const { opponentName, opponentWhatsApp, opponentWhatsAppVisible } = getOpponent(fixture)
          const winner = getWinner(fixture)
          
          return (
            <div key={fixture.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all">
              {/* Status Badge */}
              <div className="mb-4 flex justify-between items-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusBadge.bg}`}>
                  <StatusIcon size={14} className={statusBadge.color} />
                  <span className={`text-xs font-medium ${statusBadge.color}`}>{statusBadge.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isCompleted && winner && winner !== "Draw" && (
                    <div className="text-xs text-green-400 flex items-center gap-1">
                      <Trophy size={12} />
                      Winner: {winner}
                    </div>
                  )}
                  {isCompleted && winner === "Draw" && (
                    <div className="text-xs text-yellow-400">Match Drawn</div>
                  )}
                  {/* Trust Badge - Admin Approved */}
                  {fixture.result?.approved && (
                    <TrustBadge type="admin-approved" />
                  )}
                </div>
              </div>

              {/* Match Teams */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center">
                  {fixture.homePlayer?.profile?.profilePicture ? (
                    <img 
                      src={fixture.homePlayer.profile.profilePicture} 
                      alt={homeName}
                      className="h-16 w-16 rounded-full object-cover border-2 border-indigo-500 mx-auto mb-2"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                      {homeName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="font-semibold text-white">{homeName}</p>
                </div>
                
                <div className="px-4">
                  {hasResult ? (
                    <span className="text-2xl font-bold text-white">
                      {fixture.homeScore} - {fixture.awayScore}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-lg">VS</span>
                  )}
                </div>
                
                <div className="flex-1 text-center">
                  {fixture.awayPlayer?.profile?.profilePicture ? (
                    <img 
                      src={fixture.awayPlayer.profile.profilePicture} 
                      alt={awayName}
                      className="h-16 w-16 rounded-full object-cover border-2 border-purple-500 mx-auto mb-2"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                      {awayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="font-semibold text-white">{awayName}</p>
                </div>
              </div>
              
              {/* Date */}
              <div className="text-center mt-4 text-sm text-gray-500">
                {new Date(fixture.scheduledDate).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              {/* Evidence Viewer for pending/completed */}
              {isPending && fixture.result?.evidenceImage && (
                <div className="text-center mt-3">
                  <EvidenceViewer evidenceImage={fixture.result.evidenceImage} />
                </div>
              )}
              
              {/* Locked Indicator */}
              {isPending && (
                <div className="text-center mt-3">
                  <div className="inline-flex items-center gap-2 text-yellow-500 text-sm">
                    <Clock size={14} />
                    <span>Pending admin approval</span>
                  </div>
                </div>
              )}
              
              {isCompleted && (
                <div className="text-center mt-3">
                  <div className="inline-flex items-center gap-2 text-green-500 text-sm">
                    <CheckCircle size={14} />
                    <span>Match completed - result finalized</span>
                  </div>
                </div>
              )}
              
              {/* WhatsApp Button */}
              {seasonDisplay.canWhatsApp && fixture.status === "SCHEDULED" && !hasResult && (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                  <WhatsAppButton
                    opponentWhatsApp={opponentWhatsApp}
                    opponentWhatsAppVisible={opponentWhatsAppVisible}
                    opponentName={opponentName}
                    fixtureId={fixture.id}
                    seasonName={fixture.season?.name}
                    deadline={fixture.season?.endDate}
                    homePlayer={homeName}
                    awayPlayer={awayName}
                  />
                  
                  {/* Suggest Time Button */}
                  <button
                    onClick={() => setShowTimeModal(fixture.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                  >
                    <CalendarIcon size={16} />
                    Suggest Match Time
                  </button>
                </div>
              )}
              
              {/* Submit Result Button */}
              {seasonDisplay.canSubmit && fixture.status === "SCHEDULED" && !hasResult && (
                <div className="text-center mt-4 pt-4 border-t border-gray-700">
                  <Link
                    href={`/dashboard/results/submit/${fixture.id}`}
                    className="inline-block w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-all text-center"
                  >
                    Submit Result
                  </Link>
                </div>
              )}
              
              {/* Match Center Link */}
              {fixture.status !== "SCHEDULED" && (
                <div className="text-center mt-3 pt-3 border-t border-gray-700">
                  <Link
                    href={`/matches/${fixture.id}`}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                  >
                    View Match Center <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Time Suggestion Modal */}
      {showTimeModal && (
        <TimeSuggestionModal
          fixture={myFixtures.find(f => f.id === showTimeModal)!}
          onClose={() => setShowTimeModal(null)}
        />
      )}
    </div>
  )
}