import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import { CompetitionStatus } from "@prisma/client"

// ✅ Helper to check if player has paid
async function hasPlayerPaid(userId: string, seasonId: string): Promise<boolean> {
  // Check PlayerSeasonEntry
  const playerEntry = await prisma.playerSeasonEntry.findUnique({
    where: {
      userId_seasonId: {
        userId,
        seasonId,
      },
    },
  })

  // Check SeasonEntry (M-Pesa)
  const seasonEntry = await prisma.seasonEntry.findUnique({
    where: {
      userId_seasonId: {
        userId,
        seasonId,
      },
    },
  })

  return playerEntry?.hasPaid || seasonEntry?.status === CompetitionStatus.ACTIVE || false
}

// ✅ Cache dashboard stats per user
const getCachedDashboardStats = unstable_cache(
  async (userId: string) => {
    // Get active season
    const activeSeason = await prisma.season.findFirst({
      where: { isActive: true },
      include: {
        leagueSettings: true,
      },
    })

    // Get player profile
    const profile = await prisma.profile.findUnique({
      where: { userId }
    })

    // Get league entries to find rank
    let leagueEntries = await prisma.leagueEntry.findMany({
      include: { player: true },
      orderBy: { points: 'desc' }
    })
    
    // ✅ Filter by paid players if payment is required
    let filteredEntries = leagueEntries
    let showFixtures = true
    let isPaid = true
    let paymentRequired = false

    if (activeSeason?.leagueSettings?.paymentRequired) {
      paymentRequired = true
      isPaid = await hasPlayerPaid(userId, activeSeason.id)
      
      // ✅ If payment is required and player hasn't paid, filter out fixtures
      if (!isPaid) {
        showFixtures = false
        // ✅ Only show user in standings if paid (but we're filtering for unpaid so don't show)
        filteredEntries = leagueEntries.filter(e => e.playerId === userId) // Keep user for rank calculation
      } else {
        // ✅ Only include paid players in standings
        const paidPlayerIds = await prisma.playerSeasonEntry.findMany({
          where: {
            seasonId: activeSeason.id,
            hasPaid: true,
          },
          select: { userId: true },
        })
        
        const paidIds = new Set(paidPlayerIds.map(p => p.userId))
        
        // Also check SeasonEntry
        const seasonEntries = await prisma.seasonEntry.findMany({
          where: {
            seasonId: activeSeason.id,
            status: CompetitionStatus.ACTIVE,
          },
          select: { userId: true },
        })
        
        for (const entry of seasonEntries) {
          paidIds.add(entry.userId)
        }
        
        filteredEntries = leagueEntries.filter(e => paidIds.has(e.playerId))
      }
    }

    // ✅ Sort filtered entries for ranking
    filteredEntries.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })

    const userEntry = leagueEntries.find(e => e.playerId === userId)
    const rank = filteredEntries.findIndex(e => e.playerId === userId) + 1

    // ✅ Get next fixture - only if payment rules allow
    let nextFixtureData = null
    if (showFixtures) {
      const nextFixture = await prisma.fixture.findFirst({
        where: {
          OR: [
            { homePlayerId: userId },
            { awayPlayerId: userId }
          ],
          homeScore: null,
          scheduledDate: { gt: new Date() }
        },
        include: {
          homePlayer: { include: { profile: true } },
          awayPlayer: { include: { profile: true } }
        },
        orderBy: { scheduledDate: 'asc' }
      })

      if (nextFixture) {
        const isHome = nextFixture.homePlayerId === userId
        const opponent = isHome 
          ? (nextFixture.awayPlayer.profile?.username || nextFixture.awayPlayer.name)
          : (nextFixture.homePlayer.profile?.username || nextFixture.homePlayer.name)
        nextFixtureData = {
          id: nextFixture.id,
          opponent,
          date: nextFixture.scheduledDate,
          isHome
        }
      }
    }

    // ✅ Get recent result - only if payment rules allow
    let recentResultData = null
    if (showFixtures) {
      const recentResult = await prisma.result.findFirst({
        where: {
          source: "LEAGUE",
          approved: true,
          fixture: {
            OR: [
              { homePlayerId: userId },
              { awayPlayerId: userId }
            ]
          }
        },
        include: {
          fixture: {
            include: {
              homePlayer: { include: { profile: true } },
              awayPlayer: { include: { profile: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      if (recentResult && recentResult.fixture) {
        const isHome = recentResult.fixture.homePlayerId === userId
        const opponent = isHome
          ? (recentResult.fixture.awayPlayer.profile?.username || recentResult.fixture.awayPlayer.name)
          : (recentResult.fixture.homePlayer.profile?.username || recentResult.fixture.homePlayer.name)
        const myScore = isHome ? recentResult.homeScore : recentResult.awayScore
        const opponentScore = isHome ? recentResult.awayScore : recentResult.homeScore
        const result = myScore > opponentScore ? "W" : myScore < opponentScore ? "L" : "D"
        
        recentResultData = {
          opponent,
          score: `${myScore} - ${opponentScore}`,
          result
        }
      }
    }

    const totalMatches = userEntry?.played || 0
    const wins = userEntry?.wins || 0
    const draws = userEntry?.draws || 0
    const losses = userEntry?.losses || 0
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0
    const points = userEntry?.points || 0

    return {
      matchesPlayed: totalMatches,
      wins,
      draws,
      losses,
      winRate,
      currentRank: rank > 0 ? rank : filteredEntries.length,
      totalPlayers: filteredEntries.length,
      points,
      goalsFor: userEntry?.goalsFor || 0,
      goalsAgainst: userEntry?.goalsAgainst || 0,
      goalDifference: (userEntry?.goalsFor || 0) - (userEntry?.goalsAgainst || 0),
      nextFixture: nextFixtureData,
      recentResult: recentResultData,
      // ✅ Add payment info for UI
      paymentRequired,
      isPaid,
      showFixtures,
    }
  },
  ['dashboard-stats'],
  { revalidate: 30 }
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await getCachedDashboardStats(userId)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      winRate: 0,
      currentRank: 0,
      totalPlayers: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      nextFixture: null,
      recentResult: null,
      paymentRequired: false,
      isPaid: true,
      showFixtures: true,
    })
  }
}