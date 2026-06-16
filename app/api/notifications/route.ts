import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json([])
    }

    // Use exact model name - check your schema (Notification or notification)
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json([])
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notificationId } = await request.json()

    // Use exact model name here too
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 })
  }
}