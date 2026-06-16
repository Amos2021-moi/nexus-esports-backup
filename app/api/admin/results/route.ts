import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const results = await prisma.result.findMany({
      include: {
        fixture: {
          include: {
            homePlayer: {
              include: { profile: true }
            },
            awayPlayer: {
              include: { profile: true }
            }
          }
        },
        user: {
          include: { profile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json([])
  }
}