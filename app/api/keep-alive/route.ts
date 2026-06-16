import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Simple query to keep database awake
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: "ok" })
  } catch (error) {
    return NextResponse.json({ status: "error" }, { status: 500 })
  }
}