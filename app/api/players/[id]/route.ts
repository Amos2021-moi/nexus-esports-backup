import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get user with profile and related data
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        squads: {
          orderBy: { createdAt: 'desc' }
        },
        awards: {
          include: {
            season: true
          },
          orderBy: { awardedAt: 'desc' }
        },
        leagueEntries: {
          include: {
            season: true
          },
          orderBy: {
            season: {
              startDate: 'desc'
            }
          }
        },
        homeFixtures: {
          where: { status: "COMPLETED" },
          include: {
            awayPlayer: {
              include: { profile: true }
            },
            result: true
          },
          orderBy: { scheduledDate: 'desc' },
          take: 10
        },
        awayFixtures: {
          where: { status: "COMPLETED" },
          include: {
            homePlayer: {
              include: { profile: true }
            },
            result: true
          },
          orderBy: { scheduledDate: 'desc' },
          take: 10
        }
      }
    })

    if (!user || !user.profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // ✅ Fix: Create a unified matches array with proper opponent data
    const allMatches: any[] = []

    // Add home fixtures (user is home player)
    for (const fixture of user.homeFixtures) {
      allMatches.push({
        ...fixture,
        isHome: true,
        opponent: fixture.awayPlayer,
        opponentName: fixture.awayPlayer?.profile?.username || fixture.awayPlayer?.name || "Unknown"
      })
    }

    // Add away fixtures (user is away player)
    for (const fixture of user.awayFixtures) {
      allMatches.push({
        ...fixture,
        isHome: false,
        opponent: fixture.homePlayer,
        opponentName: fixture.homePlayer?.profile?.username || fixture.homePlayer?.name || "Unknown"
      })
    }

    // Sort by date (newest first)
    allMatches.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())

    // Calculate stats
    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0

    for (const match of allMatches) {
      const myScore = match.isHome ? match.result?.homeScore : match.result?.awayScore
      const oppScore = match.isHome ? match.result?.awayScore : match.result?.homeScore

      if (myScore !== undefined && oppScore !== undefined) {
        goalsFor += myScore
        goalsAgainst += oppScore
        if (myScore > oppScore) wins++
        else if (myScore < oppScore) losses++
        else draws++
      }
    }

    const totalMatches = allMatches.length
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0
    const goalDifference = goalsFor - goalsAgainst
    const totalPoints = user.profile.totalPoints || 0

    // Format recent matches
    const recentMatches = allMatches.slice(0, 10).map(match => {
      let result = "D"
      const myScore = match.isHome ? match.result?.homeScore : match.result?.awayScore
      const oppScore = match.isHome ? match.result?.awayScore : match.result?.homeScore
      
      if (myScore !== undefined && oppScore !== undefined) {
        if (myScore > oppScore) result = "W"
        else if (myScore < oppScore) result = "L"
        else result = "D"
      }

      return {
        id: match.id,
        opponentName: match.opponentName,
        score: myScore !== undefined && oppScore !== undefined ? `${myScore}-${oppScore}` : "Pending",
        result,
        date: match.scheduledDate
      }
    })

    // Format season stats
    const seasonStats = user.leagueEntries.map(entry => ({
      seasonName: entry.season.name,
      points: entry.points,
      wins: entry.wins,
      draws: entry.draws,
      losses: entry.losses,
      goalsFor: entry.goalsFor,
      goalsAgainst: entry.goalsAgainst
    }))

    // Format awards
    const awards = user.awards.map(award => ({
      name: award.name,
      seasonName: award.season.name
    }))

    // Format squads
    const squads = user.squads.map(squad => ({
      id: squad.id,
      type: squad.type,
      screenshot: squad.screenshot,
      formation: squad.formation,
      teamStrength: squad.teamStrength,
      playstyle: squad.playstyle
    }))

    return NextResponse.json({
      id: user.id,
      username: user.profile.username,
      name: user.name,
      profilePicture: user.profile.profilePicture,
      bannerImage: user.profile.bannerImage,
      bio: user.profile.bio,
      class: user.profile.class,
      favoriteClub: user.profile.favoriteClub,
      preferredFormation: user.profile.preferredFormation,
      preferredPlaystyle: user.profile.preferredPlaystyle,
      isVerified: user.isVerified,
      trustScore: user.profile.trustScore || 0,
      verifiedBadge: user.profile.verifiedBadge || false,
      totalWins: wins,
      totalDraws: draws,
      totalLosses: losses,
      totalPoints,
      goalsFor,
      goalsAgainst,
      goalDifference,
      matchesPlayed: totalMatches,
      winRate,
      whatsappNumber: user.profile.whatsappNumber,
      whatsappVisible: user.profile.whatsappVisible,
      awards,
      squads,
      recentMatches,
      seasonStats
    })
  } catch (error) {
    console.error("Error fetching player profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch player profile" },
      { status: 500 }
    )
  }
}