import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { backupService } from "@/lib/services/backup.service"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { type = "MANUAL" } = body

    await backupService.initialize()
    const backup = await backupService.createBackup(session.user.id, type)

    return NextResponse.json({
      success: true,
      message: "Backup created successfully",
      backup
    })
  } catch (error) {
    console.error("Error creating backup:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create backup" },
      { status: 500 }
    )
  }
}