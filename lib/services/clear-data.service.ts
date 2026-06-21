import { prisma } from "@/lib/prisma"
import { backupService } from "./backup.service"

export class ClearDataService {
  async clearAllData(adminId: string): Promise<{ success: boolean; message: string; backupId?: string }> {
    try {
      // ✅ Step 1: Create a backup first
      console.log("📦 Creating backup before clearing data...")
      const backup = await backupService.createBackup(adminId, "MANUAL")
      console.log(`✅ Backup created: ${backup.id}`)

      // ✅ Step 2: Delete data in correct order (respect foreign keys)
      console.log("🗑️ Clearing all data...")

      // Delete in reverse order of dependencies
      await prisma.$transaction([
        // 1. Delete notifications
        prisma.notification.deleteMany(),
        
        // 2. Delete reports
        prisma.report.deleteMany(),
        
        // 3. Delete audit logs
        prisma.auditLog.deleteMany(),
        
        // 4. Delete comments and likes
        prisma.comment.deleteMany(),
        prisma.like.deleteMany(),
        
        // 5. Delete posts
        prisma.post.deleteMany(),
        
        // 6. Delete squads
        prisma.squad.deleteMany(),
        
        // 7. Delete awards and hall of fame
        prisma.award.deleteMany(),
        prisma.hallOfFame.deleteMany(),
        
        // 8. Delete tournament data
        prisma.tournamentParticipant.deleteMany(),
        prisma.tournamentMatch.deleteMany(),
        prisma.tournament.deleteMany(),
        
        // 9. Delete results and fixtures
        prisma.result.deleteMany(),
        prisma.fixture.deleteMany(),
        
        // 10. Delete league entries
        prisma.leagueEntry.deleteMany(),
        
        // 11. Delete seasons
        prisma.season.deleteMany(),
        
        // 12. Delete news
        prisma.news.deleteMany(),
        
        // 13. Delete backups (keep the one we just created?)
        // We'll keep the backup we just created
        // prisma.backup.deleteMany({ where: { id: { not: backup.id } } }),
        
        // 14. Delete profiles (but keep admin profile)
        prisma.profile.deleteMany({
          where: {
            userId: { not: adminId }
          }
        }),
        
        // 15. Delete non-admin users
        prisma.user.deleteMany({
          where: {
            id: { not: adminId }
          }
        }),
      ])

      console.log("✅ All data cleared successfully!")

      return {
        success: true,
        message: "All data has been cleared successfully. A backup was created before clearing.",
        backupId: backup.id
      }
    } catch (error) {
      console.error("❌ Error clearing data:", error)
      throw new Error("Failed to clear data. Please try again.")
    }
  }
}

export const clearDataService = new ClearDataService()