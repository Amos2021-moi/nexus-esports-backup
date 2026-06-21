import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

   const user = await prisma.user.findFirst({
  where: {
    // @ts-ignore - These fields exist after migration
    resetPasswordToken: token,
    // @ts-ignore - These fields exist after migration
    resetPasswordExpiresAt: {
      gt: new Date()
    }
  }
})

    if (!user) {
      return NextResponse.json({
        error: "Invalid or expired reset link"
      }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordSentAt: null,
        resetPasswordExpiresAt: null
      }
    })

    return NextResponse.json({
      success: true,
      message: "Password reset successfully"
    })

  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}