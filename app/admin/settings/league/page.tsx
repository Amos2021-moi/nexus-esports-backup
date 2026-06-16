"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Save, Loader2, Trophy, Calendar, Lock, RefreshCw, Shield, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"

interface LeagueSettings {
  pointsWin: number
  pointsDraw: number
  pointsLoss: number
  autoFixtureGeneration: boolean
  fixtureLock: boolean
  seasonFreeze: boolean
}

const defaultSettings: LeagueSettings = {
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
  autoFixtureGeneration: true,
  fixtureLock: false,
  seasonFreeze: false,
}

export default function AdminLeagueSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<LeagueSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Role check - redirect if not admin
  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchSettings()
    }
  }, [session])

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings?category=league")
      if (res.ok) {
        const data = await res.json()
        setSettings({
          pointsWin: data.pointsWin !== undefined ? data.pointsWin : defaultSettings.pointsWin,
          pointsDraw: data.pointsDraw !== undefined ? data.pointsDraw : defaultSettings.pointsDraw,
          pointsLoss: data.pointsLoss !== undefined ? data.pointsLoss : defaultSettings.pointsLoss,
          autoFixtureGeneration: data.autoFixtureGeneration !== undefined ? data.autoFixtureGeneration : defaultSettings.autoFixtureGeneration,
          fixtureLock: data.fixtureLock !== undefined ? data.fixtureLock : defaultSettings.fixtureLock,
          seasonFreeze: data.seasonFreeze !== undefined ? data.seasonFreeze : defaultSettings.seasonFreeze,
        })
      }
    } catch (error) {
      console.error("Error fetching league settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      for (const [key, value] of Object.entries(settings)) {
        await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: "league",
            key,
            value,
          }),
        })
      }

      toast.success("League settings updated!")
    } catch (error) {
      console.error("Error saving league settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof LeagueSettings, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">League Settings</h2>
          </div>
          <p className="text-gray-400 text-sm">Configure league rules and behavior</p>
        </div>

        {/* Points System */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-300">Points System</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Win</label>
              <input
                type="number"
                min="0"
                max="10"
                value={settings.pointsWin}
                onChange={(e) => handleChange("pointsWin", parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white text-center text-lg font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Draw</label>
              <input
                type="number"
                min="0"
                max="10"
                value={settings.pointsDraw}
                onChange={(e) => handleChange("pointsDraw", parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white text-center text-lg font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Loss</label>
              <input
                type="number"
                min="0"
                max="10"
                value={settings.pointsLoss}
                onChange={(e) => handleChange("pointsLoss", parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white text-center text-lg font-bold focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">Points awarded for match results. Affects all league standings.</p>
        </div>

        {/* Auto Fixture Generation */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-400" />
              Auto-Fixture Generation
            </p>
            <p className="text-xs text-gray-400">Automatically generate fixtures when season starts</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("autoFixtureGeneration", !settings.autoFixtureGeneration)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.autoFixtureGeneration ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.autoFixtureGeneration ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Fixture Lock */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-yellow-400" />
              Fixture Lock
            </p>
            <p className="text-xs text-gray-400">Prevent fixture modifications after lock date</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("fixtureLock", !settings.fixtureLock)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.fixtureLock ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.fixtureLock ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Season Freeze */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-400" />
              Season Freeze
            </p>
            <p className="text-xs text-gray-400">Prevent all changes to the current season (standings, fixtures, results)</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("seasonFreeze", !settings.seasonFreeze)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.seasonFreeze ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.seasonFreeze ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Warning */}
        {settings.seasonFreeze && (
          <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-sm text-red-300 font-medium">Season is Frozen</p>
                <p className="text-xs text-gray-400 mt-1">
                  No changes can be made to fixtures, results, or standings while the season is frozen.
                  This includes admin actions and player submissions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex gap-4 pt-4 border-t border-gray-800">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}