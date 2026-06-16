"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { registerUser } from "@/app/actions/auth.actions"

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    
    try {
      await registerUser(formData)
      router.push("/auth/signin?registered=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
      <div className="w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Nexus Esports</h1>
          <p className="text-white/70 mt-2">Create your account</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/20 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="name"
              type="text"
              required
              placeholder="Full Name"
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all"
            />
          </div>

          <div>
            <input
              name="username"
              type="text"
              required
              placeholder="Username"
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all"
            />
          </div>

          <div>
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all"
            />
          </div>

          <div>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-white/70">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-white font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}