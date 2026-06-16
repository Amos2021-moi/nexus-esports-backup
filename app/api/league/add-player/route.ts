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

    const { seasonId, playerId } = await request.json()

    // Validate season exists
    const season = await prisma.season.findUnique({
      where: { id: seasonId }
    })

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    // Only allow adding players during PRESEASON or REGISTRATION
    const allowedStatuses = ["PRESEASON", "REGISTRATION"]
    if (!allowedStatuses.includes(season.status)) {
      return NextResponse.json({ 
        error: `Cannot add players when season status is ${season.status}` 
      }, { status: 403 })
    }

    // Check if player already in season
    const existing = await prisma.leagueEntry.findUnique({
      where: {
        seasonId_playerId: {
          seasonId,
          playerId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: "Player already in season" }, { status: 400 })
    }

    const entry = await prisma.leagueEntry.create({
      data: {
        seasonId,
        playerId,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }
    })

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    console.error("Error adding player:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add player" },
      { status: 500 }
    )
  }
}