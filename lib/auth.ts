import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    // ✅ Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // ✅ Credentials Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          return null
        }

        // ✅ Check if this email should be admin
        const adminEmails = process.env.ADMIN_EMAILS?.split(',')?.map(e => e.trim()) || []
        const isAdmin = adminEmails.includes(user.email.toLowerCase())

        // ✅ Update role if needed
        if (isAdmin && user.role !== "ADMIN") {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" }
          })
          user.role = "ADMIN"
          console.log(`👑 User promoted to admin on login: ${user.email}`)
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // ✅ Handle Google Sign-In
      if (account?.provider === "google") {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        // ✅ Check if this email should be admin
        const adminEmails = process.env.ADMIN_EMAILS?.split(',')?.map(e => e.trim()) || []
        const isAdmin = adminEmails.includes(user.email!.toLowerCase())

        if (!existingUser) {
          // Create new user with Google data
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || "Google User",
              role: isAdmin ? "ADMIN" : "PLAYER",
              emailVerified: true,
              emailNotificationsEnabled: true,
            }
          })

          // Create profile
          await prisma.profile.create({
            data: {
              userId: newUser.id,
              username: user.email!.split('@')[0] + Math.floor(Math.random() * 1000),
            }
          })

          user.id = newUser.id
          user.role = newUser.role

          if (isAdmin) {
            console.log(`👑 Admin account created via Google: ${user.email}`)
          }
        } else {
          // ✅ Update role if this user should be admin
          if (isAdmin && existingUser.role !== "ADMIN") {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { role: "ADMIN" }
            })
            existingUser.role = "ADMIN"
            console.log(`👑 User promoted to admin via Google: ${user.email}`)
          }

          user.id = existingUser.id
          user.role = existingUser.role
          
          // Update name if changed
          if (user.name && user.name !== existingUser.name) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { name: user.name }
            })
          }
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
    }
  }

  interface User {
    role: string
  }
}