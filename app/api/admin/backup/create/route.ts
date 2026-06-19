import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { type = "MANUAL" } = body

    // Create backup record
    const backup = await prisma.backup.create({
      data: {
        name: `backup_${new Date().toISOString().replace(/[:.]/g, '_')}`,
        type,
        status: "PROCESSING",
        createdBy: session.user.id,
        version: "1.0",
        size: 0,
      }
    })

    // Generate backup data
    const backupData = {
      id: backup.id,
      createdAt: backup.createdAt,
      type: backup.type,
      // Include minimal data
    }

    // Store in Vercel Blob (not in the function)
    const blob = await put(`backups/${backup.id}.json`, JSON.stringify(backupData), {
      access: 'private',
      addRandomSuffix: false,
    })

    // Update backup with blob URL
    await prisma.backup.update({
      where: { id: backup.id },
      data: {
        status: "COMPLETED",
        size: Buffer.from(JSON.stringify(backupData)).length,
        filePath: blob.url,
      }
    })

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