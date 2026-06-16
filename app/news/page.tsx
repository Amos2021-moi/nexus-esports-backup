"use client"

import { useEffect, useState } from "react"
import { Calendar, User, ArrowRight, Newspaper as NewspaperIcon } from "lucide-react"
import Link from "next/link"

interface NewsItem {
  id: string
  title: string
  content: string
  image: string | null
  publishedAt: string
  author: {
    name: string
    profile: { username: string }
  }
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNews()
  }, [])

  async function fetchNews() {
    const res = await fetch("/api/news")
    const data = await res.json()
    setNews(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading news...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-block p-3 bg-indigo-500/20 rounded-2xl mb-4">
          <NewspaperIcon className="h-12 w-12 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-white">News Center</h1>
        <p className="text-gray-400 mt-2">Latest updates and announcements</p>
      </div>

      {/* News Grid */}
      {news.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
          <NewspaperIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No News Yet</h3>
          <p className="text-gray-400">Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {news.map((item) => (
            <div key={item.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-indigo-500/50 transition-all group">
              {item.image && (
                <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {item.author.profile?.username || item.author.name}
                  </span>
                </div>
                <p className="text-gray-300 line-clamp-3">{item.content}</p>
                <button className="mt-4 text-indigo-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                  Read More <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}