import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"
import JSZip from "jszip"
import { put } from "@vercel/blob"

export class BackupWorker {
  private backupDir: string

  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups')
  }

  async performBackup(backupId: string, userId: string) {
    try {
      console.log(`📦 Starting backup worker for ${backupId}`)

      await prisma.backup.update({
        where: { id: backupId },
        data: { status: "PROCESSING" }
      })

      const tempDir = path.join(this.backupDir, backupId)
      await fs.mkdir(tempDir, { recursive: true })

      const dbData = await this.exportViaPrisma()
      const dbPath = path.join(tempDir, 'database.json')
      await fs.writeFile(dbPath, JSON.stringify(dbData, null, 2))

      const manifest = {
        version: "1.0",
        platform: "Nexus Esports League",
        createdAt: new Date().toISOString(),
        tables: ['User', 'Profile', 'Fixture', 'Result', 'Tournament', 'Season', 'Award', 'News', 'LeagueEntry', 'Squad']
      }
      const manifestPath = path.join(tempDir, 'manifest.json')
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))

      // Create ZIP archive
      const zip = new JSZip()
      const files = await fs.readdir(tempDir)
      for (const file of files) {
        const filePath = path.join(tempDir, file)
        const content = await fs.readFile(filePath)
        zip.file(file, content)
      }

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

      // ✅ Get the size before uploading
      const zipSize = zipBuffer.length

      // Upload to Vercel Blob
      const blob = await put(
        `backups/${backupId}.zip`,
        zipBuffer,
        {
          access: 'private',
          addRandomSuffix: false,
          contentType: 'application/zip',
        }
      )

      // ✅ Use zipSize instead of blob.size
      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: "COMPLETED",
          size: zipSize,
          filePath: blob.url,
        }
      })

      await fs.rm(tempDir, { recursive: true, force: true })

      console.log(`✅ Backup ${backupId} completed successfully! Size: ${zipSize} bytes`)

    } catch (error) {
      console.error('❌ Backup worker failed:', error)
      await prisma.backup.update({
        where: { id: backupId },
        data: { status: "FAILED" }
      })
      throw error
    }
  }

  private async exportViaPrisma() {
    const tables = ['User', 'Profile', 'Fixture', 'Result', 'Tournament', 'Season', 'Award', 'News', 'LeagueEntry', 'Squad']
    const data: Record<string, any> = {}

    for (const table of tables) {
      try {
        const modelName = table.toLowerCase()
        const model = prisma[modelName as keyof typeof prisma] as any
        if (model) {
          data[table] = await model.findMany()
        }
      } catch (error) {
        console.warn(`Failed to export table ${table}:`, error)
      }
    }

    return data
  }
}

export const backupWorker = new BackupWorker()