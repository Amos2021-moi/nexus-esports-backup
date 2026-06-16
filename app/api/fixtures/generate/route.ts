import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { seasonId } = await request.json()

    const season = await prisma.season.findUnique({
      where: { id: seasonId }
    })

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    // Prevent fixture generation if season is locked
    const lockedStatuses = ["FIXTURE_LOCK", "LIVE", "ENDED", "ARCHIVED"]
    if (lockedStatuses.includes(season.status)) {
      return NextResponse.json({ 
        error: `Cannot generate fixtures when season status is ${season.status}` 
      }, { status: 403 })
    }

    const entries = await prisma.leagueEntry.findMany({
      where: { seasonId },
      select: { playerId: true }
    })

    const players = entries.map(e => e.playerId)
    
    if (players.length < 2) {
      return NextResponse.json({ error: "Need at least 2 players" }, { status: 400 })
    }

    // Delete existing fixtures
    const existingFixtures = await prisma.fixture.findMany({
      where: { seasonId },
      select: { id: true }
    })
    
    const fixtureIds = existingFixtures.map(f => f.id)
    
    if (fixtureIds.length > 0) {
      await prisma.result.deleteMany({
        where: { fixtureId: { in: fixtureIds } }
      })
    }
    
    await prisma.fixture.deleteMany({ where: { seasonId } })

    // Generate fixtures
    const fixtures = []
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        fixtures.push({ seasonId, homePlayerId: players[i], awayPlayerId: players[j], scheduledDate: new Date() })
        fixtures.push({ seasonId, homePlayerId: players[j], awayPlayerId: players[i], scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
      }
    }

    const created = await prisma.fixture.createMany({ data: fixtures })

    return NextResponse.json({ success: true, count: created.count })
  } catch (error) {
    console.error("Error generating fixtures:", error)
    return NextResponse.json({ error: "Failed to generate fixtures" }, { status: 500 })
  }
}