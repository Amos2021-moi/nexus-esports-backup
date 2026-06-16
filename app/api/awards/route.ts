import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const awards = await prisma.award.findMany({
      include: {
        winner: {
          include: { profile: true }
        },
        season: true
      },
      orderBy: { awardedAt: 'desc' }
    })
    return NextResponse.json(awards)
  } catch (error) {
    console.error("Error fetching awards:", error)
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

    const { seasonId, name, winnerId, description } = await request.json()

    if (!seasonId || !name || !winnerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const award = await prisma.award.create({
      data: {
        seasonId,
        name,
        winnerId,
        description: description || null
      },
      include: {
        winner: { include: { profile: true } },
        season: true
      }
    })

    return NextResponse.json(award, { status: 201 })
  } catch (error) {
    console.error("Error creating award:", error)
    return NextResponse.json({ error: "Failed to create award" }, { status: 500 })
  }
}