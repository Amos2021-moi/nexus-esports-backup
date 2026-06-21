"use client"

import { CheckCircle, Shield, Clock, EyeOff } from "lucide-react"
import { useEffect, useState } from "react"

interface TrustBadgeProps {
  type: "verified" | "admin-approved" | "last-active"
  value?: string
  userId?: string  // ✅ Add userId for privacy check
}

export default function TrustBadge({ type, value, userId }: TrustBadgeProps) {
  const [showLastSeen, setShowLastSeen] = useState(true)
  const [loading, setLoading] = useState(true)

  // ✅ Fetch privacy setting for last-active
  useEffect(() => {
    if (type === "last-active" && userId) {
      fetchPrivacySetting()
    } else {
      setLoading(false)
    }
  }, [type, userId])

  async function fetchPrivacySetting() {
    try {
      const res = await fetch("/api/settings?category=privacy&key=showLastSeen")
      if (res.ok) {
        const data = await res.json()
        setShowLastSeen(data.showLastSeen !== undefined ? data.showLastSeen : true)
      }
    } catch (error) {
      console.error("Error fetching privacy setting:", error)
    } finally {
      setLoading(false)
    }
  }

  if (type === "verified") {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
        <Shield size={12} />
        <span>Verified Player</span>
      </div>
    )
  }

  if (type === "admin-approved") {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs">
        <CheckCircle size={12} />
        <span>Admin Approved</span>
      </div>
    )
  }

  // ✅ Last Active - with privacy check
  if (type === "last-active" && value) {
    // If still loading, show nothing
    if (loading) {
      return null
    }

    // ✅ If privacy is disabled, don't show
    if (!showLastSeen) {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-500/10 text-gray-500 rounded-full text-xs">
          <EyeOff size={10} />
          <span>Hidden</span>
        </div>
      )
    }

    const days = Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24))
    let label = "Active"
    if (days > 30) label = "Inactive"
    else if (days > 7) label = "Away"
    else if (days > 1) label = "Recent"
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
        days < 7 ? "bg-green-500/20 text-green-400" :
        days < 30 ? "bg-yellow-500/20 text-yellow-400" :
        "bg-red-500/20 text-red-400"
      }`}>
        <Clock size={10} />
        <span>{label}</span>
      </div>
    )
  }

  return null
}