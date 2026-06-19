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
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const backup = await prisma.backup.findUnique({
      where: { id }
    })

    if (!backup || !backup.filePath) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 })
    }

    try {
      await fs.access(backup.filePath)
    } catch {
      return NextResponse.json({ error: "Backup file not found" }, { status: 404 })
    }

    const file = await fs.readFile(backup.filePath)
    const fileName = `${backup.name}.zip`

    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': file.length.toString()
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