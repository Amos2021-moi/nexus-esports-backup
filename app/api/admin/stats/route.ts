import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const [totalPlayers, activeSeasons, totalFixtures, completedResults] = await Promise.all([
      prisma.user.count({ where: { role: "PLAYER" } }),
      prisma.season.count({ where: { isActive: true } }),
      prisma.fixture.count(),
      prisma.result.count({ where: { approved: true } })
    ])

    const pendingResults = await prisma.result.count({ where: { approved: false } })
    const totalAwards = await prisma.award.count()

    return NextResponse.json({
      totalPlayers,
      activeSeasons,
      totalFixtures,
      completedResults,
      pendingResults,
      totalAwards
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({
      totalPlayers: 0,
      activeSeasons: 0,
      totalFixtures: 0,
      completedResults: 0,
      pendingResults: 0,
      totalAwards: 0
    })
  }
}