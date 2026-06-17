import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ✅ GET handler
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const squads = await prisma.squad.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(squads)
  } catch (error: unknown) {
    console.error("Error fetching squads:", error)
    return NextResponse.json([], { status: 200 })
  }
}

// ✅ POST handler
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }

    // ✅ Check if user exists, if not create profile
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    // ✅ If user doesn't exist, create them
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || "user@example.com",
          name: session.user.name || "User",
          role: "PLAYER",
        }
      })
      
      // Also create profile
      await prisma.profile.create({
        data: {
          userId: user.id,
          username: session.user.email?.split('@')[0] || `player_${Date.now()}`,
        }
      })
    }

    const body = await request.json()
    const { type, screenshot, formation, teamStrength, playstyle, description } = body

    if (!screenshot) {
      return NextResponse.json({ error: "Screenshot is required" }, { status: 400 })
    }
    if (!formation) {
      return NextResponse.json({ error: "Formation is required" }, { status: 400 })
    }

    let strength = parseInt(teamStrength) || 0
    if (strength < 1000) strength = 1000
    if (strength > 4000) strength = 4000

    const squad = await prisma.squad.create({
      data: {
        userId: user.id,
        type: type || "MAIN",
        screenshot,
        formation,
        teamStrength: strength,
        playstyle: playstyle || "",
        description: description || "",
        isActive: false,
      },
    })

    return NextResponse.json(squad, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating squad:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Failed to create squad"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// ✅ DELETE handler
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Squad ID required" }, { status: 400 })
    }

    const squad = await prisma.squad.findUnique({
      where: { id }
    })

    if (!squad) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 })
    }

    if (squad.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.squad.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error deleting squad:", error)
    return NextResponse.json(
      { error: "Failed to delete squad" },
      { status: 500 }
    )
  }
}