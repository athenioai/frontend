import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/forgot-password']
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value
  const hasAnyToken = accessToken || refreshToken

  // Public paths: only redirect if access_token exists (verified session)
  // Don't redirect on refresh_token alone — avoids redirect loop when refresh fails
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // No tokens at all → login
  if (!hasAnyToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Has access token → proceed
  if (accessToken) {
    return NextResponse.next()
  }

  // No access token but has refresh token → try refresh
  if (refreshToken) {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (res.ok) {
        const data: { accessToken: string; refreshToken: string } =
          await res.json()

        // Set new cookies on the response
        const response = NextResponse.next()

        response.cookies.set('access_token', data.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60,
        })
        response.cookies.set('refresh_token', data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })

        return response
      }
    } catch {
      // Refresh failed — fall through to redirect
    }

    // Refresh failed → clear stale cookies and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo/).*)'],
}
