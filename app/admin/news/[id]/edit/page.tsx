"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Image as ImageIcon, X, Loader2, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

export default function EditNewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const newsId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    published: false
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Redirect if not admin
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!session || session.user?.role !== "ADMIN") {
    router.push("/dashboard")
    return null
  }

  useEffect(() => {
    fetchNews()
  }, [newsId])

  async function fetchNews() {
    try {
      const res = await fetch(`/api/admin/news?id=${newsId}`)
      if (!res.ok) {
        throw new Error("Failed to fetch news")
      }
      const data = await res.json()
      setFormData({
        title: data.title || "",
        content: data.content || "",
        image: data.image || "",
        published: data.published || false
      })
      if (data.image) {
        setImagePreview(data.image)
      }
    } catch (error) {
      console.error("Error fetching news:", error)
      toast.error("Failed to load news article")
      router.push("/admin/news")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!formData.content.trim()) {
      toast.error("Content is required")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newsId,
          ...formData
        })
      })

      if (res.ok) {
        toast.success(formData.published ? "News published!" : "News saved as draft!")
        router.push("/admin/news")
      } else {
        const error = await res.json()
        toast.error(error.error || "Failed to update news")
      }
    } catch (error) {
      console.error("Error updating news:", error)
      toast.error("Failed to update news")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this news article?")) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/news?id=${newsId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("News article deleted")
        router.push("/admin/news")
      } else {
        toast.error("Failed to delete")
      }
    } catch (error) {
      console.error("Error deleting news:", error)
      toast.error("Failed to delete")
    } finally {
      setDeleting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setImagePreview(result)
      setFormData({ ...formData, image: result })
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    setFormData({ ...formData, image: "" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading news...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/news"
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit News Article</h1>
            <p className="text-gray-400 mt-1">Update your news content</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 bg-red-600/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-600/30 transition-all disabled:opacity-50"
        >
          {deleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete
            </>
          )}
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter news title..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Content <span className="text-red-400">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={8}
            placeholder="Write your news content here..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 resize-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.content.length} characters
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Image (Optional)
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-all">
                <ImageIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  {imagePreview ? "Change Image" : "Upload Image"}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-20 w-20 object-cover rounded-lg border border-gray-600"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-all"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Supported: JPG, PNG, WebP</p>
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="published" className="text-sm text-gray-300">
            Publish immediately
          </label>
          {formData.published && (
            <span className="text-xs text-green-400">✓ Visible to everyone</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update News
              </>
            )}
          </button>
          <Link
            href="/admin/news"
            className="px-6 py-2.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}