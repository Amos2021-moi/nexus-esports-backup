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

    // ✅ Run backup in background
    setTimeout(async () => {
      try {
        const { backupWorker } = await import('@/lib/services/backup.worker')
        await backupWorker.performBackup(backup.id, session.user.id)
      } catch (error) {
        console.error('Background backup failed:', error)
        await prisma.backup.update({
          where: { id: backup.id },
          data: { status: "FAILED" }
        })
      }
    }, 100)

    return NextResponse.json({
      success: true,
      message: "Backup queued successfully",
      backupId: backup.id,
      status: "PENDING"
    })
  } catch (error) {
    console.error("Error queuing backup:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to queue backup" },
      { status: 500 }
    )
  }
}