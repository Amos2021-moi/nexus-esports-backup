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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homePlayer: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true
          }
        },
        awayPlayer: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true
          }
        },
        season: true,
        result: true
      }
    })

    if (!fixture) {
      return NextResponse.json({ error: "Fixture not found" }, { status: 404 })
    }

    return NextResponse.json(fixture)
  } catch (error) {
    console.error("Error fetching fixture:", error)
    return NextResponse.json(
      { error: "Failed to fetch fixture" },
      { status: 500 }
    )
  }
}