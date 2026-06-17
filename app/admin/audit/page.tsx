"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  Activity, Shield, User, Calendar, FileText, Trash2, Edit, 
  CheckCircle, XCircle, RefreshCw, Clock, Search, Filter
} from "lucide-react"
import toast from "react-hot-toast"

interface AuditEntry {
  id: string
  action: string
  targetType: string
  targetId: string
  details: any
  createdAt: string
  user: { name: string; email: string } | null
}

const actionIcons: Record<string, React.ReactNode> = {
  "APPROVE_RESULT": <CheckCircle className="h-4 w-4 text-green-400" />,
  "REJECT_RESULT": <XCircle className="h-4 w-4 text-red-400" />,
  "VERIFY_PLAYER": <CheckCircle className="h-4 w-4 text-blue-400" />,
  "UNVERIFY_PLAYER": <XCircle className="h-4 w-4 text-yellow-400" />,
  "UPDATE_TRUST_SCORE": <Shield className="h-4 w-4 text-purple-400" />,
  "CREATE_SEASON": <FileText className="h-4 w-4 text-indigo-400" />,
  "UPDATE_SEASON": <Edit className="h-4 w-4 text-blue-400" />,
  "DELETE_SEASON": <Trash2 className="h-4 w-4 text-red-400" />,
  "UPDATE_SEASON_STATUS": <Clock className="h-4 w-4 text-yellow-400" />,
  "CREATE_TOURNAMENT": <FileText className="h-4 w-4 text-purple-400" />,
  "GENERATE_BRACKET": <Shield className="h-4 w-4 text-amber-400" />,
  "USER_LOGIN": <User className="h-4 w-4 text-green-400" />,
  "USER_LOGOUT": <User className="h-4 w-4 text-gray-400" />,
}

const actionColors: Record<string, string> = {
  "APPROVE_RESULT": "border-green-500/20 bg-green-500/5",
  "REJECT_RESULT": "border-red-500/20 bg-red-500/5",
  "VERIFY_PLAYER": "border-blue-500/20 bg-blue-500/5",
  "UNVERIFY_PLAYER": "border-yellow-500/20 bg-yellow-500/5",
  "UPDATE_TRUST_SCORE": "border-purple-500/20 bg-purple-500/5",
  "CREATE_SEASON": "border-indigo-500/20 bg-indigo-500/5",
  "UPDATE_SEASON": "border-blue-500/20 bg-blue-500/5",
  "DELETE_SEASON": "border-red-500/20 bg-red-500/5",
  "UPDATE_SEASON_STATUS": "border-yellow-500/20 bg-yellow-500/5",
  "CREATE_TOURNAMENT": "border-purple-500/20 bg-purple-500/5",
  "GENERATE_BRACKET": "border-amber-500/20 bg-amber-500/5",
  "USER_LOGIN": "border-green-500/20 bg-green-500/5",
  "USER_LOGOUT": "border-gray-500/20 bg-gray-500/5",
}

export default function AuditLogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

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
      fetchLogs()
    }
  }, [session])

  async function fetchLogs() {
    const res = await fetch("/api/admin/audit")
    const data = await res.json()
    setLogs(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const actionTypes = ["all", ...new Set(logs.map(log => log.action))]

  const filteredLogs = logs.filter(log => {
    const matchesAction = filter === "all" || log.action === filter
    const matchesSearch = 
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      log.targetType?.toLowerCase().includes(search.toLowerCase())
    return matchesAction && matchesSearch
  })

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading audit logs...</p>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== "ADMIN") {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-400" />
          Audit Logs
        </h1>
        <p className="text-gray-400 mt-1">Track all admin actions and system changes</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action === "all" ? "All Actions" : action.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <button
            onClick={fetchLogs}
            className="p-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all"
            title="Refresh logs"
          >
            <RefreshCw size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-white">{logs.length}</p>
          <p className="text-sm text-gray-400">Total Logs</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
          <p className="text-2xl font-bold text-green-400">{logs.filter(l => l.action.includes("APPROVE")).length}</p>
          <p className="text-sm text-gray-400">Approvals</p>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
          <p className="text-2xl font-bold text-yellow-400">{logs.filter(l => l.action.includes("UPDATE")).length}</p>
          <p className="text-sm text-gray-400">Updates</p>
        </div>
        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
          <p className="text-2xl font-bold text-purple-400">{logs.filter(l => l.action.includes("CREATE")).length}</p>
          <p className="text-sm text-gray-400">Creations</p>
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <Activity className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Audit Logs Found</h3>
          <p className="text-gray-400">Admin actions will appear here.</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredLogs.map((log) => {
                  const Icon = actionIcons[log.action] || <Activity className="h-4 w-4 text-gray-400" />
                  const borderColor = actionColors[log.action] || "border-gray-500/20 bg-gray-500/5"
                  
                  return (
                    <tr key={log.id} className={`hover:bg-gray-700/50 transition-colors border-l-2 ${borderColor}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {Icon}
                          <span className="text-sm text-white">{log.action.replace(/_/g, " ")}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">{log.targetType}</span>
                        {log.targetId && (
                          <span className="text-xs text-gray-500 block truncate max-w-[100px]">{log.targetId}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-white">{log.user?.name || "Unknown"}</p>
                          <p className="text-xs text-gray-500">{log.user?.email || "No email"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <pre className="text-xs text-gray-400 max-w-md overflow-x-auto whitespace-pre-wrap">
                          {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details || "-"}
                        </pre>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}