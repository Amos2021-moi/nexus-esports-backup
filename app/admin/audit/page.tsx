"use client"

import { useEffect, useState } from "react"
import { Activity, Shield, User, Calendar, FileText, Trash2, Edit, CheckCircle } from "lucide-react"

interface AuditEntry {
  id: string
  action: string
  targetType: string
  targetId: string
  details: any
  createdAt: string
  user: { name: string; email: string }
}

const actionIcons: Record<string, JSX.Element> = {
  "APPROVE_RESULT": <CheckCircle className="h-4 w-4 text-green-400" />,
  "EDIT_SEASON": <Edit className="h-4 w-4 text-blue-400" />,
  "DELETE_PLAYER": <Trash2 className="h-4 w-4 text-red-400" />,
  "CREATE_TOURNAMENT": <FileText className="h-4 w-4 text-purple-400" />,
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    const res = await fetch("/api/admin/audit")
    const data = await res.json()
    setLogs(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading audit logs...</div>
      </div>
    )
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

      {logs.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <Activity className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Audit Logs Yet</h3>
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
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {actionIcons[log.action] || <Activity className="h-4 w-4 text-gray-400" />}
                        <span className="text-sm text-white">{log.action.replace(/_/g, " ")}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">{log.targetType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-white">{log.user?.name}</p>
                        <p className="text-xs text-gray-500">{log.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <pre className="text-xs text-gray-400 max-w-md overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}