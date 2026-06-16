"use client"

import { useEffect, useState } from "react"
import { X, AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info"
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger"
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isOpen) return null

  const colors = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-yellow-600 hover:bg-yellow-700",
    info: "bg-blue-600 hover:bg-blue-700"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-gray-800 p-6 shadow-2xl border border-gray-700">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className={`rounded-full p-2 ${type === "danger" ? "bg-red-500/20" : type === "warning" ? "bg-yellow-500/20" : "bg-blue-500/20"}`}>
            <AlertTriangle className={`h-6 w-6 ${type === "danger" ? "text-red-400" : type === "warning" ? "text-yellow-400" : "text-blue-400"}`} />
          </div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        
        <p className="text-gray-300 mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 ${colors[type]} text-white px-4 py-2 rounded-lg transition-all`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}