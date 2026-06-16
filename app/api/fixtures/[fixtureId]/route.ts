import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  try {
    const { fixtureId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }

    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homePlayer: {
          select: {
            name: true,
            profile: { 
              select: { 
                username: true,
                profilePicture: true
              } 
            }
          }
        },
        awayPlayer: {
          select: {
            name: true,
            profile: { 
              select: { 
                username: true,
                profilePicture: true
              } 
            }
          }
        }
      }
    })

    if (!fixture) {
      return NextResponse.json({ error: "Fixture not found" }, { status: 404 })
    }

    // Verify user is part of this fixture
    if (fixture.homePlayerId !== session.user.id && fixture.awayPlayerId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json(fixture)
  } catch (error) {
    console.error("Error fetching fixture:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}