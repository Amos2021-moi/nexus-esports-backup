import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"
import JSZip from "jszip"

// ✅ Dynamically import Vercel Blob (only if available)
let put: any = null
try {
  const blob = await import('@vercel/blob')
  put = blob.put
} catch (error) {
  console.log('ℹ️ Vercel Blob not available, using local storage')
}

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

      // Export database as JSON
      const dbData = await this.exportViaPrisma()
      const dbPath = path.join(tempDir, 'database.json')
      await fs.writeFile(dbPath, JSON.stringify(dbData, null, 2))

      // Create manifest
      const manifest = {
        version: "1.0",
        platform: "Nexus Esports League",
        createdAt: new Date().toISOString(),
        tables: ['User', 'Profile', 'Fixture', 'Result', 'Tournament', 'Season', 'Award', 'News', 'LeagueEntry', 'Squad']
      }
      const manifestPath = path.join(tempDir, 'manifest.json')
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))

      // Create ZIP
      const zip = new JSZip()
      const files = await fs.readdir(tempDir)
      for (const file of files) {
        const filePath = path.join(tempDir, file)
        const content = await fs.readFile(filePath)
        zip.file(file, content)
      }

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
      const zipSize = zipBuffer.length

      let filePath: string

      // ✅ Try Vercel Blob first (production), fallback to local
      if (put && process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const blob = await put(
            `backups/${backupId}.zip`,
            zipBuffer,
            {
              access: 'private',
              addRandomSuffix: false,
              contentType: 'application/zip',
            }
          )
          filePath = blob.url
          console.log(`✅ Backup stored in Vercel Blob: ${filePath}`)
        } catch (blobError) {
          console.error('❌ Vercel Blob upload failed, falling back to local:', blobError)
          filePath = await this.saveLocal(zipBuffer, backupId)
        }
      } else {
        // ✅ Fallback to local storage
        filePath = await this.saveLocal(zipBuffer, backupId)
      }

      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: "COMPLETED",
          size: zipSize,
          filePath: filePath,
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

  private async saveLocal(zipBuffer: Buffer, backupId: string): Promise<string> {
    const zipPath = path.join(this.backupDir, `${backupId}.zip`)
    await fs.writeFile(zipPath, zipBuffer)
    console.log(`✅ Backup stored locally: ${zipPath}`)
    return zipPath
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