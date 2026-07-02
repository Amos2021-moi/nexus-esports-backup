import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { seasonId, playerId } = await request.json()

    if (!seasonId || !playerId) {
      return NextResponse.json(
        { error: "Season ID and Player ID required" },
        { status: 400 }
      )
    }

    // Check if season exists
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
    })

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 })
    }

    // Check if player already in season
    const existingEntry = await prisma.leagueEntry.findUnique({
      where: {
        seasonId_playerId: {
          seasonId,
          playerId,
        },
      },
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: "Player already in this season" },
        { status: 400 }
      )
    }

    // ✅ Create transaction
    await prisma.$transaction(async (tx) => {
      // Create LeagueEntry
      await tx.leagueEntry.create({
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
          points: 0,
        },
      })

      // ✅ Create PlayerSeasonEntry for payment tracking
      const existingPlayerEntry = await tx.playerSeasonEntry.findUnique({
        where: {
          userId_seasonId: {
            userId: playerId,
            seasonId,
          },
        },
      })

      if (!existingPlayerEntry) {
        await tx.playerSeasonEntry.create({
          data: {
            userId: playerId,
            seasonId,
            hasPaid: false,
          },
        })
      }

      // ✅ Create Prize Pool if it doesn't exist
      const prizePool = await tx.prizePool.findUnique({
        where: { seasonId },
      })

      if (!prizePool) {
        await tx.prizePool.create({
          data: {
            seasonId,
            entryFee: 0,
            totalCollected: 0,
            registeredPlayers: 0,
            championReward: 0,
            runnerReward: 0,
            topScorerReward: 0,
            platformReserve: 0,
          },
        })
      }

      // Send notification to player
      await tx.notification.create({
        data: {
          userId: playerId,
          title: "🏆 Added to Competition",
          message: `You've been added to ${season.name}!`,
          type: "NEW_FIXTURE",
          link: "/dashboard",
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: "Player added to season successfully!",
    })
  } catch (error) {
    console.error("Error adding player to season:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add player" },
      { status: 500 }
    )
  }
}