"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Save, Loader2, Bell, BellOff, Mail, MessageCircle, Calendar, Trophy, Award, Newspaper } from "lucide-react"
import toast from "react-hot-toast"

interface NotificationSettings {
  fixtureAlerts: boolean
  resultApproved: boolean
  awardNotifications: boolean
  newsAlerts: boolean
  commentAlerts: boolean
  matchReminders: boolean
  emailNotifications: boolean
}

const defaultSettings: NotificationSettings = {
  fixtureAlerts: true,
  resultApproved: true,
  awardNotifications: true,
  newsAlerts: true,
  commentAlerts: true,
  matchReminders: true,
  emailNotifications: true,
}

export default function NotificationSettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings?category=notifications")
      if (res.ok) {
        const data = await res.json()
        setSettings({
          fixtureAlerts: data.fixtureAlerts !== undefined ? data.fixtureAlerts : defaultSettings.fixtureAlerts,
          resultApproved: data.resultApproved !== undefined ? data.resultApproved : defaultSettings.resultApproved,
          awardNotifications: data.awardNotifications !== undefined ? data.awardNotifications : defaultSettings.awardNotifications,
          newsAlerts: data.newsAlerts !== undefined ? data.newsAlerts : defaultSettings.newsAlerts,
          commentAlerts: data.commentAlerts !== undefined ? data.commentAlerts : defaultSettings.commentAlerts,
          matchReminders: data.matchReminders !== undefined ? data.matchReminders : defaultSettings.matchReminders,
          emailNotifications: data.emailNotifications !== undefined ? data.emailNotifications : defaultSettings.emailNotifications,
        })
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      // Save each setting individually
      for (const [key, value] of Object.entries(settings)) {
        await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: "notifications",
            key,
            value,
          }),
        })
      }

      toast.success("Notification settings updated!")
    } catch (error) {
      console.error("Error saving notification settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    })
  }

  const notificationOptions = [
    {
      key: "fixtureAlerts" as keyof NotificationSettings,
      label: "Fixture Alerts",
      description: "Get notified when new fixtures are assigned to you",
      icon: Calendar,
    },
    {
      key: "resultApproved" as keyof NotificationSettings,
      label: "Result Approved",
      description: "Get notified when your match results are approved",
      icon: Bell,
    },
    {
      key: "awardNotifications" as keyof NotificationSettings,
      label: "Award Notifications",
      description: "Get notified when you win awards or trophies",
      icon: Trophy,
    },
    {
      key: "newsAlerts" as keyof NotificationSettings,
      label: "News Alerts",
      description: "Get notified about important announcements and news",
      icon: Newspaper,
    },
    {
      key: "commentAlerts" as keyof NotificationSettings,
      label: "Comment Alerts",
      description: "Get notified when someone comments on your posts",
      icon: MessageCircle,
    },
    {
      key: "matchReminders" as keyof NotificationSettings,
      label: "Match Reminders",
      description: "Receive reminders before your upcoming matches",
      icon: Calendar,
    },
    {
      key: "emailNotifications" as keyof NotificationSettings,
      label: "Email Notifications",
      description: "Receive notifications via email (in addition to in-app)",
      icon: Mail,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
          <p className="text-gray-400 text-sm mt-1">Choose which notifications you want to receive</p>
        </div>

        {/* Notification Options */}
        <div className="space-y-4">
          {notificationOptions.map((option) => {
            const Icon = option.icon
            const isEnabled = settings[option.key]
            
            return (
              <div
                key={option.key}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isEnabled ? "bg-indigo-500/20" : "bg-gray-700/50"}`}>
                    <Icon className={`h-5 w-5 ${isEnabled ? "text-indigo-400" : "text-gray-500"}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{option.label}</p>
                    <p className="text-xs text-gray-400">{option.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(option.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                    isEnabled ? "bg-indigo-600" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                      isEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>

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