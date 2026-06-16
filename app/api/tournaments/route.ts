import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        participants: {
          include: {
            player: {
              include: { profile: true }
            }
          }
        },
        matches: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(tournaments)
  } catch (error) {
    console.error("Error fetching tournaments:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, seasonId, type, startDate, endDate, maxPlayers } = body

    const tournament = await prisma.tournament.create({
      data: {
        name,
        description: description || null,
        seasonId: seasonId || null,
        type: type || "SINGLE_ELIM",
        status: "PENDING",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxPlayers: parseInt(maxPlayers) || 8
      }
    })

    return NextResponse.json(tournament, { status: 201 })
  } catch (error) {
    console.error("Error creating tournament:", error)
    return NextResponse.json({ error: "Failed to create tournament" }, { status: 500 })
  }
}