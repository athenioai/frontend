import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/forgot-password']
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const EXPIRY_BUFFER_MS = 30_000 // refresh 30s before actual expiry

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.')
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof decoded.exp === 'number' && decoded.exp * 1000 - EXPIRY_BUFFER_MS < Date.now()
  } catch {
    return true
  }
}

async function refreshTokens(
  refreshToken: string,
  request: NextRequest,
): Promise<NextResponse | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) return null

    const data: { accessToken: string; refreshToken: string } = await res.json()
    const response = NextResponse.next()

    response.cookies.set('access_token', data.accessToken, { ...COOKIE_OPTS, maxAge: 60 * 60 })
    response.cookies.set('refresh_token', data.refreshToken, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })

    return response
  } catch {
    return null
  }
}

function clearAndRedirectToLogin(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')
  return response
}

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

  // Has access token — check if expired
  if (accessToken) {
    if (isTokenExpired(accessToken) && refreshToken) {
      const refreshed = await refreshTokens(refreshToken, request)
      if (refreshed) return refreshed
      return clearAndRedirectToLogin(request)
    }
    return NextResponse.next()
  }

  // No access token but has refresh token → try refresh
  if (refreshToken) {
    const refreshed = await refreshTokens(refreshToken, request)
    if (refreshed) return refreshed
    return clearAndRedirectToLogin(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo/).*)'],
}
