import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const backup = await prisma.backup.findUnique({
      where: { id }
    })

    if (!backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 })
    }

    if (backup.filePath) {
      try {
        await fs.unlink(backup.filePath)
        const tempDir = path.join(process.cwd(), 'backups', backup.id)
        await fs.rm(tempDir, { recursive: true, force: true })
      } catch (error) {
        console.error(`Failed to delete backup files:`, error)
      }
    }

    await prisma.backup.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting backup:", error)
    return NextResponse.json(
      { error: "Failed to delete backup" },
      { status: 500 }
    )
  }
}