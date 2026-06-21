"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Save, Loader2, Shield, MessageSquare, Users, Flag, Ban, AlertTriangle, CheckCircle, Eye, EyeOff, UserX, Filter } from "lucide-react"
import toast from "react-hot-toast"

interface ModerationSettings {
  postApproval: boolean
  commentFiltering: boolean
  squadApproval: boolean
  playerReports: boolean
  autoBanThreshold: number
  requireVerification: boolean
  allowGuestReporting: boolean
}

const defaultSettings: ModerationSettings = {
  postApproval: false,
  commentFiltering: true,
  squadApproval: false,
  playerReports: true,
  autoBanThreshold: 5,
  requireVerification: false,
  allowGuestReporting: true,
}

export default function AdminModerationSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<ModerationSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
      const res = await fetch("/api/settings?category=moderation")
      if (res.ok) {
        const data = await res.json()
        setSettings({
          postApproval: data.postApproval !== undefined ? data.postApproval : defaultSettings.postApproval,
          commentFiltering: data.commentFiltering !== undefined ? data.commentFiltering : defaultSettings.commentFiltering,
          squadApproval: data.squadApproval !== undefined ? data.squadApproval : defaultSettings.squadApproval,
          playerReports: data.playerReports !== undefined ? data.playerReports : defaultSettings.playerReports,
          autoBanThreshold: data.autoBanThreshold !== undefined ? data.autoBanThreshold : defaultSettings.autoBanThreshold,
          requireVerification: data.requireVerification !== undefined ? data.requireVerification : defaultSettings.requireVerification,
          allowGuestReporting: data.allowGuestReporting !== undefined ? data.allowGuestReporting : defaultSettings.allowGuestReporting,
        })
      }
    } catch (error) {
      console.error("Error fetching moderation settings:", error)
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
            category: "moderation",
            key,
            value,
          }),
        })
      }

      toast.success("Moderation settings updated!")
    } catch (error) {
      console.error("Error saving moderation settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof ModerationSettings, value: any) => {
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
            <Shield className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Moderation Settings</h2>
          </div>
          <p className="text-gray-400 text-sm">Configure content moderation and community safety</p>
        </div>

        {/* Post Approval */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              Post Approval
            </p>
            <p className="text-xs text-gray-400">Require admin approval before posts appear in community feed</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("postApproval", !settings.postApproval)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.postApproval ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.postApproval ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Comment Filtering */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              <Filter className="h-4 w-4 text-purple-400" />
              Comment Filtering
            </p>
            <p className="text-xs text-gray-400">Auto-filter inappropriate comments</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("commentFiltering", !settings.commentFiltering)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.commentFiltering ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.commentFiltering ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Squad Approval */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" />
              Squad Approval
            </p>
            <p className="text-xs text-gray-400">Require admin approval before squads appear on player profiles</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("squadApproval", !settings.squadApproval)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.squadApproval ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.squadApproval ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Player Reports */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              <Flag className="h-4 w-4 text-red-400" />
              Player Reports
            </p>
            <p className="text-xs text-gray-400">Allow players to report inappropriate content and behavior</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("playerReports", !settings.playerReports)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.playerReports ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.playerReports ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Auto-Ban Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <span className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-red-400" />
              Auto-Ban Threshold
            </span>
          </label>
          <select
            value={settings.autoBanThreshold}
            onChange={(e) => handleChange("autoBanThreshold", parseInt(e.target.value))}
            className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          >
            <option value={3}>3 Reports</option>
            <option value={5}>5 Reports (Default)</option>
            <option value={10}>10 Reports</option>
            <option value={15}>15 Reports</option>
            <option value={20}>20 Reports</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">Number of valid reports needed to auto-ban a player</p>
        </div>

        {/* Require Verification */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Require Email Verification
            </p>
            <p className="text-xs text-gray-400">Players must verify their email before posting in community</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("requireVerification", !settings.requireVerification)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.requireVerification ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.requireVerification ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Allow Guest Reporting */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-cyan-400" />
              Allow Guest Reporting
            </p>
            <p className="text-xs text-gray-400">Allow non-logged-in users to report content</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("allowGuestReporting", !settings.allowGuestReporting)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.allowGuestReporting ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.allowGuestReporting ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Warning */}
        {settings.postApproval && (
          <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-300 font-medium">Post Approval Enabled</p>
                <p className="text-xs text-gray-400 mt-1">
                  All community posts will require admin approval before being visible to other players.
                  This may slow down community engagement but improves content quality.
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