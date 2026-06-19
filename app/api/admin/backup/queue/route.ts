import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { type = "MANUAL" } = await request.json()

    // ✅ Create backup record
    const backup = await prisma.backup.create({
      data: {
        name: `backup_${new Date().toISOString().replace(/[:.]/g, '_')}`,
        type,
        status: "PENDING",
        createdBy: session.user.id,
        version: "1.0",
        size: 0,
      }
    })

    // ✅ Trigger background job via Vercel's waitUntil
    // This runs in the background after the response is sent
    const response = NextResponse.json({
      success: true,
      message: "Backup queued successfully",
      backupId: backup.id,
      status: "PENDING"
    })

    // ✅ Schedule the actual backup to run in the background
    // Using setTimeout to run after response is sent
    setTimeout(async () => {
      try {
        await performBackup(backup.id, session.user.id)
      } catch (error) {
        console.error('Background backup failed:', error)
      }
    }, 100)

    return response
  } catch (error) {
    console.error("Error queuing backup:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to queue backup" },
      { status: 500 }
    )
  }
}

// ✅ Heavy backup function (runs in background)
async function performBackup(backupId: string, userId: string) {
  // Dynamic import to keep the API route lightweight
  const { backupWorker } = await import('@/lib/services/backup.worker')
  await backupWorker.performBackup(backupId, userId)
}