import { prisma } from "@/lib/prisma"
import { updateTrustScore } from "@/lib/services/trust.service"

interface ApproveResultParams {
  resultId: string
  adminId: string
}

interface RejectResultParams {
  resultId: string
  adminId: string
}

export async function approveMatch({ resultId, adminId }: ApproveResultParams) {
  try {
    // Get the result with fixture and season
    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: { 
        fixture: {
          include: {
            season: true,
            homePlayer: {
              include: { profile: true }
            },
            awayPlayer: {
              include: { profile: true }
            }
          }
        } 
      }
    })

    if (!result) throw new Error("Result not found")
    if (result.approved) throw new Error("Result already approved")
    if (!result.fixture) throw new Error("Fixture not found")

    const fixture = result.fixture
    const seasonId = fixture.seasonId

    // 1. Update fixture with scores (skip tournament results)
    if (result.fixtureId) {
      await prisma.fixture.update({
        where: { id: result.fixtureId },
        data: {
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          status: "COMPLETED",
          approvedBy: adminId,
          approvedAt: new Date()
        }
      })
    }

    // 2. Mark result as approved
    await prisma.result.update({
      where: { id: resultId },
      data: { approved: true }
    })

    // 3. Calculate points
    const homePoints = result.homeScore > result.awayScore ? 3 : result.homeScore === result.awayScore ? 1 : 0
    const awayPoints = result.awayScore > result.homeScore ? 3 : result.awayScore === result.homeScore ? 1 : 0

    // 4. Update league table - Home Player
    const homeEntry = await prisma.leagueEntry.findUnique({
      where: {
        seasonId_playerId: {
          seasonId: seasonId,
          playerId: fixture.homePlayerId
        }
      }
    })

    const awayEntry = await prisma.leagueEntry.findUnique({
      where: {
        seasonId_playerId: {
          seasonId: seasonId,
          playerId: fixture.awayPlayerId
        }
      }
    })

    if (homeEntry) {
      await prisma.leagueEntry.update({
        where: { id: homeEntry.id },
        data: {
          played: { increment: 1 },
          wins: { increment: homePoints === 3 ? 1 : 0 },
          draws: { increment: homePoints === 1 ? 1 : 0 },
          losses: { increment: homePoints === 0 ? 1 : 0 },
          goalsFor: { increment: result.homeScore },
          goalsAgainst: { increment: result.awayScore },
          points: { increment: homePoints }
        }
      })
    }

    if (awayEntry) {
      await prisma.leagueEntry.update({
        where: { id: awayEntry.id },
        data: {
          played: { increment: 1 },
          wins: { increment: awayPoints === 3 ? 1 : 0 },
          draws: { increment: awayPoints === 1 ? 1 : 0 },
          losses: { increment: awayPoints === 0 ? 1 : 0 },
          goalsFor: { increment: result.awayScore },
          goalsAgainst: { increment: result.homeScore },
          points: { increment: awayPoints }
        }
      })
    }

    // 5. Update player profiles (career stats)
    await prisma.profile.updateMany({
      where: { userId: fixture.homePlayerId },
      data: {
        totalWins: { increment: homePoints === 3 ? 1 : 0 },
        totalDraws: { increment: homePoints === 1 ? 1 : 0 },
        totalLosses: { increment: homePoints === 0 ? 1 : 0 },
        totalPoints: { increment: homePoints },
        goalsFor: { increment: result.homeScore },
        goalsAgainst: { increment: result.awayScore }
      }
    })

    await prisma.profile.updateMany({
      where: { userId: fixture.awayPlayerId },
      data: {
        totalWins: { increment: awayPoints === 3 ? 1 : 0 },
        totalDraws: { increment: awayPoints === 1 ? 1 : 0 },
        totalLosses: { increment: awayPoints === 0 ? 1 : 0 },
        totalPoints: { increment: awayPoints },
        goalsFor: { increment: result.awayScore },
        goalsAgainst: { increment: result.homeScore }
      }
    })

    // 6. Send notifications to both players
    const winner = result.homeScore > result.awayScore ? fixture.homePlayer : result.awayScore > result.homeScore ? fixture.awayPlayer : null
    const winnerName = winner?.name || "No one (Draw)"
    const homePlayerName = fixture.homePlayer.profile?.username || fixture.homePlayer.name
    const awayPlayerName = fixture.awayPlayer.profile?.username || fixture.awayPlayer.name

    await prisma.notification.createMany({
      data: [
        {
          userId: fixture.homePlayerId,
          title: "✅ Result Approved!",
          message: `Your match vs ${awayPlayerName} (${result.homeScore}-${result.awayScore}) has been approved. ${winnerName} won!`,
          type: "RESULT_APPROVED",
          link: `/matches/${result.fixtureId}`
        },
        {
          userId: fixture.awayPlayerId,
          title: "✅ Result Approved!",
          message: `Your match vs ${homePlayerName} (${result.homeScore}-${result.awayScore}) has been approved. ${winnerName} won!`,
          type: "RESULT_APPROVED",
          link: `/matches/${result.fixtureId}`
        }
      ]
    })

    // 7. Log to audit
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "APPROVE_RESULT",
        targetType: "RESULT",
        targetId: resultId,
        details: {
          fixtureId: result.fixtureId,
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          homePlayerId: fixture.homePlayerId,
          awayPlayerId: fixture.awayPlayerId,
          seasonId: seasonId
        }
      }
    })

    // 8. Update trust scores for both players
    try {
      await updateTrustScore(fixture.homePlayerId)
      await updateTrustScore(fixture.awayPlayerId)
    } catch (trustError) {
      // Log but don't fail the approval if trust update fails
      console.error("Error updating trust scores:", trustError)
    }

    return { 
      success: true, 
      message: "Result approved successfully!",
      data: {
        homePoints,
        awayPoints,
        homePlayer: fixture.homePlayerId,
        awayPlayer: fixture.awayPlayerId,
        winner: winner?.id || null
      }
    }
  } catch (error) {
    console.error("Error in approveMatch:", error)
    throw error
  }
}

