import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const entries = await prisma.hallOfFame.findMany({
      include: {
        player: {
          include: { profile: true }
        },
        season: true
      },
      orderBy: { inductedAt: 'desc' }
    })
    return NextResponse.json(entries)
  } catch (error) {
    console.error("Error fetching hall of fame:", error)
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

    const { playerId, seasonId, category, reason, imageUrl } = await request.json()

    if (!playerId || !seasonId || !category || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const entry = await prisma.hallOfFame.create({
      data: {
        playerId,
        seasonId,
        category,
        reason,
        imageUrl: imageUrl || null
      },
      include: {
        player: { include: { profile: true } },
        season: true
      }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("Error creating hall of fame entry:", error)
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 })
  }
}