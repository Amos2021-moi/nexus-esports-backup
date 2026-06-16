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
      return NextResponse.json([])
    }

    const entries = await prisma.leagueEntry.findMany({
      where: { seasonId },
      include: {
        player: { include: { profile: true } }
      },
      orderBy: { points: 'desc' }
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error("Error fetching league entries:", error)
    return NextResponse.json([])
  }
}