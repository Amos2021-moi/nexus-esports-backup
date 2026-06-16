import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const seasonId = searchParams.get("seasonId")

    if (!seasonId) {
      return NextResponse.json({ error: "Season ID required" }, { status: 400 })
    }

    const entries = await prisma.leagueEntry.findMany({
      where: { seasonId },
      include: {
        player: {
          include: { 
            profile: true 
          }
        }
      },
      orderBy: [
        { points: 'desc' },
        { goalDifference: 'desc' },
        { goalsFor: 'desc' }
      ]
    })

    const formattedEntries = entries.map((entry: any) => ({
      id: entry.id,
      playerId: entry.playerId,
      playerName: entry.player.name || entry.player.email,
      username: entry.player.profile?.username || entry.player.email?.split('@')[0],
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

    return NextResponse.json(formattedEntries)
  } catch (error) {
    console.error("Error fetching league table:", error)
    return NextResponse.json([])
  }
}