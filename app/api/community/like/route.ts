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

    const { postId } = await request.json()

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id }
      })
      await prisma.post.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } }
      })
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId,
          userId: session.user.id
        }
      })
      await prisma.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } }
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to process like" }, { status: 500 })
  }
}