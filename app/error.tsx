"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console
    console.error("❌ Application Error:", error)
  }, [error])

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
          <AlertTriangle className="h-10 w-10 text-red-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Something Went Wrong</h1>
        <p className="text-gray-400 text-sm mb-6">
          We encountered an unexpected error. Please try again or return home.
        </p>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500 break-all font-mono">
            {error.message || "Unknown error occurred"}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-600 mt-2 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}