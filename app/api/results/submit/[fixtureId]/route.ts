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

    // ✅ ALLOW BOTH home and away players to submit
    if (fixture.homePlayerId !== session.user.id && fixture.awayPlayerId !== session.user.id) {
      return NextResponse.json({ 
        error: "You are not part of this fixture." 
      }, { status: 403 })
    }

    // Check Season Status - Only ALLOW if season is LIVE
    if (fixture.season?.status !== "LIVE") {
      return NextResponse.json({ 
        error: `Results can only be submitted when season is LIVE (current: ${fixture.season?.status || "UNKNOWN"})` 
      }, { status: 403 })
    }

    // ✅ Check if fixture already has a result (LOCKED)
    if (fixture.status === "PENDING") {
      const submittedBy = await prisma.user.findUnique({
        where: { id: fixture.submittedBy || undefined },
        select: { name: true }
      })
      const submittedByName = submittedBy?.name || "Someone"
      
      return NextResponse.json({ 
        error: `This fixture already has a pending result submitted by ${submittedByName}. Waiting for admin approval.`,
        locked: true,
        submittedBy: submittedByName
      }, { status: 400 })
    }

    if (fixture.status === "COMPLETED") {
      return NextResponse.json({ 
        error: "This fixture has already been completed and approved." 
      }, { status: 400 })
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

    // Create result with source: "LEAGUE"
    const result = await prisma.result.create({
      data: {
        fixtureId,
        homeScore,
        awayScore,
        evidenceImage,
        submittedBy: session.user.id,
        approved: false,
        source: "LEAGUE",
      }
    })

    // ✅ Notify the other player that result was submitted
    const otherPlayerId = fixture.homePlayerId === session.user.id 
      ? fixture.awayPlayerId 
      : fixture.homePlayerId

    const submitterName = session.user.name || "A player"

    await prisma.notification.create({
      data: {
        userId: otherPlayerId,
        title: "📋 Result Submitted",
        message: `${submitterName} has submitted a result for your match. Waiting for admin approval.`,
        type: "RESULT_APPROVED",
        link: `/matches/${fixtureId}`
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