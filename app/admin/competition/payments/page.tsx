"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { 
  DollarSign, RefreshCw, Download, Filter, Search, 
  CheckCircle, XCircle, Clock, AlertCircle, Eye,
  TrendingUp, Users, Calendar, Phone, Receipt
} from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

interface Payment {
  id: string
  userId: string
  seasonEntryId: string
  action: string
  notes: string
  createdAt: string
  user: {
    name: string
    email: string
    profile: {
      username: string
      profilePicture: string | null
    }
  }
  seasonEntry: {
    id: string
    entryFee: number
    currency: string
    phoneNumber: string
    mpesaReceipt: string | null
    status: string
    season: {
      name: string
    }
  }
}

interface PaymentStats {
  totalPayments: number
  totalAmount: number
  successCount: number
  failedCount: number
  pendingCount: number
}

export default function AdminCompetitionPayments() {
  const { data: session } = useSession()
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchPayments()
    // ✅ Auto-refresh every 15 seconds
    const interval = setInterval(fetchPayments, 15000)
    return () => clearInterval(interval)
  }, [filter])

  async function fetchPayments() {
    try {
      const url = new URL("/api/admin/competition/payments", window.location.origin)
      if (filter !== "all") url.searchParams.set("action", filter)

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Failed to fetch payments")
      const data = await res.json()
      
      // ✅ Only show successful payments in the list
      const successfulPayments = data.payments?.filter((p: Payment) => p.action === "PAYMENT_SUCCESS") || []
      setPayments(successfulPayments)
      setStats(data.stats || null)
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "PAYMENT_SUCCESS":
        return {
          icon: CheckCircle,
          label: "Success",
          className: "bg-green-500/20 text-green-400",
        }
      case "PAYMENT_FAILED":
        return {
          icon: XCircle,
          label: "Failed",
          className: "bg-red-500/20 text-red-400",
        }
      case "PAYMENT_PENDING":
        return {
          icon: Clock,
          label: "Pending",
          className: "bg-yellow-500/20 text-yellow-400",
        }
      case "ADMIN_MARKED_PAID":
        return {
          icon: CheckCircle,
          label: "Admin Marked",
          className: "bg-blue-500/20 text-blue-400",
        }
      default:
        return {
          icon: AlertCircle,
          label: action,
          className: "bg-gray-500/20 text-gray-400",
        }
    }
  }

  const filteredPayments = payments.filter((payment) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      payment.user.name?.toLowerCase().includes(searchLower) ||
      payment.user.email?.toLowerCase().includes(searchLower) ||
      payment.user.profile?.username?.toLowerCase().includes(searchLower) ||
      payment.seasonEntry.mpesaReceipt?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">💰 Payment History</h1>
          <p className="text-gray-400 text-sm">All successful competition payments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPayments}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <span className="text-xs text-gray-500 self-center">
            Auto-refresh every 15s
          </span>
        </div>
      </div>

      {/* Stats - Only successful payments */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-white">{stats.successCount}</p>
            <p className="text-sm text-gray-400">✅ Successful Payments</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-green-400">
              KES {stats.totalAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">💰 Total Collected</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingCount}</p>
            <p className="text-sm text-gray-400">⏳ Pending</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-red-400">{stats.failedCount}</p>
            <p className="text-sm text-gray-400">❌ Failed</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <p className="text-2xl font-bold text-white">{stats.totalPayments}</p>
            <p className="text-sm text-gray-400">📊 Total Transactions</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payments..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Payments</option>
          <option value="PAYMENT_SUCCESS">✅ Success</option>
          <option value="PAYMENT_FAILED">❌ Failed</option>
          <option value="PAYMENT_PENDING">⏳ Pending</option>
        </select>

        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Table - Only successful payments shown */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Player</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Season</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Receipt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No successful payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const action = getActionBadge(payment.action)
                  const ActionIcon = action.icon
                  return (
                    <tr key={payment.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {payment.user.profile?.profilePicture ? (
                            <img
                              src={payment.user.profile.profilePicture}
                              alt={payment.user.name || "Player"}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                              {(payment.user.name || "P").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-white">
                              {payment.user.profile?.username || payment.user.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-400">{payment.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {payment.seasonEntry.season.name}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        KES {payment.seasonEntry.entryFee.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {payment.seasonEntry.mpesaReceipt || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${action.className}`}>
                          <ActionIcon className="h-3 w-3" />
                          {action.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Confirmed
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {stats && stats.successCount > 0 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-sm text-green-400">
            💰 Total collected: <span className="font-bold">KES {stats.totalAmount.toLocaleString()}</span> 
            from <span className="font-bold">{stats.successCount}</span> successful payments
          </p>
        </div>
      )}
    </div>
  )
}