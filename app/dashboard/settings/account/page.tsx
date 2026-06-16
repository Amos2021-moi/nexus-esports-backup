"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Save, Loader2, User, Mail, Shield, Camera } from "lucide-react"
import ImageUpload from "@/components/dashboard/ImageUpload"
import toast from "react-hot-toast"

interface ProfileData {
  username: string
  name: string
  class: string
  bio: string
  favoriteClub: string
  preferredFormation: string
  preferredPlaystyle: string
  profilePicture: string
  bannerImage: string
  whatsappNumber: string
  whatsappVisible: boolean
}

export default function AccountSettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profilePicture, setProfilePicture] = useState("")
  const [bannerImage, setBannerImage] = useState("")
  const [formData, setFormData] = useState<ProfileData>({
    username: "",
    name: "",
    class: "",
    bio: "",
    favoriteClub: "",
    preferredFormation: "",
    preferredPlaystyle: "",
    profilePicture: "",
    bannerImage: "",
    whatsappNumber: "",
    whatsappVisible: true,
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile")
      const data = await res.json()
      setFormData({
        username: data.username || "",
        name: data.name || "",
        class: data.class || "",
        bio: data.bio || "",
        favoriteClub: data.favoriteClub || "",
        preferredFormation: data.preferredFormation || "",
        preferredPlaystyle: data.preferredPlaystyle || "",
        profilePicture: data.profilePicture || "",
        bannerImage: data.bannerImage || "",
        whatsappNumber: data.whatsappNumber || "",
        whatsappVisible: data.whatsappVisible !== undefined ? data.whatsappVisible : true,
      })
      setProfilePicture(data.profilePicture || "")
      setBannerImage(data.bannerImage || "")
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profilePicture,
          bannerImage,
        }),
      })

      if (res.ok) {
        toast.success("Profile updated successfully!")
        await update()
        router.refresh()
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement
    const value = target.type === "checkbox" ? target.checked : target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
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
        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            <ImageUpload
              type="profile"
              currentImage={profilePicture}
              onUpload={(url) => setProfilePicture(url)}
            />
            <p className="text-xs text-gray-500">Recommended: Square image, max 2MB</p>
          </div>
        </div>

        {/* Banner Image */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Banner Image
          </label>
          <div className="flex items-center gap-4">
            <ImageUpload
              type="banner"
              currentImage={bannerImage}
              onUpload={(url) => setBannerImage(url)}
            />
            <p className="text-xs text-gray-500">Recommended: 1200x300px, max 2MB</p>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Display Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            placeholder="Your display name"
          />
          <p className="text-xs text-gray-500 mt-1">This is how others see you</p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 pl-10 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              placeholder="Your unique username"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Unique identifier for your profile</p>
        </div>

        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Class
          </label>
          <select
            name="class"
            value={formData.class}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          >
            <option value="">Select Class</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
            placeholder="Tell the community about yourself..."
          />
          <p className="text-xs text-gray-500 mt-1">Max 500 characters</p>
        </div>

        {/* Favorite Club */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Favorite Club
          </label>
          <input
            type="text"
            name="favoriteClub"
            value={formData.favoriteClub}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            placeholder="e.g., Real Madrid, Manchester City"
          />
        </div>

        {/* Preferred Formation */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Preferred Formation
          </label>
          <select
            name="preferredFormation"
            value={formData.preferredFormation}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          >
            <option value="">Select Formation</option>
            <option value="4-3-3">4-3-3</option>
            <option value="4-4-2">4-4-2</option>
            <option value="4-2-3-1">4-2-3-1</option>
            <option value="3-5-2">3-5-2</option>
            <option value="5-3-2">5-3-2</option>
            <option value="4-1-2-1-2">4-1-2-1-2</option>
          </select>
        </div>

        {/* Preferred Playstyle */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Preferred Playstyle
          </label>
          <select
            name="preferredPlaystyle"
            value={formData.preferredPlaystyle}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          >
            <option value="">Select Playstyle</option>
            <option value="Possession">Possession</option>
            <option value="Counter Attack">Counter Attack</option>
            <option value="Long Ball">Long Ball</option>
            <option value="Wing Play">Wing Play</option>
            <option value="Tiki-Taka">Tiki-Taka</option>
            <option value="Quick Counter">Quick Counter</option>
          </select>
        </div>

        {/* WhatsApp */}
        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-md font-semibold text-white mb-4">Match Communication</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              WhatsApp Number (with country code)
            </label>
            <input
              type="tel"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              placeholder="+254712345678"
              className="w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code. Example: +254712345678 for Kenya
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-3">
            <input
              type="checkbox"
              id="whatsappVisible"
              name="whatsappVisible"
              checked={formData.whatsappVisible}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="whatsappVisible" className="text-sm text-gray-300">
              Allow match opponents to see my WhatsApp number
            </label>
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
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all border border-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}