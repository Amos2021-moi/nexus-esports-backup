import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ✅ GET: Get scheduled maintenance
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const schedule = await prisma.scheduledMaintenance.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(schedule || null)
  } catch (error) {
    console.error("Error fetching scheduled maintenance:", error)
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 })
  }
}

// ✅ POST: Create/Update scheduled maintenance
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { scheduledAt, duration, message } = body

    if (!scheduledAt) {
      return NextResponse.json({ error: "Scheduled time is required" }, { status: 400 })
    }

    // ✅ Turn off maintenance mode if it's currently on
    const maintenanceSetting = await prisma.setting.findFirst({
      where: {
        category: "system",
        key: "maintenanceMode"
      }
    })

    if (maintenanceSetting && JSON.parse(maintenanceSetting.value) === true) {
      await prisma.setting.update({
        where: { id: maintenanceSetting.id },
        data: { value: "false" }
      })
      console.log("🔧 Maintenance mode turned off before scheduling new maintenance")
    }

    // ✅ Delete existing schedules
    await prisma.scheduledMaintenance.deleteMany()

    // ✅ Create new schedule
    const schedule = await prisma.scheduledMaintenance.create({
      data: {
        scheduledAt: new Date(scheduledAt),
        duration: duration || 30,
        message: message || null,
        isActive: true,
      }
    })

    console.log(`📅 Maintenance scheduled for: ${schedule.scheduledAt}`)

    return NextResponse.json({ 
      success: true, 
      message: "Maintenance scheduled successfully",
      schedule 
    })
  } catch (error) {
    console.error("Error scheduling maintenance:", error)
    return NextResponse.json({ error: "Failed to schedule maintenance" }, { status: 500 })
  }
}

// ✅ DELETE: Cancel scheduled maintenance
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ Delete all schedules
    await prisma.scheduledMaintenance.deleteMany()

    // ✅ Turn off maintenance mode if it's on (in case it was triggered)
    const maintenanceSetting = await prisma.setting.findFirst({
      where: {
        category: "system",
        key: "maintenanceMode"
      }
    })

    if (maintenanceSetting && JSON.parse(maintenanceSetting.value) === true) {
      await prisma.setting.update({
        where: { id: maintenanceSetting.id },
        data: { value: "false" }
      })
      console.log("🔧 Maintenance mode turned off (schedule cancelled)")
    }

    return NextResponse.json({ 
      success: true, 
      message: "Maintenance cancelled" 
    })
  } catch (error) {
    console.error("Error cancelling maintenance:", error)
    return NextResponse.json({ error: "Failed to cancel maintenance" }, { status: 500 })
  }
}