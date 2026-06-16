import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId } = await request.json()

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: session.user.id
      }
    })

    await prisma.profile.update({
      where: { userId },
      data: { verifiedBadge: true }
    })

    // Log to audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "VERIFY_PLAYER",
        targetType: "USER",
        targetId: userId,
        details: { verifiedBy: session.user.id }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying player:", error)
    return NextResponse.json({ error: "Failed to verify player" }, { status: 500 })
  }
}