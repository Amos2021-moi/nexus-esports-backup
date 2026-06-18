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

    const posts = await prisma.post.findMany({
      include: {
        user: {
          include: { profile: true }
        },
        comments: {
          include: {
            user: {
              include: { profile: true }
            }
          },
          orderBy: { createdAt: 'asc' },
          take: 3
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, image, type } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        content: content.trim(),
        image: image || null,
        type: type || "GENERAL"
      },
      include: {
        user: {
          include: { profile: true }
        }
      }
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}

// ✅ DELETE method - Phase 1
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("id")

    if (!postId) {
      return NextResponse.json({ error: "Post ID required" }, { status: 400 })
    }

    // Check if post exists and belongs to user
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this post" }, { status: 403 })
    }

    // Delete post (comments and likes will cascade due to onDelete: Cascade)
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    )
  }
}