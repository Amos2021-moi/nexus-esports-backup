import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: { published: true },
      include: {
        author: {
          include: { profile: true }
        }
      },
      orderBy: { publishedAt: 'desc' }
    })
    return NextResponse.json(news)
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    const { title, content, image } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 })
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        image: image || null,
        authorId: session.user.id,
        published: true,
        publishedAt: new Date()
      }
    })

    return NextResponse.json(news, { status: 201 })
  } catch (error) {
    console.error("Error creating news:", error)
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 })
  }
}