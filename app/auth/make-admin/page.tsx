"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function MakeAdminPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  async function makeAdmin() {
    setLoading(true)
    setMessage("")
    
    const response = await fetch("/api/make-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      setMessage(`Success! ${email} is now an admin. Please sign in again.`)
      setTimeout(() => router.push("/auth/signin"), 2000)
    } else {
      setMessage(data.error || "Failed to make admin")
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Make User Admin</h1>
        <p className="text-gray-600 mb-6">Enter the email of the user you want to make an admin.</p>
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          className="w-full p-2 border rounded mb-4"
        />
        
        <button
          onClick={makeAdmin}
          disabled={loading || !email}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Make Admin"}
        </button>
        
        {message && (
          <p className={`mt-4 p-3 rounded ${message.includes("Success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}