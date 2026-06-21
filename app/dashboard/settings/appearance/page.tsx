"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Save, Loader2, Palette, Sun, Moon, Monitor, Layout, Eye, EyeOff, Check } from "lucide-react"
import toast from "react-hot-toast"

interface AppearanceSettings {
  theme: "dark" | "light" | "system"
  compactMode: boolean
  reduceMotion: boolean
  sidebarStyle: "default" | "compact" | "icon"
}

const defaultSettings: AppearanceSettings = {
  theme: "dark",
  compactMode: false,
  reduceMotion: false,
  sidebarStyle: "default",
}

export default function AppearanceSettingsPage() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light" | "system">("dark")

  useEffect(() => {
    fetchSettings()
    // Apply settings on load
    applyAllSettings(defaultSettings)
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings?category=appearance")
      if (res.ok) {
        const data = await res.json()
        const loadedSettings = {
          theme: data.theme || defaultSettings.theme,
          compactMode: data.compactMode !== undefined ? data.compactMode : defaultSettings.compactMode,
          reduceMotion: data.reduceMotion !== undefined ? data.reduceMotion : defaultSettings.reduceMotion,
          sidebarStyle: data.sidebarStyle || defaultSettings.sidebarStyle,
        }
        setSettings(loadedSettings)
        setPreviewTheme(loadedSettings.theme)
        // Apply settings immediately
        applyAllSettings(loadedSettings)
      }
    } catch (error) {
      console.error("Error fetching appearance settings:", error)
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
            category: "appearance",
            key,
            value,
          }),
        })
      }

      // Apply all settings
      applyAllSettings(settings)
      
      toast.success("Appearance settings updated!")
    } catch (error) {
      console.error("Error saving appearance settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  // ✅ Apply all appearance settings globally
  const applyAllSettings = (settings: AppearanceSettings) => {
    // 1. Apply theme
    applyTheme(settings.theme)
    
    // 2. Apply compact mode
    applyCompactMode(settings.compactMode)
    
    // 3. Apply reduce motion
    applyReduceMotion(settings.reduceMotion)
    
    // 4. Apply sidebar style
    applySidebarStyle(settings.sidebarStyle)
    
    // Save to localStorage for persistence
    localStorage.setItem("appearance", JSON.stringify(settings))
  }

  const applyTheme = (theme: "dark" | "light" | "system") => {
    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.classList.toggle("dark", isDark)
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
  }

  const applyCompactMode = (compact: boolean) => {
    document.documentElement.classList.toggle("compact-mode", compact)
    localStorage.setItem("compactMode", String(compact))
  }

  const applyReduceMotion = (reduce: boolean) => {
    document.documentElement.classList.toggle("reduce-motion", reduce)
    localStorage.setItem("reduceMotion", String(reduce))
  }

  const applySidebarStyle = (style: "default" | "compact" | "icon") => {
    document.documentElement.setAttribute("data-sidebar-style", style)
    localStorage.setItem("sidebarStyle", style)
  }

  const handleThemeChange = (theme: "dark" | "light" | "system") => {
    setSettings({ ...settings, theme })
    setPreviewTheme(theme)
    applyTheme(theme)
  }

  const handleSidebarStyleChange = (style: "default" | "compact" | "icon") => {
    setSettings({ ...settings, sidebarStyle: style })
    applySidebarStyle(style)
  }

  const handleToggle = (key: "compactMode" | "reduceMotion") => {
    const newValue = !settings[key]
    setSettings({ ...settings, [key]: newValue })
    
    if (key === "compactMode") {
      applyCompactMode(newValue)
    } else if (key === "reduceMotion") {
      applyReduceMotion(newValue)
    }
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
            <Palette className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Appearance</h2>
          </div>
          <p className="text-gray-400 text-sm">Customize how the platform looks and feels</p>
        </div>

        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                settings.theme === "dark"
                  ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <Moon className={`h-6 w-6 ${settings.theme === "dark" ? "text-indigo-400" : "text-gray-400"}`} />
              <span className={`text-sm font-medium ${settings.theme === "dark" ? "text-white" : "text-gray-400"}`}>
                Dark
              </span>
              {settings.theme === "dark" && <Check className="h-4 w-4 text-indigo-400" />}
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange("light")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                settings.theme === "light"
                  ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <Sun className={`h-6 w-6 ${settings.theme === "light" ? "text-indigo-400" : "text-gray-400"}`} />
              <span className={`text-sm font-medium ${settings.theme === "light" ? "text-white" : "text-gray-400"}`}>
                Light
              </span>
              {settings.theme === "light" && <Check className="h-4 w-4 text-indigo-400" />}
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange("system")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                settings.theme === "system"
                  ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <Monitor className={`h-6 w-6 ${settings.theme === "system" ? "text-indigo-400" : "text-gray-400"}`} />
              <span className={`text-sm font-medium ${settings.theme === "system" ? "text-white" : "text-gray-400"}`}>
                System
              </span>
              {settings.theme === "system" && <Check className="h-4 w-4 text-indigo-400" />}
            </button>
          </div>
        </div>

        {/* Sidebar Style */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Sidebar Style</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleSidebarStyleChange("default")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                settings.sidebarStyle === "default"
                  ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <Layout className={`h-6 w-6 ${settings.sidebarStyle === "default" ? "text-indigo-400" : "text-gray-400"}`} />
              <span className={`text-sm font-medium ${settings.sidebarStyle === "default" ? "text-white" : "text-gray-400"}`}>
                Default
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleSidebarStyleChange("compact")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                settings.sidebarStyle === "compact"
                  ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <Layout className={`h-6 w-6 ${settings.sidebarStyle === "compact" ? "text-indigo-400" : "text-gray-400"}`} />
              <span className={`text-sm font-medium ${settings.sidebarStyle === "compact" ? "text-white" : "text-gray-400"}`}>
                Compact
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleSidebarStyleChange("icon")}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                settings.sidebarStyle === "icon"
                  ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <Layout className={`h-6 w-6 ${settings.sidebarStyle === "icon" ? "text-indigo-400" : "text-gray-400"}`} />
              <span className={`text-sm font-medium ${settings.sidebarStyle === "icon" ? "text-white" : "text-gray-400"}`}>
                Icon Only
              </span>
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div>
              <p className="text-white font-medium">Compact Mode</p>
              <p className="text-xs text-gray-400">Reduce spacing and padding throughout the platform</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("compactMode")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                settings.compactMode ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                settings.compactMode ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700">
            <div>
              <p className="text-white font-medium">Reduce Motion</p>
              <p className="text-xs text-gray-400">Minimize animations and transitions</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("reduceMotion")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                settings.reduceMotion ? "bg-indigo-600" : "bg-gray-700"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                settings.reduceMotion ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </div>

        {/* Live Preview Indicator */}
        <div className="bg-green-500/10 rounded-xl border border-green-500/20 p-3">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Live preview active — changes apply immediately</span>
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