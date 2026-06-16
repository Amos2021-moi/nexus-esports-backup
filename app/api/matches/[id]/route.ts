import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // Get match with all related data
    const match = await prisma.fixture.findUnique({
      where: { id },
      include: {
        homePlayer: {
          include: {
            profile: true,
            squads: {
              where: { isActive: true },
              take: 1
            }
          }
        },
        awayPlayer: {
          include: {
            profile: true,
            squads: {
              where: { isActive: true },
              take: 1
            }
          }
        },
        season: true,
        result: {
          include: {
            user: {
              include: { profile: true }
            }
          }
        }
      }
    })

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // Get head-to-head history
    const headToHead = await prisma.fixture.findMany({
      where: {
        OR: [
          { homePlayerId: match.homePlayerId, awayPlayerId: match.awayPlayerId },
          { homePlayerId: match.awayPlayerId, awayPlayerId: match.homePlayerId }
        ],
        status: "COMPLETED",
        id: { not: id }
      },
      include: {
        result: true
      }
    })

    // Calculate head-to-head stats
    let homeWins = 0, awayWins = 0, draws = 0
    for (const h2h of headToHead) {
      if (h2h.result) {
        const isHome = h2h.homePlayerId === match.homePlayerId
        const homeScore = isHome ? h2h.result.homeScore : h2h.result.awayScore
        const awayScore = isHome ? h2h.result.awayScore : h2h.result.homeScore
        if (homeScore > awayScore) homeWins++
        else if (awayScore > homeScore) awayWins++
        else draws++
      }
    }

    // Get recent form (last 5 matches for each player)
    const homeForm = await prisma.fixture.findMany({
      where: {
        OR: [
          { homePlayerId: match.homePlayerId },
          { awayPlayerId: match.homePlayerId }
        ],
        status: "COMPLETED",
        id: { not: id }
      },
      include: { result: true },
      orderBy: { scheduledDate: 'desc' },
      take: 5
    })

    const awayForm = await prisma.fixture.findMany({
      where: {
        OR: [
          { homePlayerId: match.awayPlayerId },
          { awayPlayerId: match.awayPlayerId }
        ],
        status: "COMPLETED",
        id: { not: id }
      },
      include: { result: true },
      orderBy: { scheduledDate: 'desc' },
      take: 5
    })

    const formatResult = (fixture: any, playerId: string) => {
      if (!fixture.result) return "N/A"
      const isHome = fixture.homePlayerId === playerId
      const myScore = isHome ? fixture.result.homeScore : fixture.result.awayScore
      const oppScore = isHome ? fixture.result.awayScore : fixture.result.homeScore
      if (myScore > oppScore) return "W"
      if (myScore < oppScore) return "L"
      return "D"
    }

    const homeFormResults = homeForm.map(f => formatResult(f, match.homePlayerId))
    const awayFormResults = awayForm.map(f => formatResult(f, match.awayPlayerId))

    // Get comments (if we have a match discussion feature)
    // For now, we'll use the post/comment system

    return NextResponse.json({
      match,
      headToHead: { homeWins, awayWins, draws, total: headToHead.length },
      homeForm: homeFormResults,
      awayForm: awayFormResults,
    })
  } catch (error) {
    console.error("Error fetching match:", error)
    return NextResponse.json({ error: "Failed to fetch match" }, { status: 500 })
  }
}