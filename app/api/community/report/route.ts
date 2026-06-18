import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId, reason } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 })
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 })
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Create report notification for admin (using audit log or notification)
    await prisma.notification.create({
      data: {
        userId: "admin", // You may want to create a system user or notify all admins
        title: "🚨 Post Reported",
        message: `Post by ${post.user?.name || "Unknown"} has been reported. Reason: ${reason}`,
        type: "SYSTEM",
        link: `/dashboard/community`
      }
    })

    // Log to audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "REPORT_POST",
        targetType: "POST",
        targetId: postId,
        details: {
          reason,
          postContent: post.content,
          postAuthor: post.user?.name
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Post reported successfully. Admin will review it."
    })
  } catch (error) {
    console.error("Error reporting post:", error)
    return NextResponse.json(
      { error: "Failed to report post" },
      { status: 500 }
    )
  }
}