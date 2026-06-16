import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get recent results
    const recentResults = await prisma.result.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        fixture: {
          include: {
            homePlayer: { include: { profile: true } },
            awayPlayer: { include: { profile: true } }
          }
        },
        user: { include: { profile: true } }
      }
    })

    // Get recent fixture generations (when fixtures were created)
    const recentFixtures = await prisma.fixture.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        season: true
      }
    })

    // Get recent season creations
    const recentSeasons = await prisma.season.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    // Combine and format activities
    const activities = []

    // Add result submissions
    for (const result of recentResults) {
      const homeName = result.fixture.homePlayer.profile?.username || result.fixture.homePlayer.name
      const awayName = result.fixture.awayPlayer.profile?.username || result.fixture.awayPlayer.name
      activities.push({
        id: `result-${result.id}`,
        action: result.approved ? "Result Approved" : "Result Submitted",
        description: `${homeName} vs ${awayName} (${result.homeScore}-${result.awayScore})`,
        user: result.user.profile?.username || result.user.name,
        time: result.createdAt,
        type: result.approved ? "success" : "pending",
        icon: "result"
      })
    }

    // Add fixture generations
    for (const fixture of recentFixtures) {
      activities.push({
        id: `fixture-${fixture.id}`,
        action: "Fixtures Generated",
        description: `New fixtures created for ${fixture.season?.name || "season"}`,
        user: "System",
        time: fixture.createdAt,
        type: "info",
        icon: "fixture"
      })
    }

    // Add season creations
    for (const season of recentSeasons) {
      activities.push({
        id: `season-${season.id}`,
        action: "Season Created",
        description: `${season.name}`,
        user: "Admin",
        time: season.createdAt,
        type: "success",
        icon: "season"
      })
    }

    // Sort by time (most recent first)
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    
    // Take top 10
    const recentActivities = activities.slice(0, 10)

    return NextResponse.json(recentActivities)
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json([])
  }
}