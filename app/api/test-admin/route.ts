import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  return NextResponse.json({
    isLoggedIn: !!session,
    email: session?.user?.email,
    role: session?.user?.role,
    isAdmin: session?.user?.role === "ADMIN"
  })
}