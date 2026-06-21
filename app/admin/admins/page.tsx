"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Users, Shield, Plus, Trash2, Crown, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

interface Admin {
  id: string
  email: string
  name: string | null
  username: string | null
  createdAt: string
  isSuperAdmin: boolean
}

export default function AdminManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  // Role check - redirect if not admin
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
      fetchAdmins()
    }
  }, [session])

  async function fetchAdmins() {
    try {
      const res = await fetch("/api/admin/manage")
      if (res.ok) {
        const data = await res.json()
        setAdmins(data)
      }
    } catch (error) {
      console.error("Error fetching admins:", error)
      toast.error("Failed to load admins")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!newAdminEmail.trim()) {
      toast.error("Please enter an email")
      return
    }

    setAdding(true)
    try {
      const res = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail.trim() })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message)
        setNewAdminEmail("")
        fetchAdmins()
      } else {
        toast.error(data.error || "Failed to add admin")
      }
    } catch (error) {
      toast.error("Failed to add admin")
    } finally {
      setAdding(false)
    }
  }

  async function handleRemoveAdmin(userId: string) {
    if (!confirm("Remove this user as an admin? They will become a regular player.")) return

    setRemoving(userId)
    try {
      const res = await fetch(`/api/admin/manage?userId=${userId}`, {
        method: "DELETE"
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message)
        fetchAdmins()
      } else {
        toast.error(data.error || "Failed to remove admin")
      }
    } catch (error) {
      toast.error("Failed to remove admin")
    } finally {
      setRemoving(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Loading admins...</p>
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
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Admin Management</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Manage administrators for the platform. Super admins are defined in environment variables.
        </p>
      </div>

      {/* Add Admin Form */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-indigo-400" />
          Add New Admin
        </h2>
        <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="Enter user email"
            className="flex-1 rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none transition-all"
            required
          />
          <button
            type="submit"
            disabled={adding}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Admin
              </>
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-3">
          User must already have an account on the platform.
        </p>
      </div>

      {/* Admins List */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-white">
              Current Admins ({admins.length})
            </h2>
          </div>
          <span className="text-xs text-gray-500">Super admins cannot be removed</span>
        </div>

        {admins.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No admins found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-4 hover:bg-gray-700/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {(admin.username || admin.name || admin.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">
                        {admin.username || admin.name || admin.email}
                      </p>
                      {admin.isSuperAdmin && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          Super Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    Added: {new Date(admin.createdAt).toLocaleDateString()}
                  </span>
                  {!admin.isSuperAdmin && (
                    <button
                      onClick={() => handleRemoveAdmin(admin.id)}
                      disabled={removing === admin.id}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                      title="Remove admin"
                    >
                      {removing === admin.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  {admin.isSuperAdmin && (
                    <span className="text-xs text-gray-500" title="Super admins cannot be removed">
                      🔒 Protected
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 rounded-xl border border-blue-500/20 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium">About Admin Management</p>
            <p className="text-xs text-gray-400 mt-1">
              • <strong>Super Admins</strong> are defined in the <code className="bg-gray-700/50 px-1 rounded">ADMIN_EMAILS</code> environment variable and cannot be removed.
              <br />
              • <strong>Regular Admins</strong> are added/removed via this page.
              <br />
              • Admins have full access to all admin settings and data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}