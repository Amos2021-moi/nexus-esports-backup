import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 })
    }
    
    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      isAdmin: session.user.role === "ADMIN"
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}