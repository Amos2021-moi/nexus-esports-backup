import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Generate single elimination bracket
function generateSingleElimination(players: string[], tournamentId: string) {
  const matches = []
  const numPlayers = players.length
  const numRounds = Math.ceil(Math.log2(numPlayers))
  const totalSlots = Math.pow(2, numRounds)
  
  let matchNumber = 1
  
  for (let round = 1; round <= numRounds; round++) {
    const matchesThisRound = totalSlots / Math.pow(2, round)
    for (let i = 0; i < matchesThisRound; i++) {
      matches.push({
        tournamentId,
        round,
        matchNumber: matchNumber++,
        bracket: "WINNERS",
        status: "PENDING",
        homePlayerId: null as string | null,  // Add this field
        awayPlayerId: null as string | null   // Add this field
      })
    }
  }
  
  // Assign players to first round matches
  const firstRoundMatches = matches.filter(m => m.round === 1)
  
  for (let i = 0; i < players.length; i++) {
    const matchIndex = Math.floor(i / 2)
    if (matchIndex < firstRoundMatches.length) {
      if (i % 2 === 0) {
        firstRoundMatches[matchIndex].homePlayerId = players[i]
      } else {
        firstRoundMatches[matchIndex].awayPlayerId = players[i]
      }
    }
  }
  
  return matches
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const matches = await prisma.tournamentMatch.findMany({
      where: { tournamentId: id },
      include: {
        homePlayer: { include: { profile: true } },
        awayPlayer: { include: { profile: true } },
        winner: { include: { profile: true } },
        result: true
      },
      orderBy: [
        { bracket: 'asc' },
        { round: 'asc' },
        { matchNumber: 'asc' }
      ]
    })
    
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            player: { include: { profile: true } }
          }
        }
      }
    })
    
    return NextResponse.json({ matches, tournament })
  } catch (error) {
    console.error("Error fetching bracket:", error)
    return NextResponse.json({ error: "Failed to fetch bracket" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const tournament = await prisma.tournament.findUnique({
      where: { id }
    })
    
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }
    
    const participants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId: id },
      include: { player: true },
      orderBy: { seed: 'asc' }
    })
    
    if (participants.length < 2) {
      return NextResponse.json({ error: "Need at least 2 players" }, { status: 400 })
    }
    
    const playerIds = participants.map(p => p.playerId)
    
    // Delete existing matches
    await prisma.tournamentMatch.deleteMany({ where: { tournamentId: id } })
    
    // Generate bracket
    const matches = generateSingleElimination(playerIds, id)
    
    // Create matches
    const created = await prisma.tournamentMatch.createMany({ data: matches })
    
    await prisma.tournament.update({
      where: { id },
      data: { status: "ACTIVE" }
    })
    
    return NextResponse.json({ success: true, count: created.count })
  } catch (error) {
    console.error("Error generating bracket:", error)
    return NextResponse.json({ error: "Failed to generate bracket" }, { status: 500 })
  }
}