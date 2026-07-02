"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { 
  Trophy, DollarSign, Users, TrendingUp, Award, Crown, Medal, 
  Save, RefreshCw, Edit2, X, AlertCircle, Calendar,
  Percent, BarChart3, Wallet
} from "lucide-react"
import toast from "react-hot-toast"

interface PrizePool {
  id: string
  seasonId: string
  totalCollected: number
  entryFee: number
  registeredPlayers: number
  championReward: number
  runnerReward: number
  topScorerReward: number
  platformReserve: number
  updatedAt: string
  season: {
    id: string
    name: string
    status: string
  } | null
}

interface Season {
  id: string
  name: string
  status: string
}

export default function AdminPrizePoolPage() {
  const { data: session } = useSession()
  const [prizePool, setPrizePool] = useState<PrizePool | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeasonId, setSelectedSeasonId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    entryFee: 0,
    championPercent: 50,
    runnerPercent: 25,
    topScorerPercent: 10,
    platformPercent: 15,
  })

  useEffect(() => {
    fetchSeasons()
  }, [])

  useEffect(() => {
    if (selectedSeasonId) {
      fetchPrizePool(selectedSeasonId)
    }
  }, [selectedSeasonId])

  async function fetchSeasons() {
    try {
      const res = await fetch("/api/seasons")
      if (!res.ok) throw new Error("Failed to fetch seasons")
      const data = await res.json()
      setSeasons(data)
      if (data.length > 0) {
        setSelectedSeasonId(data[0].id)
      }
    } catch (error) {
      console.error("Error fetching seasons:", error)
      toast.error("Failed to load seasons")
    }
  }

  async function fetchPrizePool(seasonId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/competition/prize-pool?seasonId=${seasonId}`)
      if (!res.ok) throw new Error("Failed to fetch prize pool")
      const data = await res.json()
      setPrizePool(data)
      
      if (data) {
        setFormData({
          entryFee: data.entryFee || 0,
          championPercent: data.totalCollected > 0 ? Math.round((data.championReward / data.totalCollected) * 100) : 50,
          runnerPercent: data.totalCollected > 0 ? Math.round((data.runnerReward / data.totalCollected) * 100) : 25,
          topScorerPercent: data.totalCollected > 0 ? Math.round((data.topScorerReward / data.totalCollected) * 100) : 10,
          platformPercent: data.totalCollected > 0 ? Math.round((data.platformReserve / data.totalCollected) * 100) : 15,
        })
      }
    } catch (error) {
      console.error("Error fetching prize pool:", error)
      toast.error("Failed to load prize pool")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const totalPercent = formData.championPercent + formData.runnerPercent + 
                          formData.topScorerPercent + formData.platformPercent
      
      if (totalPercent !== 100) {
        toast.error(`Percentages must total 100%. Currently: ${totalPercent}%`)
        setSaving(false)
        return
      }

      const res = await fetch("/api/admin/competition/prize-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonId: selectedSeasonId,
          entryFee: formData.entryFee,
          championPercent: formData.championPercent,
          runnerPercent: formData.runnerPercent,
          topScorerPercent: formData.topScorerPercent,
          platformPercent: formData.platformPercent,
        }),
      })

      if (!res.ok) throw new Error("Failed to save prize pool")
      
      toast.success("Prize pool updated successfully!")
      setIsEditing(false)
      fetchPrizePool(selectedSeasonId)
    } catch (error) {
      console.error("Error saving prize pool:", error)
      toast.error("Failed to save prize pool")
    } finally {
      setSaving(false)
    }
  }

  // ✅ Safe helper to get values with defaults
  const getSafeValue = (value: number | undefined | null, fallback: number = 0) => {
    return value ?? fallback
  }

  const safeTotalCollected = getSafeValue(prizePool?.totalCollected)
  const safeChampionReward = getSafeValue(prizePool?.championReward)
  const safeRunnerReward = getSafeValue(prizePool?.runnerReward)
  const safeTopScorerReward = getSafeValue(prizePool?.topScorerReward)
  const safePlatformReserve = getSafeValue(prizePool?.platformReserve)
  const safeEntryFee = getSafeValue(prizePool?.entryFee)
  const safeRegisteredPlayers = getSafeValue(prizePool?.registeredPlayers)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading prize pool...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">💰 Prize Pool Management</h1>
          <p className="text-gray-400 text-sm">Configure prize distribution for competitions</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedSeasonId}
            onChange={(e) => setSelectedSeasonId(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchPrizePool(selectedSeasonId)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Entry Fee</p>
              <p className="text-2xl font-bold text-white">
                KES {safeEntryFee.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-white/50" />
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Paid Players</p>
              <p className="text-2xl font-bold text-blue-400">
                {safeRegisteredPlayers}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-400/50" />
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Prize Pool</p>
              <p className="text-2xl font-bold text-green-400">
                KES {safeTotalCollected.toLocaleString()}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-green-400/50" />
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Season Status</p>
              <p className="text-2xl font-bold text-yellow-400">
                {prizePool?.season?.status || "N/A"}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-400/50" />
          </div>
        </div>
      </div>

      {/* Prize Distribution */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Prize Distribution</h2>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-all"
          >
            {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Info message */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-sm text-blue-400">
              Prize pool is calculated from {safeRegisteredPlayers} paid players × KES {safeEntryFee} = KES {safeTotalCollected.toLocaleString()}
            </p>
          </div>

          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Entry Fee (KES)
                </label>
                <input
                  type="number"
                  value={formData.entryFee}
                  onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">This will be the entry fee for ALL players</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Champion (%)
                  </label>
                  <input
                    type="number"
                    value={formData.championPercent}
                    onChange={(e) => setFormData({ ...formData, championPercent: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Runner Up (%)
                  </label>
                  <input
                    type="number"
                    value={formData.runnerPercent}
                    onChange={(e) => setFormData({ ...formData, runnerPercent: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Top Scorer (%)
                  </label>
                  <input
                    type="number"
                    value={formData.topScorerPercent}
                    onChange={(e) => setFormData({ ...formData, topScorerPercent: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Platform Reserve (%)
                  </label>
                  <input
                    type="number"
                    value={formData.platformPercent}
                    onChange={(e) => setFormData({ ...formData, platformPercent: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-3">
                <p className="text-sm text-gray-400">
                  Total: <span className="font-bold text-white">
                    {formData.championPercent + formData.runnerPercent + 
                     formData.topScorerPercent + formData.platformPercent}%
                  </span>
                  {formData.championPercent + formData.runnerPercent + 
                   formData.topScorerPercent + formData.platformPercent !== 100 && (
                    <span className="text-red-400 ml-2">(Must equal 100%)</span>
                  )}
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Prize Distribution
                  </>
                )}
              </button>
            </div>
          ) : (
            // View Mode - Show actual values from database
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-400" />
                      <span className="text-sm text-gray-400">Champion</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-400">
                      KES {safeChampionReward.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {safeTotalCollected > 0 ? Math.round((safeChampionReward / safeTotalCollected) * 100) : 0}% of prize pool
                  </p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Medal className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-400">Runner Up</span>
                    </div>
                    <span className="text-lg font-bold text-gray-300">
                      KES {safeRunnerReward.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {safeTotalCollected > 0 ? Math.round((safeRunnerReward / safeTotalCollected) * 100) : 0}% of prize pool
                  </p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-400" />
                      <span className="text-sm text-gray-400">Top Scorer</span>
                    </div>
                    <span className="text-lg font-bold text-blue-400">
                      KES {safeTopScorerReward.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {safeTotalCollected > 0 ? Math.round((safeTopScorerReward / safeTotalCollected) * 100) : 0}% of prize pool
                  </p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-gray-500" />
                      <span className="text-sm text-gray-400">Platform Reserve</span>
                    </div>
                    <span className="text-lg font-bold text-gray-400">
                      KES {safePlatformReserve.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {safeTotalCollected > 0 ? Math.round((safePlatformReserve / safeTotalCollected) * 100) : 0}% of prize pool
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Champion</span>
                  <span>Runner Up</span>
                  <span>Top Scorer</span>
                  <span>Reserve</span>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div 
                    className="bg-yellow-500 h-full transition-all"
                    style={{ 
                      width: safeTotalCollected > 0 ? 
                        `${(safeChampionReward / safeTotalCollected) * 100}%` : '0%'
                    }}
                  />
                  <div 
                    className="bg-gray-400 h-full transition-all"
                    style={{ 
                      width: safeTotalCollected > 0 ? 
                        `${(safeRunnerReward / safeTotalCollected) * 100}%` : '0%'
                    }}
                  />
                  <div 
                    className="bg-blue-400 h-full transition-all"
                    style={{ 
                      width: safeTotalCollected > 0 ? 
                        `${(safeTopScorerReward / safeTotalCollected) * 100}%` : '0%'
                    }}
                  />
                  <div 
                    className="bg-gray-600 h-full transition-all"
                    style={{ 
                      width: safeTotalCollected > 0 ? 
                        `${(safePlatformReserve / safeTotalCollected) * 100}%` : '0%'
                    }}
                  />
                </div>
              </div>

              <div className="text-center text-xs text-gray-500">
                Last updated: {prizePool?.updatedAt ? new Date(prizePool.updatedAt).toLocaleString() : 'Never'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}