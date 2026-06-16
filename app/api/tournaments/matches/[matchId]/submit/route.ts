import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const homeScore = parseInt(formData.get("homeScore") as string)
    const awayScore = parseInt(formData.get("awayScore") as string)
    const evidenceFile = formData.get("evidence") as File

    const match = await prisma.tournamentMatch.findUnique({
      where: { id: matchId }
    })

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // Check if user is part of this match
    if (match.homePlayerId !== session.user.id && match.awayPlayerId !== session.user.id) {
      return NextResponse.json({ error: "You are not part of this match" }, { status: 403 })
    }

    // Convert image to base64
    let evidenceImage = null
    if (evidenceFile && evidenceFile.size > 0) {
      const bytes = await evidenceFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      evidenceImage = buffer.toString("base64")
    }

    // Create result
    const result = await prisma.result.create({
      data: {
        fixtureId: `tournament_${matchId}`, // Temporary fixture ID
        homeScore,
        awayScore,
        evidenceImage,
        submittedBy: session.user.id,
        approved: false
      }
    })

    // Update tournament match with result
    await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        resultId: result.id,
        status: "COMPLETED",
        winnerId: homeScore > awayScore ? match.homePlayerId : awayScore > homeScore ? match.awayPlayerId : null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error submitting tournament result:", error)
    return NextResponse.json({ error: "Failed to submit result" }, { status: 500 })
  }
}