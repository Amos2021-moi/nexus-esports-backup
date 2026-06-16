import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // ✅ REMOVED: Authentication check - now public
    // Now anyone can see these stats

    const [
      totalPlayers,
      totalFixtures,
      completedResults,
      totalTournaments,
      totalAwards,
      totalSeasons,
      totalNews,
      totalPosts,
      totalComments,
      totalLikes
    ] = await Promise.all([
      prisma.user.count({ where: { role: "PLAYER" } }),
      prisma.fixture.count(),
      prisma.result.count({ where: { approved: true } }),
      prisma.tournament.count(),
      prisma.award.count(),
      prisma.season.count(),
      prisma.news.count({ where: { published: true } }),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.like.count()
    ])

    const pendingResults = await prisma.result.count({ where: { approved: false } })

    return NextResponse.json({
      totalPlayers,
      totalFixtures,
      completedResults,
      pendingResults,
      totalTournaments,
      totalAwards,
      totalSeasons,
      totalNews,
      totalPosts,
      totalComments,
      totalLikes
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({
      totalPlayers: 0,
      totalFixtures: 0,
      completedResults: 0,
      pendingResults: 0,
      totalTournaments: 0,
      totalAwards: 0,
      totalSeasons: 0,
      totalNews: 0,
      totalPosts: 0,
      totalComments: 0,
      totalLikes: 0
    })
  }
}