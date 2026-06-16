import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const session = await getServerSession(authOptions)
  
  return Response.json({
  session,
  cookies: allCookies.map(c => c.name),
  secretSet: !!process.env.NEXTAUTH_SECRET,
  secretPreview: process.env.NEXTAUTH_SECRET?.slice(0, 6) ?? "MISSING", // first 6 chars only
  nextauth_url: process.env.NEXTAUTH_URL,
}
)
}     