export async function rejectMatch({ resultId, adminId }: RejectResultParams) {
  try {
    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: { 
        fixture: {
          include: {
            homePlayer: {
              include: { profile: true }
            },
            awayPlayer: {
              include: { profile: true }
            }
          }
        } 
      }
    })

    if (!result) throw new Error("Result not found")
    if (result.approved) throw new Error("Result already approved")
    if (!result.fixture) throw new Error("Fixture not found")

    const fixture = result.fixture
    const homePlayerName = fixture.homePlayer.profile?.username || fixture.homePlayer.name
    const awayPlayerName = fixture.awayPlayer.profile?.username || fixture.awayPlayer.name

    // 1. Reset fixture (skip tournament results)
    if (result.fixtureId) {
      await prisma.fixture.update({
        where: { id: result.fixtureId },
        data: {
          homeScore: null,
          awayScore: null,
          status: "SCHEDULED",
          submittedBy: null,
          submittedAt: null
        }
      })
    }

    // 2. Delete the result
    await prisma.result.delete({
      where: { id: resultId }
    })

    // 3. Notify players
    await prisma.notification.createMany({
      data: [
        {
          userId: fixture.homePlayerId,
          title: "❌ Result Rejected",
          message: `Your match vs ${awayPlayerName} has been rejected. Please resubmit with correct evidence.`,
          type: "RESULT_APPROVED",
          link: `/dashboard/fixtures`
        },
        {
          userId: fixture.awayPlayerId,
          title: "❌ Result Rejected",
          message: `Your match vs ${homePlayerName} has been rejected. Please resubmit with correct evidence.`,
          type: "RESULT_APPROVED",
          link: `/dashboard/fixtures`
        }
      ]
    })

    return { success: true }
  } catch (error) {
    console.error("Error in rejectMatch:", error)
    throw error
  }
}