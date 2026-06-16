import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      include: {
        profile: true,
        leagueEntries: true,
        submittedResults: {
          where: { approved: true }
        }
      }
    })

    const trustScores = users.map(user => {
      let score = 50 // Base score
      
      // +10 for verified
      if (user.isVerified) score += 10
      
      // +5 for profile picture
      if (user.profile?.profilePicture) score += 5
      
      // +5 for WhatsApp
      if (user.profile?.whatsappNumber) score += 5
      
      // +10 for completed matches
      const matches = user.leagueEntries.reduce((sum, e) => sum + e.played, 0)
      if (matches > 10) score += 10
      else if (matches > 5) score += 5
      
      // +10 for approved results
      if (user.submittedResults.length > 5) score += 10
      else if (user.submittedResults.length > 2) score += 5
      
      // Cap at 100
      score = Math.min(score, 100)
      
      return {
        userId: user.id,
        name: user.name || user.email,
        username: user.profile?.username,
        trustScore: score,
        isVerified: user.isVerified,
        matches: matches,
        approvedResults: user.submittedResults.length
      }
    })

    return NextResponse.json(trustScores)
  } catch (error) {
    console.error("Error calculating trust scores:", error)
    return NextResponse.json([])
  }
}