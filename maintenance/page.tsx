import { Shield, Clock, AlertTriangle, Mail } from "lucide-react"
import Link from "next/link"

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/20 mb-6">
          <Shield className="h-10 w-10 text-yellow-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Under Maintenance</h1>
        <p className="text-gray-400 mb-6">
          We're currently performing scheduled maintenance to improve your experience.
          The platform will be back online shortly.
        </p>

        {/* Status Card */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-yellow-400" />
            <span className="text-gray-300">Estimated downtime: <span className="text-white font-medium">~15-30 minutes</span></span>
          </div>
        </div>

        {/* Contact */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Mail className="h-4 w-4" />
          <span>Questions? Contact </span>
          <a href="mailto:support@nexusesports.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            support@nexusesports.com
          </a>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-600 mt-8">
          We'll be back soon. Thank you for your patience.
        </p>
      </div>
    </div>
  )
}