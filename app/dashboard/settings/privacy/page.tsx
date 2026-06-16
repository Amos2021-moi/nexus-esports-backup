"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Save, Loader2, Shield, Eye, EyeOff, Users, MessageSquare, User, Clock } from "lucide-react"
import toast from "react-hot-toast"

interface PrivacySettings {
  showSquad: boolean
  showStats: boolean
  allowComments: boolean
  publicProfile: boolean
  showLastSeen: boolean
}

const defaultSettings: PrivacySettings = {
  showSquad: true,
  showStats: true,
  allowComments: true,
  publicProfile: true,
  showLastSeen: true,
}

export default function PrivacySettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings?category=privacy")
      if (res.ok) {
        const data = await res.json()
        setSettings({
          showSquad: data.showSquad !== undefined ? data.showSquad : defaultSettings.showSquad,
          showStats: data.showStats !== undefined ? data.showStats : defaultSettings.showStats,
          allowComments: data.allowComments !== undefined ? data.allowComments : defaultSettings.allowComments,
          publicProfile: data.publicProfile !== undefined ? data.publicProfile : defaultSettings.publicProfile,
          showLastSeen: data.showLastSeen !== undefined ? data.showLastSeen : defaultSettings.showLastSeen,
        })
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error)
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
            category: "privacy",
            key,
            value,
          }),
        })
      }

      toast.success("Privacy settings updated!")
    } catch (error) {
      console.error("Error saving privacy settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (key: keyof PrivacySettings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    })
  }

  const privacyOptions = [
    {
      key: "publicProfile" as keyof PrivacySettings,
      label: "Public Profile",
      description: "Allow others to view your profile",
      icon: User,
    },
    {
      key: "showSquad" as keyof PrivacySettings,
      label: "Show Squad",
      description: "Display your squad on your profile and match pages",
      icon: Users,
    },
    {
      key: "showStats" as keyof PrivacySettings,
      label: "Show Stats",
      description: "Display your statistics on your profile",
      icon: Eye,
    },
    {
      key: "allowComments" as keyof PrivacySettings,
      label: "Allow Comments",
      description: "Allow other players to comment on your posts",
      icon: MessageSquare,
    },
    {
      key: "showLastSeen" as keyof PrivacySettings,
      label: "Show Last Seen",
      description: "Display when you were last active",
      icon: Clock,
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
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Privacy Controls</h2>
          </div>
          <p className="text-gray-400 text-sm">Control who can see your information and activity</p>
        </div>

        {/* Privacy Options */}
        <div className="space-y-4">
          {privacyOptions.map((option) => {
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

        {/* Privacy Notice */}
        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300 font-medium">Your Privacy Matters</p>
              <p className="text-xs text-gray-400 mt-1">
                These settings control what other players can see. Admins will still have access to your profile for moderation purposes.
              </p>
            </div>
          </div>
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