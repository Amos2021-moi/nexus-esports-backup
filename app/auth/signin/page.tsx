import { Suspense } from "react"
import SignInForm from "./SignInForm"

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="text-white/60">Loading...</div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}