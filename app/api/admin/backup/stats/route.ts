import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { backupService } from "@/lib/services/backup.service"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const stats = await backupService.getBackupStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching backup stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch backup stats" },
      { status: 500 }
    )
  }
}