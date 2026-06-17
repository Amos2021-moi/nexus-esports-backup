import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  try {
    const { fixtureId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }

    // Check if fixture exists with season
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: { 
        season: true
      }
    })

    if (!fixture) {
      return NextResponse.json({ error: "Fixture not found" }, { status: 404 })
    }

    // Check Season Status - Only ALLOW if season is LIVE
    if (fixture.season?.status !== "LIVE") {
      let errorMessage = `Results can only be submitted when season is LIVE (current: ${fixture.season?.status || "UNKNOWN"})`
      return NextResponse.json({ error: errorMessage }, { status: 403 })
    }

    // Check if fixture already has a result or is pending/completed
    if (fixture.status === "PENDING" || fixture.status === "COMPLETED") {
      return NextResponse.json({ 
        error: "Result already submitted for this fixture. Waiting for admin approval or already completed." 
      }, { status: 400 })
    }

    // Verify user is part of this fixture
    if (fixture.homePlayerId !== session.user.id && fixture.awayPlayerId !== session.user.id) {
      return NextResponse.json({ error: "You are not part of this match" }, { status: 403 })
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

    // Convert image to base64
    let evidenceImage = null
    if (evidenceFile && evidenceFile.size > 0) {
      const bytes = await evidenceFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      evidenceImage = buffer.toString("base64")
    }

    // Update fixture to PENDING status
    await prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        homeScore,
        awayScore,
        status: "PENDING",
        submittedBy: session.user.id,
        submittedAt: new Date()
      }
    })

    // ✅ Create result with source: "LEAGUE"
    const result = await prisma.result.create({
      data: {
        fixtureId,
        homeScore,
        awayScore,
        evidenceImage,
        submittedBy: session.user.id,
        approved: false,
        source: "LEAGUE",  // ✅ ADDED
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Result submitted! Waiting for admin approval.",
      result 
    })
  } catch (error) {
    console.error("Error submitting result:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit" },
      { status: 500 }
    )
  }
}