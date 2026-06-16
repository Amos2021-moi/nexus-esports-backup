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

    const fixtures = await prisma.fixture.findMany({
      where: {
        OR: [
          { homePlayerId: session.user.id },
          { awayPlayerId: session.user.id }
        ]
      },
      select: {
        id: true,
        status: true,
        homeScore: true,
        awayScore: true,
        scheduledDate: true,
        homePlayer: {
          select: {
            name: true,
            profile: {
              select: {
                username: true,
                profilePicture: true,
                whatsappNumber: true,
                whatsappVisible: true
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
                profilePicture: true,
                whatsappNumber: true,
                whatsappVisible: true
              }
            }
          }
        },
        season: {
          select: {
            name: true,
            status: true,
            endDate: true
          }
        },
        result: {
          select: {
            approved: true
          }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    })

    return NextResponse.json(fixtures)
  } catch (error) {
    console.error("Error fetching fixtures:", error)
    return NextResponse.json([])
  }
}