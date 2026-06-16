import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { approveMatch } from "@/lib/services/result.service"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { resultId } = await request.json()

    if (!resultId) {
      return NextResponse.json({ error: "Result ID required" }, { status: 400 })
    }

    const result = await approveMatch({
      resultId,
      adminId: session.user.id
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error approving result:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to approve" },
      { status: 500 }
    )
  }
}