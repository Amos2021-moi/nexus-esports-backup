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
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }

    // ✅ Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get match with a timeout
    const matchPromise = prisma.tournamentMatch.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        homePlayer: {
          include: { profile: true }
        },
        awayPlayer: {
          include: { profile: true }
        }
      }
    })

    // ✅ Add timeout to database operations
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database timeout")), 15000)
    )

    const match = await Promise.race([matchPromise, timeoutPromise]) as any

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    if (match.homePlayerId !== session.user.id && match.awayPlayerId !== session.user.id) {
      return NextResponse.json({ error: "You are not part of this match" }, { status: 403 })
    }

    if (match.resultId) {
      return NextResponse.json({ error: "Result already submitted for this match" }, { status: 400 })
    }

    const formData = await request.formData()
    const homeScore = parseInt(formData.get("homeScore") as string)
    const awayScore = parseInt(formData.get("awayScore") as string)
    const evidenceFile = formData.get("evidence") as File

    if (isNaN(homeScore) || isNaN(awayScore)) {
      return NextResponse.json({ error: "Invalid scores" }, { status: 400 })
    }

    if (!evidenceFile) {
      return NextResponse.json({ error: "Evidence screenshot is required" }, { status: 400 })
    }

    let evidenceImage = null
    if (evidenceFile && evidenceFile.size > 0) {
      try {
        const bytes = await evidenceFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        evidenceImage = buffer.toString("base64")
      } catch (err) {
        console.error("Error processing image:", err)
        return NextResponse.json({ error: "Failed to process image" }, { status: 400 })
      }
    }

    // ✅ Create result with source: "TOURNAMENT"
    const result = await prisma.result.create({
      data: {
        homeScore,
        awayScore,
        evidenceImage: evidenceImage || null,
        submittedBy: session.user.id,
        approved: false,
        source: "TOURNAMENT",
        tournamentMatchId: matchId
      }
    })

    await prisma.tournamentMatch.update({
      where: { id: matchId },
      data: {
        resultId: result.id,
        status: "PENDING"
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Result submitted! Waiting for admin approval.",
      result 
    })
  } catch (error: any) {
    console.error("Error submitting tournament result:", error)
    
    // ✅ Handle specific Prisma errors
    if (error?.code === 'P1001') {
      return NextResponse.json(
        { error: "Database connection lost. Please try again." },
        { status: 503 }
      )
    }
    
    if (error?.code === 'P1017') {
      return NextResponse.json(
        { error: "Database connection timed out. Please try again with a smaller image." },
        { status: 504 }
      )
    }
    
    if (error?.code === 'P2024') {
      return NextResponse.json(
        { error: "Database connection pool exhausted. Please try again." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit result" },
      { status: 500 }
    )
  }
}