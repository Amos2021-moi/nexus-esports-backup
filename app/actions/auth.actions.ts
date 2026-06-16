"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const username = formData.get("username") as string

  if (!email || !password || !name || !username) {
    throw new Error("All fields are required")
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error("User already exists")
  }

  // Check if username is taken
  const existingProfile = await prisma.profile.findUnique({
    where: { username }
  })

  if (existingProfile) {
    throw new Error("Username already taken")
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user (without transaction)
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    }
  })

  // Create profile separately
  await prisma.profile.create({
    data: {
      userId: newUser.id,
      username,
    }
  })

  redirect("/auth/signin?registered=true")
}