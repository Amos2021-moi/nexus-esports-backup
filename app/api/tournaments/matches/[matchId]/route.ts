import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params
    
    const match = await prisma.tournamentMatch.findUnique({
      where: { id: matchId },
      include: {
        homePlayer: { include: { profile: true } },
        awayPlayer: { include: { profile: true } },
        tournament: true,
        result: true
      }
    })
    
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }
    
    return NextResponse.json(match)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch match" }, { status: 500 })
  }
}