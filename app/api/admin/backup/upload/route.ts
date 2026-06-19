import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"
import JSZip from "jszip"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("backup") as File

    if (!file) {
      return NextResponse.json({ error: "No backup file provided" }, { status: 400 })
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json({ error: "File must be a ZIP archive" }, { status: 400 })
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 100MB" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    try {
      const zip = await JSZip.loadAsync(buffer)
      
      const requiredFiles = ['database.json', 'manifest.json']
      for (const required of requiredFiles) {
        if (!zip.file(required)) {
          return NextResponse.json({ 
            error: `Invalid backup: missing ${required}` 
          }, { status: 400 })
        }
      }

      const manifestContent = await zip.file('manifest.json')?.async('string')
      if (manifestContent) {
        const manifest = JSON.parse(manifestContent)
        if (manifest.version !== "1.0") {
          return NextResponse.json({ 
            error: `Unsupported backup version: ${manifest.version}` 
          }, { status: 400 })
        }
      }
    } catch (error) {
      return NextResponse.json({ 
        error: "Invalid ZIP file or corrupted backup" 
      }, { status: 400 })
    }

    const backupDir = path.join(process.cwd(), 'backups', 'uploads')
    await fs.mkdir(backupDir, { recursive: true })

    const fileName = `upload_${Date.now()}_${file.name}`
    const filePath = path.join(backupDir, fileName)
    await fs.writeFile(filePath, buffer)

    const backup = await prisma.backup.create({
      data: {
        name: file.name.replace('.zip', ''),
        type: "UPLOADED",
        status: "COMPLETED",
        createdBy: session.user.id,
        version: "1.0",
        size: file.size,
        filePath: filePath,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          size: file.size
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: "Backup uploaded successfully",
      backup: {
        id: backup.id,
        name: backup.name,
        size: backup.size,
        createdAt: backup.createdAt
      }
    })
  } catch (error) {
    console.error("Error uploading backup:", error)
    return NextResponse.json(
      { error: "Failed to upload backup" },
      { status: 500 }
    )
  }
}