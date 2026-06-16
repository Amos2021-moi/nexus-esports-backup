"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Trophy, Mail, Lock, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

export default function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const registered = searchParams.get("registered")
  const errorParam = searchParams.get("error")

  // Clean URL on load
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState({}, document.title, "/auth/signin")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("Please enter both email and password")
      toast.error("Please enter both email and password")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setLoading(false)
        toast.error("Invalid email or password")
        return
      }

      // Wait for session
      await new Promise(resolve => setTimeout(resolve, 500))

      // Check role and redirect
      const sessionRes = await fetch("/api/auth/session", {
        credentials: "include",
      })
      const session = await sessionRes.json()
      
      if (session?.user) {
        if (session.user.role === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      } else {
        setError("Failed to authenticate. Please try again.")
        setLoading(false)
      }
    } catch (err) {
      console.error("Sign in error:", err)
      setError("Something went wrong. Please try again.")
      setLoading(false)
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
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-white/60 mt-1">Sign in to your Nexus Esports account</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
          {/* Alerts */}
          {registered && (
            <div className="mb-4 rounded-xl bg-green-500/20 border border-green-500/30 p-3 flex items-center gap-2 text-green-200">
              <CheckCircle size={18} />
              <span className="text-sm">Account created successfully! Please sign in.</span>
            </div>
          )}

          {errorParam === "registrations_closed" && (
            <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/30 p-3 flex items-center gap-2 text-red-200">
              <AlertCircle size={18} />
              <span className="text-sm">Registrations are currently closed.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/30 p-3 flex items-center gap-2 text-red-200">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
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
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white/60">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-white font-semibold hover:underline transition-all">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-white/40 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}