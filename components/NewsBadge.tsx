"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

export default function NewsBadge() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNewsCount()
    // Check for new news every 60 seconds
    const interval = setInterval(fetchNewsCount, 60000)
    return () => clearInterval(interval)
  }, [])

  async function fetchNewsCount() {
    try {
      const res = await fetch("/api/news?count=true")
      const data = await res.json()
      setCount(data.count || 0)
    } catch (error) {
      console.error("Error fetching news count:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <Bell className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
      {!loading && count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </div>
  )
}