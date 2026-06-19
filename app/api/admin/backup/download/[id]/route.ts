import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import fs from "fs/promises"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const backup = await prisma.backup.findUnique({
      where: { id }
    })

    if (!backup || !backup.filePath) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 })
    }

    let fileBuffer: Buffer

    // Check if it's a Vercel Blob URL or local path
    if (backup.filePath.startsWith('http')) {
      // Download from Vercel Blob
      const response = await fetch(backup.filePath)
      const arrayBuffer = await response.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)
    } else {
      // Read from local file system
      try {
        await fs.access(backup.filePath)
        fileBuffer = await fs.readFile(backup.filePath)
      } catch {
        return NextResponse.json({ error: "Backup file not found" }, { status: 404 })
      }
    }

    const fileName = `${backup.name}.zip`

    // ✅ Convert Buffer to Uint8Array for NextResponse
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error("Error downloading backup:", error)
    return NextResponse.json(
      { error: "Failed to download backup" },
      { status: 500 }
    )
  }
}