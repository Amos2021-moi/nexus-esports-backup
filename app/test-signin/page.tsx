"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Trophy, Mail, Lock, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

export default function TestSignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    if (!email || !password) {
      setError("Please enter both email and password")
      setLoading(false)
      toast.error("Please enter both email and password")
      return
    }

    try {
      console.log("🔐 Attempting sign in with:", email)

      const result = await signIn("credentials", {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      })

      console.log("📦 SignIn result:", result)

      if (result?.error) {
        setError("Invalid email or password")
        setLoading(false)
        toast.error("Invalid email or password")
        return
      }

      // Wait for session to propagate
      await new Promise(resolve => setTimeout(resolve, 500))

      // Fetch session to check role
      const sessionRes = await fetch("/api/auth/session", {
        credentials: "include",
      })
      const session = await sessionRes.json()
      
      console.log("👤 Session after sign in:", session)

      if (session?.user) {
        setSuccess(true)
        toast.success(`Welcome ${session.user.name || "User"}!`)

        // Redirect after 1.5 seconds
        setTimeout(() => {
          if (session.user.role === "ADMIN") {
            router.push("/admin")
          } else {
            router.push("/dashboard")
          }
        }, 1500)
      } else {
        setError("Failed to authenticate. Please try again.")
        setLoading(false)
        toast.error("Failed to authenticate")
      }
    } catch (err) {
      console.error("❌ Sign in error:", err)
      setError("Something went wrong. Please try again.")
      setLoading(false)
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl mb-4">
            <Trophy className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">🧪 Test Sign In</h1>
          <p className="text-white/60 mt-1">Standalone test form - works with your system</p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-xs text-green-300">Uses your existing auth</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/30 p-3 flex items-center gap-2 text-red-200">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-4 rounded-xl bg-green-500/20 border border-green-500/30 p-3 flex items-center gap-2 text-green-200">
              <CheckCircle size={18} />
              <span className="text-sm">✅ Sign in successful! Redirecting...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "🚀 Test Sign In"
              )}
            </button>
          </form>

          {/* Debug Info */}
          <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/10">
            <p className="text-xs text-white/50 mb-2">🔧 Debug Info:</p>
            <div className="space-y-1 text-xs font-mono text-white/40">
              <p>• Auth Provider: Credentials (NextAuth)</p>
              <p>• Redirect: {loading ? "Waiting..." : success ? "Redirecting..." : "Ready"}</p>
              <p>• Email: {email || "(empty)"}</p>
              <p>• Password: {password ? "••••••••" : "(empty)"}</p>
            </div>
          </div>

          {/* Navigation back */}
          <div className="mt-4 text-center">
            <p className="text-sm text-white/60">
              <Link href="/auth/signin" className="text-white/80 hover:text-white transition-colors">
                ← Back to main sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-white/40 mt-6">
          This is a test page. Your main sign-in is at <span className="text-white/60">/auth/signin</span>
        </p>
      </div>
    </div>
  )
}