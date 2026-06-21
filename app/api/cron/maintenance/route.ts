import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("🔄 Checking scheduled maintenance at", new Date().toISOString())

    // ✅ Get the scheduled maintenance
    const schedule = await prisma.scheduledMaintenance.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!schedule) {
      return NextResponse.json({ message: "No scheduled maintenance found" })
    }

    if (!schedule.isActive) {
      return NextResponse.json({ message: "Scheduled maintenance is not active" })
    }

    const now = new Date()
    const scheduledDate = new Date(schedule.scheduledAt)

    // ✅ Only proceed if maintenance is scheduled for TODAY
    const isToday = 
      now.getFullYear() === scheduledDate.getFullYear() &&
      now.getMonth() === scheduledDate.getMonth() &&
      now.getDate() === scheduledDate.getDate()

    if (!isToday) {
      return NextResponse.json({ 
        message: "No maintenance scheduled for today",
        scheduledDate: scheduledDate.toLocaleDateString()
      })
    }

    // ✅ Check if maintenance should be turned off (duration expired)
    if (schedule.triggeredAt) {
      const triggeredTime = new Date(schedule.triggeredAt)
      const durationMs = (schedule.duration || 30) * 60 * 1000
      const expiryTime = new Date(triggeredTime.getTime() + durationMs)
      
      if (now >= expiryTime) {
        await prisma.setting.updateMany({
          where: {
            category: "system",
            key: "maintenanceMode"
          },
          data: { value: "false" }
        })
        
        await prisma.scheduledMaintenance.update({
          where: { id: schedule.id },
          data: { completedAt: now }
        })
        
        console.log("✅ Maintenance mode turned off (duration expired)")
        return NextResponse.json({
          success: true,
          message: "Maintenance mode turned off"
        })
      }
      
      return NextResponse.json({
        message: "Maintenance is active. Time remaining...",
        remaining: Math.ceil((expiryTime.getTime() - now.getTime()) / 60000) + " minutes"
      })
    }

    // ✅ Check if it's time to activate (within the hour)
    const scheduledTime = new Date(schedule.scheduledAt)
    const timeDiff = now.getTime() - scheduledTime.getTime()

    // ✅ Check if scheduled time has passed (any time today)
    if (timeDiff >= 0) {
      console.log("🔧 Activating scheduled maintenance...")

      let maintenanceSetting = await prisma.setting.findFirst({
        where: {
          category: "system",
          key: "maintenanceMode"
        }
      })

      if (maintenanceSetting) {
        await prisma.setting.update({
          where: { id: maintenanceSetting.id },
          data: { value: "true" }
        })
      } else {
        await prisma.setting.create({
          data: {
            category: "system",
            key: "maintenanceMode",
            value: "true"
          }
        })
      }

      await prisma.scheduledMaintenance.update({
        where: { id: schedule.id },
        data: {
          isActive: false,
          triggeredAt: now
        }
      })

      console.log("✅ Maintenance mode activated via schedule!")

      return NextResponse.json({
        success: true,
        message: "Maintenance mode activated",
        triggeredAt: now
      })
    }

    // ✅ Schedule time is in the future (later today)
    const hoursUntil = Math.floor((scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60))
    const minutesUntil = Math.floor(((scheduledTime.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60))

    return NextResponse.json({
      message: "Maintenance scheduled for today",
      scheduledAt: schedule.scheduledAt,
      timeRemaining: {
        hours: hoursUntil,
        minutes: minutesUntil
      }
    })
  } catch (error) {
    console.error("Error checking scheduled maintenance:", error)
    return NextResponse.json(
      { error: "Failed to check scheduled maintenance" },
      { status: 500 }
    )
  }
}