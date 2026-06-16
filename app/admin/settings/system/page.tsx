"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Save, Loader2, Settings, Server, Upload, Archive, AlertTriangle, Shield, Globe, UserPlus, Power, Database } from "lucide-react"
import toast from "react-hot-toast"

interface SystemSettings {
  registrationOpen: boolean
  maintenanceMode: boolean
  uploadsEnabled: boolean
  maxUploadSize: number
  archiveSeasons: boolean
}

const defaultSettings: SystemSettings = {
  registrationOpen: true,
  maintenanceMode: false,
  uploadsEnabled: true,
  maxUploadSize: 5,
  archiveSeasons: false,
}

export default function AdminSystemSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
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
      const res = await fetch("/api/settings?category=system")
      if (res.ok) {
        const data = await res.json()
        setSettings({
          registrationOpen: data.registrationOpen !== undefined ? data.registrationOpen : defaultSettings.registrationOpen,
          maintenanceMode: data.maintenanceMode !== undefined ? data.maintenanceMode : defaultSettings.maintenanceMode,
          uploadsEnabled: data.uploadsEnabled !== undefined ? data.uploadsEnabled : defaultSettings.uploadsEnabled,
          maxUploadSize: data.maxUploadSize !== undefined ? data.maxUploadSize : defaultSettings.maxUploadSize,
          archiveSeasons: data.archiveSeasons !== undefined ? data.archiveSeasons : defaultSettings.archiveSeasons,
        })
      }
    } catch (error) {
      console.error("Error fetching system settings:", error)
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
            category: "system",
            key,
            value,
          }),
        })
      }

      toast.success("System settings updated!")
      
      // If maintenance mode was toggled, show warning
      if (settings.maintenanceMode) {
        toast.error("Maintenance mode is now active. Only admins can access the site.")
      }
    } catch (error) {
      console.error("Error saving system settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: keyof SystemSettings, value: any) => {
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
            <Settings className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">System Settings</h2>
          </div>
          <p className="text-gray-400 text-sm">Control platform-wide system behavior</p>
        </div>

        {/* Registration */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-green-400" />
              Registration Open
            </p>
            <p className="text-xs text-gray-400">Allow new players to register on the platform</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("registrationOpen", !settings.registrationOpen)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.registrationOpen ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.registrationOpen ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Maintenance Mode */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              <Power className="h-4 w-4 text-red-400" />
              Maintenance Mode
            </p>
            <p className="text-xs text-gray-400">Put the platform in maintenance mode (only admins can access)</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("maintenanceMode", !settings.maintenanceMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.maintenanceMode ? "bg-red-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.maintenanceMode ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Uploads Enabled */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-400" />
              Uploads Enabled
            </p>
            <p className="text-xs text-gray-400">Allow players to upload images (profile pictures, squad screenshots)</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("uploadsEnabled", !settings.uploadsEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.uploadsEnabled ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.uploadsEnabled ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Max Upload Size */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Max Upload Size (MB)
            </span>
          </label>
          <select
            value={settings.maxUploadSize}
            onChange={(e) => handleChange("maxUploadSize", parseInt(e.target.value))}
            className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          >
            <option value={2}>2 MB</option>
            <option value={5}>5 MB</option>
            <option value={10}>10 MB</option>
            <option value={20}>20 MB</option>
            <option value={50}>50 MB</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">Maximum file size for image uploads</p>
        </div>

        {/* Archive Seasons */}
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              <Archive className="h-4 w-4 text-yellow-400" />
              Auto-Archive Seasons
            </p>
            <p className="text-xs text-gray-400">Automatically archive completed seasons after 30 days</p>
          </div>
          <button
            type="button"
            onClick={() => handleChange("archiveSeasons", !settings.archiveSeasons)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
              settings.archiveSeasons ? "bg-indigo-600" : "bg-gray-700"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
              settings.archiveSeasons ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        {/* Warnings */}
        {settings.maintenanceMode && (
          <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-sm text-red-300 font-medium">Maintenance Mode Active</p>
                <p className="text-xs text-gray-400 mt-1">
                  The platform is currently in maintenance mode. Only administrators can access the site.
                  Players will see a maintenance page.
                </p>
              </div>
            </div>
          </div>
        )}

        {!settings.registrationOpen && (
          <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-300 font-medium">Registration Closed</p>
                <p className="text-xs text-gray-400 mt-1">
                  New player registration is currently disabled. Existing players can still log in.
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