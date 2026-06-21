"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "@/app/actions/auth.actions"
import { 
  Trophy, 
  Mail, 
  Lock, 
  User, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Gamepad2,
  ArrowRight,
  Calendar,
  Trophy as TrophyIcon
} from "lucide-react"
import toast from "react-hot-toast"

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationOpen, setRegistrationOpen] = useState(true)
  const [checkingRegistration, setCheckingRegistration] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  useEffect(() => {
    async function checkRegistration() {
      try {
        const res = await fetch("/api/settings?category=system&key=registrationOpen")
        if (res.ok) {
          const data = await res.json()
          setRegistrationOpen(data.registrationOpen !== undefined ? data.registrationOpen : true)
        }
      } catch (error) {
        console.error("Error checking registration status:", error)
      } finally {
        setCheckingRegistration(false)
      }
    }
    checkRegistration()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError("")
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    // ✅ Check if registration is open
    if (!registrationOpen) {
      setError("Registrations are currently closed")
      toast.error("Registrations are currently closed")
      return
    }

    setLoading(true)
    setError("")

    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setError("All fields are required")
      toast.error("All fields are required")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      toast.error("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      toast.error("Passwords do not match")
      setLoading(false)
      return
    }

    const formDataObj = new FormData()
    formDataObj.append("name", formData.name)
    formDataObj.append("username", formData.username)
    formDataObj.append("email", formData.email)
    formDataObj.append("password", formData.password)
    
    try {
      await registerUser(formDataObj)
      toast.success("Account created successfully! 🎮")
      router.push("/auth/signin?registered=true")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (checkingRegistration) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
        <div className="text-white/60">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8 text-white pt-8">
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
              <h2 className="text-4xl font-bold leading-tight">
                Start Your Journey
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  to Greatness
                </span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                Join the premier school eFootball league. Compete, connect, and climb the ranks to become a legend.
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
                    <TrophyIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Hall of Fame</p>
                    <p className="text-sm text-white/40">Legendary players</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 pt-4">
              <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-xs text-white/50 flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-blue-400" />
                Secure Registration
              </div>
              <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-xs text-white/50 flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-green-400" />
                Admin Verified
              </div>
              <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-xs text-white/50 flex items-center gap-1.5">
                <Gamepad2 className="h-3 w-3 text-purple-400" />
                eFootball Pro
              </div>
            </div>
          </div>

          {/* Right Side - Sign Up Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 relative overflow-hidden">
              {/* Subtle gradient overlay */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/20 mb-3">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Create Account</h2>
                <p className="text-white/50 text-sm mt-1">Join the league today</p>
              </div>

              {/* ✅ Registration Closed Warning */}
              {!registrationOpen && (
                <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/30 p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <h3 className="text-red-400 font-semibold">Registrations are Closed</h3>
                  <p className="text-red-200/80 text-sm mt-1">
                    New player registrations are currently disabled by the admin.
                  </p>
                  <Link href="/auth/signin" className="inline-block mt-3 text-white/60 hover:text-white transition-colors">
                    Back to Sign In →
                  </Link>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/30 p-3 flex items-center gap-2 text-red-200 text-sm animate-shake">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Form - ✅ Disabled when registration is closed */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      disabled={!registrationOpen}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">
                    Username
                  </label>
                  <div className="relative group">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="text"
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a unique username"
                      disabled={!registrationOpen}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      autoComplete="username"
                    />
                  </div>
                  <p className="text-xs text-white/30 mt-1">This will be your public display name</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      disabled={!registrationOpen}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      name="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      disabled={!registrationOpen}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      autoComplete="new-password"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      disabled={!registrationOpen}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:bg-white/10 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.password && formData.confirmPassword && (
                    <p className={`text-xs mt-1 ${formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                      {formData.password === formData.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                    </p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="text-xs text-white/30 space-y-1 pt-1">
                  <p className={formData.password.length >= 6 ? 'text-green-400' : ''}>
                    {formData.password.length >= 6 ? '✅' : '○'} At least 6 characters
                  </p>
                </div>

                {/* Sign Up Button - ✅ Disabled when registration is closed */}
                <button
                  type="submit"
                  disabled={loading || !registrationOpen}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      {registrationOpen ? "Create Account" : "Registration Closed"}
                      <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
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
                  <span className="px-3 bg-transparent text-white/30">Already have an account?</span>
                </div>
              </div>

              {/* Sign In Link */}
              <Link
                href="/auth/signin"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm group"
              >
                Sign In
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-xs text-white/30">
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="text-indigo-400/60 hover:text-indigo-400 transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-indigo-400/60 hover:text-indigo-400 transition-colors">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-white/20 mt-4">
              🎮 Join the community. Compete. Win. Repeat.
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