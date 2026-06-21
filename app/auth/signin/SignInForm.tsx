"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  Trophy, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Users,
  Calendar,
  ArrowRight,
  Gamepad2,
  Code2,
} from "lucide-react"
import toast from "react-hot-toast"

export default function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
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
        toast.success(`Welcome back, ${session.user.name || "Player"}! 🎮`)
        
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

  // Quick fill for testing
  const fillTestAccount = (role: "admin" | "player") => {
    if (role === "admin") {
      setEmail("admin@example.com")
      setPassword("admin123")
    } else {
      setEmail("player@example.com")
      setPassword("player123")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-xl shadow-indigo-500/20">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Nexus Esports</h1>
                <p className="text-white/50 text-sm">Premier eFootball League</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-bold leading-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Welcome Back,<br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Champion
                </span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                Continue your journey to the top. Compete, connect, and claim your place in the Hall of Fame.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 text-white/70">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                    <Users className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">1,200+ Players</p>
                    <p className="text-sm text-white/40">Competing daily</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-white/70">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                    <Calendar className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">50+ Tournaments</p>
                    <p className="text-sm text-white/40">Held this season</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-white/70">
                  <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                    <Shield className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Trust Score System</p>
                    <p className="text-sm text-white/40">Verified players</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 pt-4">
              <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-xs text-white/50 flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-green-400" />
                Secure Login
              </div>
              <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-xs text-white/50 flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-blue-400" />
                Admin Verified
              </div>
              <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-xs text-white/50 flex items-center gap-1.5">
                <Gamepad2 className="h-3 w-3 text-purple-400" />
                eFootball Pro
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 relative overflow-hidden">
              {/* Subtle gradient overlay */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/20 mb-3">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                <p className="text-white/50 text-sm mt-1">Sign in to continue</p>
              </div>

              {/* Alerts */}
              {registered && (
                <div className="mb-4 rounded-xl bg-green-500/20 border border-green-500/30 p-3 flex items-center gap-2 text-green-200 text-sm">
                  <CheckCircle size={18} />
                  <span>Account created successfully! Please sign in.</span>
                </div>
              )}

              {errorParam === "registrations_closed" && (
                <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/30 p-3 flex items-center gap-2 text-red-200 text-sm">
                  <AlertCircle size={18} />
                  <span>Registrations are currently closed.</span>
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/30 p-3 flex items-center gap-2 text-red-200 text-sm animate-shake">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-transparent text-white/30">or continue with</span>
                </div>
              </div>
{/* Social Buttons */}
<div className="grid grid-cols-2 gap-3">
  {/* Google Sign-In Button */}
  <button
    type="button"
    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm group"
  >
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
    Google
  </button>
  
  {/* GitHub Button (Coming Soon) */}
  <button
    type="button"
    className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm"
    onClick={() => toast("GitHub sign-in coming soon!")}
  >
    <Code2 className="h-4 w-4" />
    GitHub
  </button>
</div>

              {/* Footer */}
              <div className="mt-6 text-center space-y-3">
                <p className="text-sm text-white/50">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                    Sign Up
                  </Link>
                </p>
                
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-white/20 mt-4">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}