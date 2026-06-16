import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            player: {
              include: { profile: true }
            }
          }
        },
        matches: {
          include: {
            homePlayer: { include: { profile: true } },
            awayPlayer: { include: { profile: true } },
            winner: { include: { profile: true } },
            result: true
          }
        }
      }
    })
    
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }
    
    return NextResponse.json(tournament)
  } catch (error) {
    console.error("Error fetching tournament:", error)
    return NextResponse.json({ error: "Failed to fetch tournament" }, { status: 500 })
  }
}