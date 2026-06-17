"use client"

import { useEffect, useState } from "react"
import { Bell, CheckCircle, Trophy, Calendar, Award, X } from "lucide-react"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  link: string | null
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // ✅ Only fetch on client-side
    if (typeof window !== 'undefined') {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [])

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()
      // Handle both array and error responses
      const notificationsArray = Array.isArray(data) ? data : []
      setNotifications(notificationsArray)
      setUnreadCount(notificationsArray.filter((n: Notification) => !n.read).length)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      setNotifications([])
      setUnreadCount(0)
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId })
      })
      fetchNotifications()
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  async function markAllAsRead() {
    for (const notif of notifications.filter(n => !n.read)) {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notif.id })
      })
    }
    fetchNotifications()
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "RESULT_APPROVED": return <CheckCircle className="h-4 w-4 text-green-400" />
      case "NEW_FIXTURE": return <Calendar className="h-4 w-4 text-blue-400" />
      case "AWARD_EARNED": return <Trophy className="h-4 w-4 text-yellow-400" />
      default: return <Bell className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Bell size={18} className="text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 z-50 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-3 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer ${!notif.read ? "bg-indigo-500/5" : ""}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <Link href={notif.link || "#"} className="block">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">{getIcon(notif.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{notif.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notif.read && <div className="h-2 w-2 bg-indigo-400 rounded-full mt-1" />}
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}