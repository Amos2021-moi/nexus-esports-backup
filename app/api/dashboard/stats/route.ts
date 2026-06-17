import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }

    const userId = session.user.id

    // Get player profile
    const profile = await prisma.profile.findUnique({
      where: { userId }
    })

    // Get league entries to find rank
    const leagueEntries = await prisma.leagueEntry.findMany({
      include: { player: true },
      orderBy: { points: 'desc' }
    })
    
    const userEntry = leagueEntries.find(e => e.playerId === userId)
    const rank = leagueEntries.findIndex(e => e.playerId === userId) + 1

    // Get next fixture
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

    let nextFixtureData = null
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

    // Get recent result
    // Get recent result (only league results)
const recentResult = await prisma.result.findFirst({
  where: {
    source: "LEAGUE",  // ✅ Only league results
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

let recentResultData = null
if (recentResult && recentResult.fixture) {  // ✅ Check if fixture exists
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
    const totalMatches = userEntry?.played || 0
    const wins = userEntry?.wins || 0
    const draws = userEntry?.draws || 0
    const losses = userEntry?.losses || 0
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0
    const points = userEntry?.points || 0

    return NextResponse.json({
      matchesPlayed: totalMatches,
      wins,
      draws,
      losses,
      winRate,
      currentRank: rank > 0 ? rank : leagueEntries.length,
      totalPlayers: leagueEntries.length,
      points,
      goalsFor: userEntry?.goalsFor || 0,
      goalsAgainst: userEntry?.goalsAgainst || 0,
      goalDifference: (userEntry?.goalsFor || 0) - (userEntry?.goalsAgainst || 0),
      nextFixture: nextFixtureData,
      recentResult: recentResultData
    })
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
      recentResult: null
    })
  }
}