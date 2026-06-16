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

    const { postId, content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: session.user.id,
        content: content.trim()
      },
      include: {
        user: {
          include: { profile: true }
        }
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}