import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ Skip ALL API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // ✅ Skip static assets
  if (pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon.ico") ||
      pathname.startsWith("/maintenance")) {
    return NextResponse.next()
  }

  // ✅ Check maintenance mode
  try {
    const maintenanceRes = await fetch(`${request.nextUrl.origin}/api/settings?category=system&key=maintenanceMode`, {
      headers: { 'Cache-Control': 'no-cache' }
    })

    let maintenanceMode = false
    if (maintenanceRes.ok) {
      const data = await maintenanceRes.json()
      maintenanceMode = data.maintenanceMode || false
    }

    // ✅ If maintenance mode is enabled
    if (maintenanceMode) {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
      })

      // ✅ ALLOW admins to access everything
      if (token?.role === "ADMIN") {
        return NextResponse.next()
      }

      // ✅ Allow access to signin page (so users can log in)
      if (pathname === "/auth/signin" || pathname === "/auth/signup") {
        return NextResponse.next()
      }

      // ✅ All other users see maintenance page
      const maintenanceUrl = new URL("/maintenance", request.url)
      return NextResponse.rewrite(maintenanceUrl)
    }
  } catch (error) {
    console.error("Error checking maintenance mode:", error)
    // If we can't check, allow access
    return NextResponse.next()
  }

  // ✅ Check if user is authenticated for protected routes
  const protectedPaths = ["/dashboard", "/admin", "/tournaments", "/players", "/standings", "/matches"]
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtected) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // ✅ Check admin routes
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}