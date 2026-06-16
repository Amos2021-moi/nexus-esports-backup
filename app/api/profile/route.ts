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

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    })

    return NextResponse.json({
      username: profile?.username || "",
      name: user?.name || "",
      class: profile?.class || "",
      bio: profile?.bio || "",
      favoriteClub: profile?.favoriteClub || "",
      preferredFormation: profile?.preferredFormation || "",
      preferredPlaystyle: profile?.preferredPlaystyle || "",
      profilePicture: profile?.profilePicture || "",
      bannerImage: profile?.bannerImage || "",
      whatsappNumber: profile?.whatsappNumber || "",          // ADD THIS
      whatsappVisible: profile?.whatsappVisible ?? true,      // ADD THIS
      email: user?.email || "",
      totalWins: profile?.totalWins || 0,
      totalDraws: profile?.totalDraws || 0,
      totalLosses: profile?.totalLosses || 0,
      totalPoints: profile?.totalPoints || 0,
      goalsFor: profile?.goalsFor || 0,
      goalsAgainst: profile?.goalsAgainst || 0,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      username, 
      name,
      class: className, 
      bio, 
      favoriteClub, 
      preferredFormation, 
      preferredPlaystyle, 
      profilePicture, 
      bannerImage,
      whatsappNumber,        // ADD THIS
      whatsappVisible        // ADD THIS
    } = body

    // Update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      })
    }

    // Check if profile exists
    let profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: session.user.id,
          username: username || session.user.email?.split('@')[0] || "player",
        },
      })
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        username: username !== undefined ? username : profile.username,
        class: className !== undefined ? className : profile.class,
        bio: bio !== undefined ? bio : profile.bio,
        favoriteClub: favoriteClub !== undefined ? favoriteClub : profile.favoriteClub,
        preferredFormation: preferredFormation !== undefined ? preferredFormation : profile.preferredFormation,
        preferredPlaystyle: preferredPlaystyle !== undefined ? preferredPlaystyle : profile.preferredPlaystyle,
        profilePicture: profilePicture !== undefined ? profilePicture : profile.profilePicture,
        bannerImage: bannerImage !== undefined ? bannerImage : profile.bannerImage,
        whatsappNumber: whatsappNumber !== undefined ? whatsappNumber : profile.whatsappNumber,
        whatsappVisible: whatsappVisible !== undefined ? whatsappVisible : profile.whatsappVisible,
      },
    })

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}