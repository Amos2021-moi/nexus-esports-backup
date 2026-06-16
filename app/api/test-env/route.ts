import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    secretExists: !!process.env.NEXTAUTH_SECRET,
    secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    url: process.env.NEXTAUTH_URL,
  })
}