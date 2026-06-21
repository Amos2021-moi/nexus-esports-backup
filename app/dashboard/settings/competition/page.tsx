"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Save, Loader2, Trophy, Calendar, Clock, Shield, Users, Zap } from "lucide-react"
import toast from "react-hot-toast"

interface CompetitionSettings {
  defaultSquad: "MAIN" | "SEASONAL" | "TOURNAMENT"
  autoSelectTournamentSquad: boolean
  matchReminderTime: "15m" | "30m" | "1h" | "2h" | "24h"
  fixtureCalendarSync: boolean
}

const defaultSettings: CompetitionSettings = {
  defaultSquad: "MAIN",
  autoSelectTournamentSquad: false,
  matchReminderTime: "1h",
  fixtureCalendarSync: false,
}

export default function CompetitionSettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<CompetitionSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings?category=competition")
      if (res.ok) {
        const data = await res.json()
        setSettings({
          defaultSquad: data.defaultSquad || defaultSettings.defaultSquad,
          autoSelectTournamentSquad: data.autoSelectTournamentSquad !== undefined ? data.autoSelectTournamentSquad : defaultSettings.autoSelectTournamentSquad,
          matchReminderTime: data.matchReminderTime || defaultSettings.matchReminderTime,
          fixtureCalendarSync: data.fixtureCalendarSync !== undefined ? data.fixtureCalendarSync : defaultSettings.fixtureCalendarSync,
        })
      }
    } catch (error) {
      console.error("Error fetching competition settings:", error)
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
            category: "competition",
            key,
            value,
          }),
        })
      }

      toast.success("Competition settings updated!")
    } catch (error) {
      console.error("Error saving competition settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof CompetitionSettings, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

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
            <Trophy className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Competition Settings</h2>
          </div>
          <p className="text-gray-400 text-sm">Configure your competitive preferences</p>
        </div>

        {/* Default Squad */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Default Squad
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "MAIN", label: "Main Squad", icon: Shield },
              { value: "SEASONAL", label: "Seasonal Squad", icon: Calendar },
              { value: "TOURNAMENT", label: "Tournament Squad", icon: Trophy },
            ].map((option) => {
              const Icon = option.icon
              const isSelected = settings.defaultSquad === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange("defaultSquad", option.value)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isSelected ? "text-indigo-400" : "text-gray-400"}`} />
                  <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-400"}`}>
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">This squad will be used by default in matches</p>
        </div>

        {/* Auto Select Tournament Squad */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium">Auto-Select Tournament Squad</p>
            <p className="text-xs text-gray-400">Automatically use your tournament squad in tournaments</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("autoSelectTournamentSquad", !settings.autoSelectTournamentSquad)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.autoSelectTournamentSquad ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.autoSelectTournamentSquad ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Match Reminder Time - Updated description */}
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    <span className="flex items-center gap-2">
      <Clock className="h-4 w-4" />
      Match Reminder Time
    </span>
  </label>
  <select
    value={settings.matchReminderTime}
    onChange={(e) => handleChange("matchReminderTime", e.target.value)}
    className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
  >
    <option value="15m">15 minutes before</option>
    <option value="30m">30 minutes before</option>
    <option value="1h">1 hour before</option>
    <option value="2h">2 hours before</option>
    <option value="24h">24 hours before</option>
  </select>
  <p className="text-xs text-gray-500 mt-2">When to send match reminder emails</p>
</div>

{/* Fixture Calendar Sync - Updated description */}
<div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
  <div>
    <p className="text-white font-medium">Calendar Sync</p>
    <p className="text-xs text-gray-400">Generate .ics calendar files when fixtures are created</p>
  </div>
  <button
    type="button"
    onClick={() => handleChange("fixtureCalendarSync", !settings.fixtureCalendarSync)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
      settings.fixtureCalendarSync ? "bg-indigo-600" : "bg-gray-700"
    }`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
      settings.fixtureCalendarSync ? "translate-x-6" : "translate-x-1"
    }`} />
  </button>
</div>

        {/* Fixture Calendar Sync */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium">Calendar Sync</p>
            <p className="text-xs text-gray-400">Add fixtures to your calendar automatically</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("fixtureCalendarSync", !settings.fixtureCalendarSync)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.fixtureCalendarSync ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.fixtureCalendarSync ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
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