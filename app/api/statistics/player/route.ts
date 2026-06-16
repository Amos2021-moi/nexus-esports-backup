import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    })

    const playerStats = await prisma.playerStats.findUnique({
      where: { profileId: profile?.id }
    })

    return NextResponse.json(playerStats || {
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      manOfTheMatch: 0,
      matchesPlayed: 0,
      winRate: 0
    })
  } catch (error) {
    return NextResponse.json({})
  }
}