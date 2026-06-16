import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    const isValid = await bcrypt.compare(password, user.password || "")
    
    return NextResponse.json({
      userExists: true,
      passwordValid: isValid,
      role: user.role,
      hasPassword: !!user.password
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}