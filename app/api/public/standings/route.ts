import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get("seasonId")

    // Get all seasons
    const seasons = await prisma.season.findMany({
      orderBy: { startDate: 'desc' }
    })

    // If no seasonId provided, use the latest active season
    let selectedSeasonId = seasonId
    if (!selectedSeasonId) {
      const activeSeason = seasons.find(s => s.isActive)
      if (activeSeason) {
        selectedSeasonId = activeSeason.id
      } else if (seasons.length > 0) {
        selectedSeasonId = seasons[0].id
      }
    }

    // ✅ FIXED: Only add seasonId filter if we have one
    const entries = await prisma.leagueEntry.findMany({
      where: selectedSeasonId ? { seasonId: selectedSeasonId } : {},
      include: {
        player: {
          include: { profile: true }
        }
      },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' }
      ]
    })

    // Get total players count
    const totalPlayers = await prisma.user.count({
      where: { role: "PLAYER" }
    })

    // Get total matches
    const totalMatches = await prisma.fixture.count({
      where: { status: "COMPLETED" }
    })

    // Get total awards
    const totalAwards = await prisma.award.count()

    const formattedEntries = entries.map((entry: any) => ({
      id: entry.id,
      playerId: entry.playerId,
      playerName: entry.player.profile?.username || entry.player.name || "Player",
      profilePicture: entry.player.profile?.profilePicture || null,
      played: entry.played,
      wins: entry.wins,
      draws: entry.draws,
      losses: entry.losses,
      goalsFor: entry.goalsFor,
      goalsAgainst: entry.goalsAgainst,
      goalDifference: entry.goalDifference,
      points: entry.points
    }))

    return NextResponse.json({
      entries: formattedEntries,
      seasons,
      selectedSeasonId,
      totalPlayers,
      totalMatches,
      totalAwards
    })
  } catch (error) {
    console.error("Error fetching public standings:", error)
    return NextResponse.json({
      entries: [],
      seasons: [],
      selectedSeasonId: null,
      totalPlayers: 0,
      totalMatches: 0,
      totalAwards: 0
    })
  }
}