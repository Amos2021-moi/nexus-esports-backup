"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ImageUpload from "@/components/dashboard/ImageUpload"
import toast from "react-hot-toast"

export default function EditProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [profilePicture, setProfilePicture] = useState("")
  const [bannerImage, setBannerImage] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    class: "",
    bio: "",
    favoriteClub: "",
    preferredFormation: "",
    preferredPlaystyle: "",
    whatsappNumber: "",
    whatsappVisible: true,
  })

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile")
        const data = await response.json()
        setFormData({
          username: data.username || "",
          name: data.name || "",
          class: data.class || "",
          bio: data.bio || "",
          favoriteClub: data.favoriteClub || "",
          preferredFormation: data.preferredFormation || "",
          preferredPlaystyle: data.preferredPlaystyle || "",
          whatsappNumber: data.whatsappNumber || "",
          whatsappVisible: data.whatsappVisible !== undefined ? data.whatsappVisible : true,
        })
        setProfilePicture(data.profilePicture || "")
        setBannerImage(data.bannerImage || "")
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchProfile()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profilePicture,
          bannerImage,
        }),
      })

      if (response.ok) {
        toast.success("Profile updated successfully!")
        router.push("/dashboard/profile")
      } else {
        const error = await response.json()
        toast.error(error.error || "Error updating profile")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error updating profile")
    } finally {
      setSubmitting(false)
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
        <div className="text-gray-500">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/profile"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-gray-800 p-6 shadow-md border border-gray-700">
        {/* Profile Picture Upload */}
        <div className="border-b border-gray-700 pb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Profile Picture
          </label>
          <ImageUpload
            type="profile"
            currentImage={profilePicture}
            onUpload={(url) => setProfilePicture(url)}
          />
        </div>

        {/* Banner Image Upload */}
        <div className="border-b border-gray-700 pb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Banner Image
          </label>
          <ImageUpload
            type="banner"
            currentImage={bannerImage}
            onUpload={(url) => setBannerImage(url)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Display Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Username *
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Class
          </label>
          <select
            name="class"
            value={formData.class}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Select Class</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Favorite Club
          </label>
          <input
            type="text"
            name="favoriteClub"
            value={formData.favoriteClub}
            onChange={handleChange}
            placeholder="e.g., Real Madrid, Manchester City"
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Preferred Formation
          </label>
          <select
            name="preferredFormation"
            value={formData.preferredFormation}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Select Formation</option>
            <option value="4-3-3">4-3-3</option>
            <option value="4-4-2">4-4-2</option>
            <option value="4-2-3-1">4-2-3-1</option>
            <option value="3-5-2">3-5-2</option>
            <option value="5-3-2">5-3-2</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Preferred Playstyle
          </label>
          <select
            name="preferredPlaystyle"
            value={formData.preferredPlaystyle}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Select Playstyle</option>
            <option value="Possession">Possession</option>
            <option value="Counter Attack">Counter Attack</option>
            <option value="Long Ball">Long Ball</option>
            <option value="Wing Play">Wing Play</option>
            <option value="Tiki-Taka">Tiki-Taka</option>
          </select>
        </div>

        {/* WhatsApp Section */}
        <div className="border-t border-gray-700 pt-4 mt-2">
          <h3 className="text-md font-semibold text-white mb-3">Match Communication</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              WhatsApp Number (with country code)
            </label>
            <input
              type="tel"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              placeholder="+254712345678"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code. Example: +254712345678 for Kenya
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="whatsappVisible"
              name="whatsappVisible"
              checked={formData.whatsappVisible}
              onChange={handleChange}
              className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="whatsappVisible" className="text-sm text-gray-300">
              Allow match opponents to see my WhatsApp number
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-indigo-600 px-6 py-2 font-semibold text-white hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href="/dashboard/profile"
            className="flex-1 rounded-lg bg-gray-700 px-6 py-2 text-center font-semibold text-gray-300 hover:bg-gray-600 transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}