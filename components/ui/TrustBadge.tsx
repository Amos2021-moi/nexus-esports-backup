"use client"

import { CheckCircle, Shield, Clock } from "lucide-react"

interface TrustBadgeProps {
  type: "verified" | "admin-approved" | "last-active"
  value?: string
}

export default function TrustBadge({ type, value }: TrustBadgeProps) {
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

  if (type === "last-active" && value) {
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
        <Clock size={12} />
        <span>{label}</span>
      </div>
    )
  }

  return null
}