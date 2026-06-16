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
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }

    const participants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId: id },
      include: {
        player: {
          include: { profile: true }
        }
      },
      orderBy: { seed: 'asc' }
    })

    return NextResponse.json(participants)
  } catch (error) {
    console.error("Error fetching participants:", error)
    return NextResponse.json([])
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { playerIds } = await request.json()

    const participants = await prisma.tournamentParticipant.createMany({
      data: playerIds.map((playerId: string, index: number) => ({
        tournamentId: id,
        playerId,
        seed: index + 1
      })),
      skipDuplicates: true
    })

    return NextResponse.json({ success: true, count: participants.count })
  } catch (error) {
    console.error("Error adding players:", error)
    return NextResponse.json({ error: "Failed to add players" }, { status: 500 })
  }
}