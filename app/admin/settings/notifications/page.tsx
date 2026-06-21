"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Save, Loader2, Bell, Mail, MessageCircle, Calendar, Trophy, Flag, Shield,  AlertTriangle, Users, Megaphone, Clock, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

interface AdminNotificationSettings {
  matchReminders: boolean
  resultApproved: boolean
  tournamentUpdates: boolean
  newsAlerts: boolean
  systemAnnouncements: boolean
  adminDigest: boolean
  digestFrequency: "daily" | "weekly" | "monthly"
  moderationAlerts: boolean
  reportAlerts: boolean
}

const defaultSettings: AdminNotificationSettings = {
  matchReminders: true,
  resultApproved: true,
  tournamentUpdates: true,
  newsAlerts: true,
  systemAnnouncements: true,
  adminDigest: true,
  digestFrequency: "daily",
  moderationAlerts: true,
  reportAlerts: true,
}

export default function AdminNotificationSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<AdminNotificationSettings>(defaultSettings)
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
      const res = await fetch("/api/settings?category=admin_notifications")
      if (res.ok) {
        const data = await res.json()
        setSettings({
          matchReminders: data.matchReminders !== undefined ? data.matchReminders : defaultSettings.matchReminders,
          resultApproved: data.resultApproved !== undefined ? data.resultApproved : defaultSettings.resultApproved,
          tournamentUpdates: data.tournamentUpdates !== undefined ? data.tournamentUpdates : defaultSettings.tournamentUpdates,
          newsAlerts: data.newsAlerts !== undefined ? data.newsAlerts : defaultSettings.newsAlerts,
          systemAnnouncements: data.systemAnnouncements !== undefined ? data.systemAnnouncements : defaultSettings.systemAnnouncements,
          adminDigest: data.adminDigest !== undefined ? data.adminDigest : defaultSettings.adminDigest,
          digestFrequency: data.digestFrequency || defaultSettings.digestFrequency,
          moderationAlerts: data.moderationAlerts !== undefined ? data.moderationAlerts : defaultSettings.moderationAlerts,
          reportAlerts: data.reportAlerts !== undefined ? data.reportAlerts : defaultSettings.reportAlerts,
        })
      }
    } catch (error) {
      console.error("Error fetching admin notification settings:", error)
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
            category: "admin_notifications",
            key,
            value,
          }),
        })
      }

      toast.success("Admin notification settings updated!")
    } catch (error) {
      console.error("Error saving admin notification settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof AdminNotificationSettings, value: any) => {
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
            <Bell className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Admin Notifications</h2>
          </div>
          <p className="text-gray-400 text-sm">Configure which notifications you receive as an admin</p>
        </div>

        {/* Notification Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div>
              <p className="text-white font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                Match Reminders
              </p>
              <p className="text-xs text-gray-400">Get notified about upcoming matches</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("matchReminders", !settings.matchReminders)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                settings.matchReminders ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                settings.matchReminders ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div>
              <p className="text-white font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Result Approved
              </p>
              <p className="text-xs text-gray-400">Get notified when a result is approved</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("resultApproved", !settings.resultApproved)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                settings.resultApproved ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                settings.resultApproved ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div>
              <p className="text-white font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                Tournament Updates
              </p>
              <p className="text-xs text-gray-400">Get notified about tournament status changes</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("tournamentUpdates", !settings.tournamentUpdates)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                settings.tournamentUpdates ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                settings.tournamentUpdates ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div>
              <p className="text-white font-medium flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-purple-400" />
                News Alerts
              </p>
              <p className="text-xs text-gray-400">Get notified when news is published</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("newsAlerts", !settings.newsAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                settings.newsAlerts ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                settings.newsAlerts ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div>
              <p className="text-white font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                System Announcements
              </p>
              <p className="text-xs text-gray-400">Get notified about important system updates</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("systemAnnouncements", !settings.systemAnnouncements)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                settings.systemAnnouncements ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                settings.systemAnnouncements ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div>
              <p className="text-white font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" />
                Moderation Alerts
              </p>
              <p className="text-xs text-gray-400">Get notified when content needs moderation approval</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("moderationAlerts", !settings.moderationAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                settings.moderationAlerts ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                settings.moderationAlerts ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div>
              <p className="text-white font-medium flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-400" />
                Report Alerts
              </p>
              <p className="text-xs text-gray-400">Get notified when content is reported by players</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("reportAlerts", !settings.reportAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                settings.reportAlerts ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                settings.reportAlerts ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div>
              <p className="text-white font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" />
                Admin Digest
              </p>
              <p className="text-xs text-gray-400">Receive a summary of platform activity</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("adminDigest", !settings.adminDigest)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                settings.adminDigest ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                settings.adminDigest ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </div>

        {/* Digest Frequency */}
        {settings.adminDigest && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Digest Frequency
              </span>
            </label>
            <select
              value={settings.digestFrequency}
              onChange={(e) => handleChange("digestFrequency", e.target.value as any)}
              className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">How often to receive the admin digest email</p>
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