"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Newspaper, Plus, Edit, Trash2, Eye, EyeOff,
  Calendar, User, Search, RefreshCw, CheckCircle,
  XCircle, Clock, Image as ImageIcon
} from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

interface NewsItem {
  id: string
  title: string
  content: string
  image: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author: {
    name: string
    email: string
    profile: { username: string } | null
  }
}

export default function AdminNewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

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
      fetchNews()
    }
  }, [session])

  async function fetchNews() {
    try {
      const res = await fetch("/api/admin/news")
      const data = await res.json()
      setNews(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching news:", error)
      toast.error("Failed to load news")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this news article?")) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("News article deleted")
        fetchNews()
      } else {
        toast.error("Failed to delete")
      }
    } catch (error) {
      console.error("Error deleting news:", error)
      toast.error("Failed to delete")
    } finally {
      setDeleting(null)
    }
  }

  async function handleTogglePublish(id: string, currentStatus: boolean) {
    setToggling(id)
    try {
      const newsItem = news.find(n => n.id === id)
      if (!newsItem) return

      const res = await fetch("/api/admin/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: newsItem.title,
          content: newsItem.content,
          image: newsItem.image,
          published: !currentStatus
        })
      })

      if (res.ok) {
        toast.success(!currentStatus ? "News published!" : "News unpublished")
        fetchNews()
      } else {
        toast.error("Failed to update publish status")
      }
    } catch (error) {
      console.error("Error toggling publish:", error)
      toast.error("Failed to update")
    } finally {
      setToggling(null)
    }
  }

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.content.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === "all" || 
                          (filter === "published" && item.published) ||
                          (filter === "draft" && !item.published)
    return matchesSearch && matchesFilter
  })

  const publishedCount = news.filter(n => n.published).length
  const draftCount = news.filter(n => !n.published).length

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading news...</p>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-indigo-400" />
            News Management
          </h1>
          <p className="text-gray-400 mt-1">Create and manage news articles</p>
        </div>
        <Link
          href="/admin/news/create"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} />
          Create News
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-white">{news.length}</p>
          <p className="text-sm text-gray-400">Total Articles</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
          <p className="text-2xl font-bold text-green-400">{publishedCount}</p>
          <p className="text-sm text-gray-400">Published</p>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
          <p className="text-2xl font-bold text-yellow-400">{draftCount}</p>
          <p className="text-sm text-gray-400">Drafts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search news..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "published"
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "draft"
                ? "bg-yellow-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            Drafts
          </button>
        </div>
        <button
          onClick={fetchNews}
          className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all"
          title="Refresh"
        >
          <RefreshCw size={18} className="text-gray-400" />
        </button>
      </div>

      {/* News List */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <Newspaper className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No News Articles</h3>
          <p className="text-gray-400">
            {search ? "No articles match your search." : "Create your first news article."}
          </p>
          {!search && (
            <Link
              href="/admin/news/create"
              className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 transition-all"
            >
              Create News →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNews.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-gray-600 transition-all">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                    {item.published ? (
                      <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        <CheckCircle size={12} />
                        Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                        <Clock size={12} />
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{item.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {item.author.profile?.username || item.author.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    {item.image && (
                      <span className="flex items-center gap-1">
                        <ImageIcon size={12} />
                        Has image
                      </span>
                    )}
                    {item.publishedAt && (
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} />
                        Published: {new Date(item.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTogglePublish(item.id, item.published)}
                    disabled={toggling === item.id}
                    className={`p-2 rounded-lg transition-all ${
                      item.published
                        ? "text-yellow-400 hover:bg-yellow-500/20"
                        : "text-green-400 hover:bg-green-500/20"
                    }`}
                    title={item.published ? "Unpublish" : "Publish"}
                  >
                    {toggling === item.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : item.published ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                  <Link
                    href={`/admin/news/${item.id}/edit`}
                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                  >
                    {deleting === item.id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}