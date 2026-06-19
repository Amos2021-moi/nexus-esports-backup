import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { backupScheduler } from "@/lib/services/backup.scheduler"

let schedulerInitialized = false

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Initialize scheduler on first request
    if (!schedulerInitialized) {
      await backupScheduler.initialize()
      schedulerInitialized = true
    }

    const config = await prisma.backupConfig.findFirst()

    if (!config) {
      const defaultConfig = await prisma.backupConfig.create({
        data: {
          enabled: true,
          frequency: "DAILY",
          time: "02:00",
          keepDaily: 7,
          keepWeekly: 4,
          keepMonthly: 3
        }
      })
      return NextResponse.json(defaultConfig)
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error fetching backup schedule:", error)
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { enabled, frequency, time, keepDaily, keepWeekly, keepMonthly } = body

    const existing = await prisma.backupConfig.findFirst()

    let config
    if (existing) {
      config = await prisma.backupConfig.update({
        where: { id: existing.id },
        data: {
          enabled,
          frequency,
          time,
          keepDaily: keepDaily || 7,
          keepWeekly: keepWeekly || 4,
          keepMonthly: keepMonthly || 3,
          updatedAt: new Date()
        }
      })
    } else {
      config = await prisma.backupConfig.create({
        data: {
          enabled,
          frequency,
          time,
          keepDaily: keepDaily || 7,
          keepWeekly: keepWeekly || 4,
          keepMonthly: keepMonthly || 3
        }
      })
    }

    // Recalculate next run time
    const now = new Date()
    const [hours, minutes] = (time || "02:00").split(':').map(Number)
    const nextRun = new Date(now)
    nextRun.setHours(hours, minutes, 0, 0)
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }

    await prisma.backupConfig.update({
      where: { id: config.id },
      data: { nextRunAt: nextRun }
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error("Error updating backup schedule:", error)
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    )
  }
}