import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { clearDataService } from "@/lib/services/clear-data.service"

export async function POST(request: Request) {
  try {
    // ✅ Check if user is logged in
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }

    // ✅ Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // ✅ Get confirmation from request
    const body = await request.json()
    const { confirmation } = body

    // ✅ Require "DELETE" confirmation
    if (confirmation !== "DELETE") {
      return NextResponse.json({ 
        error: 'Please type "DELETE" to confirm' 
      }, { status: 400 })
    }

    // ✅ Clear all data
    const result = await clearDataService.clearAllData(session.user.id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error clearing data:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clear data" },
      { status: 500 }
    )
  }
}