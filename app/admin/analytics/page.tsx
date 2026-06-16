"use client"

import { useEffect, useState } from "react"
import { Activity, Eye, Users, TrendingUp, Calendar } from "lucide-react"

interface AnalyticsData {
  pageViews: { page: string; count: number; lastViewed: string }[]
  activeUsers: number
  totalPageViews: number
  lastUpdated: string
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  async function fetchAnalytics() {
    const res = await fetch("/api/analytics")
    const analyticsData = await res.json()
    setData(analyticsData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const stats = [
    { name: "Total Page Views", value: data?.totalPageViews || 0, icon: Eye, color: "from-blue-500 to-cyan-500" },
    { name: "Active Users (24h)", value: data?.activeUsers || 0, icon: Users, color: "from-green-500 to-emerald-500" },
    { name: "Unique Pages", value: data?.pageViews.length || 0, icon: Activity, color: "from-purple-500 to-pink-500" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Track user activity and page views</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className={`bg-gradient-to-r ${stat.color} p-2 rounded-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">{stat.name}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Top Pages</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Page</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Views</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Last Viewed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {data?.pageViews.sort((a, b) => b.count - a.count).map((page, i) => (
                <tr key={i} className="hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-white font-mono text-sm">{page.page || "/"}</td>
                  <td className="px-4 py-3 text-gray-300">{page.count}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {new Date(page.lastViewed).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-right text-xs text-gray-500">
        Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "Never"}
      </div>
    </div>
  )
}