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

    const squads = await prisma.squad.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(squads)
  } catch (error) {
    console.error("Error fetching squads:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }

    const body = await request.json()
    const { type, screenshot, formation, teamStrength, playstyle, description } = body

    // Validate teamStrength range (1000-4000)
    let strength = parseInt(teamStrength)
    if (isNaN(strength)) strength = 0
    if (strength < 1000) strength = 1000
    if (strength > 4000) strength = 4000

    const squad = await prisma.squad.create({
      data: {
        userId: session.user.id,
        type,
        screenshot,
        formation,
        teamStrength: strength,
        playstyle,
        description,
        isActive: type === "MAIN"
      }
    })

    // If this is MAIN squad, deactivate others
    if (type === "MAIN") {
      await prisma.squad.updateMany({
        where: { userId: session.user.id, type: "MAIN", id: { not: squad.id } },
        data: { isActive: false }
      })
    }

    return NextResponse.json(squad)
  } catch (error) {
    console.error("Error creating squad:", error)
    return NextResponse.json({ error: "Failed to create squad" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const squadId = searchParams.get("id")

    if (!squadId) {
      return NextResponse.json({ error: "Squad ID required" }, { status: 400 })
    }

    // Verify squad belongs to user
    const squad = await prisma.squad.findUnique({
      where: { id: squadId }
    })

    if (!squad || squad.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 })
    }

    await prisma.squad.delete({ where: { id: squadId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting squad:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}