"use client"

import { ReactNode } from "react"
import { FolderOpen } from "lucide-react"

interface EmptyStateProps {
  title: string
  message: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ title, message, icon, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon || <FolderOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}